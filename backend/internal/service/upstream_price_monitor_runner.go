package service

import (
	"context"
	"log/slog"
	"sync"
	"time"
)

// UpstreamPriceMonitorRunner 单例定时巡检调度器。
type UpstreamPriceMonitorRunner struct {
	svc *UpstreamPriceMonitorService

	mu           sync.Mutex
	cancel       context.CancelFunc
	loopWG       sync.WaitGroup
	started      bool
	stopped      bool
	parent       context.Context
	parentCancel context.CancelFunc
}

// NewUpstreamPriceMonitorRunner 构造 runner（未 Start）。
func NewUpstreamPriceMonitorRunner(svc *UpstreamPriceMonitorService) *UpstreamPriceMonitorRunner {
	ctx, cancel := context.WithCancel(context.Background())
	return &UpstreamPriceMonitorRunner{
		svc:          svc,
		parent:       ctx,
		parentCancel: cancel,
	}
}

// Start 加载配置并启动循环。
func (r *UpstreamPriceMonitorRunner) Start() {
	if r == nil || r.svc == nil {
		return
	}
	r.mu.Lock()
	defer r.mu.Unlock()
	if r.started || r.stopped {
		return
	}
	r.started = true
	r.svc.SetScheduler(r)
	r.restartLocked()
}

// Reschedule 按最新配置重建 ticker。
func (r *UpstreamPriceMonitorRunner) Reschedule() {
	if r == nil {
		return
	}
	r.mu.Lock()
	defer r.mu.Unlock()
	if !r.started || r.stopped {
		return
	}
	r.restartLocked()
}

// Stop 停止调度。
func (r *UpstreamPriceMonitorRunner) Stop() {
	if r == nil {
		return
	}
	r.mu.Lock()
	if r.stopped {
		r.mu.Unlock()
		return
	}
	r.stopped = true
	if r.cancel != nil {
		r.cancel()
		r.cancel = nil
	}
	if r.parentCancel != nil {
		r.parentCancel()
	}
	r.mu.Unlock()
	r.loopWG.Wait()
}

func (r *UpstreamPriceMonitorRunner) restartLocked() {
	if r.cancel != nil {
		r.cancel()
		r.cancel = nil
	}
	// 等旧 loop 退出（不在 mu 内 Wait，避免与 loop 内取锁死锁——loop 不取 mu）。
	r.mu.Unlock()
	r.loopWG.Wait()
	r.mu.Lock()
	if r.stopped {
		return
	}

	cfg, err := r.svc.GetConfig(r.parent)
	if err != nil {
		slog.Warn("upstream price monitor: load config failed", "err", err)
		return
	}
	if !cfg.Enabled {
		return
	}
	interval := time.Duration(cfg.IntervalSeconds) * time.Second
	if interval < time.Hour {
		interval = time.Hour
	}
	ctx, cancel := context.WithCancel(r.parent)
	r.cancel = cancel
	r.loopWG.Add(1)
	go r.loop(ctx, interval)
}

func (r *UpstreamPriceMonitorRunner) loop(ctx context.Context, interval time.Duration) {
	defer r.loopWG.Done()
	ticker := time.NewTicker(interval)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			r.fire(ctx)
		}
	}
}

func (r *UpstreamPriceMonitorRunner) fire(ctx context.Context) {
	runCtx, cancel := context.WithTimeout(ctx, 5*time.Minute)
	defer cancel()
	if _, err := r.svc.RunNow(runCtx); err != nil {
		if err == ErrUpstreamPriceMonitorBusy {
			return
		}
		slog.Warn("upstream price monitor run failed", "err", err)
	}
}
