import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import QuantModelsView from '../QuantModelsView.vue'
import QuantCasesDialog from '../QuantCasesDialog.vue'
import zh from '@/i18n/locales/zh/quantModels'

const global = {
  plugins: [createI18n({ legacy: false, locale: 'zh', messages: { zh }, messageCompiler: message => () => String(message) })],
  stubs: { AppLayout: { template: '<div><slot /></div>' }, BaseDialog: { template: '<div><slot /></div>' }, transition: true }
}

afterEach(() => vi.useRealTimers())

describe('quant model cases', () => {
  it('orders the recommended products first and opens the gallery from both products', async () => {
    const wrapper = mount(QuantModelsView, { global })
    expect(wrapper.findAll('article').map(card => card.attributes('data-test'))).toEqual(['quant-card-assist', 'quant-card-super', 'quant-card-qmt', 'quant-card-leader'])
    expect(wrapper.findAll('[data-test="recommended"]')).toHaveLength(2)
    await wrapper.get('[data-test="view-cases-assist"]').trigger('click')
    expect(wrapper.findComponent(QuantCasesDialog).props('product')).toBe('assist')
    wrapper.findComponent(QuantCasesDialog).vm.$emit('close')
    await nextTick()
    expect(wrapper.findComponent(QuantCasesDialog).exists()).toBe(false)
    await wrapper.get('[data-test="view-cases-super"]').trigger('click')
    expect(wrapper.findComponent(QuantCasesDialog).props('product')).toBe('super')
    wrapper.unmount()
  })

  it.each(['assist', 'super'] as const)('cycles through all eight images from %s with synchronized indicators and clears its timer', async product => {
    vi.useFakeTimers()
    const wrapper = mount(QuantCasesDialog, { props: { product }, global })
    expect(wrapper.findAll('button')).toHaveLength(10)
    for (const [prefix, count] of [['assist', 6], ['super', 2]] as const) {
      for (let number = 1; number <= count; number++) {
        expect(wrapper.get('[data-test="case-image"]').attributes('src')).toContain(`${prefix}-${number}.png`)
        const key = `${prefix}${number}` as keyof typeof zh.quantModels.cases
        expect(wrapper.get('[data-test="case-description"]').text()).toBe(zh.quantModels.cases[key])
        const indicator = prefix === 'assist' ? number : number + 6
        expect(wrapper.get(`[data-test="case-indicator-${indicator}"]`).attributes('aria-current')).toBe('true')
        await vi.advanceTimersByTimeAsync(6000)
      }
    }
    expect(wrapper.get('[data-test="case-image"]').attributes('src')).toContain('assist-1.png')
    await wrapper.get('[data-test="case-previous"]').trigger('click')
    expect(wrapper.get('[data-test="case-image"]').attributes('src')).toContain('super-2.png')
    expect(wrapper.get('[data-test="case-indicator-8"]').attributes('aria-current')).toBe('true')
    await vi.advanceTimersByTimeAsync(5000)
    await wrapper.get('[data-test="case-next"]').trigger('click')
    expect(wrapper.get('[data-test="case-image"]').attributes('src')).toContain('assist-1.png')
    await vi.advanceTimersByTimeAsync(1000)
    expect(wrapper.get('[data-test="case-image"]').attributes('src')).toContain('assist-1.png')
    await wrapper.get('[data-test="case-next"]').trigger('click')
    expect(wrapper.get('[data-test="case-image"]').attributes('src')).toContain('assist-2.png')
    await wrapper.get('[data-test="case-previous"]').trigger('click')
    expect(wrapper.get('[data-test="case-image"]').attributes('src')).toContain('assist-1.png')
    await vi.advanceTimersByTimeAsync(5000)
    await wrapper.get('[data-test="case-indicator-7"]').trigger('click')
    expect(wrapper.get('[data-test="case-image"]').attributes('src')).toContain('super-1.png')
    expect(wrapper.get('[data-test="case-indicator-7"]').attributes('aria-current')).toBe('true')
    await vi.advanceTimersByTimeAsync(1000)
    expect(wrapper.get('[data-test="case-image"]').attributes('src')).toContain('super-1.png')
    await vi.advanceTimersByTimeAsync(5000)
    expect(wrapper.get('[data-test="case-image"]').attributes('src')).toContain('super-2.png')
    wrapper.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
