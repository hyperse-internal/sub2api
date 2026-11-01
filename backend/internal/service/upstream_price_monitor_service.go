package service

import (
	"context"
	"fmt"
	"html"
	"log/slog"
	"net/mail"
	"strings"
	"sync"
	"time"

	"github.com/Wei-Shaw/sub2api/internal/pkg/pagination"
)

// UpstreamPriceMonitorScheduler 配置变更后通知 runner 重排程。
type UpstreamPriceMonitorScheduler interface {
	Reschedule()
}

// UpstreamPriceMonitorService 上游价格巡检业务逻辑。
type UpstreamPriceMonitorService struct {
	repo           UpstreamPriceMonitorRepository
	channelRepo    ChannelRepository
	channelService *ChannelService
	pricingClient  UpstreamPricingClient
	emailService   *EmailService
	settingService *SettingService

	scheduler UpstreamPriceMonitorScheduler

	runMu sync.Mutex
}

// NewUpstreamPriceMonitorService 构造服务。
func NewUpstreamPriceMonitorService(
	repo UpstreamPriceMonitorRepository,
	channelRepo ChannelRepository,
	channelService *ChannelService,
	pricingClient UpstreamPricingClient,
	emailService *EmailService,
	settingService *SettingService,
) *UpstreamPriceMonitorService {
	return &UpstreamPriceMonitorService{
		repo:           repo,
		channelRepo:    channelRepo,
		channelService: channelService,
		pricingClient:  pricingClient,
		emailService:   emailService,
		settingService: settingService,
	}
}

// SetScheduler 注入 runner（避免 wire 环）。
func (s *UpstreamPriceMonitorService) SetScheduler(scheduler UpstreamPriceMonitorScheduler) {
	s.scheduler = scheduler
}

// GetConfig 读取单例配置。
func (s *UpstreamPriceMonitorService) GetConfig(ctx context.Context) (*UpstreamPriceMonitorConfig, error) {
	return s.repo.GetConfig(ctx)
}

// UpdateConfig 校验并保存配置。
func (s *UpstreamPriceMonitorService) UpdateConfig(ctx context.Context, input UpdateUpstreamPriceMonitorConfigInput) (*UpstreamPriceMonitorConfig, error) {
	cfg, err := s.repo.GetConfig(ctx)
	if err != nil {
		return nil, err
	}
	if input.Enabled != nil {
		cfg.Enabled = *input.Enabled
	}
	if input.IntervalSeconds != nil {
		cfg.IntervalSeconds = *input.IntervalSeconds
	}
	if input.ChannelIDs != nil {
		cfg.ChannelIDs = dedupeInt64(*input.ChannelIDs)
	}
	if input.NotifyEmails != nil {
		emails, err := normalizeNotifyEmails(*input.NotifyEmails)
		if err != nil {
			return nil, err
		}
		cfg.NotifyEmails = emails
	}
	if input.ProfitMin != nil {
		cfg.ProfitMin = *input.ProfitMin
	}
	if input.ProfitMax != nil {
		cfg.ProfitMax = *input.ProfitMax
	}
	if input.ClearTarget {
		cfg.TargetProfit = nil
	} else if input.TargetProfit != nil {
		cfg.TargetProfit = input.TargetProfit
	}
	if input.UpdatedBy > 0 {
		cfg.UpdatedBy = &input.UpdatedBy
	}

	if err := validateUpstreamPriceMonitorConfig(cfg); err != nil {
		return nil, err
	}
	if err := s.repo.UpsertConfig(ctx, cfg); err != nil {
		return nil, err
	}
	if s.scheduler != nil {
		s.scheduler.Reschedule()
	}
	return cfg, nil
}

// ListRuns 分页列出执行记录。
func (s *UpstreamPriceMonitorService) ListRuns(ctx context.Context, params pagination.PaginationParams) ([]UpstreamPriceMonitorRun, *pagination.PaginationResult, error) {
	if params.Page < 1 {
		params.Page = 1
	}
	if params.PageSize < 1 {
		params.PageSize = 20
	}
	return s.repo.ListRuns(ctx, params)
}

// GetRun 获取单次执行（含明细）。
func (s *UpstreamPriceMonitorService) GetRun(ctx context.Context, id int64) (*UpstreamPriceMonitorRun, error) {
	return s.repo.GetRunByID(ctx, id)
}

// DeleteRun 手动删除单次执行记录（级联删除明细）。
func (s *UpstreamPriceMonitorService) DeleteRun(ctx context.Context, id int64) error {
	if id <= 0 {
		return ErrUpstreamPriceMonitorRunNotFound
	}
	return s.repo.DeleteRunByID(ctx, id)
}

