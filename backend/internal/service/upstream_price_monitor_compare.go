package service

import "fmt"

// 渠道 token 单价存的是 USD/token；Teamo cost 与归档售价是 USD/百万 tokens。
const upstreamPriceLocalPerTokenToPerMillion = 1_000_000.0

// CompareChannelModelAgainstUpstream builds one run item for a channel model.
// 明细里的本地价 / 上游价 / 建议价统一为 USD / 百万 tokens。
func CompareChannelModelAgainstUpstream(
	channelID int64,
	channelName string,
	model string,
	pricing *ChannelModelPricing,
	upstream map[string]UpstreamPriceQuote,
	profitMin, profitMax, targetProfit float64,
) UpstreamPriceMonitorRunItem {
	item := UpstreamPriceMonitorRunItem{
		ChannelID:   channelID,
		ChannelName: channelName,
		Model:       model,
	}

	if pricing == nil {
		item.Status = UpstreamPriceMonitorItemUnmatchedLocal
		item.Message = "local pricing missing"
		return item
	}
	if pricing.BillingMode != "" && pricing.BillingMode != BillingModeToken {
		item.Status = UpstreamPriceMonitorItemSkipped
		item.Message = fmt.Sprintf("billing_mode=%s skipped", pricing.BillingMode)
		return item
	}

	quote, ok := upstream[NormalizeModelID(model)]
	if !ok {
		item.Status = UpstreamPriceMonitorItemUnmatchedUpstream
		item.Message = "not found in Teamo pricing"
		return item
	}

	localInPerToken, localOutPerToken, localReadPerToken, localWritePerToken := extractLocalTokenPrices(pricing)
	localIn := scalePricePtr(localInPerToken, upstreamPriceLocalPerTokenToPerMillion)
	localOut := scalePricePtr(localOutPerToken, upstreamPriceLocalPerTokenToPerMillion)
	localRead := scalePricePtr(localReadPerToken, upstreamPriceLocalPerTokenToPerMillion)
	localWrite := scalePricePtr(localWritePerToken, upstreamPriceLocalPerTokenToPerMillion)

	item.UpstreamInput = upstreamPriceFloatPtr(quote.Input)
	item.UpstreamOutput = upstreamPriceFloatPtr(quote.Output)
	item.UpstreamCacheRead = upstreamPriceFloatPtr(quote.CacheRead)
	if quote.HasWrite {
		item.UpstreamCacheWrite = upstreamPriceFloatPtr(quote.CacheWrite)
	} else if quote.Input > 0 {
		item.UpstreamCacheWrite = upstreamPriceFloatPtr(EstimateCacheWriteFromInput(quote.Input))
	}
	item.LocalInput = localIn
	item.LocalOutput = localOut
	item.LocalCacheRead = localRead
	item.LocalCacheWrite = localWrite

	if localIn == nil || !(quote.Input > 0) || !(*localIn > 0) {
		item.Status = UpstreamPriceMonitorItemSkipped
		item.Message = "missing input price for margin check"
		return item
	}

	margin, ok := ImpliedGrossMargin(quote.Input, *localIn)
	if !ok {
		item.Status = UpstreamPriceMonitorItemSkipped
		item.Message = "unable to compute margin"
		return item
	}
	item.MarginInput = upstreamPriceFloatPtr(margin)

	if MarginInRange(margin, profitMin, profitMax) {
		item.Status = UpstreamPriceMonitorItemPass
		item.Message = "within profit range"
		return item
	}

	item.Status = UpstreamPriceMonitorItemFail
	item.Message = fmt.Sprintf("margin %.2f%% outside [%.2f%%, %.2f%%]", margin*100, profitMin*100, profitMax*100)

	if sug, ok := SuggestedSellPrice(quote.Input, targetProfit); ok {
		item.SuggestedInput = upstreamPriceFloatPtr(sug)
	}
	if sug, ok := SuggestedSellPrice(quote.Output, targetProfit); ok {
		item.SuggestedOutput = upstreamPriceFloatPtr(sug)
	}
	if sug, ok := SuggestedSellPrice(quote.CacheRead, targetProfit); ok {
		item.SuggestedCacheRead = upstreamPriceFloatPtr(sug)
	}
	writeCost := quote.CacheWrite
	if !quote.HasWrite {
		writeCost = EstimateCacheWriteFromInput(quote.Input)
	}
	if sug, ok := SuggestedSellPrice(writeCost, targetProfit); ok {
		item.SuggestedCacheWrite = upstreamPriceFloatPtr(sug)
	}
	return item
}

func extractLocalTokenPrices(p *ChannelModelPricing) (in, out, read, write *float64) {
	if p == nil {
		return nil, nil, nil, nil
	}
	// Prefer base interval (min_tokens == 0) when present.
	for i := range p.Intervals {
		iv := &p.Intervals[i]
		if iv.MinTokens == 0 {
			return pickPrice(iv.InputPrice, p.InputPrice),
				pickPrice(iv.OutputPrice, p.OutputPrice),
				pickPrice(iv.CacheReadPrice, p.CacheReadPrice),
				pickPrice(firstNonNil(iv.CacheWritePrice, iv.CacheWrite1hPrice), firstNonNil(p.CacheWritePrice, p.CacheWrite1hPrice))
		}
	}
	return p.InputPrice, p.OutputPrice, p.CacheReadPrice, firstNonNil(p.CacheWritePrice, p.CacheWrite1hPrice)
}

func scalePricePtr(v *float64, scale float64) *float64 {
	if v == nil {
		return nil
	}
	return upstreamPriceFloatPtr(*v * scale)
}

func pickPrice(primary, fallback *float64) *float64 {
	if primary != nil {
		return primary
	}
	return fallback
}

func firstNonNil(values ...*float64) *float64 {
	for _, v := range values {
		if v != nil {
			return v
		}
	}
	return nil
}

func upstreamPriceFloatPtr(v float64) *float64 {
	return &v
}
