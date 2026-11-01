package admin

import (
	"strconv"
	"time"

	infraerrors "github.com/Wei-Shaw/sub2api/internal/pkg/errors"
	"github.com/Wei-Shaw/sub2api/internal/pkg/pagination"
	"github.com/Wei-Shaw/sub2api/internal/pkg/response"
	middleware2 "github.com/Wei-Shaw/sub2api/internal/server/middleware"
	"github.com/Wei-Shaw/sub2api/internal/service"

	"github.com/gin-gonic/gin"
)

// UpstreamPriceMonitorHandler 管理端上游价格巡检。
type UpstreamPriceMonitorHandler struct {
	svc *service.UpstreamPriceMonitorService
}

// NewUpstreamPriceMonitorHandler 创建 handler。
func NewUpstreamPriceMonitorHandler(svc *service.UpstreamPriceMonitorService) *UpstreamPriceMonitorHandler {
	return &UpstreamPriceMonitorHandler{svc: svc}
}

type upstreamPriceMonitorConfigResponse struct {
	Enabled         bool     `json:"enabled"`
	IntervalSeconds int      `json:"interval_seconds"`
	ChannelIDs      []int64  `json:"channel_ids"`
	NotifyEmails    []string `json:"notify_emails"`
	ProfitMin       float64  `json:"profit_min"`
	ProfitMax       float64  `json:"profit_max"`
	TargetProfit    *float64 `json:"target_profit"`
	LastRunAt       *string  `json:"last_run_at"`
	UpdatedBy       *int64   `json:"updated_by"`
	UpdatedAt       string   `json:"updated_at"`
}

type upstreamPriceMonitorConfigUpdateRequest struct {
	Enabled         *bool     `json:"enabled"`
	IntervalSeconds *int      `json:"interval_seconds"`
	ChannelIDs      *[]int64  `json:"channel_ids"`
	NotifyEmails    *[]string `json:"notify_emails"`
	ProfitMin       *float64  `json:"profit_min"`
	ProfitMax       *float64  `json:"profit_max"`
	TargetProfit    *float64  `json:"target_profit"`
	ClearTarget     bool      `json:"clear_target"`
}

type upstreamPriceMonitorRunResponse struct {
	ID                int64                                 `json:"id"`
	Status            string                                `json:"status"`
	StartedAt         string                                `json:"started_at"`
	FinishedAt        *string                               `json:"finished_at"`
	UpstreamFetchedAt *string                               `json:"upstream_fetched_at"`
	ModelCount        int                                   `json:"model_count"`
	MatchedCount      int                                   `json:"matched_count"`
	OutOfRangeCount   int                                   `json:"out_of_range_count"`
	Summary           string                                `json:"summary"`
	ErrorMessage      *string                               `json:"error_message"`
	ChannelIDs        []int64                               `json:"channel_ids"`
	ProfitMin         float64                               `json:"profit_min"`
	ProfitMax         float64                               `json:"profit_max"`
	TargetProfit      *float64                              `json:"target_profit"`
	Items             []upstreamPriceMonitorRunItemResponse `json:"items,omitempty"`
}

type upstreamPriceMonitorRunItemResponse struct {
	ID                  int64    `json:"id"`
	ChannelID           int64    `json:"channel_id"`
	ChannelName         string   `json:"channel_name"`
	Model               string   `json:"model"`
	Status              string   `json:"status"`
	UpstreamInput       *float64 `json:"upstream_input"`
	UpstreamOutput      *float64 `json:"upstream_output"`
	UpstreamCacheRead   *float64 `json:"upstream_cache_read"`
	UpstreamCacheWrite  *float64 `json:"upstream_cache_write"`
	LocalInput          *float64 `json:"local_input"`
	LocalOutput         *float64 `json:"local_output"`
	LocalCacheRead      *float64 `json:"local_cache_read"`
	LocalCacheWrite     *float64 `json:"local_cache_write"`
	SuggestedInput      *float64 `json:"suggested_input"`
	SuggestedOutput     *float64 `json:"suggested_output"`
	SuggestedCacheRead  *float64 `json:"suggested_cache_read"`
	SuggestedCacheWrite *float64 `json:"suggested_cache_write"`
	MarginInput         *float64 `json:"margin_input"`
	Message             string   `json:"message"`
}