// pruneExpiredRuns 删除超过保留天数的最早执行记录。
func (s *UpstreamPriceMonitorService) pruneExpiredRuns(ctx context.Context, now time.Time) {
	cutoff := now.AddDate(0, 0, -UpstreamPriceMonitorRunRetentionDays)
	n, err := s.repo.DeleteRunsStartedBefore(ctx, cutoff)
	if err != nil {
		slog.Warn("upstream price monitor: prune expired runs failed", "error", err)
		return
	}
	if n > 0 {
		slog.Info("upstream price monitor: pruned expired runs",
			"deleted", n,
			"retention_days", UpstreamPriceMonitorRunRetentionDays,
			"before", cutoff.UTC().Format(time.RFC3339),
		)
	}
}

// RunNow 手动或定时触发一次巡检。
func (s *UpstreamPriceMonitorService) RunNow(ctx context.Context) (*UpstreamPriceMonitorRun, error) {
	if !s.runMu.TryLock() {
		return nil, ErrUpstreamPriceMonitorBusy
	}
	defer s.runMu.Unlock()

	cfg, err := s.repo.GetConfig(ctx)
	if err != nil {
		return nil, err
	}
	if err := validateUpstreamPriceMonitorConfig(cfg); err != nil {
		return nil, err
	}

	target := ResolveTargetProfit(cfg.ProfitMin, cfg.ProfitMax, cfg.TargetProfit)
	now := time.Now()
	s.pruneExpiredRuns(ctx, now)
	run := &UpstreamPriceMonitorRun{
		Status:       UpstreamPriceMonitorRunRunning,
		StartedAt:    now,
		ChannelIDs:   append([]int64(nil), cfg.ChannelIDs...),
		ProfitMin:    cfg.ProfitMin,
		ProfitMax:    cfg.ProfitMax,
		TargetProfit: upstreamPriceFloatPtr(target),
		Summary:      "",
	}
	if err := s.repo.CreateRun(ctx, run); err != nil {
		return nil, err
	}

	finish := func(status, summary string, errMsg *string) (*UpstreamPriceMonitorRun, error) {
		finished := time.Now()
		run.Status = status
		run.FinishedAt = &finished
		run.Summary = summary
		run.ErrorMessage = errMsg
		if err := s.repo.FinishRun(ctx, run); err != nil {
			return run, err
		}
		_ = s.repo.TouchLastRunAt(ctx, finished)
		return run, nil
	}

	if len(cfg.ChannelIDs) == 0 {
		msg := "no channels configured"
		return finish(UpstreamPriceMonitorRunError, msg, &msg)
	}

	quotes, err := s.pricingClient.FetchModelPricing(ctx)
	if err != nil {
		msg := err.Error()
		return finish(UpstreamPriceMonitorRunError, "failed to fetch upstream pricing", &msg)
	}
	fetchedAt := time.Now()
	run.UpstreamFetchedAt = &fetchedAt

	items := make([]UpstreamPriceMonitorRunItem, 0)
	matched := 0
	outOfRange := 0
	modelCount := 0

	for _, channelID := range cfg.ChannelIDs {
		ch, err := s.channelRepo.GetByID(ctx, channelID)
		if err != nil {
			items = append(items, UpstreamPriceMonitorRunItem{
				ChannelID:   channelID,
				ChannelName: fmt.Sprintf("#%d", channelID),
				Model:       "*",
				Status:      UpstreamPriceMonitorItemSkipped,
				Message:     "channel not found",
			})
			continue
		}
		for i := range ch.ModelPricing {
			p := &ch.ModelPricing[i]
			for _, model := range p.Models {
				model = strings.TrimSpace(model)
				if model == "" {
					continue
				}
				modelCount++
				item := CompareChannelModelAgainstUpstream(
					ch.ID, ch.Name, model, p, quotes,
					cfg.ProfitMin, cfg.ProfitMax, target,
				)
				switch item.Status {
				case UpstreamPriceMonitorItemPass, UpstreamPriceMonitorItemFail:
					matched++
					if item.Status == UpstreamPriceMonitorItemFail {
						outOfRange++
					}
				}
				items = append(items, item)
			}
		}
	}

	run.ModelCount = modelCount
	run.MatchedCount = matched
	run.OutOfRangeCount = outOfRange

	for i := range items {
		items[i].RunID = run.ID
	}
	if err := s.repo.CreateRunItems(ctx, items); err != nil {
		msg := err.Error()
		return finish(UpstreamPriceMonitorRunError, "failed to persist run items", &msg)
	}
	run.Items = items

	status := UpstreamPriceMonitorRunPassed
	summary := fmt.Sprintf("matched=%d out_of_range=%d models=%d", matched, outOfRange, modelCount)
	if outOfRange > 0 {
		status = UpstreamPriceMonitorRunFailed
		summary = fmt.Sprintf("%d model(s) outside profit range (matched=%d)", outOfRange, matched)
	}
	finishedRun, err := finish(status, summary, nil)
	if err != nil {
		return finishedRun, err
	}
	finishedRun.Items = items

	if outOfRange > 0 {
		s.notifyOutOfRange(ctx, cfg, finishedRun)
	}
	return finishedRun, nil
}

