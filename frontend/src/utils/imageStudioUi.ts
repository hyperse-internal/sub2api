export const IMAGE_HISTORY_LIMIT = 10
export const MAX_PROMPT_LENGTH = 4000

export type PromptTagCategoryId = 'quality' | 'style' | 'composition' | 'lighting' | 'color' | 'material'

export const promptTagCategories: Array<{
  id: PromptTagCategoryId
  tags: Array<{ label: { en: string; zh: string }; value: string }>
}> = [
  {
    id: 'quality',
    tags: [
      { label: { en: 'High detail', zh: '高细节' }, value: 'high detail' },
      { label: { en: 'Ultra sharp', zh: '超清晰' }, value: 'ultra sharp' },
      { label: { en: 'Clean composition', zh: '干净构图' }, value: 'clean composition' },
      { label: { en: 'Fine texture', zh: '精细纹理' }, value: 'fine texture' }
    ]
  },
  {
    id: 'style',
    tags: [
      { label: { en: 'Cinematic', zh: '电影感' }, value: 'cinematic' },
      { label: { en: 'Watercolor', zh: '水彩' }, value: 'watercolor' },
      { label: { en: 'Editorial', zh: '杂志编辑风' }, value: 'editorial' },
      { label: { en: '3D render', zh: '3D 渲染' }, value: '3D render' }
    ]
  },
  {
    id: 'composition',
    tags: [
      { label: { en: 'Macro shot', zh: '微距' }, value: 'macro shot' },
      { label: { en: 'Close-up', zh: '近景' }, value: 'close-up' },
      { label: { en: 'Wide angle', zh: '广角' }, value: 'wide angle' },
      { label: { en: 'Overhead view', zh: '俯拍' }, value: 'overhead view' }
    ]
  },
  {
    id: 'lighting',
    tags: [
      { label: { en: 'Soft rim light', zh: '柔和轮廓光' }, value: 'soft rim light' },
      { label: { en: 'Golden hour', zh: '黄金时刻' }, value: 'golden hour' },
      { label: { en: 'Volumetric lighting', zh: '体积光' }, value: 'volumetric lighting' },
      { label: { en: 'Studio lighting', zh: '棚拍光' }, value: 'studio lighting' }
    ]
  },
  {
    id: 'color',
    tags: [
      { label: { en: 'Muted palette', zh: '低饱和色盘' }, value: 'muted palette' },
      { label: { en: 'Vibrant colors', zh: '鲜明色彩' }, value: 'vibrant colors' },
      { label: { en: 'Warm tone', zh: '暖色调' }, value: 'warm tone' },
      { label: { en: 'High contrast', zh: '高对比' }, value: 'high contrast' }
    ]
  },
  {
    id: 'material',
    tags: [
      { label: { en: 'Glass texture', zh: '玻璃质感' }, value: 'glass texture' },
      { label: { en: 'Brushed metal', zh: '拉丝金属' }, value: 'brushed metal' },
      { label: { en: 'Fabric fibers', zh: '织物纤维' }, value: 'fabric fibers' },
      { label: { en: 'Ceramic finish', zh: '陶瓷表面' }, value: 'ceramic finish' }
    ]
  }
]

export function appendPromptTag(prompt: string, tagValue: string): string {
  const value = tagValue.trim()
  if (!value) return prompt
  const current = prompt.trim()
  if (!current) return value
  if (current.includes(value)) return prompt
  return `${current}, ${value}`
}

export function detectImageMime(bytes: Uint8Array): 'image/png' | 'image/jpeg' | 'image/webp' | null {
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png'
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'image/webp'
  }
  return null
}

export function modelSupportsEdit(model: string): boolean {
  const normalized = model.trim().toLowerCase()
  return normalized.startsWith('gpt-image-') || normalized.startsWith('grok-imagine')
}

export function openImageStudioWindow() {
  const base = import.meta.env.BASE_URL || '/'
  const href = `${base.endsWith('/') ? base : `${base}/`}image-studio`
  window.open(href, '_blank', 'noopener,noreferrer')
}
