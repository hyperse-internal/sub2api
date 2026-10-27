import { keysAPI } from '@/api/keys'
import { buildGatewayUrl } from '@/api/client'
import type { ApiKey } from '@/types'
import {
  buildImageStudioCatalog,
  keyAllowsImageStudio,
  type ImageBackground,
  type ImageOutputFormat,
  type ImageQuality,
  type ImageStudioModelGroup
} from '@/utils/imageStudioCatalog'

const PAGE_SIZE = 100
const REQUEST_TIMEOUT_MS = 300_000

/** Gateway / API-key auth rejects requests when the account has no usable balance. */
export const IMAGE_STUDIO_INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE'

export interface ImageStudioRequest {
  apiKey: string
  model: string
  prompt: string
  size: string
  quality: ImageQuality
  count: number
  outputFormat: ImageOutputFormat
  background: ImageBackground
  outputCompression: number | null
  references?: File[]
}

async function listActiveKeys(): Promise<ApiKey[]> {
  const keys: ApiKey[] = []
  let page = 1
  while (true) {
    const response = await keysAPI.list(page, PAGE_SIZE, {
      status: 'active',
      sort_by: 'created_at',
      sort_order: 'desc'
    })
    keys.push(...(response.items || []))
    if (page >= response.pages || (response.items || []).length === 0) break
    page += 1
  }
  return keys.filter(keyAllowsImageStudio)
}

function modelIDs(payload: unknown): string[] {
  const data = (payload as { data?: unknown })?.data
  if (!Array.isArray(data)) return []
  return data.flatMap((item) => {
    const id = (item as { id?: unknown })?.id
    return typeof id === 'string' && id.trim() ? [id.trim()] : []
  })
}

async function listModelsForKey(apiKey: string): Promise<string[]> {
  const response = await fetch(buildGatewayUrl('/v1/models'), {
    headers: { Authorization: `Bearer ${apiKey}` }
  })
  if (!response.ok) {
    throw await gatewayError(response)
  }
  return modelIDs(await response.json())
}

export async function loadImageStudioCatalog(): Promise<ImageStudioModelGroup[]> {
  const keys = await listActiveKeys()
  let failures = 0
  let balanceFailures = 0
  const entries = await Promise.all(
    keys.map(async (key) => {
      try {
        return { key, models: await listModelsForKey(key.key) }
      } catch (error) {
        failures += 1
        if (error instanceof Error && error.message === IMAGE_STUDIO_INSUFFICIENT_BALANCE) {
          balanceFailures += 1
        }
        return { key, models: [] as string[] }
      }
    })
  )
  if (keys.length > 0 && failures === keys.length) {
    if (balanceFailures === keys.length) {
      throw new Error(IMAGE_STUDIO_INSUFFICIENT_BALANCE)
    }
    throw new Error('load_failed')
  }
  return buildImageStudioCatalog(entries)
}

function generationFields(request: ImageStudioRequest): Record<string, string | number> {
  const fields: Record<string, string | number> = {
    model: request.model,
    prompt: request.prompt,
    n: request.count,
    size: request.size,
    quality: request.quality,
    output_format: request.outputFormat,
    background: request.background
  }
  if (request.outputCompression !== null) {
    fields.output_compression = request.outputCompression
  }
  return fields
}

export async function generateStudioImage(request: ImageStudioRequest): Promise<string[]> {
  const references = request.references ?? []
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const response = references.length
      ? await fetch(buildGatewayUrl('/v1/images/edits'), {
          method: 'POST',
          headers: { Authorization: `Bearer ${request.apiKey}` },
          body: editsBody(request, references),
          signal: controller.signal
        })
      : await fetch(buildGatewayUrl('/v1/images/generations'), {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${request.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(generationFields(request)),
          signal: controller.signal
        })
    if (!response.ok) throw await gatewayError(response)
    return dataUrlsFromImages(await response.json())
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('timeout')
    }
    throw error
  } finally {
    window.clearTimeout(timer)
  }
}

function editsBody(request: ImageStudioRequest, references: File[]): FormData {
  const form = new FormData()
  for (const [name, value] of Object.entries(generationFields(request))) {
    form.append(name, String(value))
  }
  for (const file of references) form.append('image[]', file, file.name)
  return form
}

async function dataUrlsFromImages(payload: unknown): Promise<string[]> {
  const items = Array.isArray((payload as { data?: unknown })?.data)
    ? ((payload as { data: Array<{ b64_json?: unknown; url?: unknown }> }).data ?? [])
    : []
  const urls: string[] = []
  for (const item of items) {
    if (typeof item?.b64_json === 'string' && item.b64_json) {
      urls.push(`data:image/png;base64,${item.b64_json}`)
      continue
    }
    if (typeof item?.url === 'string' && item.url) {
      urls.push(item.url)
    }
  }
  if (!urls.length) throw new Error('empty_result')
  return urls
}

function gatewayErrorCode(body: unknown): string {
  const root = body as { code?: unknown; error?: { code?: unknown; type?: unknown } } | null
  const code = root?.code ?? root?.error?.code ?? root?.error?.type
  return typeof code === 'string' ? code.trim() : ''
}

async function gatewayError(response: Response): Promise<Error> {
  const body = await response.json().catch(() => null)
  const code = gatewayErrorCode(body)
  if (
    code === IMAGE_STUDIO_INSUFFICIENT_BALANCE ||
    code === 'insufficient_quota' ||
    code.toUpperCase() === IMAGE_STUDIO_INSUFFICIENT_BALANCE
  ) {
    return new Error(IMAGE_STUDIO_INSUFFICIENT_BALANCE)
  }
  const message =
    (body as { error?: { message?: string } })?.error?.message ||
    (body as { message?: string })?.message ||
    `HTTP ${response.status}`
  return new Error(message)
}
