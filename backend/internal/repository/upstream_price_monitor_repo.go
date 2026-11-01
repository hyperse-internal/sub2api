package repository

import (
	"context"
	"fmt"
	"time"

	dbent "github.com/Wei-Shaw/sub2api/ent"
	"github.com/Wei-Shaw/sub2api/ent/upstreampricemonitorconfig"
	"github.com/Wei-Shaw/sub2api/ent/upstreampricemonitorrun"
	"github.com/Wei-Shaw/sub2api/ent/upstreampricemonitorrunitem"
	"github.com/Wei-Shaw/sub2api/internal/pkg/pagination"
	"github.com/Wei-Shaw/sub2api/internal/service"
)

type upstreamPriceMonitorRepository struct {
	client *dbent.Client
}

// NewUpstreamPriceMonitorRepository 创建仓储。
func NewUpstreamPriceMonitorRepository(client *dbent.Client) service.UpstreamPriceMonitorRepository {
	return &upstreamPriceMonitorRepository{client: client}
}

func (r *upstreamPriceMonitorRepository) GetConfig(ctx context.Context) (*service.UpstreamPriceMonitorConfig, error) {
	client := clientFromContext(ctx, r.client)
	row, err := client.UpstreamPriceMonitorConfig.Query().
		Where(upstreampricemonitorconfig.IDEQ(1)).
		Only(ctx)
	if dbent.IsNotFound(err) {
		// Migration seeds id=1; if missing, return defaults for upsert.
		return &service.UpstreamPriceMonitorConfig{
			ID:              1,
			Enabled:         false,
			IntervalSeconds: 43200,
			ChannelIDs:      []int64{},
			NotifyEmails:    []string{},
			ProfitMin:       0.25,
			ProfitMax:       0.35,
		}, nil
	}
	if err != nil {
		return nil, fmt.Errorf("get upstream price monitor config: %w", err)
	}
	return entToUpstreamPriceMonitorConfig(row), nil
}

func (r *upstreamPriceMonitorRepository) UpsertConfig(ctx context.Context, cfg *service.UpstreamPriceMonitorConfig) error {
	client := clientFromContext(ctx, r.client)
	channelIDs := cfg.ChannelIDs
	if channelIDs == nil {
		channelIDs = []int64{}
	}
	emails := cfg.NotifyEmails
	if emails == nil {
		emails = []string{}
	}

	// 保证单例行存在（migration 已 seed；测试库可能尚未执行 INSERT）。
	if _, err := client.ExecContext(ctx,
		`INSERT INTO upstream_price_monitor_configs (id) VALUES (1) ON CONFLICT (id) DO NOTHING`,
	); err != nil {
		return fmt.Errorf("ensure upstream price monitor config: %w", err)
	}

	updater := client.UpstreamPriceMonitorConfig.UpdateOneID(1).
		SetEnabled(cfg.Enabled).
		SetIntervalSeconds(cfg.IntervalSeconds).
		SetChannelIds(channelIDs).
		SetNotifyEmails(emails).
		SetProfitMin(cfg.ProfitMin).
		SetProfitMax(cfg.ProfitMax).
		SetNillableUpdatedBy(cfg.UpdatedBy)
	if cfg.TargetProfit != nil {
		updater = updater.SetTargetProfit(*cfg.TargetProfit)
	} else {
		updater = updater.ClearTargetProfit()
	}
	if cfg.LastRunAt != nil {
		updater = updater.SetLastRunAt(*cfg.LastRunAt)
	}

	updated, err := updater.Save(ctx)
	if err != nil {
		return fmt.Errorf("update upstream price monitor config: %w", err)
	}
	*cfg = *entToUpstreamPriceMonitorConfig(updated)
	return nil
}

func (r *upstreamPriceMonitorRepository) TouchLastRunAt(ctx context.Context, t time.Time) error {
	client := clientFromContext(ctx, r.client)
	err := client.UpstreamPriceMonitorConfig.UpdateOneID(1).
		SetLastRunAt(t).
		Exec(ctx)
	if err != nil {
		return fmt.Errorf("touch last_run_at: %w", err)
	}
	return nil
}

func (r *upstreamPriceMonitorRepository) CreateRun(ctx context.Context, run *service.UpstreamPriceMonitorRun) error {
	client := clientFromContext(ctx, r.client)
	channelIDs := run.ChannelIDs
	if channelIDs == nil {
		channelIDs = []int64{}
	}
	builder := client.UpstreamPriceMonitorRun.Create().
		SetStatus(upstreampricemonitorrun.Status(run.Status)).
		SetStartedAt(run.StartedAt).
		SetModelCount(run.ModelCount).
		SetMatchedCount(run.MatchedCount).
		SetOutOfRangeCount(run.OutOfRangeCount).
		SetSummary(run.Summary).
		SetChannelIds(channelIDs).
		SetProfitMin(run.ProfitMin).
		SetProfitMax(run.ProfitMax).
		SetNillableTargetProfit(run.TargetProfit).
		SetNillableFinishedAt(run.FinishedAt).
		SetNillableUpstreamFetchedAt(run.UpstreamFetchedAt).
		SetNillableErrorMessage(run.ErrorMessage)
	created, err := builder.Save(ctx)
	if err != nil {
		return fmt.Errorf("create upstream price monitor run: %w", err)
	}
	run.ID = created.ID
	run.CreatedAt = created.CreatedAt
	run.UpdatedAt = created.UpdatedAt
	return nil
}

