import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import RedeemView from '../RedeemView.vue'

const {
  preview,
  redeem,
  getHistory,
  refreshUser,
  fetchActiveSubscriptions,
  showError,
  showWarning,
  showSuccess,
  activeSubscriptions
} = vi.hoisted(() => ({
  preview: vi.fn(),
  redeem: vi.fn(),
  getHistory: vi.fn(),
  refreshUser: vi.fn(),
  fetchActiveSubscriptions: vi.fn(),
  showError: vi.fn(),
  showWarning: vi.fn(),
  showSuccess: vi.fn(),
  activeSubscriptions: [] as Array<{
    id: number
    group_id: number
    expires_at?: string | null
    group?: { name: string; reset_quota_on_renewal?: boolean }
  }>
}))

vi.mock('@/api', () => ({
  redeemAPI: { preview, redeem, getHistory },
  authAPI: { getPublicSettings: vi.fn().mockResolvedValue({}) },
}))
vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({ user: { balance: 10, concurrency: 2 }, refreshUser }),
}))
vi.mock('@/stores/subscriptions', () => ({
  useSubscriptionStore: () => ({
    activeSubscriptions,
    fetchActiveSubscriptions
  }),
}))
vi.mock('@/stores/app', () => ({
  useAppStore: () => ({ showError, showWarning, showSuccess }),
}))
vi.mock('vue-i18n', async () => {
  const actual = await vi.importActual<typeof import('vue-i18n')>('vue-i18n')
  return { ...actual, useI18n: () => ({ t: (key: string) => key }) }
})

async function submitCode() {
  const wrapper = mount(RedeemView, {
    global: {
      stubs: {
        AppLayout: { template: '<div><slot /></div>' },
        Icon: true,
        ConfirmDialog: {
          name: 'ConfirmDialog',
          props: ['show', 'title', 'message', 'confirmText', 'cancelText', 'danger'],
          emits: ['confirm', 'cancel'],
          template: `
            <div v-if="show" data-test="confirm-dialog" :data-danger="danger ? 'true' : 'false'">
              <p>{{ title }}</p>
              <p>{{ message }}</p>
              <slot />
              <button data-test="confirm-continue" @click="$emit('confirm')">{{ confirmText }}</button>
              <button data-test="confirm-cancel" @click="$emit('cancel')">{{ cancelText }}</button>
            </div>
          `
        }
      }
    },
  })
  await flushPromises()
  await wrapper.get('input#code').setValue(' REDEEM-CODE ')
  await wrapper.get('form').trigger('submit')
  await flushPromises()
  return wrapper
}

