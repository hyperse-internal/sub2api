<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show && item"
        class="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-3 sm:p-6"
        role="dialog"
        aria-modal="true"
        data-test="pelican-detail-dialog"
        @click.self="emit('close')"
      >
        <div
          class="flex max-h-[min(92vh,920px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-dark-700 dark:bg-dark-900"
          @click.stop
        >
          <div class="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-3 dark:border-dark-700 sm:px-5">
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <Icon name="lightbulb" size="sm" class="shrink-0 text-primary-600 dark:text-primary-400" />
                <h2 class="truncate text-base font-semibold text-gray-900 dark:text-white">{{ item.model }}</h2>
              </div>
              <p class="mt-1 text-xs text-gray-500 dark:text-dark-400">
                {{ scheduledLabel }}
                <span class="mx-1">·</span>
                {{ t('pelicanBenchmark.beijingTime') }}
              </p>
            </div>
            <button
              type="button"
              class="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-dark-800 dark:hover:text-dark-200"
              :aria-label="t('common.close')"
              @click="emit('close')"
            >
              <Icon name="x" size="md" />
            </button>
          </div>

          <div class="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-2.5 dark:border-dark-700 sm:px-5">
            <p class="text-sm text-gray-600 dark:text-dark-300">
              <template v-if="durationLabel">
                {{ t('pelicanBenchmark.duration', { value: durationLabel }) }}
              </template>
              <template v-else>—</template>
            </p>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="rounded-lg bg-red-500 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-red-600"
                @click="fitToWindow"
              >
                {{ t('pelicanBenchmark.fitToWindow') }}
              </button>
              <span class="min-w-[3rem] text-right text-xs tabular-nums text-gray-500 dark:text-dark-400">
                {{ Math.round(zoom * 100) }}%
              </span>
            </div>
          </div>

          <div ref="viewportRef" class="relative min-h-0 flex-1 overflow-auto bg-gray-50 dark:bg-dark-950">
            <div class="flex min-h-full items-start justify-center p-4">
              <div
                class="overflow-hidden rounded-xl bg-transparent"
                :style="frameBoxStyle"
              >
                <iframe
                  v-if="documentUrl"
                  ref="iframeRef"
                  :src="documentUrl"
                  class="block border-0"
                  :style="iframeStyle"
                  sandbox="allow-scripts"
                  :title="item.model"
                />
              </div>
            </div>
          </div>

          <p class="border-t border-gray-100 px-4 py-2 text-center text-[11px] text-gray-400 dark:border-dark-700 dark:text-dark-500 sm:px-5">
            {{ t('pelicanBenchmark.sandboxHint') }}
          </p>

          <div class="flex items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 dark:border-dark-700 sm:px-5">
            <button
              type="button"
              class="btn btn-secondary inline-flex items-center gap-1.5"
              :disabled="downloading || !documentUrl"
              data-test="pelican-download-html"
              @click="handleDownload"
            >
              <Icon name="download" size="sm" />
              {{ downloading ? t('pelicanBenchmark.downloading') : t('pelicanBenchmark.downloadHtml') }}
            </button>
            <button type="button" class="btn btn-primary" @click="emit('close')">
              {{ t('common.close') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/icons/Icon.vue'
import { useAppStore } from '@/stores/app'
import { downloadPelicanHtml, pelicanDocumentUrl } from './api'
import { formatPelicanDateTime, formatPelicanDuration } from './format'
import type { PelicanBenchmarkItem } from './types'

const props = defineProps<{
  show: boolean
  item: PelicanBenchmarkItem | null
}>()

const emit = defineEmits<{
  close: []
}>()

const { t, locale } = useI18n()
const appStore = useAppStore()

const viewportRef = ref<HTMLElement | null>(null)
const iframeRef = ref<HTMLIFrameElement | null>(null)
const zoom = ref(1)
const downloading = ref(false)

const documentUrl = computed(() => (props.item ? pelicanDocumentUrl(props.item) : null))
const scheduledLabel = computed(() =>
  props.item ? formatPelicanDateTime(props.item.scheduledAt || props.item.finishedAt, locale.value) : ''
)
const durationLabel = computed(() =>
  props.item ? formatPelicanDuration(props.item.durationMs) : null
)

const naturalWidth = computed(() => (props.item && props.item.width > 0 ? props.item.width : 800))
const naturalHeight = computed(() => (props.item && props.item.height > 0 ? props.item.height : 500))

const iframeStyle = computed(() => ({
  width: `${naturalWidth.value}px`,
  height: `${naturalHeight.value}px`,
  transform: `scale(${zoom.value})`,
  transformOrigin: 'top left'
}))

const frameBoxStyle = computed(() => ({
  width: `${Math.round(naturalWidth.value * zoom.value)}px`,
  height: `${Math.round(naturalHeight.value * zoom.value)}px`
}))

function fitToWindow() {
  const viewport = viewportRef.value
  if (!viewport) {
    zoom.value = 1
    return
  }
  const pad = 32
  const availW = Math.max(120, viewport.clientWidth - pad)
  const availH = Math.max(120, viewport.clientHeight - pad)
  const scale = Math.min(1, availW / naturalWidth.value, availH / naturalHeight.value)
  zoom.value = Number.isFinite(scale) && scale > 0 ? scale : 1
}

async function handleDownload() {
  if (!props.item || downloading.value) return
  downloading.value = true
  try {
    await downloadPelicanHtml(props.item)
  } catch {
    appStore.showError(t('pelicanBenchmark.downloadFailed'))
  } finally {
    downloading.value = false
  }
}

watch(
  () => [props.show, props.item?.id] as const,
  async ([show]) => {
    if (!show) return
    zoom.value = 1
    await nextTick()
    fitToWindow()
  }
)
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.15s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
