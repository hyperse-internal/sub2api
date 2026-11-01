package service

import (
	"context"
	"fmt"
	"strings"
)

// SyncChannelModelPriceInput 按指定毛利率把上游成本写回渠道模型售价。
type SyncChannelModelPriceInput struct {
	ChannelID int64
	Model     string
	Profit    float64 // 毛利率比例，(0, 1)
}

// SyncChannelModelPriceResult 同步后的售价（USD / 百万 tokens，便于对照巡检页）。
type SyncChannelModelPriceResult struct {
	ChannelID       int64    `json:"channel_id"`
	Model           string   `json:"model"`
	Profit          float64  `json:"profit"`
	Input           float64  `json:"input"`
	Output          float64  `json:"output"`
	CacheRead       *float64 `json:"cache_read,omitempty"`
	CacheWrite      *float64 `json:"cache_write,omitempty"`
	LocalInput      float64  `json:"local_input"`  // USD/token 写入值
	LocalOutput     float64  `json:"local_output"` // USD/token 写入值
	LocalCacheRead  *float64 `json:"local_cache_read,omitempty"`
	LocalCacheWrite *float64 `json:"local_cache_write,omitempty"`
}

// SyncChannelModelPrice 拉取上游成本，按毛利率计算售价并写回渠道该模型定价。
func (s *UpstreamPriceMonitorService) SyncChannelModelPrice(
	ctx context.Context,
	input SyncChannelModelPriceInput,
) (*SyncChannelModelPriceResult, error) {
	model := strings.TrimSpace(input.Model)
	if input.ChannelID <= 0 || model == "" {
		return nil, fmt.Errorf("%w: channel_id and model are required", ErrUpstreamPriceMonitorInvalidSync)
	}
	if !(input.Profit > 0) || !(input.Profit < 1) {
		return nil, fmt.Errorf("%w: profit must be in (0,1)", ErrUpstreamPriceMonitorInvalidSync)
	}
	if s.channelService == nil {
		return nil, fmt.Errorf("%w: channel service unavailable", ErrUpstreamPriceMonitorInvalidSync)
	}

	quotes, err := s.pricingClient.FetchModelPricing(ctx)
	if err != nil {
		return nil, err
	}
	quote, ok := quotes[NormalizeModelID(model)]
	if !ok || !(quote.Input > 0) {
		return nil, ErrUpstreamPriceMonitorUpstreamMissing
	}

	channel, err := s.channelRepo.GetByID(ctx, input.ChannelID)
	if err != nil {
		return nil, err
	}

	pricingIdx, modelIdx := findChannelModelPricingIndex(channel.ModelPricing, model)
	if pricingIdx < 0 {
		return nil, ErrUpstreamPriceMonitorModelNotFound
	}
	entry := channel.ModelPricing[pricingIdx]
	if entry.BillingMode != "" && entry.BillingMode != BillingModeToken {
		return nil, fmt.Errorf("%w: only token billing models can be synced", ErrUpstreamPriceMonitorInvalidSync)
	}

	inPerM, outPerM, readPerM, writePerM, err := computeSellPricesPerMillion(quote, input.Profit)
	if err != nil {
		return nil, err
	}
	inToken := perMillionToPerToken(inPerM)
	outToken := perMillionToPerToken(outPerM)
	var readToken, writeToken *float64
	if readPerM != nil {
		v := perMillionToPerToken(*readPerM)
		readToken = &v
	}
	if writePerM != nil {
		v := perMillionToPerToken(*writePerM)
		writeToken = &v
	}

	updated := cloneChannelModelPricing(entry)
	applyTokenSellPrices(&updated, &inToken, &outToken, readToken, writeToken)

	newList := make([]ChannelModelPricing, 0, len(channel.ModelPricing)+1)
	for i := range channel.ModelPricing {
		if i != pricingIdx {
			newList = append(newList, channel.ModelPricing[i])
			continue
		}
		if len(entry.Models) == 1 {
			updated.Models = []string{entry.Models[modelIdx]}
			newList = append(newList, updated)
			continue
		}
		// 多模型共用定价：拆出目标模型，避免牵连其它模型。
		remaining := append([]string(nil), entry.Models[:modelIdx]...)
		remaining = append(remaining, entry.Models[modelIdx+1:]...)
		shared := cloneChannelModelPricing(entry)
		shared.Models = remaining
		newList = append(newList, shared)

		updated.ID = 0
		updated.Models = []string{entry.Models[modelIdx]}
		newList = append(newList, updated)
	}

	if _, err := s.channelService.Update(ctx, input.ChannelID, &UpdateChannelInput{
		ModelPricing: &newList,
	}); err != nil {
		return nil, err
	}

	return &SyncChannelModelPriceResult{
		ChannelID:       input.ChannelID,
		Model:           entry.Models[modelIdx],
		Profit:          input.Profit,
		Input:           inPerM,
		Output:          outPerM,
		CacheRead:       readPerM,
		CacheWrite:      writePerM,
		LocalInput:      inToken,
		LocalOutput:     outToken,
		LocalCacheRead:  readToken,
		LocalCacheWrite: writeToken,
	}, nil
}