// GetConfig GET /admin/upstream-price-monitor/config
func (h *UpstreamPriceMonitorHandler) GetConfig(c *gin.Context) {
	cfg, err := h.svc.GetConfig(c.Request.Context())
	if err != nil {
		response.ErrorFrom(c, err)
		return
	}
	response.Success(c, toUpstreamPriceMonitorConfigResponse(cfg))
}

// UpdateConfig PUT /admin/upstream-price-monitor/config
func (h *UpstreamPriceMonitorHandler) UpdateConfig(c *gin.Context) {
	var req upstreamPriceMonitorConfigUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ErrorFrom(c, infraerrors.BadRequest("VALIDATION_ERROR", err.Error()))
		return
	}
	var updatedBy int64
	if subject, ok := middleware2.GetAuthSubjectFromContext(c); ok {
		updatedBy = subject.UserID
	}
	cfg, err := h.svc.UpdateConfig(c.Request.Context(), service.UpdateUpstreamPriceMonitorConfigInput{
		Enabled:         req.Enabled,
		IntervalSeconds: req.IntervalSeconds,
		ChannelIDs:      req.ChannelIDs,
		NotifyEmails:    req.NotifyEmails,
		ProfitMin:       req.ProfitMin,
		ProfitMax:       req.ProfitMax,
		TargetProfit:    req.TargetProfit,
		ClearTarget:     req.ClearTarget,
		UpdatedBy:       updatedBy,
	})
	if err != nil {
		response.ErrorFrom(c, err)
		return
	}
	response.Success(c, toUpstreamPriceMonitorConfigResponse(cfg))
}

// Run POST /admin/upstream-price-monitor/run
func (h *UpstreamPriceMonitorHandler) Run(c *gin.Context) {
	run, err := h.svc.RunNow(c.Request.Context())
	if err != nil {
		response.ErrorFrom(c, err)
		return
	}
	response.Success(c, toUpstreamPriceMonitorRunResponse(run, true))
}

// ListRuns GET /admin/upstream-price-monitor/runs
func (h *UpstreamPriceMonitorHandler) ListRuns(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	params := pagination.PaginationParams{Page: page, PageSize: pageSize}
	runs, pageResult, err := h.svc.ListRuns(c.Request.Context(), params)
	if err != nil {
		response.ErrorFrom(c, err)
		return
	}
	items := make([]upstreamPriceMonitorRunResponse, 0, len(runs))
	for i := range runs {
		items = append(items, toUpstreamPriceMonitorRunResponse(&runs[i], false))
	}
	response.PaginatedWithResult(c, items, &response.PaginationResult{
		Total:    pageResult.Total,
		Page:     pageResult.Page,
		PageSize: pageResult.PageSize,
		Pages:    pageResult.Pages,
	})
}

// GetRun GET /admin/upstream-price-monitor/runs/:id
func (h *UpstreamPriceMonitorHandler) GetRun(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil || id <= 0 {
		response.ErrorFrom(c, infraerrors.BadRequest("INVALID_ID", "invalid run id"))
		return
	}
	run, err := h.svc.GetRun(c.Request.Context(), id)
	if err != nil {
		response.ErrorFrom(c, err)
		return
	}
	response.Success(c, toUpstreamPriceMonitorRunResponse(run, true))
}

// DeleteRun DELETE /admin/upstream-price-monitor/runs/:id
func (h *UpstreamPriceMonitorHandler) DeleteRun(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil || id <= 0 {
		response.ErrorFrom(c, infraerrors.BadRequest("INVALID_ID", "invalid run id"))
		return
	}
	if err := h.svc.DeleteRun(c.Request.Context(), id); err != nil {
		response.ErrorFrom(c, err)
		return
	}
	response.Success(c, gin.H{"ok": true})
}

type upstreamPriceMonitorSyncRequest struct {
	ChannelID int64   `json:"channel_id" binding:"required"`
	Model     string  `json:"model" binding:"required"`
	Profit    float64 `json:"profit" binding:"required"`
}

