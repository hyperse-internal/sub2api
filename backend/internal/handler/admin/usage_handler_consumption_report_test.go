package admin

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestAdminUsageConsumptionReport_Validation(t *testing.T) {
	gin.SetMode(gin.TestMode)
	handler := NewUsageHandler(nil, nil, nil, nil)
	router := gin.New()
	router.GET("/admin/usage/consumption-report", handler.ConsumptionReport)

	cases := []struct {
		name string
		url  string
	}{
		{name: "missing user_id", url: "/admin/usage/consumption-report?start_date=2026-10-17&end_date=2026-10-21"},
		{name: "missing dates", url: "/admin/usage/consumption-report?user_id=14"},
		{name: "range too long", url: "/admin/usage/consumption-report?user_id=14&start_date=2026-10-01&end_date=2026-10-10"},
		{name: "end before start", url: "/admin/usage/consumption-report?user_id=14&start_date=2026-10-21&end_date=2026-10-17"},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, tc.url, nil)
			rec := httptest.NewRecorder()
			router.ServeHTTP(rec, req)
			if rec.Code != http.StatusBadRequest {
				t.Fatalf("status = %d, want %d; body=%s", rec.Code, http.StatusBadRequest, rec.Body.String())
			}

			var body map[string]any
			if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
				t.Fatalf("unmarshal: %v", err)
			}
			if body["code"] == float64(0) {
				t.Fatalf("expected non-zero code, got %#v", body["code"])
			}
		})
	}
}
