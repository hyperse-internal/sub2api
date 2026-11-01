package service

import (
	"time"
)

// UpstreamPriceMonitorConfig 巡检单例配置。
type UpstreamPriceMonitorConfig struct {
	ID              int64
	Enabled         bool
	IntervalSeconds int
	ChannelIDs      []int64
	NotifyEmails    []string
	ProfitMin       float64
	ProfitMax       float64
	TargetProfit    *float64
	LastRunAt       *time.Time
	UpdatedBy       *int64
	CreatedAt       time.Time
	UpdatedAt       time.Time
}

// UpstreamPriceMonitorRun 一次执行记录。
type UpstreamPriceMonitorRun struct {
	ID                int64
	Status            string
	StartedAt         time.Time
	FinishedAt        *time.Time
	UpstreamFetchedAt *time.Time
	ModelCount        int
	MatchedCount      int
	OutOfRangeCount   int
	Summary           string
	ErrorMessage      *string
	ChannelIDs        []int64
	ProfitMin         float64
	ProfitMax         float64
	TargetProfit      *float64
	CreatedAt         time.Time
	UpdatedAt         time.Time
	Items             []UpstreamPriceMonitorRunItem
}

// UpstreamPriceMonitorRunItem 单模型明细。
type UpstreamPriceMonitorRunItem struct {
	ID                  int64
	RunID               int64
	ChannelID           int64
	ChannelName         string
	Model               string
	Status              string
	UpstreamInput       *float64
	UpstreamOutput      *float64
	UpstreamCacheRead   *float64
	UpstreamCacheWrite  *float64
	LocalInput          *float64
	LocalOutput         *float64
	LocalCacheRead      *float64
	LocalCacheWrite     *float64
	SuggestedInput      *float64
	SuggestedOutput     *float64
	SuggestedCacheRead  *float64
	SuggestedCacheWrite *float64
	MarginInput         *float64
	Message             string
	CreatedAt           time.Time
}

// UpstreamPriceQuote Teamo 侧 token 成本（USD / 1M tokens）。
type UpstreamPriceQuote struct {
	ID         string
	Input      float64
	Output     float64
	CacheRead  float64
	CacheWrite float64 // 0 表示上游未提供，建议价时可按 input×1.25 估算
	HasWrite   bool
}

// UpdateUpstreamPriceMonitorConfigInput 更新配置入参。
type UpdateUpstreamPriceMonitorConfigInput struct {
	Enabled         *bool
	IntervalSeconds *int
	ChannelIDs      *[]int64
	NotifyEmails    *[]string
	ProfitMin       *float64
	ProfitMax       *float64
	TargetProfit    *float64
	ClearTarget     bool
	UpdatedBy       int64
}
