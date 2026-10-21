import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import AnnouncementNoticeBar from '../AnnouncementNoticeBar.vue'
import { useAnnouncementStore } from '@/stores/announcements'
import type { UserAnnouncement } from '@/types'

vi.mock('../AnnouncementPopup.vue', () => ({
  default: {
    name: 'AnnouncementPopup',
    props: { announcement: Object, preview: Boolean },
    emits: ['close'],
    template: '<div data-testid="mock-popup" />'
  }
}))

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      announcements: {
        noticeBarDismiss: 'Dismiss notice',
        noticeBarMore: 'Details'
      }
    }
  }
})

const sample: UserAnnouncement = {
  id: 9,
  title: 'Maintenance tonight',
  content: 'Service window **22:00-23:00**',
  notify_mode: 'notice_bar',
  created_at: '2026-10-21T00:00:00Z',
  updated_at: '2026-10-21T00:00:00Z'
}

describe('AnnouncementNoticeBar', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders store currentNoticeBar title and excerpt', () => {
    const store = useAnnouncementStore()
    store.currentNoticeBar = sample

    const wrapper = mount(AnnouncementNoticeBar, {
      global: { plugins: [i18n] }
    })

    expect(wrapper.get('[data-testid="announcement-notice-bar"]').text()).toContain('Maintenance tonight')
    expect(wrapper.text()).toContain('Service window 22:00-23:00')
  })

  it('emits close in preview mode', async () => {
    const host = document.createElement('div')
    document.body.appendChild(host)

    const wrapper = mount(AnnouncementNoticeBar, {
      props: { announcement: sample, preview: true },
      attachTo: host,
      global: { plugins: [i18n] }
    })

    const dismiss = document.querySelector('[data-testid="announcement-notice-bar-dismiss"]') as HTMLButtonElement
    expect(dismiss).toBeTruthy()
    await dismiss.click()
    expect(wrapper.emitted('close')).toBeTruthy()

    wrapper.unmount()
    host.remove()
  })

  it('opens details and preserves the runtime dismiss action', async () => {
    const store = useAnnouncementStore()
    store.currentNoticeBar = sample
    const dismiss = vi.spyOn(store, 'dismissNoticeBar').mockResolvedValue()
    const wrapper = mount(AnnouncementNoticeBar, {
      global: { plugins: [i18n] }
    })

    await wrapper.get('[data-testid="announcement-notice-bar-more"]').trigger('click')
    const popup = wrapper.findComponent({ name: 'AnnouncementPopup' })
    expect(popup.props('announcement')).toEqual(sample)
    expect(popup.props('preview')).toBe(true)
    popup.vm.$emit('close')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-testid="mock-popup"]').exists()).toBe(false)
    await wrapper.get('[data-testid="announcement-notice-bar-dismiss"]').trigger('click')
    expect(dismiss).toHaveBeenCalledOnce()
    wrapper.unmount()
  })
})
