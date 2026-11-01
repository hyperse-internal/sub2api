package service

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
)

const (
	upstreamPriceMonitorPricingURL = "https://teamorouter.com/v1/models/pricing"
	upstreamPriceMonitorHTTPProxy  = "TEAMO_HTTP_PROXY"
	upstreamPriceMonitorMaxBody    = 8 << 20 // 8 MiB
)

type teamoPricingAPIResponse struct {
	Models []teamoPricingAPIModel `json:"models"`
}

type teamoPricingAPIModel struct {
	ID          string `json:"id"`
	BillingMode string `json:"billing_mode"`
	Cost        struct {
		Input       float64 `json:"input"`
		Output      float64 `json:"output"`
		CachedInput float64 `json:"cached_input"`
		CacheRead   float64 `json:"cache_read"`
		CacheCreate float64 `json:"cache_creation"`
	} `json:"cost"`
}

// TeamoUpstreamPricingClient 直连 TeamoRouter 公开定价接口。
type TeamoUpstreamPricingClient struct {
	httpClient *http.Client
	url        string
}

// NewTeamoUpstreamPricingClient 创建客户端；支持 TEAMO_HTTP_PROXY → 标准代理 → 直连。
func NewTeamoUpstreamPricingClient() *TeamoUpstreamPricingClient {
	transport := &http.Transport{
		Proxy: teamoHTTPProxyFromEnv,
		DialContext: (&net.Dialer{
			Timeout:   10 * time.Second,
			KeepAlive: 30 * time.Second,
		}).DialContext,
		TLSHandshakeTimeout: 10 * time.Second,
		ForceAttemptHTTP2:   true,
	}
	return &TeamoUpstreamPricingClient{
		httpClient: &http.Client{
			Timeout:   30 * time.Second,
			Transport: transport,
		},
		url: upstreamPriceMonitorPricingURL,
	}
}

func teamoHTTPProxyFromEnv(req *http.Request) (*url.URL, error) {
	if raw := strings.TrimSpace(os.Getenv(upstreamPriceMonitorHTTPProxy)); raw != "" {
		return url.Parse(raw)
	}
	return http.ProxyFromEnvironment(req)
}

// FetchModelPricing 返回 id(lower) → quote。仅收录 billing_mode=token 的模型。
func (c *TeamoUpstreamPricingClient) FetchModelPricing(ctx context.Context) (map[string]UpstreamPriceQuote, error) {
	if c == nil || c.httpClient == nil {
		return nil, fmt.Errorf("upstream pricing client not configured")
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("User-Agent", "sub2api-upstream-price-monitor/1.0")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("fetch teamo pricing: %w", err)
	}
	defer resp.Body.Close()

	limited := io.LimitReader(resp.Body, upstreamPriceMonitorMaxBody+1)
	body, err := io.ReadAll(limited)
	if err != nil {
		return nil, fmt.Errorf("read teamo pricing: %w", err)
	}
	if len(body) > upstreamPriceMonitorMaxBody {
		return nil, fmt.Errorf("teamo pricing response too large")
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("teamo pricing status %d", resp.StatusCode)
	}

	var parsed teamoPricingAPIResponse
	if err := json.Unmarshal(body, &parsed); err != nil {
		return nil, fmt.Errorf("decode teamo pricing: %w", err)
	}

	out := make(map[string]UpstreamPriceQuote, len(parsed.Models))
	for _, m := range parsed.Models {
		id := NormalizeModelID(m.ID)
		if id == "" {
			continue
		}
		if m.BillingMode != "" && !strings.EqualFold(m.BillingMode, string(BillingModeToken)) {
			continue
		}
		cacheRead := m.Cost.CacheRead
		if cacheRead <= 0 {
			cacheRead = m.Cost.CachedInput
		}
		q := UpstreamPriceQuote{
			ID:        id,
			Input:     m.Cost.Input,
			Output:    m.Cost.Output,
			CacheRead: cacheRead,
		}
		if m.Cost.CacheCreate > 0 {
			q.CacheWrite = m.Cost.CacheCreate
			q.HasWrite = true
		}
		out[id] = q
	}
	return out, nil
}
