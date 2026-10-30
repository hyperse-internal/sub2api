package routes

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

const (
	teamoProxyPrefix = "/teamo"
	teamoUpstream    = "https://teamorouter.com"
	// 只转发鹈鹕测智公开接口，避免开放式反代被滥用
	teamoAllowedAPIPrefix = "/api/v1/pelican-benchmark"
	// 可选：开发机 Clash 等。生产机通常能直连 teamorouter，勿硬编码 7890。
	teamoHTTPProxyEnv = "TEAMO_HTTP_PROXY"
)

// teamoUpstreamProxy 解析上游出口代理：TEAMO_HTTP_PROXY → 标准 HTTP(S)_PROXY → 直连（nil）。
func teamoUpstreamProxy(req *http.Request) (*url.URL, error) {
	if raw := strings.TrimSpace(os.Getenv(teamoHTTPProxyEnv)); raw != "" {
		return url.Parse(raw)
	}
	return http.ProxyFromEnvironment(req)
}

// RegisterTeamoProxyRoutes 将 /teamo/* 转发到 TeamoRouter，供前端同源嵌入测智作品。
func RegisterTeamoProxyRoutes(r *gin.Engine) {
	dialer := &net.Dialer{
		Timeout:   15 * time.Second,
		KeepAlive: 30 * time.Second,
	}
	transport := &http.Transport{
		Proxy: teamoUpstreamProxy,
		DialContext: func(ctx context.Context, network, addr string) (net.Conn, error) {
			return dialer.DialContext(ctx, "tcp4", addr)
		},
		ForceAttemptHTTP2:     true,
		TLSHandshakeTimeout:   15 * time.Second,
		ResponseHeaderTimeout: 45 * time.Second,
		ExpectContinueTimeout: 1 * time.Second,
		MaxIdleConns:          32,
		IdleConnTimeout:       90 * time.Second,
	}
	client := &http.Client{
		Transport: transport,
		Timeout:   60 * time.Second,
	}

	handler := func(c *gin.Context) {
		path := c.Param("proxyPath")
		if path == "" {
			path = "/"
		}
		if !strings.HasPrefix(path, "/") {
			path = "/" + path
		}
		if !isAllowedTeamoProxyPath(path) {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "teamo_proxy_path_forbidden"})
			return
		}

		upstreamURL := teamoUpstream + path
		if raw := c.Request.URL.RawQuery; raw != "" {
			upstreamURL += "?" + raw
		}

		accept := c.GetHeader("Accept")
		if accept == "" {
			accept = "*/*"
		}

		status, contentType, body, err := fetchTeamoUpstream(c.Request.Context(), client, c.Request.Method, upstreamURL, accept)
		if err != nil {
			log.Printf("[teamo-proxy] upstream failed method=%s url=%s err=%v", c.Request.Method, upstreamURL, err)
			c.AbortWithStatusJSON(http.StatusBadGateway, gin.H{"error": "teamo_proxy_unavailable"})
			return
		}

		// 卡片/详情用同源 iframe 预览 document.html；覆盖全局 SecurityHeaders 的
		// X-Frame-Options: DENY 与 CSP frame-ancestors 'none'，否则浏览器会直接拒嵌。
		applyTeamoEmbedHeaders(c)

		if contentType != "" {
			c.Header("Content-Type", contentType)
		}
		c.Header("Cache-Control", "no-store")
		c.Status(status)
		_, _ = c.Writer.Write(body)
		c.Abort()
	}

	r.Any(teamoProxyPrefix+"/*proxyPath", handler)
}

