package service

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestImpliedGrossMargin(t *testing.T) {
	m, ok := ImpliedGrossMargin(0.171, 0.244)
	require.True(t, ok)
	require.InDelta(t, 0.30, m, 0.01)

	_, ok = ImpliedGrossMargin(0, 1)
	require.False(t, ok)
	_, ok = ImpliedGrossMargin(1, 0)
	require.False(t, ok)
}

func TestMarginInRange(t *testing.T) {
	require.True(t, MarginInRange(0.30, 0.25, 0.35))
	require.True(t, MarginInRange(0.25, 0.25, 0.35))
	require.True(t, MarginInRange(0.35, 0.25, 0.35))
	require.False(t, MarginInRange(0.20, 0.25, 0.35))
	require.False(t, MarginInRange(0.40, 0.25, 0.35))
}

func TestSuggestedSellPrice(t *testing.T) {
	// cost / 0.7 ≈ cost × 1.4286
	got, ok := SuggestedSellPrice(0.171, 0.30)
	require.True(t, ok)
	require.Equal(t, 0.2443, got)

	_, ok = SuggestedSellPrice(0.171, 1)
	require.False(t, ok)
}

func TestResolveTargetProfit(t *testing.T) {
	require.Equal(t, 0.30, ResolveTargetProfit(0.25, 0.35, nil))
	target := 0.28
	require.Equal(t, 0.28, ResolveTargetProfit(0.25, 0.35, &target))
}

func TestNormalizeModelID(t *testing.T) {
	require.Equal(t, "gpt-6.1-terra", NormalizeModelID(" GPT-6.1-Terra "))
}

func TestCompareChannelModelAgainstUpstream(t *testing.T) {
	// 渠道库存 USD/token；Teamo 为 USD/百万 tokens。
	in := 0.000000244 // $0.244 / 1M
	out := 0.00000122
	pricing := &ChannelModelPricing{
		BillingMode: BillingModeToken,
		Models:      []string{"gpt-6.1-terra"},
		InputPrice:  &in,
		OutputPrice: &out,
	}
	upstream := map[string]UpstreamPriceQuote{
		"gpt-6.1-terra": {ID: "gpt-6.1-terra", Input: 0.171, Output: 0.855, CacheRead: 0.0086},
	}

	pass := CompareChannelModelAgainstUpstream(3, "GPT", "gpt-6.1-terra", pricing, upstream, 0.25, 0.35, 0.30)
	require.Equal(t, UpstreamPriceMonitorItemPass, pass.Status)
	require.NotNil(t, pass.MarginInput)
	require.NotNil(t, pass.LocalInput)
	require.InDelta(t, 0.244, *pass.LocalInput, 1e-9)

	cheap := 0.00000018 // $0.18 / 1M → 毛利率过低
	pricing.InputPrice = &cheap
	fail := CompareChannelModelAgainstUpstream(3, "GPT", "gpt-6.1-terra", pricing, upstream, 0.25, 0.35, 0.30)
	require.Equal(t, UpstreamPriceMonitorItemFail, fail.Status)
	require.NotNil(t, fail.SuggestedInput)
	require.Equal(t, 0.2443, *fail.SuggestedInput)

	miss := CompareChannelModelAgainstUpstream(3, "GPT", "unknown-model", pricing, upstream, 0.25, 0.35, 0.30)
	require.Equal(t, UpstreamPriceMonitorItemUnmatchedUpstream, miss.Status)

	img := &ChannelModelPricing{BillingMode: BillingModeImage, Models: []string{"gpt-image"}}
	skipped := CompareChannelModelAgainstUpstream(3, "GPT", "gpt-image", img, upstream, 0.25, 0.35, 0.30)
	require.Equal(t, UpstreamPriceMonitorItemSkipped, skipped.Status)
}