func (s *UpstreamPriceMonitorService) notifyOutOfRange(ctx context.Context, cfg *UpstreamPriceMonitorConfig, run *UpstreamPriceMonitorRun) {
	if s.emailService == nil || len(cfg.NotifyEmails) == 0 {
		return
	}
	siteName := "Sub2API"
	if s.settingService != nil {
		if name := strings.TrimSpace(s.settingService.GetSiteName(ctx)); name != "" {
			siteName = name
		}
	}
	subject := fmt.Sprintf("[%s] Upstream price monitor: %d model(s) out of profit range", siteName, run.OutOfRangeCount)
	var b strings.Builder
	b.WriteString(fmt.Sprintf("<p>%s</p>", html.EscapeString(run.Summary)))
	b.WriteString("<table border=\"1\" cellpadding=\"6\" cellspacing=\"0\"><thead><tr>")
	b.WriteString("<th>Channel</th><th>Model</th><th>Upstream In</th><th>Local In</th><th>Margin</th><th>Suggested In</th></tr></thead><tbody>")
	n := 0
	for _, it := range run.Items {
		if it.Status != UpstreamPriceMonitorItemFail {
			continue
		}
		n++
		if n > 30 {
			break
		}
		b.WriteString("<tr>")
		b.WriteString("<td>" + html.EscapeString(it.ChannelName) + "</td>")
		b.WriteString("<td>" + html.EscapeString(it.Model) + "</td>")
		b.WriteString("<td>" + formatOptionalFloat(it.UpstreamInput) + "</td>")
		b.WriteString("<td>" + formatOptionalFloat(it.LocalInput) + "</td>")
		if it.MarginInput != nil {
			b.WriteString(fmt.Sprintf("<td>%.2f%%</td>", *it.MarginInput*100))
		} else {
			b.WriteString("<td>-</td>")
		}
		b.WriteString("<td>" + formatOptionalFloat(it.SuggestedInput) + "</td>")
		b.WriteString("</tr>")
	}
	b.WriteString("</tbody></table>")
	if run.OutOfRangeCount > 30 {
		b.WriteString(fmt.Sprintf("<p>...and %d more. Open admin → Upstream Price Monitor for full details.</p>", run.OutOfRangeCount-30))
	} else {
		b.WriteString("<p>Open admin → Upstream Price Monitor for full details. Prices are not auto-updated.</p>")
	}
	body := b.String()
	for _, to := range cfg.NotifyEmails {
		if err := s.emailService.SendEmail(ctx, to, subject, body); err != nil {
			slog.Warn("upstream price monitor email failed", "to", to, "err", err)
		}
	}
}

func formatOptionalFloat(v *float64) string {
	if v == nil {
		return "-"
	}
	return fmt.Sprintf("%.4f", *v)
}

func validateUpstreamPriceMonitorConfig(cfg *UpstreamPriceMonitorConfig) error {
	if cfg.IntervalSeconds < 3600 || cfg.IntervalSeconds > 86400 {
		return fmt.Errorf("%w: interval_seconds must be 3600..86400", ErrUpstreamPriceMonitorInvalidConfig)
	}
	if cfg.ProfitMin < 0 || cfg.ProfitMax <= 0 || cfg.ProfitMin > cfg.ProfitMax || cfg.ProfitMax >= 1 {
		return fmt.Errorf("%w: profit range must satisfy 0 <= min <= max < 1", ErrUpstreamPriceMonitorInvalidConfig)
	}
	if cfg.TargetProfit != nil {
		t := *cfg.TargetProfit
		if !(t > 0 && t < 1) {
			return fmt.Errorf("%w: target_profit must be in (0,1)", ErrUpstreamPriceMonitorInvalidConfig)
		}
	}
	return nil
}

func normalizeNotifyEmails(raw []string) ([]string, error) {
	seen := make(map[string]struct{}, len(raw))
	out := make([]string, 0, len(raw))
	for _, e := range raw {
		e = strings.TrimSpace(e)
		if e == "" {
			continue
		}
		addr, err := mail.ParseAddress(e)
		if err != nil {
			return nil, fmt.Errorf("%w: invalid email %q", ErrUpstreamPriceMonitorInvalidConfig, e)
		}
		key := strings.ToLower(addr.Address)
		if _, ok := seen[key]; ok {
			continue
		}
		seen[key] = struct{}{}
		out = append(out, addr.Address)
	}
	return out, nil
}

func dedupeInt64(ids []int64) []int64 {
	seen := make(map[int64]struct{}, len(ids))
	out := make([]int64, 0, len(ids))
	for _, id := range ids {
		if id <= 0 {
			continue
		}
		if _, ok := seen[id]; ok {
			continue
		}
		seen[id] = struct{}{}
		out = append(out, id)
	}
	return out
}