func (r *upstreamPriceMonitorRepository) FinishRun(ctx context.Context, run *service.UpstreamPriceMonitorRun) error {
	client := clientFromContext(ctx, r.client)
	updater := client.UpstreamPriceMonitorRun.UpdateOneID(run.ID).
		SetStatus(upstreampricemonitorrun.Status(run.Status)).
		SetModelCount(run.ModelCount).
		SetMatchedCount(run.MatchedCount).
		SetOutOfRangeCount(run.OutOfRangeCount).
		SetSummary(run.Summary).
		SetNillableFinishedAt(run.FinishedAt).
		SetNillableUpstreamFetchedAt(run.UpstreamFetchedAt)
	if run.ErrorMessage != nil {
		updater = updater.SetErrorMessage(*run.ErrorMessage)
	} else {
		updater = updater.ClearErrorMessage()
	}
	updated, err := updater.Save(ctx)
	if err != nil {
		return fmt.Errorf("finish upstream price monitor run: %w", err)
	}
	run.UpdatedAt = updated.UpdatedAt
	return nil
}

func (r *upstreamPriceMonitorRepository) CreateRunItems(ctx context.Context, items []service.UpstreamPriceMonitorRunItem) error {
	if len(items) == 0 {
		return nil
	}
	client := clientFromContext(ctx, r.client)
	builders := make([]*dbent.UpstreamPriceMonitorRunItemCreate, 0, len(items))
	for i := range items {
		it := &items[i]
		b := client.UpstreamPriceMonitorRunItem.Create().
			SetRunID(it.RunID).
			SetChannelID(it.ChannelID).
			SetChannelName(it.ChannelName).
			SetModel(it.Model).
			SetStatus(upstreampricemonitorrunitem.Status(it.Status)).
			SetMessage(it.Message).
			SetNillableUpstreamInput(it.UpstreamInput).
			SetNillableUpstreamOutput(it.UpstreamOutput).
			SetNillableUpstreamCacheRead(it.UpstreamCacheRead).
			SetNillableUpstreamCacheWrite(it.UpstreamCacheWrite).
			SetNillableLocalInput(it.LocalInput).
			SetNillableLocalOutput(it.LocalOutput).
			SetNillableLocalCacheRead(it.LocalCacheRead).
			SetNillableLocalCacheWrite(it.LocalCacheWrite).
			SetNillableSuggestedInput(it.SuggestedInput).
			SetNillableSuggestedOutput(it.SuggestedOutput).
			SetNillableSuggestedCacheRead(it.SuggestedCacheRead).
			SetNillableSuggestedCacheWrite(it.SuggestedCacheWrite).
			SetNillableMarginInput(it.MarginInput)
		builders = append(builders, b)
	}
	created, err := client.UpstreamPriceMonitorRunItem.CreateBulk(builders...).Save(ctx)
	if err != nil {
		return fmt.Errorf("create upstream price monitor run items: %w", err)
	}
	for i := range created {
		items[i].ID = created[i].ID
		items[i].CreatedAt = created[i].CreatedAt
	}
	return nil
}

func (r *upstreamPriceMonitorRepository) ListRuns(ctx context.Context, params pagination.PaginationParams) ([]service.UpstreamPriceMonitorRun, *pagination.PaginationResult, error) {
	client := clientFromContext(ctx, r.client)
	total, err := client.UpstreamPriceMonitorRun.Query().Count(ctx)
	if err != nil {
		return nil, nil, fmt.Errorf("count upstream price monitor runs: %w", err)
	}
	rows, err := client.UpstreamPriceMonitorRun.Query().
		Order(dbent.Desc(upstreampricemonitorrun.FieldStartedAt)).
		Offset(params.Offset()).
		Limit(params.Limit()).
		All(ctx)
	if err != nil {
		return nil, nil, fmt.Errorf("list upstream price monitor runs: %w", err)
	}
	out := make([]service.UpstreamPriceMonitorRun, 0, len(rows))
	for _, row := range rows {
		out = append(out, *entToUpstreamPriceMonitorRun(row, nil))
	}
	return out, paginationResultFromTotal(int64(total), params), nil
}

func (r *upstreamPriceMonitorRepository) GetRunByID(ctx context.Context, id int64) (*service.UpstreamPriceMonitorRun, error) {
	client := clientFromContext(ctx, r.client)
	row, err := client.UpstreamPriceMonitorRun.Query().
		Where(upstreampricemonitorrun.IDEQ(id)).
		WithItems(func(q *dbent.UpstreamPriceMonitorRunItemQuery) {
			q.Order(dbent.Asc(upstreampricemonitorrunitem.FieldChannelID), dbent.Asc(upstreampricemonitorrunitem.FieldModel))
		}).
		Only(ctx)
	if err != nil {
		return nil, translatePersistenceError(err, service.ErrUpstreamPriceMonitorRunNotFound, nil)
	}
	var items []service.UpstreamPriceMonitorRunItem
	for _, it := range row.Edges.Items {
		items = append(items, *entToUpstreamPriceMonitorRunItem(it))
	}
	return entToUpstreamPriceMonitorRun(row, items), nil
}

