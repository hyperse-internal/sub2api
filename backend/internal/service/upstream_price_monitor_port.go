package service

import (
	"context"
	"time"

	"github.com/Wei-Shaw/sub2api/internal/pkg/pagination"
)

// UpstreamPriceMonitorRepository 上游价格巡检持久化接口。
type UpstreamPriceMonitorRepository interface {
	GetConfig(ctx context.Context) (*UpstreamPriceMonitorConfig, error)
	UpsertConfig(ctx context.Context, cfg *UpstreamPriceMonitorConfig) error
	TouchLastRunAt(ctx context.Context, t time.Time) error

	CreateRun(ctx context.Context, run *UpstreamPriceMonitorRun) error
	FinishRun(ctx context.Context, run *UpstreamPriceMonitorRun) error
	CreateRunItems(ctx context.Context, items []UpstreamPriceMonitorRunItem) error
	ListRuns(ctx context.Context, params pagination.PaginationParams) ([]UpstreamPriceMonitorRun, *pagination.PaginationResult, error)
	GetRunByID(ctx context.Context, id int64) (*UpstreamPriceMonitorRun, error)
	DeleteRunByID(ctx context.Context, id int64) error
	DeleteRunsStartedBefore(ctx context.Context, before time.Time) (int, error)
}

// UpstreamPricingClient 拉取 Teamo 模型定价。
type UpstreamPricingClient interface {
	FetchModelPricing(ctx context.Context) (map[string]UpstreamPriceQuote, error)
}
