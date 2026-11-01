export function formatPrice(v: number | null | undefined): string {
  if (v == null || Number.isNaN(v)) return '—'
  return v.toFixed(4)
}

export function formatMargin(v: number | null | undefined): string {
  if (v == null || Number.isNaN(v)) return '—'
  return `${(v * 100).toFixed(2)}%`
}

/** 隐含毛利率 = 1 - upstream/local（与后端口径一致）。 */
export function impliedMargin(
  upstream: number | null | undefined,
  local: number | null | undefined
): number | null {
  if (upstream == null || local == null) return null
  if (!(upstream > 0) || !(local > 0)) return null
  const m = 1 - upstream / local
  if (!Number.isFinite(m)) return null
  return m
}

/** 本地价 + 利润比例，如 `1.5300 (30.07%)`。 */
export function formatLocalWithMargin(
  local: number | null | undefined,
  upstream: number | null | undefined,
  marginOverride?: number | null
): string {
  const price = formatPrice(local)
  if (price === '—') return '—'
  const margin = marginOverride ?? impliedMargin(upstream, local)
  if (margin == null) return price
  return `${price} (${formatMargin(margin)})`
}

/**
 * 按毛利率区间反推建议售价区间：sell = cost / (1 - margin)。
 * 返回如 `[1.2267, 1.4154]`（低=利润下限对应售价，高=利润上限对应售价）。
 */
export function formatSuggestedSellRange(
  upstream: number | null | undefined,
  profitMin: number | null | undefined,
  profitMax: number | null | undefined
): string {
  if (upstream == null || !(upstream > 0)) return '—'
  if (profitMin == null || profitMax == null) return '—'
  if (!(profitMin < 1) || !(profitMax < 1)) return '—'
  const low = upstream / (1 - profitMin)
  const high = upstream / (1 - profitMax)
  if (!Number.isFinite(low) || !Number.isFinite(high)) return '—'
  const a = Math.min(low, high)
  const b = Math.max(low, high)
  return `[${formatPrice(a)}, ${formatPrice(b)}]`
}

export function formatPercentInput(v: number): string {
  return String(Math.round(v * 10000) / 100)
}

/** Convert UI percent (e.g. 30) to ratio (0.30). */
export function percentToRatio(pct: number): number {
  return pct / 100
}

/** 利润区间中点（百分比，保留 1 位小数），用于同步价格默认值。 */
export function defaultSyncProfitPct(
  profitMin: number | null | undefined,
  profitMax: number | null | undefined
): number {
  const min = profitMin ?? 0
  const max = profitMax ?? min
  return Math.round(((min + max) / 2) * 1000) / 10
}
