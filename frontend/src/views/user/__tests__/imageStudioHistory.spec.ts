import { describe, expect, it } from 'vitest'
import { blobFromImageSource } from '../imageStudioHistory'

describe('blobFromImageSource', () => {
  it('decodes a data URL without fetch', async () => {
    const blob = await blobFromImageSource('data:image/png;base64,aGVsbG8=')
    expect(blob.type).toBe('image/png')
    expect(blob.size).toBe(5)
  })
})
