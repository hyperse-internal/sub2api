import type { GroupPlatform } from '@/types'

/**
 * 创建密钥时的厂商平铺顺序（按 platform，不再聚合成 4 大类）。
 * 未知平台会出现在列表末尾。
 */
export const KEY_CREATE_PLATFORMS = [
  'anthropic',
  'openai',
  'gemini',
  'grok',
  'deepseek',
  'kimi',
  'zhipu',
  'minimax',
  'antigravity',
  'opencode_go',
  'typesafe',
  'command_code',
  'cline',
  'composite'
] as const satisfies readonly GroupPlatform[]

export type KeyCreatePlatform = (typeof KEY_CREATE_PLATFORMS)[number]

const PLATFORM_ORDER = new Map<string, number>(
  KEY_CREATE_PLATFORMS.map((platform, index) => [platform, index])
)

/** 稳定排序：已知平台按 KEY_CREATE_PLATFORMS，其余按名字排在末尾。 */
export function compareKeyCreatePlatforms(a: string, b: string): number {
  const ai = PLATFORM_ORDER.get(a) ?? Number.MAX_SAFE_INTEGER
  const bi = PLATFORM_ORDER.get(b) ?? Number.MAX_SAFE_INTEGER
  if (ai !== bi) return ai - bi
  return a.localeCompare(b)
}
