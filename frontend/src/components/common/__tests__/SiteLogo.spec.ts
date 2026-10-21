import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SiteLogo from '../SiteLogo.vue'

describe('SiteLogo', () => {
  it('uses the default accessible wordmark when no image is configured', () => {
    const wrapper = mount(SiteLogo)
    expect(wrapper.get('svg').attributes('aria-label')).toBe('AlphaIO')
    expect(wrapper.get('svg').attributes('viewBox')).toBe('0 0 1200 360')
    expect(wrapper.find('img').exists()).toBe(false)
  })

  it.each(['/brand.png', 'https://example.com/brand.svg', 'data:image/png;base64,aGVsbG8='])('prioritizes configured image %s', (src) => {
    const wrapper = mount(SiteLogo, { props: { src, title: 'Custom Site' } })
    expect(wrapper.get('img').attributes('src')).toBe(src)
    expect(wrapper.get('img').attributes('alt')).toBe('Custom Site')
    expect(wrapper.find('svg').exists()).toBe(false)
  })

  it('falls back when the configured URL is unsafe or cleared', async () => {
    const wrapper = mount(SiteLogo, { props: { src: '/brand.png' } })
    await wrapper.setProps({ src: 'javascript:alert(1)' })
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('svg').exists()).toBe(true)
    await wrapper.setProps({ src: '' })
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('supports explicit theme overrides and compact sidebar mode', async () => {
    const wrapper = mount(SiteLogo, { props: { theme: 'dark', compact: true, class: 'h-9 w-9' } })
    expect(wrapper.attributes('data-theme')).toBe('dark')
    expect(wrapper.attributes('viewBox')).toBe('0 0 300 360')
    expect(wrapper.classes()).toContain('h-9')
    await wrapper.setProps({ theme: 'light', compact: false })
    expect(wrapper.attributes('data-theme')).toBe('light')
    expect(wrapper.attributes('viewBox')).toBe('0 0 1200 360')
    await wrapper.setProps({ theme: undefined })
    expect(wrapper.attributes('data-theme')).toBeUndefined()
  })
})