describe('RedeemView refresh after redemption', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    activeSubscriptions.splice(0, activeSubscriptions.length)
    preview.mockResolvedValue({ type: 'balance', value: 20, code: 'REDEEM-CODE' })
    redeem.mockResolvedValue({ type: 'balance', value: 20, message: 'Code applied' })
    getHistory.mockResolvedValue({ items: [], total: 0 })
    refreshUser.mockResolvedValue({ balance: 30, concurrency: 2 })
    fetchActiveSubscriptions.mockImplementation(async () => activeSubscriptions)
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it.each(['balance', 'concurrency'])(
    'keeps a successful %s redemption when profile refresh fails', async (type) => {
    preview.mockResolvedValue({ type, value: 20, code: 'REDEEM-CODE' })
    redeem.mockResolvedValue({ type, value: 20, message: 'Code applied' })
    refreshUser.mockRejectedValue({ status: 503, message: 'Service unavailable' })
    getHistory.mockResolvedValueOnce({ items: [], total: 0 }).mockResolvedValueOnce({ total: 1, items: [{
      id: 1, code: 'REDEEM-CODE', type, value: 20, used_at: '2026-03-08T00:00:00Z',
    }] })

    const wrapper = await submitCode()

    expect(preview).toHaveBeenCalledWith('REDEEM-CODE')
    expect(redeem).toHaveBeenCalledWith('REDEEM-CODE')
    expect(showError).not.toHaveBeenCalled()
    expect(showWarning).toHaveBeenCalledWith('redeem.userRefreshFailed')
    expect(showSuccess).toHaveBeenCalledWith('redeem.codeRedeemSuccess')
    expect(wrapper.text()).toContain('Code applied')
    expect(wrapper.text()).not.toContain('redeem.failedToRedeem')
    expect((wrapper.get('input#code').element as HTMLInputElement).value).toBe('')
    expect((wrapper.get('input#code').element as HTMLInputElement).disabled).toBe(false)
    expect(getHistory).toHaveBeenCalledTimes(2)
    expect(wrapper.text()).toContain('REDEEM-C...')
    expect(fetchActiveSubscriptions).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('asks for confirmation before redeeming a subscription code, then redeems on continue', async () => {
    preview.mockResolvedValue({
      type: 'subscription',
      code: 'REDEEM-CODE',
      group_id: 7,
      validity_days: 30,
      group: { id: 7, name: 'Pro Plan', reset_quota_on_renewal: true }
    })
    redeem.mockResolvedValue({
      type: 'subscription',
      value: 30,
      message: 'Subscription applied',
      group_name: 'Pro Plan',
      validity_days: 30
    })
    activeSubscriptions.push({
      id: 1,
      group_id: 7,
      expires_at: '2026-04-01T00:00:00Z',
      group: { name: 'Pro Plan', reset_quota_on_renewal: true }
    }, {
      id: 2,
      group_id: 9,
      expires_at: '2026-05-01T00:00:00Z',
      group: { name: 'Other Plan' }
    })
    refreshUser.mockRejectedValue({ status: 503, message: 'Service unavailable' })

    const wrapper = await submitCode()

    expect(preview).toHaveBeenCalledWith('REDEEM-CODE')
    expect(redeem).not.toHaveBeenCalled()
    expect(fetchActiveSubscriptions).toHaveBeenCalledWith(true)
    expect(wrapper.get('[data-test="confirm-dialog"]').text()).toContain('redeem.subscriptionConfirmTitle')
    expect(wrapper.get('[data-test="confirm-dialog"]').text()).toContain('redeem.subscriptionConfirmOverwrite')
    expect(wrapper.get('[data-test="confirm-dialog"]').attributes('data-danger')).toBe('true')
    expect(wrapper.get('[data-test="confirm-dialog"]').html()).toContain('border-amber-')
    expect(wrapper.get('[data-test="confirm-dialog"]').text()).toContain('Pro Plan')
    expect(wrapper.get('[data-test="confirm-dialog"]').text()).toContain('redeem.subscriptionConfirmCurrentBadge')

    await wrapper.get('[data-test="confirm-continue"]').trigger('click')
    await flushPromises()

    expect(redeem).toHaveBeenCalledWith('REDEEM-CODE')
    expect(showSuccess).toHaveBeenCalledWith('redeem.codeRedeemSuccess')
    expect(fetchActiveSubscriptions).toHaveBeenCalledTimes(2)
    expect(wrapper.find('[data-test="confirm-dialog"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('cancels subscription redemption without calling redeem', async () => {
    preview.mockResolvedValue({
      type: 'subscription',
      code: 'REDEEM-CODE',
      group_id: 7,
      validity_days: 30,
      group: { id: 7, name: 'Pro Plan', reset_quota_on_renewal: false }
    })

    const wrapper = await submitCode()
    expect(wrapper.get('[data-test="confirm-dialog"]').text()).toContain('redeem.subscriptionConfirmCreate')
    expect(wrapper.get('[data-test="confirm-dialog"]').attributes('data-danger')).toBe('false')
    expect(wrapper.get('[data-test="confirm-dialog"]').html()).toContain('border-emerald-')
    await wrapper.get('[data-test="confirm-cancel"]').trigger('click')
    await flushPromises()

    expect(redeem).not.toHaveBeenCalled()
    expect(showSuccess).not.toHaveBeenCalled()
    expect(wrapper.find('[data-test="confirm-dialog"]').exists()).toBe(false)
    expect((wrapper.get('input#code').element as HTMLInputElement).value).toBe(' REDEEM-CODE ')
    wrapper.unmount()
  })

  it('pages on the server, changes size, and resets page and total after redeeming', async () => {
    getHistory.mockResolvedValue({ items: [], total: 101 })
    const wrapper = mount(RedeemView, {
      global: {
        stubs: {
          AppLayout: { template: '<div><slot /></div>' },
          Icon: true,
          ConfirmDialog: true
        }
      },
    })
    await flushPromises()
    const button = (text: string) => wrapper.findAll('button').find(b => b.text() === text)!
    expect(getHistory).toHaveBeenLastCalledWith(1, 20)
    expect(button('pagination.previous').attributes('disabled')).toBeDefined()
    await button('pagination.next').trigger('click')
    await flushPromises()
    expect(getHistory).toHaveBeenLastCalledWith(2, 20)
    await button('pagination.previous').trigger('click')
    await flushPromises()
    expect(getHistory).toHaveBeenLastCalledWith(1, 20)
    expect(wrapper.findAll('select option').map(o => o.text())).toEqual(['20', '50', '100'])
    await wrapper.get('select').setValue('50')
    await flushPromises()
    expect(getHistory).toHaveBeenLastCalledWith(1, 50)
    await wrapper.get('select').setValue('100')
    await flushPromises()
    await button('pagination.next').trigger('click')
    await flushPromises()
    expect(getHistory).toHaveBeenLastCalledWith(2, 100)
    expect(button('pagination.next').attributes('disabled')).toBeDefined()
    getHistory.mockResolvedValue({ items: [], total: 102 })
    await wrapper.get('input#code').setValue('NEW-CODE')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(getHistory).toHaveBeenLastCalledWith(1, 100)
    expect(wrapper.text()).toContain('102')
    expect(button('pagination.previous').attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })

  it('restores the loaded size and keeps rows and navigation usable after a size request fails', async () => {
    const item = { id: 1, code: 'OLD-ROWS', type: 'balance', value: 20, used_at: '2026-03-08T00:00:00Z' }
    getHistory.mockResolvedValue({ items: [item], total: 61 })
    const wrapper = mount(RedeemView, {
      global: {
        stubs: {
          AppLayout: { template: '<div><slot /></div>' },
          Icon: true,
          ConfirmDialog: true
        }
      },
    })
    await flushPromises()
    const button = (text: string) => wrapper.findAll('button').find(b => b.text() === text)!
    await button('pagination.next').trigger('click')
    await flushPromises()
    let rejectRequest!: (error: Error) => void
    getHistory.mockImplementationOnce(() => new Promise((_resolve, reject) => { rejectRequest = reject }))
    await wrapper.get('select').setValue('50')
    expect(getHistory).toHaveBeenLastCalledWith(1, 50)
    expect(button('pagination.next').attributes('disabled')).toBeDefined()
    rejectRequest(new Error('Network error'))
    await flushPromises()
    expect(wrapper.get('select').element.value).toBe('20')
    expect(wrapper.text()).toContain('OLD-ROWS')
    expect(wrapper.text()).toContain('61')
    expect(button('pagination.previous').attributes('disabled')).toBeUndefined()
    expect(button('pagination.next').attributes('disabled')).toBeUndefined()
    expect(showError).toHaveBeenCalledWith('redeem.historyLoadFailed')
    await button('pagination.next').trigger('click')
    await flushPromises()
    expect(getHistory).toHaveBeenLastCalledWith(3, 20)
    await wrapper.get('select').setValue('50')
    await flushPromises()
    expect(getHistory).toHaveBeenLastCalledWith(1, 50)
    expect(wrapper.get('select').element.value).toBe('50')
    expect(button('pagination.previous').attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })

  it.each(['success', 'failure'])('ignores a stale history %s after a newer size request succeeds', async (outcome) => {
    let resolveOld!: (value: unknown) => void
    let rejectOld!: (error: Error) => void
    getHistory.mockImplementationOnce(() => new Promise((resolve, reject) => {
      resolveOld = resolve
      rejectOld = reject
    }))
    const wrapper = mount(RedeemView, {
      global: {
        stubs: {
          AppLayout: { template: '<div><slot /></div>' },
          Icon: true,
          ConfirmDialog: true
        }
      },
    })
    getHistory.mockResolvedValue({ items: [{
      id: 2, code: 'NEW-ROWS', type: 'balance', value: 30, used_at: '2026-03-08T00:00:00Z',
    }], total: 61 })
    // Force overlapping requests to exercise responses arriving out of order.
    await wrapper.get('select').setValue('50')
    await flushPromises()
    const button = (text: string) => wrapper.findAll('button').find(b => b.text() === text)!
    await button('pagination.next').trigger('click')
    await flushPromises()
    expect(getHistory).toHaveBeenLastCalledWith(2, 50)
    if (outcome === 'success') {
      resolveOld({ items: [], total: 0 })
    } else {
      rejectOld(new Error('Stale network error'))
    }
    await flushPromises()
    expect(wrapper.get('select').element.value).toBe('50')
    expect(wrapper.text()).toContain('NEW-ROWS')
    expect(wrapper.text()).toContain('61')
    expect(button('pagination.previous').attributes('disabled')).toBeUndefined()
    expect(button('pagination.next').attributes('disabled')).toBeDefined()
    expect(wrapper.get('select').attributes('disabled')).toBeUndefined()
    expect(showError).not.toHaveBeenCalled()
    await button('pagination.previous').trigger('click')
    await flushPromises()
    expect(getHistory).toHaveBeenLastCalledWith(1, 50)
    wrapper.unmount()
  })

  it('disables both paging buttons for empty history', async () => {
    const wrapper = await submitCode()
    for (const button of wrapper.findAll('button').filter(b => b.text().startsWith('pagination.'))) {
      expect(button.attributes('disabled')).toBeDefined()
    }
    wrapper.unmount()
  })

  it('finishes normally without a warning when profile refresh succeeds', async () => {
    const wrapper = await submitCode()

    expect(refreshUser).toHaveBeenCalledOnce()
    expect(showWarning).not.toHaveBeenCalled()
    expect(showError).not.toHaveBeenCalled()
    expect(showSuccess).toHaveBeenCalledWith('redeem.codeRedeemSuccess')
    expect((wrapper.get('input#code').element as HTMLInputElement).value).toBe('')
    wrapper.unmount()
  })

  it('preserves the existing subscription refresh warning after successful redemption', async () => {
    preview.mockResolvedValue({
      type: 'subscription',
      code: 'REDEEM-CODE',
      group_id: 7,
      validity_days: 30,
      group: { id: 7, name: 'Pro Plan' }
    })
    redeem.mockResolvedValue({ type: 'subscription', value: 20, message: 'Code applied' })
    fetchActiveSubscriptions
      .mockResolvedValueOnce([])
      .mockRejectedValueOnce(new Error('Network Error'))

    const wrapper = await submitCode()
    await wrapper.get('[data-test="confirm-continue"]').trigger('click')
    await flushPromises()

    expect(showWarning).toHaveBeenCalledWith('redeem.subscriptionRefreshFailed')
    expect(showError).not.toHaveBeenCalled()
    expect(showSuccess).toHaveBeenCalledWith('redeem.codeRedeemSuccess')
    expect(getHistory).toHaveBeenCalledTimes(2)
    wrapper.unmount()
  })

  it('keeps the code and reports failure when the redemption request itself fails', async () => {
    redeem.mockRejectedValue({ response: { data: { detail: 'Invalid code' } } })
    const wrapper = await submitCode()

    expect(showError).toHaveBeenCalledWith('redeem.redeemFailed')
    expect(wrapper.text()).toContain('Invalid code')
    expect(wrapper.text()).not.toContain('Code applied')
    expect((wrapper.get('input#code').element as HTMLInputElement).value).toBe(' REDEEM-CODE ')
    expect(refreshUser).not.toHaveBeenCalled()
    expect(fetchActiveSubscriptions).not.toHaveBeenCalled()
    expect(getHistory).toHaveBeenCalledOnce()
    expect(showSuccess).not.toHaveBeenCalled()
    expect(showWarning).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('keeps the code and reports failure when preview fails', async () => {
    preview.mockRejectedValue({ response: { data: { message: 'redeem code not found' } } })
    const wrapper = await submitCode()

    expect(redeem).not.toHaveBeenCalled()
    expect(showError).toHaveBeenCalledWith('redeem.redeemFailed')
    expect(wrapper.text()).toContain('redeem code not found')
    expect((wrapper.get('input#code').element as HTMLInputElement).value).toBe(' REDEEM-CODE ')
    wrapper.unmount()
  })
})
