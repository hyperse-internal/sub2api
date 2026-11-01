package schema

import (
	"time"

	"github.com/Wei-Shaw/sub2api/ent/schema/mixins"

	"entgo.io/ent"
	"entgo.io/ent/dialect"
	"entgo.io/ent/dialect/entsql"
	"entgo.io/ent/schema"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// UpstreamPriceMonitorRun 一次上游价格巡检执行记录。
type UpstreamPriceMonitorRun struct {
	ent.Schema
}

func (UpstreamPriceMonitorRun) Annotations() []schema.Annotation {
	return []schema.Annotation{
		entsql.Annotation{Table: "upstream_price_monitor_runs"},
	}
}

func (UpstreamPriceMonitorRun) Mixin() []ent.Mixin {
	return []ent.Mixin{
		mixins.TimeMixin{},
	}
}

func (UpstreamPriceMonitorRun) Fields() []ent.Field {
	return []ent.Field{
		field.Enum("status").
			Values("running", "passed", "failed", "error"),
		field.Time("started_at").
			Default(time.Now).
			SchemaType(map[string]string{
				dialect.Postgres: "timestamptz",
			}),
		field.Time("finished_at").
			Optional().
			Nillable().
			SchemaType(map[string]string{
				dialect.Postgres: "timestamptz",
			}),
		field.Time("upstream_fetched_at").
			Optional().
			Nillable().
			SchemaType(map[string]string{
				dialect.Postgres: "timestamptz",
			}),
		field.Int("model_count").
			Default(0),
		field.Int("matched_count").
			Default(0),
		field.Int("out_of_range_count").
			Default(0),
		field.Text("summary").
			Default(""),
		field.Text("error_message").
			Optional().
			Nillable(),
		field.JSON("channel_ids", []int64{}).
			Default([]int64{}),
		field.Float("profit_min").
			Default(0),
		field.Float("profit_max").
			Default(0),
		field.Float("target_profit").
			Optional().
			Nillable(),
	}
}

func (UpstreamPriceMonitorRun) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("items", UpstreamPriceMonitorRunItem.Type).
			Annotations(entsql.OnDelete(entsql.Cascade)),
	}
}

func (UpstreamPriceMonitorRun) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("started_at"),
	}
}
