<template>
  <!-- Admin preview: fixed overlay at top -->
  <Teleport v-if="preview && displayedAnnouncement" to="body">
    <div class="fixed inset-x-0 top-0 z-[110]" data-testid="announcement-notice-bar-preview-host">
      <div
        class="px-4 pt-4 md:px-6 lg:px-8"
        role="status"
        data-testid="announcement-notice-bar"
      >
        <div class="notice-card">
          <div
            class="notice-icon"
            aria-hidden="true"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
              />
            </svg>
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-gray-900 dark:text-dark-100" :title="displayedAnnouncement.title">
              {{ displayedAnnouncement.title }}
            </p>
            <p
              v-if="plainExcerpt"
              class="mt-1 truncate text-xs leading-relaxed text-gray-500 dark:text-dark-400"
              :title="plainExcerpt"
            >
              {{ plainExcerpt }}
            </p>
          </div>
          <button
            type="button"
            class="notice-dismiss"
            :aria-label="t('announcements.noticeBarDismiss')"
            data-testid="announcement-notice-bar-dismiss"
            @click="handleDismiss"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Runtime bar in AppLayout -->
  <template v-else-if="displayedAnnouncement">
    <div
      class="px-4 pt-4 md:px-6 lg:px-8"
      role="status"
      data-testid="announcement-notice-bar"
    >
      <div class="notice-card">
        <div
          class="notice-icon"
          aria-hidden="true"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
            />
          </svg>
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-gray-900 dark:text-dark-100" :title="displayedAnnouncement.title">
            {{ displayedAnnouncement.title }}
          </p>
          <p
            v-if="plainExcerpt"
            class="mt-1 truncate text-xs leading-relaxed text-gray-500 dark:text-dark-400"
            :title="plainExcerpt"
          >
            {{ plainExcerpt }}
          </p>
        </div>
        <button
          v-if="hasMarkdownBody"
          type="button"
          class="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 dark:text-primary-400 dark:hover:bg-primary-500/10"
          data-testid="announcement-notice-bar-more"
          @click="showDetails = true"
        >
          {{ t('announcements.noticeBarMore') }}
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="m9 5 7 7-7 7" />
          </svg>
        </button>
        <button
          type="button"
          class="notice-dismiss"
          :aria-label="t('announcements.noticeBarDismiss')"
          data-testid="announcement-notice-bar-dismiss"
          @click="handleDismiss"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <AnnouncementPopup
      v-if="detailsAnnouncement"
      :announcement="detailsAnnouncement"
      preview
      @close="showDetails = false"
    />
  </template>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAnnouncementStore } from '@/stores/announcements'
import type { Announcement, UserAnnouncement } from '@/types'
import AnnouncementPopup from './AnnouncementPopup.vue'

type PreviewAnnouncement = Pick<Announcement | UserAnnouncement, 'title' | 'content' | 'created_at'>

const props = withDefaults(
  defineProps<{
    announcement?: PreviewAnnouncement | UserAnnouncement | null
    preview?: boolean
  }>(),
  {
    announcement: null,
    preview: false
  }
)

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()
const store = useAnnouncementStore()
const showDetails = ref(false)

const displayedAnnouncement = computed(() => {
  if (props.preview || props.announcement) {
    return props.announcement
  }
  return store.currentNoticeBar
})

const detailsAnnouncement = computed(() => (showDetails.value ? displayedAnnouncement.value : null))

const hasMarkdownBody = computed(() => Boolean(displayedAnnouncement.value?.content?.trim()))

const plainExcerpt = computed(() => {
  const content = displayedAnnouncement.value?.content?.trim()
  if (!content) return ''
  return content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*>\s+/gm, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/\s+/g, ' ')
    .trim()
})

watch(displayedAnnouncement, () => {
  showDetails.value = false
})

async function handleDismiss() {
  if (props.preview || props.announcement) {
    emit('close')
    return
  }
  await store.dismissNoticeBar()
}
</script>

<style scoped>
.notice-card {
  @apply flex items-center gap-2 rounded-xl border border-gray-200/80 bg-white/80 p-3 shadow-sm backdrop-blur-sm sm:gap-3 sm:px-4;
  @apply dark:border-dark-700/60 dark:bg-dark-900/80 dark:shadow-none;
}

.notice-icon {
  @apply flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600;
  @apply dark:bg-primary-500/10 dark:text-primary-400;
}

.notice-dismiss {
  @apply flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 dark:text-dark-400 dark:hover:bg-white/5 dark:hover:text-dark-100;
}
</style>
