import { describe, expect, it } from 'vitest'
import { KEY_CREATE_PLATFORMS, compareKeyCreatePlatforms } from '../keyGroupProviders'

describe('keyGroupProviders', () => {
  it('orders known platforms before unknown ones', () => {
    const platforms = ['typesafe', 'openai', 'zzz-custom', 'anthropic']
    expect([...platforms].sort(compareKeyCreatePlatforms)).toEqual([
      'anthropic',
      'openai',
      'typesafe',
      'zzz-custom'
    ])
  })

  it('keeps create platform list unique and stable', () => {
    expect(new Set(KEY_CREATE_PLATFORMS).size).toBe(KEY_CREATE_PLATFORMS.length)
    expect(KEY_CREATE_PLATFORMS[0]).toBe('anthropic')
    expect(KEY_CREATE_PLATFORMS).toContain('composite')
  })
})