func computeSellPricesPerMillion(quote UpstreamPriceQuote, profit float64) (in, out float64, read, write *float64, err error) {
	in, ok := SuggestedSellPrice(quote.Input, profit)
	if !ok {
		return 0, 0, nil, nil, fmt.Errorf("%w: unable to compute input sell price", ErrUpstreamPriceMonitorInvalidSync)
	}
	out, ok = SuggestedSellPrice(quote.Output, profit)
	if !ok {
		return 0, 0, nil, nil, fmt.Errorf("%w: unable to compute output sell price", ErrUpstreamPriceMonitorInvalidSync)
	}
	if quote.CacheRead > 0 {
		if v, ok := SuggestedSellPrice(quote.CacheRead, profit); ok {
			read = upstreamPriceFloatPtr(v)
		}
	}
	writeCost := quote.CacheWrite
	if !quote.HasWrite {
		writeCost = EstimateCacheWriteFromInput(quote.Input)
	}
	if writeCost > 0 {
		if v, ok := SuggestedSellPrice(writeCost, profit); ok {
			write = upstreamPriceFloatPtr(v)
		}
	}
	return in, out, read, write, nil
}

func perMillionToPerToken(perMillion float64) float64 {
	return perMillion / upstreamPriceLocalPerTokenToPerMillion
}

func findChannelModelPricingIndex(list []ChannelModelPricing, model string) (pricingIdx, modelIdx int) {
	want := NormalizeModelID(model)
	for i := range list {
		for j, m := range list[i].Models {
			if NormalizeModelID(m) == want {
				return i, j
			}
		}
	}
	return -1, -1
}

func applyTokenSellPrices(p *ChannelModelPricing, in, out, read, write *float64) {
	if p == nil {
		return
	}
	p.BillingMode = BillingModeToken
	p.InputPrice = in
	p.OutputPrice = out
	if read != nil {
		p.CacheReadPrice = read
	}
	if write != nil {
		p.CacheWritePrice = write
	}
	for i := range p.Intervals {
		if p.Intervals[i].MinTokens != 0 {
			continue
		}
		p.Intervals[i].InputPrice = in
		p.Intervals[i].OutputPrice = out
		if read != nil {
			p.Intervals[i].CacheReadPrice = read
		}
		if write != nil {
			p.Intervals[i].CacheWritePrice = write
		}
	}
}

func cloneChannelModelPricing(src ChannelModelPricing) ChannelModelPricing {
	dst := src
	if src.Models != nil {
		dst.Models = append([]string(nil), src.Models...)
	}
	if src.Intervals != nil {
		dst.Intervals = append([]PricingInterval(nil), src.Intervals...)
	}
	if src.ReasoningEffortMultipliers != nil {
		dst.ReasoningEffortMultipliers = make(map[string]float64, len(src.ReasoningEffortMultipliers))
		for k, v := range src.ReasoningEffortMultipliers {
			dst.ReasoningEffortMultipliers[k] = v
		}
	}
	if src.TimePricing != nil {
		tp := *src.TimePricing
		if src.TimePricing.Periods != nil {
			tp.Periods = append([]ChannelTimePricingPeriod(nil), src.TimePricing.Periods...)
		}
		dst.TimePricing = &tp
	}
	return dst
}
