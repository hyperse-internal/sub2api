package routes

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/require"
)

func TestIsAllowedTeamoProxyPath(t *testing.T) {
	require.True(t, isAllowedTeamoProxyPath("/api/v1/pelican-benchmark"))
	require.True(t, isAllowedTeamoProxyPath("/api/v1/pelican-benchmark/abc/document.html"))
	require.False(t, isAllowedTeamoProxyPath("/api/v1/flags"))
	require.False(t, isAllowedTeamoProxyPath("/api/v1/pelican-benchmark-evil"))
	require.False(t, isAllowedTeamoProxyPath("/"))
}

func TestApplyTeamoEmbedHeaders(t *testing.T) {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Header("Content-Security-Policy", "frame-ancestors 'none'")
	c.Header("X-Frame-Options", "DENY")

	applyTeamoEmbedHeaders(c)

	require.Equal(t, "SAMEORIGIN", w.Header().Get("X-Frame-Options"))
	require.Equal(t, "frame-ancestors 'self'", w.Header().Get("Content-Security-Policy"))
}

func TestTeamoUpstreamProxyFallsBackToLocal(t *testing.T) {
	t.Setenv("HTTP_PROXY", "")
	t.Setenv("HTTPS_PROXY", "")
	t.Setenv("ALL_PROXY", "")
	t.Setenv("http_proxy", "")
	t.Setenv("https_proxy", "")
	t.Setenv("all_proxy", "")
	t.Setenv("NO_PROXY", "")
	t.Setenv("no_proxy", "")

	req, err := http.NewRequest(http.MethodGet, "https://teamorouter.com/api/v1/pelican-benchmark", nil)
	require.NoError(t, err)
	u, err := teamoUpstreamProxy(req)
	require.NoError(t, err)
	require.NotNil(t, u)
	require.Equal(t, "http://127.0.0.1:7890", u.String())
}

func TestRegisterTeamoProxyRoutesRejectsForeignPath(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	RegisterTeamoProxyRoutes(r)

	req := httptest.NewRequest(http.MethodGet, "/teamo/api/v1/flags", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	require.Equal(t, http.StatusForbidden, w.Code)
}

func TestRegisterTeamoProxyRoutesRejectsNonGET(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	RegisterTeamoProxyRoutes(r)

	req := httptest.NewRequest(http.MethodPost, "/teamo/api/v1/pelican-benchmark", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	require.Equal(t, http.StatusBadGateway, w.Code)
	require.Contains(t, w.Body.String(), "teamo_proxy_unavailable")
}
