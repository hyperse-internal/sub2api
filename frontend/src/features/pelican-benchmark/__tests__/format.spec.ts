import { describe, expect, it } from 'vitest'
import { formatPelicanDuration, pelicanStatusTone } from '../format'

describe('pelican-benchmark format', () => {
  it('formats duration in seconds with one decimal', () => {
    expect(formatPelicanDuration(195317)).toBe('195.3')
    expect(formatPelicanDuration(88378)).toBe('88.4')
  })

  it('maps status tones', () => {
    expect(pelicanStatusTone('succeeded', false)).toBe('success')
    expect(pelicanStatusTone('failed', false)).toBe('danger')
    expect(pelicanStatusTone('succeeded', true)).toBe('danger')
    expect(pelicanStatusTone('running', false)).toBe('warning')
  })
})
