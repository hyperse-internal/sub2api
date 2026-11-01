package service

import infraerrors "github.com/Wei-Shaw/sub2api/internal/pkg/errors"

var (
	ErrUpstreamPriceMonitorRunNotFound = infraerrors.NotFound(
		"UPSTREAM_PRICE_MONITOR_RUN_NOT_FOUND", "upstream price monitor run not found",
	)
	ErrUpstreamPriceMonitorInvalidConfig = infraerrors.BadRequest(
		"UPSTREAM_PRICE_MONITOR_INVALID_CONFIG", "invalid upstream price monitor config",
	)
	ErrUpstreamPriceMonitorBusy = infraerrors.Conflict(
		"UPSTREAM_PRICE_MONITOR_BUSY", "upstream price monitor is already running",
	)
	ErrUpstreamPriceMonitorInvalidSync = infraerrors.BadRequest(
		"UPSTREAM_PRICE_MONITOR_INVALID_SYNC", "invalid upstream price sync request",
	)
	ErrUpstreamPriceMonitorModelNotFound = infraerrors.NotFound(
		"UPSTREAM_PRICE_MONITOR_MODEL_NOT_FOUND", "channel model pricing not found",
	)
	ErrUpstreamPriceMonitorUpstreamMissing = infraerrors.NotFound(
		"UPSTREAM_PRICE_MONITOR_UPSTREAM_MISSING", "model not found in Teamo pricing",
	)
)
