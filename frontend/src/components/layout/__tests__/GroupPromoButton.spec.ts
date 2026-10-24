import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import GroupPromoButton from '../GroupPromoButton.vue'

const copyToClipboard = vi.hoisted(() => vi.fn())

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key })
}))

vi.mock('@/composables/useClipboard', () => ({
  useClipboard: () => ({ copied: ref(false), copyToClipboard })
}))

describe('GroupPromoButton', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    document.body.classList.remove('modal-open')
    copyToClipboard.mockClear()
  })

  it('opens the offer with both QR variants and copies the displayed group number', async () => {
    const wrapper = mount(GroupPromoButton, {
      attachTo: document.body,
      global: { stubs: { Icon: true } }
    })

    await wrapper.get('[data-test="group-promo-button"]').trigger('click')
    await nextTick()

    expect(document.body.querySelector('[data-test="group-promo-dialog"]')).not.toBeNull()
    expect(document.body.querySelector('[data-test="group-promo-qr-light"]')).not.toBeNull()
    expect(document.body.querySelector('[data-test="group-promo-qr-dark"]')).not.toBeNull()
    expect(document.body.querySelector('[data-test="group-promo-number"]')?.textContent).toBe('2155071618')
    expect(document.body.querySelector('[data-test="group-promo-speed"]')?.textContent).toContain('common.groupPromoSpeedRate')

    document.body.querySelector<HTMLButtonElement>('[data-test="group-promo-copy"]')?.click()
    expect(copyToClipboard).toHaveBeenCalledWith('2155071618')

    wrapper.unmount()
  })
})
