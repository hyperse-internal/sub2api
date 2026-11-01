package service

import (
	"math"
	"strings"
)

const (
	UpstreamPriceMonitorItemPass              = "pass"
	UpstreamPriceMonitorItemFail              = "fail"
	UpstreamPriceMonitorItemUnmatchedUpstream = "unmatched_upstream"
	UpstreamPriceMonitorItemUnmatchedLocal    = "unmatched_local"
	UpstreamPriceMonitorItemSkipped           = "skipped"

	UpstreamPriceMonitorRunRunning = "running"
	UpstreamPriceMonitorRunPassed  = "passed"
	UpstreamPriceMonitorRunFailed  = "failed"
	UpstreamPriceMonitorRunError   = "error"

	upstreamPriceMonitorMarginEpsilon = 1e-6
	upstreamPriceMonitorPriceDigits   = 4

	// UpstreamPriceMonitorRunRetention 执行记录最长保留天数；每次巡检会清理更早的记录。
	UpstreamPriceMonitorRunRetentionDays = 30
)

// ImpliedGrossMargin returns 1 - cost/local (gross margin on selling price).
// Returns false when inputs are not usable.
func ImpliedGrossMargin(cost, local float64) (float64, bool) {
	if !(cost > 0) || !(local > 0) || math.IsNaN(cost) || math.IsNaN(local) || math.IsInf(cost, 0) || math.IsInf(local, 0) {
		return 0, false
	}
	return 1 - cost/local, true
}

// MarginInRange reports whether margin is within [min, max] with float epsilon.
func MarginInRange(margin, min, max float64) bool {
	return margin+upstreamPriceMonitorMarginEpsilon >= min && margin-upstreamPriceMonitorMarginEpsilon <= max
}

// SuggestedSellPrice computes cost / (1 - targetProfit), rounded.
func SuggestedSellPrice(cost, targetProfit float64) (float64, bool) {
	if !(cost > 0) || !(targetProfit > 0) || !(targetProfit < 1) {
		return 0, false
	}
	den := 1 - targetProfit
	if den <= 0 {
		return 0, false
	}
	return RoundPrice(cost / den), true
}

// RoundPrice rounds to a stable display precision used in cost archives.
func RoundPrice(v float64) float64 {
	if math.IsNaN(v) || math.IsInf(v, 0) {
		return 0
	}
	pow := math.Pow(10, float64(upstreamPriceMonitorPriceDigits))
	return math.Round(v*pow) / pow
}

// ResolveTargetProfit returns configured target or midpoint of [min, max].
func ResolveTargetProfit(min, max float64, target *float64) float64 {
	if target != nil && *target > 0 && *target < 1 {
		return *target
	}
	return (min + max) / 2
}

// NormalizeModelID lowercases and trims for Teamo id ↔ channel model matching.
func NormalizeModelID(id string) string {
	return strings.ToLower(strings.TrimSpace(id))
}

// EstimateCacheWriteFromInput applies archive rule: cache write ≈ input × 1.25 when missing.
func EstimateCacheWriteFromInput(input float64) float64 {
	if !(input > 0) {
		return 0
	}
	return RoundPrice(input * 1.25)
}
