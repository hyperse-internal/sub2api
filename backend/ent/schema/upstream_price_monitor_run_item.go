package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/dialect/entsql"
	"entgo.io/ent/schema"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// UpstreamPriceMonitorRunItem 巡检明细（单渠道单模型一行）。
type UpstreamPriceMonitorRunItem struct {
	ent.Schema
}

func (UpstreamPriceMonitorRunItem) Annotations() []schema.Annotation {
	return []schema.Annotation{
		entsql.Annotation{Table: "upstream_price_monitor_run_items"},
	}
}

func (UpstreamPriceMonitorRunItem) Fields() []ent.Field {
	return []ent.Field{
		field.Int64("run_id"),
		field.Int64("channel_id"),
		field.String("channel_name").
			Default("").
			MaxLen(200),
		field.String("model").
			NotEmpty().
			MaxLen(200),
		field.Enum("status").
			Values("pass", "fail", "unmatched_upstream", "unmatched_local", "skipped"),
		field.Float("upstream_input").
			Optional().
			Nillable(),
		field.Float("upstream_output").
			Optional().
			Nillable(),
		field.Float("upstream_cache_read").
			Optional().
			Nillable(),
		field.Float("upstream_cache_write").
			Optional().
			Nillable(),
		field.Float("local_input").
			Optional().
			Nillable(),
		field.Float("local_output").
			Optional().
			Nillable(),
		field.Float("local_cache_read").
			Optional().
			Nillable(),
		field.Float("local_cache_write").
			Optional().
			Nillable(),
		field.Float("suggested_input").
			Optional().
			Nillable(),
		field.Float("suggested_output").
			Optional().
			Nillable(),
		field.Float("suggested_cache_read").
			Optional().
			Nillable(),
		field.Float("suggested_cache_write").
			Optional().
			Nillable(),
		field.Float("margin_input").
			Optional().
			Nillable(),
		field.String("message").
			Default("").
			MaxLen(500),
		field.Time("created_at").
			Immutable().
			Default(time.Now),
	}
}

func (UpstreamPriceMonitorRunItem) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("run", UpstreamPriceMonitorRun.Type).
			Ref("items").
			Field("run_id").
			Unique().
			Required(),
	}
}

func (UpstreamPriceMonitorRunItem) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("run_id"),
	}
}
