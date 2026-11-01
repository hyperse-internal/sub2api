package service

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestComputeSellPricesPerMillion(t *testing.T) {
	quote := UpstreamPriceQuote{
		ID:        "gpt-6.1-terra",
		Input:     0.171,
		Output:    0.855,
		CacheRead: 0.0086,
	}
	in, out, read, write, err := computeSellPricesPerMillion(quote, 0.30)
	require.NoError(t, err)
	require.Equal(t, 0.2443, in)
	require.Equal(t, 1.2214, out)
	require.NotNil(t, read)
	require.Equal(t, 0.0123, *read)
	require.NotNil(t, write)
	// write estimated = 0.171 * 1.25 = 0.21375 → /0.7 ≈ 0.3054
	require.Equal(t, 0.3054, *write)
}

func TestApplyTokenSellPricesUpdatesBaseInterval(t *testing.T) {
	in := 1e-7
	out := 2e-7
	p := ChannelModelPricing{
		BillingMode: BillingModeToken,
		Models:      []string{"m"},
		InputPrice:  &in,
		OutputPrice: &out,
		Intervals: []PricingInterval{
			{MinTokens: 0, InputPrice: &in, OutputPrice: &out},
			{MinTokens: 1000, InputPrice: &in, OutputPrice: &out},
		},
	}
	newIn := 3e-7
	newOut := 4e-7
	read := 5e-8
	write := 6e-8
	applyTokenSellPrices(&p, &newIn, &newOut, &read, &write)
	require.Equal(t, &newIn, p.InputPrice)
	require.Equal(t, &newOut, p.OutputPrice)
	require.Equal(t, &read, p.CacheReadPrice)
	require.Equal(t, &write, p.CacheWritePrice)
	require.Equal(t, &newIn, p.Intervals[0].InputPrice)
	require.Equal(t, &newOut, p.Intervals[0].OutputPrice)
	require.Equal(t, &in, p.Intervals[1].InputPrice) // non-base untouched
}

func TestFindChannelModelPricingIndex(t *testing.T) {
	list := []ChannelModelPricing{
		{Models: []string{"a", "B"}},
		{Models: []string{"c"}},
	}
	i, j := findChannelModelPricingIndex(list, "b")
	require.Equal(t, 0, i)
	require.Equal(t, 1, j)
	i, j = findChannelModelPricingIndex(list, "missing")
	require.Equal(t, -1, i)
	require.Equal(t, -1, j)
}

func TestPerMillionToPerToken(t *testing.T) {
	require.InDelta(t, 0.0000002443, perMillionToPerToken(0.2443), 1e-15)
}
