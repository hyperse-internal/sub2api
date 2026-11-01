package schema

import (
	"github.com/Wei-Shaw/sub2api/ent/schema/mixins"

	"entgo.io/ent"
	"entgo.io/ent/dialect"
	"entgo.io/ent/dialect/entsql"
	"entgo.io/ent/schema"
	"entgo.io/ent/schema/field"
)

// UpstreamPriceMonitorConfig 上游价格巡检单例配置（id 固定为 1）。
type UpstreamPriceMonitorConfig struct {
	ent.Schema
}

func (UpstreamPriceMonitorConfig) Annotations() []schema.Annotation {
	return []schema.Annotation{
		entsql.Annotation{Table: "upstream_price_monitor_configs"},
	}
}

func (UpstreamPriceMonitorConfig) Mixin() []ent.Mixin {
	return []ent.Mixin{
		mixins.TimeMixin{},
	}
}

func (UpstreamPriceMonitorConfig) Fields() []ent.Field {
	return []ent.Field{
		field.Bool("enabled").
			Default(false),
		field.Int("interval_seconds").
			Default(43200).
			Range(3600, 86400),
		field.JSON("channel_ids", []int64{}).
			Default([]int64{}),
		field.JSON("notify_emails", []string{}).
			Default([]string{}),
		field.Float("profit_min").
			Default(0.25),
		field.Float("profit_max").
			Default(0.35),
		field.Float("target_profit").
			Optional().
			Nillable(),
		field.Time("last_run_at").
			Optional().
			Nillable().
			SchemaType(map[string]string{
				dialect.Postgres: "timestamptz",
			}),
		field.Int64("updated_by").
			Optional().
			Nillable(),
	}
}
