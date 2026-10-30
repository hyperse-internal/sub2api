<template>
  <button
    type="button"
    data-test="pelican-entry-card"
    data-pelican-entry
    class="group flex w-[300px] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-sm transition hover:border-primary-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-dark-700 dark:bg-dark-900 dark:hover:border-primary-600"
    @click="emit('open')"
  >
    <div class="relative aspect-[3/2] w-full overflow-hidden bg-gray-50 dark:bg-dark-800">
      <iframe
        v-if="previewUrl && canPreview"
        :src="previewUrl"
        class="pointer-events-none absolute inset-0 h-full w-full border-0 origin-top-left"
        :style="iframeStyle"
        sandbox="allow-scripts"
        loading="lazy"
        tabindex="-1"
        title=""
      />
      <div
        v-else
        class="flex h-full items-center justify-center px-4 text-center text-xs text-gray-400 dark:text-dark-500"
      >
        {{ placeholderText }}
      </div>
    </div>

    <div class="flex flex-1 flex-col gap-2 border-t border-gray-100 px-3.5 py-3 dark:border-dark-700">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <p class="truncate font-mono text-sm font-medium text-gray-900 dark:text-white">{{ item.model }}</p>
          <p class="mt-0.5 text-xs text-gray-500 dark:text-dark-400">{{ scheduledLabel }}</p>
        </div>
        <span :class="statusClass" class="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium">
          {{ statusLabel }}
        </span>
      </div>
      <div class="flex items-center justify-between text-xs text-gray-500 dark:text-dark-400">
        <span v-if="durationLabel">{{ t('pelicanBenchmark.duration', { value: durationLabel }) }}</span>
        <span v-else class="invisible">—</span>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { pelicanDocumentUrl } from './api'
import { formatPelicanDateTime, formatPelicanDuration, pelicanStatusTone } from './format'
import type { PelicanBenchmarkItem } from './types'

const props = defineProps<{
  item: PelicanBenchmarkItem
}>()

const emit = defineEmits<{
  open: []
}>()

const { t, locale } = useI18n()

const previewUrl = computed(() => pelicanDocumentUrl(props.item))
const canPreview = computed(
  () => props.item.status === 'succeeded' && !props.item.disqualified && !!previewUrl.value
)

const iframeStyle = computed(() => {
  const w = props.item.width > 0 ? props.item.width : 800
  const scale = 300 / w
  return {
    width: `${w}px`,
    height: `${(props.item.height > 0 ? props.item.height : 500)}px`,
    transform: `scale(${scale})`
  }
})

const scheduledLabel = computed(() =>
  formatPelicanDateTime(props.item.scheduledAt || props.item.finishedAt, locale.value)
)

const durationLabel = computed(() => formatPelicanDuration(props.item.durationMs))

const statusLabel = computed(() => {
  if (props.item.disqualified) return t('pelicanBenchmark.status.disqualified')
  const key = `pelicanBenchmark.status.${props.item.status}`
  const translated = t(key)
  return translated === key ? props.item.status : translated
})

const statusClass = computed(() => {
  const tone = pelicanStatusTone(props.item.status, props.item.disqualified)
  if (tone === 'success') {
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
  }
  if (tone === 'danger') {
    return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  }
  if (tone === 'warning') {
    return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
  }
  return 'bg-gray-100 text-gray-600 dark:bg-dark-700 dark:text-dark-300'
})

const placeholderText = computed(() => {
  if (props.item.status === 'running' || props.item.status === 'queued') {
    return statusLabel.value
  }
  if (props.item.status === 'failed' || props.item.disqualified) {
    return statusLabel.value
  }
  return t('pelicanBenchmark.noPreview')
})
</script>
