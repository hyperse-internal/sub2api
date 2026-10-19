/**
 * 文档中心导航。新增文章：在 `src/docs/` 放 Markdown，再登记到 DOCS_NAV。
 */
import agentSkillsMd from '@/docs/agent-skills.md?raw'
import configToolMd from '@/docs/config-tool.md?raw'
import faqMd from '@/docs/faq.md?raw'
import imageGenerationMd from '@/docs/image-generation.md?raw'
import purchaseMd from '@/docs/purchase.md?raw'
import registerMd from '@/docs/register.md?raw'

export type DocsDocItem = {
  id: string
  label: string
  file: string
  source: string
}

export type DocFrontmatter = {
  title: string
  eyebrow: string
  description: string
}

export type LoadedDoc = {
  id: string
  label: string
  frontmatter: DocFrontmatter
  body: string
}

export const DOCS_NAV: DocsDocItem[] = [
  { id: 'register', label: '注册账号', file: 'register.md', source: registerMd },
  { id: 'purchase', label: '充值/兑换', file: 'purchase.md', source: purchaseMd },
  { id: 'config-tool', label: '工具配置', file: 'config-tool.md', source: configToolMd },
  { id: 'agent-skills', label: 'Agent 技能', file: 'agent-skills.md', source: agentSkillsMd },
  { id: 'image-generation', label: '图片生成', file: 'image-generation.md', source: imageGenerationMd },
  { id: 'faq', label: '常见问题', file: 'faq.md', source: faqMd }
]

export const DEFAULT_DOC_ID = DOCS_NAV[0]?.id ?? 'register'

export function getDocsItem(id: string): DocsDocItem | undefined {
  return DOCS_NAV.find((item) => item.id === id)
}

function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  if (!raw.startsWith('---')) return { data: {}, body: raw.trim() }
  const end = raw.indexOf('\n---', 3)
  if (end < 0) return { data: {}, body: raw.trim() }
  const data: Record<string, string> = {}
  for (const line of raw.slice(3, end).trim().split('\n')) {
    const index = line.indexOf(':')
    if (index < 0) continue
    let value = line.slice(index + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    data[line.slice(0, index).trim()] = value
  }
  return { data, body: raw.slice(end + 4).trim() }
}

export function loadDoc(id: string): LoadedDoc | undefined {
  const item = getDocsItem(id)
  if (!item) return undefined
  const { data, body } = parseFrontmatter(item.source)
  return {
    id,
    label: item.label,
    frontmatter: {
      title: data.title || item.label,
      eyebrow: data.eyebrow || '',
      description: data.description || ''
    },
    body
  }
}

export function loadAllDocs(): Record<string, LoadedDoc> {
  return Object.fromEntries(
    DOCS_NAV.map((item) => [item.id, loadDoc(item.id)]).filter((entry): entry is [string, LoadedDoc] => Boolean(entry[1]))
  )
}
