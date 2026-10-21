import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, mount, RouterLinkStub } from '@vue/test-utils'
import { nextTick, reactive } from 'vue'
import { createI18n } from 'vue-i18n'
import type { PublicSettings } from '@/types'
import zh from '@/i18n/locales/zh/landing'
import en from '@/i18n/locales/en/landing'
import BuiltinHomeView from '../BuiltinHomeView.vue'

const appStore = reactive({
  cachedPublicSettings: {} as Partial<PublicSettings> | null,
  publicSettingsLoaded: true,
  siteName: 'Sub2API',
  siteLogo: ''
})
const authStore = reactive({ isAuthenticated: false, isAdmin: false, isSimpleMode: false })

vi.mock('@/stores', () => ({ useAppStore: () => appStore, useAuthStore: () => authStore }))
enableAutoUnmount(afterEach)

function mountHome(settings: Partial<PublicSettings> = {}, locale = 'zh') {
  appStore.cachedPublicSettings = settings
  return mount(BuiltinHomeView, {
    global: {
      plugins: [createI18n({ legacy: false, locale, messages: { zh, en }, messageCompiler: message => () => String(message) })],
      stubs: { RouterLink: RouterLinkStub, LocaleSwitcher: true }
    }
  })
}

function destination(wrapper: ReturnType<typeof mountHome>, selector: string) {
  return wrapper.getComponent(selector).props('to')
}

