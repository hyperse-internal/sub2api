import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import GroupOptionItem from '../GroupOptionItem.vue'

vi.mock('vue-i18n', async () => {
  const actual = await vi.importActual<typeof import('vue-i18n')>('vue-i18n')
  return {
    ...actual,
    useI18n: () => ({
      t: (key: string) => {
        const map: Record<string, string> = {
          'keys.pricing.relativeOfficial': '相对官价',
          'keys.pricing.byModel': '价格按模型',
          'keys.pricing.groupRate': '分组费率',
          'keys.pricing.modelDetails': '模型明细',
          'keys.pricing.relativeOfficialHint': 'hint',
          'keys.pricing.byModelHint': 'by-model-hint',
          'keys.pricing.groupRateHint': 'group-rate-hint',
          'admin.groups.rateLabel': '倍率',
          'groups.subscription': '订阅'
        }
        return map[key] ?? key
      }
    })
  }
})

vi.mock('@/stores/app', () => ({
  useAppStore: () => ({ cachedPublicSettings: null })
}))

describe('GroupOptionItem pricing hints', () => {
  it('相对官价区间为主标签，并提供模型明细链接', () => {
    const wrapper = mount(GroupOptionItem, {
      props: {
        name: 'GPT PRO',
        platform: 'openai',
        rateMultiplier: 1,
        pricingHintMode: 'relative',
        relativeRateMin: 0.14,
        relativeRateMax: 0.72,
        modelPlazaHref: '/model-plaza?group=23&embedded=1'
      },
      global: {
        stubs: {
          GroupBadge: true,
          RouterLink: { template: '<a><slot /></a>', props: ['to'] }
        }
      }
    })
    expect(wrapper.text()).toContain('0.14x–0.72x')
    expect(wrapper.text()).toContain('相对官价')
    expect(wrapper.text()).not.toContain('1x 倍率')
    expect(wrapper.text()).toContain('模型明细')
  })

  it('无区间弱化为价格按模型，不展示 1x 倍率', () => {
    const wrapper = mount(GroupOptionItem, {
      props: {
        name: 'GPT PRO',
        platform: 'openai',
        rateMultiplier: 1,
        pricingHintMode: 'by_model',
        showSecondaryGroupRate: false
      },
      global: {
        stubs: {
          GroupBadge: true,
          RouterLink: true
        }
      }
    })
    expect(wrapper.text()).toContain('价格按模型')
    expect(wrapper.text()).not.toContain('1x 倍率')
  })

  it('modal 模式下点击模型明细触发 open-model-plaza', async () => {
    const wrapper = mount(GroupOptionItem, {
      props: {
        name: 'GPT PRO',
        platform: 'openai',
        rateMultiplier: 1,
        pricingHintMode: 'by_model',
        modelPlazaHref: '/model-plaza?group=23&embedded=1',
        modelPlazaMode: 'modal'
      },
      global: {
        stubs: {
          GroupBadge: true,
          RouterLink: true
        }
      }
    })
    await wrapper.get('[data-test="group-option-model-plaza"]').trigger('click')
    expect(wrapper.emitted('open-model-plaza')).toHaveLength(1)
  })
})
