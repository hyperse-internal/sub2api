import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAnnouncementStore } from '../announcements'
import type { UserAnnouncement } from '@/types'

const list = vi.hoisted(() => vi.fn())
const markRead = vi.hoisted(() => vi.fn())
vi.mock('@/api', () => ({ announcementsAPI: { list, markRead } }))

const notice = (id: number, mode: UserAnnouncement['notify_mode'] = 'notice_bar'): UserAnnouncement => ({
  id,
  title: `Notice ${id}`,
  content: '**Hello** bar',
  notify_mode: mode,
  created_at: '2026-09-18T00:00:00Z',
  updated_at: '2026-09-18T00:00:00Z'
})

beforeEach(() => {
  setActivePinia(createPinia())
  vi.resetAllMocks()
  vi.spyOn(console, 'error').mockImplementation(() => {})
  markRead.mockResolvedValue(undefined)
})
afterEach(() => vi.restoreAllMocks())

describe('announcement notice bar queue', () => {
  it('enqueues unread notice_bar items and ignores popup/silent', async () => {
    const store = useAnnouncementStore()
    list.mockResolvedValueOnce([
      notice(1, 'notice_bar'),
      notice(2, 'popup'),
      notice(3, 'silent'),
      { ...notice(4, 'notice_bar'), read_at: '2026-09-18T01:00:00Z' }
    ])

    await store.fetchAnnouncements()

    expect(store.currentNoticeBar?.id).toBe(1)
    expect(store.currentPopup?.id).toBe(2)
  })

  it('advances to the next notice_bar after dismiss', async () => {
    const store = useAnnouncementStore()
    list.mockResolvedValueOnce([notice(1), notice(2)])

    await store.fetchAnnouncements()
    expect(store.currentNoticeBar?.id).toBe(1)

    await store.dismissNoticeBar()
    expect(markRead).toHaveBeenCalledWith(1)
    expect(store.currentNoticeBar?.id).toBe(2)
  })

  it('clears notice bar when mark all as read succeeds', async () => {
    const store = useAnnouncementStore()
    list.mockResolvedValueOnce([notice(1), notice(2)])

    await store.fetchAnnouncements()
    expect(store.currentNoticeBar).not.toBeNull()

    await store.markAllAsRead()
    expect(store.currentNoticeBar).toBeNull()
  })
})
