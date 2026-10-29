import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import ModelPlazaContent from '../ModelPlazaContent.vue'
import type { ModelPlazaResponse } from '@/api/modelPlaza'

vi.mock('vue-i18n', async () => {
  const actual = await vi.importActual<typeof import('vue-i18n')>('vue-i18n')
  return {
    ...actual,
    useI18n: () => ({ t: (key: string) => key })
  }
})

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({ isAuthenticated: true })
}))

vi.mock('@/stores/app', () => ({
  useAppStore: () => ({ cachedPublicSettings: null })
}))

const response: ModelPlazaResponse = {
  description: '',
  groups: [
    {
      id: 23,
      name: 'GPT PRO',
      description: '',
      platform: 'openai',
      subscription_type: 'standard',
      rate_multiplier: 1,
      peak_rate_enabled: false,
      peak_start: '',
      peak_end: '',
      peak_rate_multiplier: 1,
      is_exclusive: false,
      image_rate_independent: false,
      image_rate_multiplier: 1,
      video_rate_independent: false,
      video_rate_multiplier: 1,
      long_context_pricing_enabled: true,
      models: []
    },
    {
      id: 24,
      name: 'Claude',
      description: '',
      platform: 'anthropic',
      subscription_type: 'standard',
      rate_multiplier: 1,
      peak_rate_enabled: false,
      peak_start: '',
      peak_end: '',
      peak_rate_multiplier: 1,
      is_exclusive: false,
      image_rate_independent: false,
      image_rate_multiplier: 1,
      video_rate_independent: false,
      video_rate_multiplier: 1,
      long_context_pricing_enabled: true,
      models: []
    }
  ]
}

describe('ModelPlazaContent deeplink', () => {
  it('filters to initialGroupId and scrolls to the section', async () => {
    const scrollIntoView = vi.fn()
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
      writable: true
    })

    const wrapper = mount(ModelPlazaContent, {
      props: {
        response,
        loading: false,
        initialGroupId: 23
      },
      attachTo: document.body,
      global: {
        stubs: {
          Icon: true,
          PlazaFilterBar: {
            props: ['groupId'],
            template: '<div data-test="filter">{{ groupId }}</div>'
          },
          PlazaGroupSection: {
            props: ['group'],
            template: '<section :id="`plaza-group-${group.id}`">{{ group.name }}</section>'
          }
        }
      }
    })

    await flushPromises()
    await nextTick()
    await nextTick()

    expect(wrapper.get('[data-test="filter"]').text()).toBe('23')
    expect(wrapper.text()).toContain('GPT PRO')
    expect(wrapper.text()).not.toContain('Claude')
    expect(scrollIntoView).toHaveBeenCalled()
    wrapper.unmount()
  })
})