func (r *upstreamPriceMonitorRepository) DeleteRunByID(ctx context.Context, id int64) error {
	client := clientFromContext(ctx, r.client)
	n, err := client.UpstreamPriceMonitorRun.Delete().
		Where(upstreampricemonitorrun.IDEQ(id)).
		Exec(ctx)
	if err != nil {
		return fmt.Errorf("delete upstream price monitor run: %w", err)
	}
	if n == 0 {
		return service.ErrUpstreamPriceMonitorRunNotFound
	}
	return nil
}

func (r *upstreamPriceMonitorRepository) DeleteRunsStartedBefore(ctx context.Context, before time.Time) (int, error) {
	client := clientFromContext(ctx, r.client)
	n, err := client.UpstreamPriceMonitorRun.Delete().
		Where(upstreampricemonitorrun.StartedAtLT(before)).
		Exec(ctx)
	if err != nil {
		return 0, fmt.Errorf("prune upstream price monitor runs: %w", err)
	}
	return n, nil
}

func entToUpstreamPriceMonitorConfig(row *dbent.UpstreamPriceMonitorConfig) *service.UpstreamPriceMonitorConfig {
	cfg := &service.UpstreamPriceMonitorConfig{
		ID:              row.ID,
		Enabled:         row.Enabled,
		IntervalSeconds: row.IntervalSeconds,
		ChannelIDs:      append([]int64(nil), row.ChannelIds...),
		NotifyEmails:    append([]string(nil), row.NotifyEmails...),
		ProfitMin:       row.ProfitMin,
		ProfitMax:       row.ProfitMax,
		TargetProfit:    row.TargetProfit,
		LastRunAt:       row.LastRunAt,
		UpdatedBy:       row.UpdatedBy,
		CreatedAt:       row.CreatedAt,
		UpdatedAt:       row.UpdatedAt,
	}
	if cfg.ChannelIDs == nil {
		cfg.ChannelIDs = []int64{}
	}
	if cfg.NotifyEmails == nil {
		cfg.NotifyEmails = []string{}
	}
	return cfg
}

func entToUpstreamPriceMonitorRun(row *dbent.UpstreamPriceMonitorRun, items []service.UpstreamPriceMonitorRunItem) *service.UpstreamPriceMonitorRun {
	run := &service.UpstreamPriceMonitorRun{
		ID:                row.ID,
		Status:            string(row.Status),
		StartedAt:         row.StartedAt,
		FinishedAt:        row.FinishedAt,
		UpstreamFetchedAt: row.UpstreamFetchedAt,
		ModelCount:        row.ModelCount,
		MatchedCount:      row.MatchedCount,
		OutOfRangeCount:   row.OutOfRangeCount,
		Summary:           row.Summary,
		ErrorMessage:      row.ErrorMessage,
		ChannelIDs:        append([]int64(nil), row.ChannelIds...),
		ProfitMin:         row.ProfitMin,
		ProfitMax:         row.ProfitMax,
		TargetProfit:      row.TargetProfit,
		CreatedAt:         row.CreatedAt,
		UpdatedAt:         row.UpdatedAt,
		Items:             items,
	}
	if run.ChannelIDs == nil {
		run.ChannelIDs = []int64{}
	}
	if run.Items == nil {
		run.Items = []service.UpstreamPriceMonitorRunItem{}
	}
	return run
}

func entToUpstreamPriceMonitorRunItem(row *dbent.UpstreamPriceMonitorRunItem) *service.UpstreamPriceMonitorRunItem {
	return &service.UpstreamPriceMonitorRunItem{
		ID:                  row.ID,
		RunID:               row.RunID,
		ChannelID:           row.ChannelID,
		ChannelName:         row.ChannelName,
		Model:               row.Model,
		Status:              string(row.Status),
		UpstreamInput:       row.UpstreamInput,
		UpstreamOutput:      row.UpstreamOutput,
		UpstreamCacheRead:   row.UpstreamCacheRead,
		UpstreamCacheWrite:  row.UpstreamCacheWrite,
		LocalInput:          row.LocalInput,
		LocalOutput:         row.LocalOutput,
		LocalCacheRead:      row.LocalCacheRead,
		LocalCacheWrite:     row.LocalCacheWrite,
		SuggestedInput:      row.SuggestedInput,
		SuggestedOutput:     row.SuggestedOutput,
		SuggestedCacheRead:  row.SuggestedCacheRead,
		SuggestedCacheWrite: row.SuggestedCacheWrite,
		MarginInput:         row.MarginInput,
		Message:             row.Message,
		CreatedAt:           row.CreatedAt,
	}
}
