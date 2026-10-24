import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import GlobalAnnouncementBar from '../GlobalAnnouncementBar.vue'
import { useAnnouncementStore } from '@/stores/announcements'
import type { UserAnnouncement } from '@/types'

const sample: UserAnnouncement = {
  id: 1,
  title: 'Global notice',
  content: 'Welcome to the console',
  notify_mode: 'global_bar',
  created_at: '2026-10-24T00:00:00Z',
  updated_at: '2026-10-24T00:00:00Z'
}

const wrappers: ReturnType<typeof mount>[] = []
function render(announcement?: UserAnnouncement) {
  const wrapper = mount(GlobalAnnouncementBar, {
    props: { announcement },
    global: { plugins: [createI18n({ legacy: false, locale: 'en', missingWarn: false, fallbackWarn: false })] }
  })
  wrappers.push(wrapper)
  return wrapper
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-24T12:00:00Z'))
})

afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  vi.useRealTimers()
})

describe('GlobalAnnouncementBar', () => {
  it('hides when nothing is configured or the content has no visible text', async () => {
    const wrapper = render()
    expect(wrapper.find('[data-test="global-announcement-bar"]').exists()).toBe(false)
    useAnnouncementStore().globalAnnouncements = [{ ...sample, content: '<p> </p>' }]
    await wrapper.vm.$nextTick()
    expect(wrapper.find('section').exists()).toBe(false)
  })

  it('shows plain text and read notices without a dismiss action', () => {
    useAnnouncementStore().globalAnnouncements = [{ ...sample, read_at: sample.created_at }]
    const wrapper = render()
    expect(wrapper.text()).toContain(sample.content)
    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.get('.marquee-track').attributes('style')).toContain('animation-duration')
  })

  it('renders Markdown and HTML formatting while removing executable content and media', () => {
    useAnnouncementStore().globalAnnouncements = [{
      ...sample,
      content: '**Bold** <em>Italic</em> [Help](https://example.com/help) <a href="javascript:alert(1)" onclick="alert(1)">Unsafe</a><script>alert(1)</script><img src=x onerror="alert(1)"><iframe src="https://example.com"></iframe>'
    }]
    const wrapper = render()
    expect(wrapper.get('strong').text()).toBe('Bold')
    expect(wrapper.get('em').text()).toBe('Italic')
    expect(wrapper.findAll('a')[0].attributes('href')).toBe('https://example.com/help')
    expect(wrapper.findAll('a')[1].attributes('href')).toBeUndefined()
    expect(wrapper.find('[onclick], script, img, iframe').exists()).toBe(false)
  })

  it('flattens line breaks for the single-line banner', () => {
    const wrapper = render({ ...sample, content: 'First\nSecond<br>Third' })
    expect(wrapper.find('br').exists()).toBe(false)
    expect(wrapper.text()).toContain('First')
    expect(wrapper.text()).toContain('Second Third')
  })

  it('displays multiple notices and hides expired notices while the page remains open', async () => {
    useAnnouncementStore().globalAnnouncements = [
      { ...sample, ends_at: '2026-10-24T12:00:01Z' },
      { ...sample, id: 2, content: 'Second', ends_at: '2026-10-24T12:00:02Z' },
      { ...sample, id: 3, starts_at: '2026-10-25T00:00:00Z' }
    ]
    const wrapper = render()
    expect(wrapper.findAll('.marquee-item')).toHaveLength(2)
    await vi.advanceTimersByTimeAsync(1000)
    expect(wrapper.findAll('.marquee-item')).toHaveLength(1)
    expect(wrapper.text()).toContain('Second')
    await vi.advanceTimersByTimeAsync(1000)
    expect(wrapper.find('section').exists()).toBe(false)
  })

  it('previews a scheduled notice and allows closing the preview', async () => {
    const wrapper = render({ ...sample, starts_at: '2026-10-25T00:00:00Z' })
    expect(wrapper.text()).toContain(sample.content)
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
