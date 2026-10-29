/**
 * 相对官价折扣：与模型广场倍率列同一口径。
 * 相对官价 = (渠道基础档输入价 × 生效分组/专属倍率) ÷ 官方输入价，四舍五入 1 位小数。
 */

import type { PlazaModel } from '@/api/modelPlaza'
import type { UserPricingInterval } from '@/api/channels'
import { BILLING_MODE_TOKEN } from '@/constants/channel'
import { resolveIntervalPrices } from '@/utils/pricing'

export type PricingHintMode = 'relative' | 'by_model' | 'group_rate'

export interface RelativeRateRange {
  min: number
  max: number
}

function sortByContext(intervals: UserPricingInterval[]): UserPricingInterval[] {
  return [...intervals].sort((a, b) => a.min_tokens - b.min_tokens)
}

function isTokenModel(m: PlazaModel): boolean {
  return (m.pricing?.billing_mode || BILLING_MODE_TOKEN) === BILLING_MODE_TOKEN
}

/** 取基础档(或平价)渠道输入单价。非 token / 无价返回 null。 */
export function basePaidInput(m: PlazaModel): number | null {
  if (!isTokenModel(m) || !m.pricing) return null
  const intervals = sortByContext(m.pricing.intervals ?? []).map((iv) =>
    resolveIntervalPrices(iv, m.pricing!)
  )
  if (intervals.length > 0) {
    const v = intervals[0]?.input_price
    if (v != null) return v
  }
  return m.pricing.input_price ?? null
}

/** 取基础档(或平价)官方输入单价。 */
export function baseOfficialInput(m: PlazaModel): number | null {
  if (!isTokenModel(m)) return null
  const intervals = sortByContext(m.official_pricing?.intervals ?? [])
  if (intervals.length > 0) {
    const v = intervals[0]?.input_price
    if (v != null) return v
  }
  return m.official_pricing?.input_price ?? null
}

/**
 * 相对官价折扣 = (渠道输入价 × 行生效倍率) ÷ 官方输入价。
 * 渠道绝对定价 + 分组费率 1.0 时，此值才是用户感知的「几折」；无官价时返回 null。
 */
export function vsOfficialWithRate(m: PlazaModel, rate: number): number | null {
  const paid = basePaidInput(m)
  const officialInput = baseOfficialInput(m)
  if (paid == null || officialInput == null || !(officialInput > 0)) return null
  const ratio = (paid * rate) / officialInput
  if (!Number.isFinite(ratio) || ratio <= 0) return null
  return Math.round(ratio * 10) / 10
}

/** 聚合分组内 token 模型的相对官价区间；无有效比值返回 null。 */
export function summarizeGroupRelativeRate(
  models: PlazaModel[],
  effectiveRate: number
): RelativeRateRange | null {
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  for (const m of models) {
    const ratio = vsOfficialWithRate(m, effectiveRate)
    if (ratio == null) continue
    if (ratio < min) min = ratio
    if (ratio > max) max = ratio
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null
  return { min, max }
}

/** min≈max 时单值，否则区间（en dash）。 */
export function formatRelativeRateRange(range: RelativeRateRange): string {
  if (range.min === range.max) return `${range.min}x`
  return `${range.min}x–${range.max}x`
}

export interface GroupPricingHint {
  mode: PricingHintMode
  relativeRange: RelativeRateRange | null
  /** 有专属倍率时，分组默认倍率下的区间（划线对比用）。 */
  groupRelativeRange: RelativeRateRange | null
  /** by_model 且分组费率有信息量时，次要展示分组费率。 */
  showSecondaryGroupRate: boolean
}

/**
 * 密钥选分组展示口径：能算相对官价 → relative；否则 by_model（弱化裸 1x）。
 * models 缺失（广场关/失败）时走 by_model。
 */
export function buildGroupPricingHint(opts: {
  models?: PlazaModel[] | null
  rateMultiplier: number
  userRateMultiplier?: number | null
}): GroupPricingHint {
  const { models, rateMultiplier } = opts
  const userRate = opts.userRateMultiplier
  const hasCustom =
    userRate != null && userRate !== rateMultiplier
  const effective = userRate ?? rateMultiplier

  if (models == null) {
    return {
      mode: 'by_model',
      relativeRange: null,
      groupRelativeRange: null,
      showSecondaryGroupRate: rateMultiplier !== 1 || hasCustom
    }
  }

  const relativeRange = summarizeGroupRelativeRate(models, effective)
  if (relativeRange) {
    return {
      mode: 'relative',
      relativeRange,
      groupRelativeRange: hasCustom
        ? summarizeGroupRelativeRate(models, rateMultiplier)
        : null,
      showSecondaryGroupRate: false
    }
  }

  return {
    mode: 'by_model',
    relativeRange: null,
    groupRelativeRange: null,
    showSecondaryGroupRate: rateMultiplier !== 1 || hasCustom
  }
}
