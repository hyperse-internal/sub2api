import { beforeEach, describe, expect, it, vi } from 'vitest'
import { IMAGE_STUDIO_INSUFFICIENT_BALANCE, loadImageStudioCatalog, generateStudioImage } from '../imageStudio'

const { list } = vi.hoisted(() => ({ list: vi.fn() }))

vi.mock('../keys', () => ({
  keysAPI: { list }
}))

vi.mock('../client', () => ({
  buildGatewayUrl: (path: string) => `https://gateway.test${path}`
}))

vi.mock('@/utils/imageStudioCatalog', async () => {
  const actual = await vi.importActual<typeof import('@/utils/imageStudioCatalog')>('@/utils/imageStudioCatalog')
  return {
    ...actual,
    keyAllowsImageStudio: () => true,
    buildImageStudioCatalog: (entries: Array<{ key: { id: number }; models: string[] }>) =>
      entries
        .filter((entry) => entry.models.length)
        .map((entry) => ({
          label: `key-${entry.key.id}`,
          models: entry.models.map((model) => ({
            id: `${entry.key.id}:${model}`,
            model,
            apiKey: 'sk-test',
            keyId: entry.key.id,
            keyName: `key-${entry.key.id}`,
            groupLabel: `group-${entry.key.id}`
          }))
        }))
  }
})

function jsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body
  } as Response
}

describe('imageStudio gateway errors', () => {
  beforeEach(() => {
    list.mockReset()
    vi.stubGlobal('fetch', vi.fn())
  })

  it('maps INSUFFICIENT_BALANCE from /v1/models into a catalog failure', async () => {
    list.mockResolvedValue({
      items: [
        {
          id: 1,
          key: 'sk-test',
          name: 'demo',
          status: 'active',
          group_id: 1,
          group: { platform: 'openai', allow_image_generation: true }
        }
      ],
      pages: 1
    })
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(403, { code: 'INSUFFICIENT_BALANCE', message: 'Insufficient account balance' })
    )

    await expect(loadImageStudioCatalog()).rejects.toThrow(IMAGE_STUDIO_INSUFFICIENT_BALANCE)
  })

  it('maps INSUFFICIENT_BALANCE when generating images', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(403, { code: 'INSUFFICIENT_BALANCE', message: 'Insufficient account balance' })
    )

    await expect(
      generateStudioImage({
        apiKey: 'sk-test',
        model: 'gpt-image-1',
        prompt: 'a cat',
        size: 'auto',
        quality: 'auto',
        count: 1,
        outputFormat: 'png',
        background: 'auto',
        outputCompression: null
      })
    ).rejects.toThrow(IMAGE_STUDIO_INSUFFICIENT_BALANCE)
  })

  it('still reports a generic load failure for other gateway errors', async () => {
    list.mockResolvedValue({
      items: [
        {
          id: 1,
          key: 'sk-test',
          name: 'demo',
          status: 'active',
          group_id: 1,
          group: { platform: 'openai', allow_image_generation: true }
        }
      ],
      pages: 1
    })
    vi.mocked(fetch).mockResolvedValue(jsonResponse(500, { message: 'boom' }))

    await expect(loadImageStudioCatalog()).rejects.toThrow('load_failed')
  })
})