func fetchTeamoUpstream(ctx context.Context, client *http.Client, method, upstreamURL, accept string) (int, string, []byte, error) {
	if method == "" {
		method = http.MethodGet
	}
	// 上游公开接口只读；非 GET/HEAD 直接拒绝，避免变成开放式出口
	if method != http.MethodGet && method != http.MethodHead {
		return 0, "", nil, fmt.Errorf("method_not_allowed:%s", method)
	}

	req, err := http.NewRequestWithContext(ctx, method, upstreamURL, nil)
	if err != nil {
		return 0, "", nil, err
	}
	req.Header.Set("Accept", accept)
	req.Header.Set("User-Agent", "Mozilla/5.0 (compatible; Sub2API-TeamoProxy/1.0)")
	req.Host = "teamorouter.com"

	resp, err := client.Do(req)
	if err == nil {
		defer func() { _ = resp.Body.Close() }()
		body, readErr := io.ReadAll(io.LimitReader(resp.Body, 20<<20))
		if readErr != nil {
			return 0, "", nil, readErr
		}
		return resp.StatusCode, resp.Header.Get("Content-Type"), body, nil
	}

	// 部分网络会对 Go TLS 指纹 RST；回退系统 python3（开发机常见可用）
	status, contentType, body, pyErr := fetchTeamoUpstreamViaPython(ctx, upstreamURL, accept)
	if pyErr != nil {
		return 0, "", nil, fmt.Errorf("http=%v; python=%v", err, pyErr)
	}
	log.Printf("[teamo-proxy] fell back to python3 for %s", upstreamURL)
	return status, contentType, body, nil
}

func fetchTeamoUpstreamViaPython(ctx context.Context, upstreamURL, accept string) (int, string, []byte, error) {
	script := `
import sys, urllib.request
url, accept = sys.argv[1], sys.argv[2]
req = urllib.request.Request(url, headers={
    "User-Agent": "Mozilla/5.0 (compatible; Sub2API-TeamoProxy/1.0)",
    "Accept": accept,
})
with urllib.request.urlopen(req, timeout=45) as r:
    body = r.read()
    ctype = r.headers.get("Content-Type") or ""
    sys.stdout.buffer.write(f"{r.status}\n{ctype}\n".encode("utf-8"))
    sys.stdout.buffer.write(body)
`
	cmd := exec.CommandContext(ctx, "python3", "-c", script, upstreamURL, accept)
	// 与 Go 客户端对齐：有配置代理时再注入；无代理则清掉继承的代理变量，避免误走本机 Clash。
	cmd.Env = filterProxyEnv(os.Environ())
	if reqURL, err := url.Parse(upstreamURL); err == nil {
		if u, err := teamoUpstreamProxy(&http.Request{URL: reqURL}); err == nil && u != nil {
			proxyURL := u.String()
			cmd.Env = append(cmd.Env,
				"HTTP_PROXY="+proxyURL,
				"HTTPS_PROXY="+proxyURL,
				"http_proxy="+proxyURL,
				"https_proxy="+proxyURL,
			)
		}
	}
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	if err := cmd.Run(); err != nil {
		msg := strings.TrimSpace(stderr.String())
		if msg == "" {
			msg = err.Error()
		}
		return 0, "", nil, fmt.Errorf("python3: %s", msg)
	}
	raw := stdout.Bytes()
	first := bytes.IndexByte(raw, '\n')
	if first < 0 {
		return 0, "", nil, fmt.Errorf("python3: bad response")
	}
	second := bytes.IndexByte(raw[first+1:], '\n')
	if second < 0 {
		return 0, "", nil, fmt.Errorf("python3: bad response")
	}
	second += first + 1
	status, err := strconv.Atoi(string(raw[:first]))
	if err != nil {
		return 0, "", nil, fmt.Errorf("python3: bad status")
	}
	contentType := string(raw[first+1 : second])
	body := raw[second+1:]
	return status, contentType, body, nil
}

func isAllowedTeamoProxyPath(path string) bool {
	if path == teamoAllowedAPIPrefix {
		return true
	}
	return strings.HasPrefix(path, teamoAllowedAPIPrefix+"/")
}

func filterProxyEnv(environ []string) []string {
	out := make([]string, 0, len(environ))
	for _, kv := range environ {
		key, _, _ := strings.Cut(kv, "=")
		switch strings.ToUpper(key) {
		case "HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY", "NO_PROXY",
			teamoHTTPProxyEnv:
			continue
		}
		out = append(out, kv)
	}
	return out
}

// applyTeamoEmbedHeaders 允许本站同源 iframe 嵌入 /teamo 文档。
func applyTeamoEmbedHeaders(c *gin.Context) {
	c.Writer.Header().Del("Content-Security-Policy")
	c.Header("X-Frame-Options", "SAMEORIGIN")
	// 显式允许同源嵌入；仅设这一条时其余 CSP 指令不限制文档内脚本/样式
	c.Header("Content-Security-Policy", "frame-ancestors 'self'")
}
