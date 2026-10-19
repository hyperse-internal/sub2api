import type { ApiKey } from '@/types'

export const IMAGE_QUALITIES = ['auto', 'low', 'medium', 'high', 'xhigh', 'max'] as const
export type ImageQuality = (typeof IMAGE_QUALITIES)[number]

export const IMAGE_OUTPUT_FORMATS = ['png', 'jpeg', 'webp'] as const
export type ImageOutputFormat = (typeof IMAGE_OUTPUT_FORMATS)[number]

export const IMAGE_BACKGROUNDS = ['auto', 'opaque', 'transparent'] as const
export type ImageBackground = (typeof IMAGE_BACKGROUNDS)[number]

export const MIN_IMAGE_COUNT = 1
export const MAX_IMAGE_COUNT = 4
export const DEFAULT_IMAGE_COUNT = 1
export const MAX_REFERENCE_IMAGES = 10
export const MAX_REFERENCE_BYTES = 10 * 1024 * 1024

const VARIANT_SUFFIX = /-(?:\d+k|flare|sunburst|quality)$/i

export interface ImageStudioModelOption {
  id: string
  model: string
  family: string
  rate: number
  rateLabel: string
  groupLabel: string
  apiKey: string
  keyId: number
  keyName: string
}

export interface ImageStudioModelGroup {
  label: string
  family: string
  rateLabel: string
  models: ImageStudioModelOption[]
}

export function keyAllowsImageStudio(key: ApiKey): boolean {
  const platform = key.group?.platform
  return (
    key.status === 'active' &&
    (platform === 'openai' || platform === 'grok') &&
    key.group?.allow_image_generation === true &&
    Boolean(key.key)
  )
}

export function imageRateForKey(key: ApiKey): number {
  const group = key.group
  if (!group) return 1
  const rate = group.image_rate_independent ? group.image_rate_multiplier : group.rate_multiplier
  return Number.isFinite(rate) ? rate : 1
}

export function formatRateLabel(rate: number): string {
  if (!Number.isFinite(rate)) return '1'
  const rounded = Number(rate.toFixed(4))
  return String(rounded)
}

export function isStudioImageModel(model: string): boolean {
  const normalized = model.trim().toLowerCase()
  return (
    normalized.startsWith('gpt-image-') ||
    normalized.startsWith('dall-e-') ||
    normalized.startsWith('grok-imagine')
  )
}

export function imageModelFamily(model: string): string {
  let current = model.trim()
  while (VARIANT_SUFFIX.test(current)) {
    const next = current.replace(VARIANT_SUFFIX, '')
    if (!next || next === current) break
    current = next
  }
  return current
}

export function buildImageStudioCatalog(
  entries: Array<{ key: ApiKey; models: string[] }>
): ImageStudioModelGroup[] {
  const byGroup = new Map<string, ImageStudioModelGroup>()
  const seenModel = new Set<string>()

  for (const entry of entries) {
    if (!keyAllowsImageStudio(entry.key)) continue
    const rate = imageRateForKey(entry.key)
    const rateLabel = formatRateLabel(rate)
    for (const rawModel of entry.models) {
      const model = rawModel.trim()
      if (!isStudioImageModel(model)) continue
      const family = imageModelFamily(model)
      const dedupe = `${family}|${rateLabel}|${model}`
      if (seenModel.has(dedupe)) continue
      seenModel.add(dedupe)
      const groupLabel = rateLabel === '1' ? family : `${family}-${rateLabel}x`
      const groupKey = `${family}|${rateLabel}`
      const group = byGroup.get(groupKey) ?? {
        label: groupLabel,
        family,
        rateLabel,
        models: []
      }
      group.models.push({
        id: `${entry.key.id}:${model}`,
        model,
        family,
        rate,
        rateLabel,
        groupLabel,
        apiKey: entry.key.key,
        keyId: entry.key.id,
        keyName: entry.key.name
      })
      byGroup.set(groupKey, group)
    }
  }

  return [...byGroup.values()]
    .map((group) => ({
      ...group,
      models: [...group.models].sort((a, b) => a.model.localeCompare(b.model))
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

const BASE_QUALITIES: ImageQuality[] = ['auto', 'low', 'medium', 'high']

export function qualitiesForModel(model: string): ImageQuality[] {
  return model.trim().startsWith('gpt-image-2.5') ? [...BASE_QUALITIES, 'xhigh', 'max'] : [...BASE_QUALITIES]
}

export function sizesForModel(model: string): string[] {
  const normalized = model.trim().toLowerCase()
  if (normalized.startsWith('dall-e-')) return ['1024x1024', '1792x1024', '1024x1792']
  if (normalized.startsWith('grok-imagine')) return ['1024x1024', 'auto']
  return ['auto', '1024x1024', '1536x1024', '1024x1536']
}

export function clampImageCount(value: unknown): number {
  const count = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(count)) return DEFAULT_IMAGE_COUNT
  return Math.min(Math.max(Math.round(count), MIN_IMAGE_COUNT), MAX_IMAGE_COUNT)
}
