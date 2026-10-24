<template>
  <section
    v-if="items.length"
    class="global-announcement-bar flex items-center gap-3 bg-gradient-to-r from-orange-600 via-rose-600 to-pink-600 px-4 py-2 text-sm text-white"
    :aria-label="t('admin.announcements.notifyModeLabels.globalBar')"
    data-test="global-announcement-bar"
  >
    <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" d="M3 10v4h4l12 5V5L7 10H3zm4 4 2 6h3l-2-4.75M22 9v6" />
    </svg>
    <div class="marquee-viewport min-w-0 flex-1 overflow-hidden" tabindex="0">
      <div class="marquee-track" :style="{ animationDuration: `${duration}s` }">
        <span v-for="item in items" :key="item.id" class="marquee-item" v-html="item.html"></span>
      </div>
    </div>
    <button v-if="announcement" type="button" class="shrink-0 rounded px-2 py-1 hover:bg-white/15" @click="$emit('close')">
      {{ t('common.close') }}
    </button>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNow } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useAnnouncementStore } from '@/stores/announcements'
import type { UserAnnouncement } from '@/types'

const props = defineProps<{ announcement?: UserAnnouncement }>()
defineEmits<{ close: [] }>()
const { t } = useI18n()
const store = useAnnouncementStore()
const now = useNow({ interval: 1000 })

const renderedItems = computed(() => {
  const announcements = props.announcement ? [props.announcement] : store.globalAnnouncements
  return announcements.map((item) => {
    const html = DOMPurify.sanitize(marked.parse(item.content, { breaks: true, gfm: true }) as string, {
      ALLOWED_TAGS: ['p', 'div', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'del', 'a', 'span', 'code', 'ul', 'ol', 'li', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      ALLOWED_ATTR: ['href', 'title'],
      ALLOW_DATA_ATTR: false,
      ALLOW_ARIA_ATTR: false
    })
    const container = document.createElement('div')
    container.innerHTML = html
    container.querySelectorAll('br').forEach((lineBreak) => lineBreak.replaceWith(' '))
    return { ...item, html: container.innerHTML, text: container.textContent?.trim() ?? '' }
  }).filter((item) => item.text)
})

const items = computed(() => renderedItems.value.filter((item) => props.announcement || (
  (!item.starts_at || Date.parse(item.starts_at) <= now.value.getTime()) &&
  (!item.ends_at || Date.parse(item.ends_at) > now.value.getTime())
)))

const duration = computed(() => Math.max(20, items.value.reduce((length, item) => length + item.text.length, 0) / 5) * 2)
</script>

<style scoped>
.marquee-track {
  display: flex;
  width: max-content;
  min-width: 100%;
  padding-left: 100%;
  white-space: nowrap;
  animation: global-marquee linear infinite;
}

.marquee-item {
  flex-shrink: 0;
  padding-right: 4rem;
}

.marquee-item :deep(*) {
  display: inline;
  margin: 0;
  padding: 0;
}

.marquee-item :deep(p)::after,
.marquee-item :deep(div)::after,
.marquee-item :deep(li)::after {
  content: ' ';
  white-space: pre;
}

.marquee-item :deep(a) {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.global-announcement-bar:hover .marquee-track,
.global-announcement-bar:focus-within .marquee-track {
  animation-play-state: paused;
}

@keyframes global-marquee {
  to { transform: translateX(-100%); }
}

@media (prefers-reduced-motion: reduce) {
  .marquee-viewport {
    overflow-x: auto;
  }

  .marquee-track {
    animation: none;
    padding-left: 0;
  }
}
</style>