describe('Built-in home', () => {
  it('finishes typing every character including the final O and restarts for a changed site name', async () => {
    vi.useFakeTimers()
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const matchMedia = vi.spyOn(window, 'matchMedia').mockReturnValue({ ...mediaQuery, matches: false })
    const wrapper = mountHome({ site_name: 'AlphaIO' })
    try {
      expect(wrapper.findAll('.wordmark-character.is-hidden')).toHaveLength(7)
      await vi.advanceTimersByTimeAsync(120)
      expect(wrapper.findAll('.wordmark-character:not(.is-hidden)').map(character => character.text()).join('')).toBe('A')
      await vi.advanceTimersByTimeAsync(720)
      expect(wrapper.findAll('.wordmark-character.is-hidden')).toHaveLength(0)
      expect(wrapper.get('.wordmark-character:last-child').text()).toBe('O')
      await vi.advanceTimersByTimeAsync(5000)
      expect(wrapper.findAll('.wordmark-character.is-hidden')).toHaveLength(0)
      appStore.cachedPublicSettings = { site_name: '新站点' }
      await nextTick()
      expect(wrapper.findAll('.wordmark-character.is-hidden')).toHaveLength(3)
      await vi.advanceTimersByTimeAsync(360)
      expect(wrapper.findAll('.wordmark-character.is-hidden')).toHaveLength(0)
      expect(wrapper.get('.hero-wordmark').attributes('aria-label')).toBe('新站点')
    } finally {
      wrapper.unmount()
      matchMedia.mockRestore()
      vi.useRealTimers()
    }
  })

  it('shows the complete wordmark immediately when reduced motion is preferred', () => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const matchMedia = vi.spyOn(window, 'matchMedia').mockReturnValue({ ...mediaQuery, matches: true })
    const wrapper = mountHome({ site_name: 'AlphaIO' })
    try {
      expect(wrapper.findAll('.wordmark-character.is-hidden')).toHaveLength(0)
      expect(wrapper.findAll('.wordmark-character.is-cursor')).toHaveLength(0)
      expect(wrapper.get('.hero-wordmark').text()).toBe('AlphaIO')
    } finally {
      wrapper.unmount()
      matchMedia.mockRestore()
    }
  })

  beforeEach(() => {
    Object.assign(authStore, { isAuthenticated: false, isAdmin: false, isSimpleMode: false })
    appStore.publicSettingsLoaded = true
    document.documentElement.classList.remove('dark')
    localStorage.clear()
  })

  it('offers registration only after public settings confirm it', async () => {
    appStore.publicSettingsLoaded = false
    const wrapper = mountHome({ registration_enabled: true, model_plaza_enabled: true, payment_enabled: true })
    expect(destination(wrapper, '[data-test="hero-account"]')).toBe('/login')
    expect(destination(wrapper, '[data-test="header-account"]')).toBe('/login')
    expect(wrapper.find('[data-test="model-plaza"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="purchase"]').exists()).toBe(false)
    appStore.publicSettingsLoaded = true
    await nextTick()
    expect(destination(wrapper, '[data-test="hero-account"]')).toBe('/register')
    expect(destination(wrapper, '[data-test="header-account"]')).toBe('/login')
    expect(wrapper.get('[data-test="header-account"]').text()).toBe('登录')
    expect(wrapper.text()).toContain('已有账户？登录')
    expect(wrapper.find('[data-test="model-plaza"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="purchase"]').exists()).toBe(true)
  })

  it.each([false, true])('sends authenticated users to the appropriate dashboard (admin: %s)', (admin) => {
    Object.assign(authStore, { isAuthenticated: true, isAdmin: admin })
    const wrapper = mountHome()
    expect(destination(wrapper, '[data-test="hero-account"]')).toBe(admin ? '/admin/dashboard' : '/dashboard')
    expect(destination(wrapper, '[data-test="header-account"]')).toBe(admin ? '/admin/dashboard' : '/dashboard')
    expect(wrapper.get('[data-test="header-account"]').text()).toBe('进入控制台')
    expect(destination(wrapper, '[data-test="capability-keys"] a')).toBe('/keys')
  })

  it('routes protected capabilities and tools through login with their destination', () => {
    const wrapper = mountHome({ model_plaza_enabled: true, model_plaza_require_auth: true })
    for (const [selector, redirect] of [
      ['[data-test="model-plaza"]', '/model-plaza'],
      ['[data-test="capability-keys"] a', '/keys'],
      ['[data-test="capability-usage"] a', '/usage'],
      ['[data-test="image-tool"] a', '/image-studio']
    ]) {
      expect(destination(wrapper, selector)).toEqual({ path: '/login', query: { redirect } })
    }
    expect(wrapper.get('[data-test="model-plaza"]').text()).toContain('登录查看')
    expect(wrapper.get('.hero').text()).not.toContain('图像')
    expect(wrapper.get('#capabilities').text()).not.toContain('图像')
  })

  it('opens a public model plaza directly and removes disabled references', async () => {
    const wrapper = mountHome({ model_plaza_enabled: true, model_plaza_require_auth: false })
    expect(destination(wrapper, '[data-test="model-plaza"]')).toBe('/model-plaza')
    appStore.cachedPublicSettings = { model_plaza_enabled: false, payment_enabled: false }
    await nextTick()
    expect(wrapper.find('[data-test="model-plaza"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="purchase"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('模型广场')
  })

  it.each([
    [true, false, '充值／订阅', '/purchase'],
    [false, false, '账户充值', '/purchase'],
    [true, true, '查看订阅', '/purchase?tab=subscription']
  ] as const)('matches billing mode and preserves its login redirect', (subscription, balanceDisabled, label, redirect) => {
    const wrapper = mountHome({ payment_enabled: true, subscription_enabled: subscription, payment_balance_disabled: balanceDisabled })
    expect(wrapper.get('[data-test="purchase"]').text()).toBe(label)
    expect(destination(wrapper, '[data-test="purchase"]')).toEqual({ path: '/login', query: { redirect } })
  })

  it('removes billing, quota and usage promotion in simple mode', () => {
    authStore.isSimpleMode = true
    const wrapper = mountHome({ payment_enabled: true, registration_enabled: true, model_plaza_enabled: true })
    expect(wrapper.find('[data-test="purchase"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="capability-usage"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="faq-cost"]').exists()).toBe(false)
    expect(wrapper.text()).not.toMatch(/费用|额度|充值|订阅|价格/)
    expect(wrapper.find('[data-test="capability-keys"]').exists()).toBe(true)
  })

  it('uses configured branding, content-only legal links and plain contact text', () => {
    const wrapper = mountHome({
      site_name: 'Custom Site', site_logo: 'javascript:alert(1)', contact_info: 'support: example',
      login_agreement_documents: [
        { id: 'terms', title: '使用条款', content_md: 'Terms' },
        { id: 'empty', title: '空协议', content_md: '  ' }
      ]
    })
    expect(wrapper.get('.hero-wordmark').text()).toBe('Custom Site')
    expect(wrapper.find('.brand img').exists()).toBe(false)
    expect(wrapper.get('.brand svg').attributes('aria-label')).toBe('Custom Site')
    expect(wrapper.get('[data-test="contact"]').text()).toContain('support: example')
    expect(wrapper.get('[data-test="contact"]').find('a').exists()).toBe(false)
    expect(wrapper.findAllComponents(RouterLinkStub).map(link => link.props('to'))).toContain('/legal/terms')
    expect(wrapper.text()).not.toContain('空协议')
    expect(wrapper.get('[data-test="faq-errors"]').text()).toContain('联系站点支持')
  })

  it('does not promise support without a configured contact', () => {
    const wrapper = mountHome()
    expect(wrapper.find('[data-test="contact"]').exists()).toBe(false)
    expect(wrapper.get('[data-test="faq-errors"]').text()).not.toContain('联系站点支持')
  })

  it('switches both header and footer between the default wordmark and configured image', async () => {
    const wrapper = mountHome({ site_name: 'AlphaIO' })
    expect(wrapper.findAll('.brand svg')).toHaveLength(2)
    expect(wrapper.findAll('.brand span')).toHaveLength(0)
    appStore.cachedPublicSettings = { site_name: 'Custom Site', site_logo: '/custom-logo.png' }
    await nextTick()
    expect(wrapper.findAll('.brand svg')).toHaveLength(0)
    for (const brand of wrapper.findAll('.brand')) {
      expect(brand.get('img').attributes('src')).toBe('/custom-logo.png')
      expect(brand.get('span').text()).toBe('Custom Site')
    }
    appStore.cachedPublicSettings = { site_logo: '' }
    await nextTick()
    expect(wrapper.findAll('.brand svg')).toHaveLength(2)
  })

  it('closes the mobile menu on navigation and Escape, and persists theme choice', async () => {
    const wrapper = mountHome()
    await wrapper.get('[data-test="mobile-toggle"]').trigger('click')
    expect(wrapper.get('[data-test="mobile-toggle"]').attributes('aria-expanded')).toBe('true')
    expect(wrapper.get('[data-test="mobile-menu"] a').attributes('href')).toBe('#capabilities')
    await wrapper.get('[data-test="mobile-menu"] a').trigger('click')
    expect(wrapper.find('[data-test="mobile-menu"]').exists()).toBe(false)
    await wrapper.get('[data-test="mobile-toggle"]').trigger('click')
    await wrapper.get('header').trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('[data-test="mobile-menu"]').exists()).toBe(false)
    await wrapper.get('[data-test="theme-dark"]').trigger('click')
    expect(localStorage.getItem('theme')).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    await wrapper.get('[data-test="theme-light"]').trigger('click')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('renders English content and native keyboard-accessible FAQ controls', () => {
    const wrapper = mountHome({}, 'en')
    expect(wrapper.get('h1').text()).toContain('The AI models you need.')
    expect(wrapper.text()).not.toContain('home.builtin.')
    expect(wrapper.findAll('details > summary')).toHaveLength(4)
  })
})