// SyncPrice POST /admin/upstream-price-monitor/sync-price
func (h *UpstreamPriceMonitorHandler) SyncPrice(c *gin.Context) {
	var req upstreamPriceMonitorSyncRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ErrorFrom(c, infraerrors.BadRequest("INVALID_REQUEST", err.Error()))
		return
	}
	result, err := h.svc.SyncChannelModelPrice(c.Request.Context(), service.SyncChannelModelPriceInput{
		ChannelID: req.ChannelID,
		Model:     req.Model,
		Profit:    req.Profit,
	})
	if err != nil {
		response.ErrorFrom(c, err)
		return
	}
	response.Success(c, result)
}

func toUpstreamPriceMonitorConfigResponse(cfg *service.UpstreamPriceMonitorConfig) upstreamPriceMonitorConfigResponse {
	resp := upstreamPriceMonitorConfigResponse{
		Enabled:         cfg.Enabled,
		IntervalSeconds: cfg.IntervalSeconds,
		ChannelIDs:      cfg.ChannelIDs,
		NotifyEmails:    cfg.NotifyEmails,
		ProfitMin:       cfg.ProfitMin,
		ProfitMax:       cfg.ProfitMax,
		TargetProfit:    cfg.TargetProfit,
		UpdatedBy:       cfg.UpdatedBy,
		UpdatedAt:       cfg.UpdatedAt.UTC().Format(time.RFC3339),
	}
	if resp.ChannelIDs == nil {
		resp.ChannelIDs = []int64{}
	}
	if resp.NotifyEmails == nil {
		resp.NotifyEmails = []string{}
	}
	if cfg.LastRunAt != nil {
		s := cfg.LastRunAt.UTC().Format(time.RFC3339)
		resp.LastRunAt = &s
	}
	return resp
}

func toUpstreamPriceMonitorRunResponse(run *service.UpstreamPriceMonitorRun, withItems bool) upstreamPriceMonitorRunResponse {
	resp := upstreamPriceMonitorRunResponse{
		ID:              run.ID,
		Status:          run.Status,
		StartedAt:       run.StartedAt.UTC().Format(time.RFC3339),
		ModelCount:      run.ModelCount,
		MatchedCount:    run.MatchedCount,
		OutOfRangeCount: run.OutOfRangeCount,
		Summary:         run.Summary,
		ErrorMessage:    run.ErrorMessage,
		ChannelIDs:      run.ChannelIDs,
		ProfitMin:       run.ProfitMin,
		ProfitMax:       run.ProfitMax,
		TargetProfit:    run.TargetProfit,
	}
	if run.FinishedAt != nil {
		s := run.FinishedAt.UTC().Format(time.RFC3339)
		resp.FinishedAt = &s
	}
	if run.UpstreamFetchedAt != nil {
		s := run.UpstreamFetchedAt.UTC().Format(time.RFC3339)
		resp.UpstreamFetchedAt = &s
	}
	if withItems {
		resp.Items = make([]upstreamPriceMonitorRunItemResponse, 0, len(run.Items))
		for _, it := range run.Items {
			resp.Items = append(resp.Items, upstreamPriceMonitorRunItemResponse{
				ID:                  it.ID,
				ChannelID:           it.ChannelID,
				ChannelName:         it.ChannelName,
				Model:               it.Model,
				Status:              it.Status,
				UpstreamInput:       it.UpstreamInput,
				UpstreamOutput:      it.UpstreamOutput,
				UpstreamCacheRead:   it.UpstreamCacheRead,
				UpstreamCacheWrite:  it.UpstreamCacheWrite,
				LocalInput:          it.LocalInput,
				LocalOutput:         it.LocalOutput,
				LocalCacheRead:      it.LocalCacheRead,
				LocalCacheWrite:     it.LocalCacheWrite,
				SuggestedInput:      it.SuggestedInput,
				SuggestedOutput:     it.SuggestedOutput,
				SuggestedCacheRead:  it.SuggestedCacheRead,
				SuggestedCacheWrite: it.SuggestedCacheWrite,
				MarginInput:         it.MarginInput,
				Message:             it.Message,
			})
		}
	}
	return resp
}
