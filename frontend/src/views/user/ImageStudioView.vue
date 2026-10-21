<template>
  <div class="flex h-screen min-h-0 flex-col bg-gray-50 text-gray-900 dark:bg-dark-950 dark:text-gray-100">
    <header class="flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-3 dark:border-dark-700 dark:bg-dark-900">
      <div class="flex min-w-0 items-center gap-3">
        <router-link :to="systemHome" class="shrink-0" :title="t('imageStudio.backToSystem')" :aria-label="t('imageStudio.backToSystem')">
          <SiteLogo :src="siteLogo" :title="appStore.siteName" class="h-8" :class="siteLogo ? 'w-8' : 'w-auto'" />
        </router-link>
        <div class="min-w-0">
          <h1 class="truncate text-base font-medium">{{ t('imageStudio.title') }}</h1>
          <p class="truncate text-xs text-gray-500 dark:text-dark-400">{{ t('imageStudio.subtitle') }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span v-if="selected" class="inline-flex max-w-56 items-center gap-2 overflow-visible rounded-full bg-primary-50 py-1 pl-2.5 pr-3 text-xs font-medium text-primary-700 dark:bg-primary-900/40 dark:text-primary-200">
          <span class="relative inline-flex h-2 w-2 shrink-0" aria-hidden="true">
            <span class="model-wave"></span>
            <span class="model-wave model-wave-delay"></span>
            <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span class="truncate">{{ selected.groupLabel }}</span>
        </span>
        <button type="button" class="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5" :title="isDark ? t('nav.lightMode') : t('nav.darkMode')" @click="toggleTheme">
          <Icon :name="isDark ? 'sun' : 'moon'" size="sm" />
        </button>
      </div>
    </header>

    <div v-if="loadingCatalog" class="flex flex-1 items-center justify-center">
      <Icon name="refresh" size="lg" class="animate-spin text-primary-500" />
    </div>
    <div v-else-if="!groups.length" class="m-6 flex flex-col items-start gap-4 rounded-xl border border-gray-200 bg-white p-6 dark:border-dark-700 dark:bg-dark-900" data-test="image-studio-empty">
      <p class="text-sm text-gray-600 dark:text-gray-300">{{ loadError || t('imageStudio.emptyModels') }}</p>
      <a class="btn btn-primary" href="/keys" target="_blank" rel="noopener">{{ t('imageStudio.openKeys') }}</a>
    </div>

    <div v-else class="flex min-h-0 flex-1">
      <nav class="flex w-14 shrink-0 flex-col items-center gap-2 border-r border-gray-200 bg-white py-4 dark:border-dark-700 dark:bg-dark-900" :aria-label="t('imageStudio.modules.chat')">
        <button type="button" class="rounded-lg p-2" :class="module === 'chat' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200' : 'text-gray-500'" :title="t('imageStudio.modules.chatTip')" @click="module = 'chat'">
          <Icon name="sparkles" size="md" />
        </button>
        <button type="button" class="rounded-lg p-2" :class="module === 'history' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200' : 'text-gray-500'" :title="t('imageStudio.modules.historyTip')" @click="module = 'history'">
          <Icon name="clock" size="md" />
        </button>
      </nav>

      <section class="flex min-h-0 shrink-0 flex-col border-r border-gray-200 bg-white dark:border-dark-700 dark:bg-dark-900" :style="{ width: `${panelWidth}px` }">
        <div v-if="module === 'history'" class="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
          <div class="flex items-center justify-between">
            <h2 class="font-medium">{{ t('imageStudio.history.title') }}</h2>
            <span class="text-xs text-gray-500">{{ history.length }} / {{ IMAGE_HISTORY_LIMIT }}</span>
          </div>
          <p class="text-xs text-gray-500">{{ t('imageStudio.history.hint') }}</p>
          <p v-if="!history.length" class="py-10 text-center text-sm text-gray-500">{{ historyFailed ? t('imageStudio.history.loadFailed') : t('imageStudio.history.empty') }}</p>
          <ul class="space-y-3">
            <li v-for="item in history" :key="item.id" class="flex items-center gap-3 rounded-xl border border-gray-200 p-3 dark:border-dark-700">
              <button type="button" class="h-20 w-20 shrink-0 overflow-hidden rounded-lg" @click="previewHistory(item)">
                <img :src="item.url" :alt="item.prompt" class="h-full w-full object-cover" />
              </button>
              <div class="min-w-0 flex-1">
                <p class="line-clamp-2 text-sm">{{ item.prompt }}</p>
                <p class="truncate text-xs text-gray-500">{{ item.model }}</p>
                <time class="text-xs text-gray-400">{{ formatTime(item.createdAt) }}</time>
              </div>
              <div class="flex flex-col gap-1">
                <button type="button" class="btn btn-secondary btn-sm" @click="download(item.url, item.name, item.mimeType || item.blob.type)">{{ t('imageStudio.history.download') }}</button>
                <button type="button" class="btn btn-secondary btn-sm" @click="removeHistory(item.id)">{{ t('imageStudio.history.delete') }}</button>
              </div>
            </li>
          </ul>
        </div>

        <form v-else class="flex min-h-0 flex-1 flex-col" @submit.prevent="generate">
          <div class="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
            <section class="space-y-2">
              <div class="relative">
                <textarea v-model="prompt" data-test="image-studio-prompt" :maxlength="MAX_PROMPT_LENGTH" rows="6" class="w-full rounded-xl border border-gray-200 bg-white px-3 pb-12 pt-3 text-sm dark:border-dark-700 dark:bg-dark-800" :placeholder="t('imageStudio.promptPlaceholder')" />
                <button ref="helperButton" type="button" class="btn btn-secondary btn-sm absolute bottom-2 right-2" @click="toggleHelper">{{ t('imageStudio.promptHelper.title') }}</button>
              </div>
            </section>

            <section class="space-y-2">
              <div class="flex items-center gap-2 text-sm font-medium">
                {{ t('imageStudio.reference') }}
                <span class="rounded-md bg-gray-100 px-1.5 text-xs text-gray-500 dark:bg-dark-800">{{ references.length }}</span>
              </div>
              <p v-if="selected && !canEdit" class="text-sm text-gray-500">{{ t('imageStudio.editUnavailable') }}</p>
              <div class="flex flex-wrap gap-2">
                <button type="button" class="btn btn-secondary btn-sm" @click="acceptClipboard">{{ t('imageStudio.referenceClipboard') }}</button>
                <button type="button" class="btn btn-secondary btn-sm" @click="fileInput?.click()">{{ t('imageStudio.referenceUpload') }}</button>
                <button type="button" class="btn btn-secondary btn-sm" @click="pickerOpen = true">{{ t('imageStudio.history.title') }}</button>
                <input ref="fileInput" data-test="image-studio-references" type="file" accept="image/png,image/jpeg,image/webp" multiple class="sr-only" @change="onFiles" />
              </div>
              <div class="flex min-h-36 items-center rounded-xl border border-dashed border-gray-300 px-3 py-4 dark:border-dark-600" :class="references.length ? 'overflow-x-auto' : 'justify-center'">
                <div v-if="references.length" class="flex gap-3">
                  <div v-for="item in references" :key="item.url" class="relative h-24 w-24 shrink-0">
                    <img :src="item.url" :alt="item.file.name" class="h-full w-full rounded-lg object-cover" />
                    <button type="button" class="absolute right-1 top-1 rounded bg-red-600 px-1.5 text-xs text-white" :aria-label="t('imageStudio.removeFile')" @click="removeFile(item.file)">×</button>
                  </div>
                </div>
                <p v-else class="text-sm text-gray-500">{{ t('imageStudio.referenceEmpty') }}</p>
              </div>
            </section>

            <section class="space-y-2">
              <h2 class="text-sm font-medium">{{ t('imageStudio.model') }}</h2>
              <select v-model="selectedId" data-test="image-studio-model" class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-dark-700 dark:bg-dark-800">
                <optgroup v-for="group in groups" :key="group.label" :label="group.label">
                  <option v-for="item in group.models" :key="item.id" :value="item.id">{{ item.model }}</option>
                </optgroup>
              </select>
              <p v-if="selected" class="text-xs text-gray-500">{{ t('imageStudio.usingKey', { name: selected.keyName || selected.keyId }) }}</p>
            </section>

            <section class="space-y-2">
              <h2 class="text-sm font-medium">{{ t('imageStudio.parameters') }}</h2>
              <div class="grid grid-cols-3 gap-3">
                <label class="space-y-1 text-xs text-gray-500">{{ t('imageStudio.size') }}
                  <select v-model="size" class="w-full rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm text-gray-900 dark:border-dark-700 dark:bg-dark-800 dark:text-gray-100">
                    <option v-for="item in sizes" :key="item" :value="item">{{ item }}</option>
                  </select>
                </label>
                <label class="space-y-1 text-xs text-gray-500">{{ t('imageStudio.quality') }}
                  <select v-model="quality" class="w-full rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm text-gray-900 dark:border-dark-700 dark:bg-dark-800 dark:text-gray-100">
                    <option v-for="item in qualities" :key="item" :value="item">{{ item }}</option>
                  </select>
                </label>
                <label class="space-y-1 text-xs text-gray-500">{{ t('imageStudio.quantity') }}
                  <input v-model="count" inputmode="numeric" class="w-full rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm dark:border-dark-700 dark:bg-dark-800" />
                </label>
                <label class="space-y-1 text-xs text-gray-500">{{ t('imageStudio.format') }}
                  <select v-model="outputFormat" class="w-full rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm text-gray-900 dark:border-dark-700 dark:bg-dark-800 dark:text-gray-100">
                    <option v-for="item in formats" :key="item" :value="item">{{ item }}</option>
                  </select>
                </label>
                <label class="space-y-1 text-xs text-gray-500">{{ t('imageStudio.compression') }}
                  <input v-model="compression" :disabled="outputFormat === 'png'" :placeholder="outputFormat === 'png' ? t('imageStudio.compressionUnsupported') : '0-100'" class="w-full rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm disabled:opacity-60 dark:border-dark-700 dark:bg-dark-800" />
                </label>
                <label class="space-y-1 text-xs text-gray-500">{{ t('imageStudio.background') }}
                  <select v-model="background" class="w-full rounded-lg border border-gray-200 bg-white px-2 py-2 text-sm text-gray-900 dark:border-dark-700 dark:bg-dark-800 dark:text-gray-100">
                    <option v-for="item in backgrounds" :key="item" :value="item">{{ t(`imageStudio.backgrounds.${item}`) }}</option>
                  </select>
                </label>
              </div>
            </section>
            <p v-if="errorMessage" class="text-sm text-red-600" data-test="image-studio-error">{{ errorMessage }}</p>
            <p v-if="historyWarning" class="text-sm text-amber-600">{{ historyWarning }}</p>
          </div>
          <div class="space-y-2 border-t border-gray-200 px-4 py-3 dark:border-dark-700">
            <button type="submit" class="btn btn-primary w-full" data-test="image-studio-generate" :disabled="pending">
              {{ pending ? t('imageStudio.generating') : references.length ? t('imageStudio.submitEdit') : t('imageStudio.submitGenerate') }}
            </button>
            <p class="text-xs text-gray-500">{{ t('imageStudio.costHint') }}</p>
          </div>
        </form>
      </section>

      <button type="button" class="w-1.5 shrink-0 cursor-col-resize bg-gray-200 hover:bg-primary-400 dark:bg-dark-700" aria-label="resize" @pointerdown="startResize" />

      <section class="relative flex min-h-0 min-w-0 flex-1 flex-col bg-gray-100 dark:bg-dark-950">
        <div v-if="pending" class="absolute inset-0 z-20 flex items-center justify-center bg-white/60 dark:bg-dark-950/60">
          <Icon name="refresh" size="lg" class="animate-spin text-primary-500" />
        </div>
        <ImageStudioCanvas v-if="canvasItems.length" :items="canvasItems" :alt="t('imageStudio.title')" @download="downloadItem" />
        <p v-else class="flex h-full items-center justify-center text-sm text-gray-500">{{ t('imageStudio.resultEmpty') }}</p>
      </section>
    </div>

    <div v-if="pickerOpen" class="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4" @click.self="pickerOpen = false">
      <div class="max-h-[70vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-4 dark:bg-dark-900">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="font-medium">{{ t('imageStudio.history.pickTitle') }}</h2>
          <button type="button" class="btn btn-secondary btn-sm" @click="pickerOpen = false">×</button>
        </div>
        <p class="mb-3 text-sm text-gray-500">{{ t('imageStudio.history.pickHint', { count: remainingSlots }) }}</p>
        <div class="grid grid-cols-3 gap-3">
          <label v-for="item in history" :key="item.id" class="relative block">
            <input v-model="pickedIds" type="checkbox" class="absolute left-2 top-2" :value="item.id" :disabled="!pickedIds.includes(item.id) && pickedIds.length >= remainingSlots" />
            <img :src="item.url" :alt="item.prompt" class="h-28 w-full rounded-lg object-cover" />
          </label>
        </div>
        <button type="button" class="btn btn-primary mt-4" :disabled="!pickedIds.length" @click="confirmPicked">{{ t('imageStudio.history.add') }}</button>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="helperOpen" class="fixed z-50 w-80 overflow-y-auto rounded-xl border border-gray-200 bg-white p-3 shadow-lg dark:border-dark-700 dark:bg-dark-800" :style="helperStyle" @mousedown.stop>
        <section v-for="category in promptTagCategories" :key="category.id" class="mb-3 last:mb-0">
          <p class="mb-2 text-[11px] font-medium text-gray-500">{{ t(`imageStudio.promptHelper.categories.${category.id}`) }}</p>
          <div class="flex flex-wrap gap-2">
            <button v-for="tag in category.tags" :key="tag.value" type="button" class="rounded-md border border-gray-200 px-2 py-1 text-xs hover:border-primary-400 hover:text-primary-700 dark:border-dark-600 dark:hover:text-primary-200" @click="prompt = appendPromptTag(prompt, tag.value)">
              {{ tag.label[tagLocale] }}
            </button>
          </div>
        </section>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import SiteLogo from '@/components/common/SiteLogo.vue'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/icons/Icon.vue'
import { useAppStore, useAuthStore } from '@/stores'
import { sanitizeUrl } from '@/utils/url'
import { generateStudioImage, loadImageStudioCatalog } from '@/api/imageStudio'
import {
  IMAGE_BACKGROUNDS,
  IMAGE_OUTPUT_FORMATS,
  MAX_REFERENCE_BYTES,
  MAX_REFERENCE_IMAGES,
  clampImageCount,
  qualitiesForModel,
  sizesForModel,
  type ImageBackground,
  type ImageOutputFormat,
  type ImageQuality,
  type ImageStudioModelGroup
} from '@/utils/imageStudioCatalog'
import {
  IMAGE_HISTORY_LIMIT,
  MAX_PROMPT_LENGTH,
  appendPromptTag,
  detectImageMime,
  modelSupportsEdit,
  promptTagCategories
} from '@/utils/imageStudioUi'
import { deleteImageStudioHistory, readImageDimensions, readImageStudioHistory, saveImageStudioHistory, type ImageStudioHistoryEntry } from './imageStudioHistory'
import ImageStudioCanvas, { type ImageStudioCanvasItem } from './ImageStudioCanvas.vue'

const { t, locale } = useI18n()
const appStore = useAppStore()
const authStore = useAuthStore()
const siteLogo = computed(() => sanitizeUrl(appStore.cachedPublicSettings?.site_logo || appStore.siteLogo || '', { allowRelative: true, allowDataUrl: true }))
const systemHome = computed(() => (authStore.isAdmin ? '/admin/dashboard' : '/dashboard'))
const formats = IMAGE_OUTPUT_FORMATS
const backgrounds = IMAGE_BACKGROUNDS
const tagLocale = computed(() => (locale.value.startsWith('zh') ? 'zh' : 'en'))
const isDark = ref(document.documentElement.classList.contains('dark'))

const loadingCatalog = ref(true)
const loadError = ref('')
const groups = ref<ImageStudioModelGroup[]>([])
const selectedId = ref('')
const prompt = ref('')
const size = ref('auto')
const quality = ref<ImageQuality>('auto')
const count = ref('1')
const outputFormat = ref<ImageOutputFormat>('png')
const background = ref<ImageBackground>('auto')
const compression = ref('')
const references = ref<{ file: File; url: string }[]>([])
const pending = ref(false)
const errorMessage = ref('')
const historyWarning = ref('')
const resultItems = ref<ImageStudioCanvasItem[]>([])
const history = ref<Array<ImageStudioHistoryEntry & { url: string }>>([])
const historyFailed = ref(false)
const previewId = ref<number | null>(null)
const module = ref<'chat' | 'history'>('chat')
const helperOpen = ref(false)
const helperButton = ref<HTMLButtonElement | null>(null)
const helperStyle = ref<Record<string, string>>({})
const pickerOpen = ref(false)
const pickedIds = ref<number[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const panelWidth = ref(420)

const options = computed(() => groups.value.flatMap((group) => group.models))
const selected = computed(() => options.value.find((item) => item.id === selectedId.value) ?? null)
const sizes = computed(() => sizesForModel(selected.value?.model ?? ''))
const qualities = computed(() => qualitiesForModel(selected.value?.model ?? ''))
const canEdit = computed(() => (selected.value ? modelSupportsEdit(selected.value.model) : false))
const remainingSlots = computed(() => Math.max(0, MAX_REFERENCE_IMAGES - references.value.length))
const canvasItems = computed(() => {
  const preview = history.value.find((item) => item.id === previewId.value)
  return preview ? [historyToCanvas(preview)] : resultItems.value
})

function historyToCanvas(item: ImageStudioHistoryEntry & { url: string }): ImageStudioCanvasItem {
  return {
    url: item.url,
    name: item.name,
    byteSize: item.byteSize || item.blob.size,
    width: item.width || 0,
    height: item.height || 0,
    mimeType: item.mimeType || item.blob.type || 'image/png',
    model: item.model,
    prompt: item.prompt,
    createdAt: item.createdAt,
    size: item.size || '',
    quality: item.quality || '',
    format: item.format || ''
  }
}

watch(selected, (item) => {
  if (!item) return
  if (!sizes.value.includes(size.value)) size.value = sizes.value[0]
  if (!qualities.value.includes(quality.value)) quality.value = 'auto'
})
watch(outputFormat, (format) => {
  if (format === 'png') compression.value = ''
})
watch(background, (value) => {
  if (value === 'transparent' && outputFormat.value === 'jpeg') outputFormat.value = 'png'
})

function placeHelper() {
  const button = helperButton.value
  if (!button) return
  const rect = button.getBoundingClientRect()
  const width = 320
  const gap = 8
  let left = rect.right + gap
  if (left + width > window.innerWidth - gap) left = Math.max(gap, rect.left - gap - width)
  const maxHeight = Math.min(window.innerHeight * 0.7, 448)
  let top = rect.top
  if (top + maxHeight > window.innerHeight - gap) top = Math.max(gap, window.innerHeight - gap - maxHeight)
  helperStyle.value = { top: `${top}px`, left: `${left}px`, maxHeight: `${maxHeight}px` }
}

function onHelperPointerDown(event: MouseEvent) {
  const target = event.target
  if (target instanceof Node && helperButton.value?.contains(target)) return
  helperOpen.value = false
}

function toggleHelper() {
  helperOpen.value = !helperOpen.value
  if (helperOpen.value) void nextTick(placeHelper)
}

watch(helperOpen, (open) => {
  if (open) {
    window.addEventListener('resize', placeHelper)
    document.addEventListener('mousedown', onHelperPointerDown)
    return
  }
  window.removeEventListener('resize', placeHelper)
  document.removeEventListener('mousedown', onHelperPointerDown)
})

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

function formatTime(value: number) {
  return new Intl.DateTimeFormat(locale.value, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(value)
}

function revokeHistory() {
  for (const item of history.value) URL.revokeObjectURL(item.url)
}

async function refreshHistory() {
  revokeHistory()
  try {
    const entries = await readImageStudioHistory()
    history.value = await Promise.all(entries.map(async (entry) => {
      const mimeType = entry.mimeType || entry.blob.type || 'image/png'
      let width = entry.width || 0
      let height = entry.height || 0
      if (!width || !height) {
        const dimensions = await readImageDimensions(entry.blob).catch(() => ({ width: 0, height: 0 }))
        width = dimensions.width
        height = dimensions.height
      }
      const extension = mimeType === 'image/jpeg' ? 'jpg' : mimeType === 'image/webp' ? 'webp' : 'png'
      return {
        ...entry,
        url: URL.createObjectURL(entry.blob),
        width,
        height,
        mimeType,
        byteSize: entry.byteSize || entry.blob.size,
        name: entry.name || `image-${entry.id}.${extension}`,
        size: entry.size || '',
        quality: entry.quality || '',
        format: entry.format || ''
      }
    }))
    historyFailed.value = false
  } catch {
    history.value = []
    historyFailed.value = true
  }
}

onMounted(async () => {
  if (!appStore.publicSettingsLoaded) void appStore.fetchPublicSettings()
  try {
    groups.value = await loadImageStudioCatalog()
    selectedId.value = groups.value[0]?.models[0]?.id ?? ''
  } catch {
    loadError.value = t('imageStudio.loadFailed')
  } finally {
    loadingCatalog.value = false
  }
  await refreshHistory()
})

onBeforeUnmount(() => {
  revokeHistory()
  for (const item of references.value) URL.revokeObjectURL(item.url)
  window.removeEventListener('resize', placeHelper)
  document.removeEventListener('mousedown', onHelperPointerDown)
})

function showError(key: string) {
  errorMessage.value = t(`imageStudio.errors.${key}`)
}

async function acceptFiles(files: File[]) {
  if (!files.length) return false
  if (references.value.length + files.length > MAX_REFERENCE_IMAGES) {
    showError('too_many_references')
    return false
  }
  for (const file of files) {
    if (file.size <= 0 || file.size > MAX_REFERENCE_BYTES) {
      showError('image_too_large')
      return false
    }
    if (!detectImageMime(new Uint8Array(await file.arrayBuffer()))) {
      showError('invalid_image_type')
      return false
    }
  }
  errorMessage.value = ''
  references.value = [...references.value, ...files.map((file) => ({ file, url: URL.createObjectURL(file) }))]
  return true
}

function onFiles(event: Event) {
  const input = event.target as HTMLInputElement
  const files = [...(input.files ?? [])]
  input.value = ''
  void acceptFiles(files)
}

async function acceptClipboard() {
  if (!navigator.clipboard?.read) {
    showError('clipboard_unavailable')
    return
  }
  try {
    const items = await navigator.clipboard.read()
    for (const item of items) {
      const type = item.types.find((entry) => entry.startsWith('image/'))
      if (!type) continue
      const blob = await item.getType(type)
      const extension = type === 'image/jpeg' ? 'jpg' : type === 'image/webp' ? 'webp' : 'png'
      await acceptFiles([new File([blob], `clipboard.${extension}`, { type: blob.type || type })])
      return
    }
    showError('invalid_image_type')
  } catch {
    showError('clipboard_unavailable')
  }
}

function removeFile(file: File) {
  const removed = references.value.find((item) => item.file === file)
  if (removed) URL.revokeObjectURL(removed.url)
  references.value = references.value.filter((item) => item.file !== file)
}

function previewHistory(item: ImageStudioHistoryEntry & { url: string }) {
  previewId.value = item.id
}

async function removeHistory(id: number) {
  try {
    await deleteImageStudioHistory(id)
    if (previewId.value === id) previewId.value = null
    await refreshHistory()
  } catch {
    errorMessage.value = t('imageStudio.history.deleteFailed')
  }
}

async function confirmPicked() {
  const chosen = history.value.filter((item) => pickedIds.value.includes(item.id))
  const files = chosen.map((item) => new File([item.blob], `history-${item.id}.png`, { type: item.blob.type || 'image/png' }))
  if (await acceptFiles(files)) {
    pickedIds.value = []
    pickerOpen.value = false
  }
}

function download(url: string, name?: string, type?: string) {
  const mime = type ?? /^data:([^;,]+)/.exec(url)?.[1] ?? 'image/png'
  const extension = mime === 'image/jpeg' ? 'jpg' : mime === 'image/webp' ? 'webp' : 'png'
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name || `image-${Date.now()}.${extension}`
  anchor.click()
}

function downloadItem(item: ImageStudioCanvasItem) {
  download(item.url, item.name, item.mimeType)
}

function startResize(event: PointerEvent) {
  const startX = event.clientX
  const startWidth = panelWidth.value
  const move = (next: PointerEvent) => {
    panelWidth.value = Math.min(720, Math.max(320, startWidth + next.clientX - startX))
  }
  const up = () => {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', up)
  }
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', up)
}

async function generate() {
  const current = selected.value
  const trimmed = prompt.value.trim()
  if (!current) {
    showError('missing_model')
    return
  }
  if (!trimmed) {
    showError('invalid_prompt')
    return
  }
  if (trimmed.length > MAX_PROMPT_LENGTH) {
    showError('prompt_too_long')
    return
  }
  if (references.value.length && !canEdit.value) {
    showError('edit_unsupported')
    return
  }
  const n = Number(count.value)
  if (!Number.isFinite(n) || n < 1 || n > 4) {
    showError('invalid_count')
    return
  }
  pending.value = true
  errorMessage.value = ''
  historyWarning.value = ''
  previewId.value = null
  const format: ImageOutputFormat = background.value === 'transparent' && outputFormat.value === 'jpeg' ? 'png' : outputFormat.value
  try {
    const urls = await generateStudioImage({
      apiKey: current.apiKey,
      model: current.model,
      prompt: trimmed,
      size: size.value,
      quality: quality.value,
      count: clampImageCount(n),
      outputFormat: format,
      background: background.value,
      outputCompression: format === 'png' || compression.value === '' ? null : Math.min(100, Math.max(0, Math.round(Number(compression.value)))),
      references: references.value.map((item) => item.file)
    })
    let saved: Awaited<ReturnType<typeof saveImageStudioHistory>> = []
    try {
      saved = await saveImageStudioHistory(urls, {
        prompt: trimmed,
        model: current.model,
        size: size.value,
        quality: quality.value,
        format
      })
      await refreshHistory()
    } catch {
      historyWarning.value = t('imageStudio.historySaveFailed')
    }
    const extension = format === 'jpeg' ? 'jpg' : format
    resultItems.value = urls.map((url, index) => ({
      url,
      name: saved[index]?.name || `image-${index + 1}.${extension}`,
      byteSize: saved[index]?.byteSize || 0,
      width: saved[index]?.width || 0,
      height: saved[index]?.height || 0,
      mimeType: saved[index]?.mimeType || `image/${format === 'jpeg' ? 'jpeg' : format}`,
      model: current.model,
      prompt: trimmed,
      createdAt: saved[index]?.createdAt || Date.now(),
      size: size.value,
      quality: quality.value,
      format
    }))
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    errorMessage.value = message === 'timeout' ? t('imageStudio.timeout') : message === 'empty_result' ? t('imageStudio.emptyResult') : message || t('imageStudio.loadFailed')
  } finally {
    pending.value = false
  }
}
</script>

<style scoped>
.model-wave {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background: rgb(16 185 129);
  animation: model-wave 1.8s ease-out infinite;
}

.model-wave-delay {
  animation-delay: 0.7s;
}

@keyframes model-wave {
  0% {
    transform: scale(1);
    opacity: 0.55;
  }
  100% {
    transform: scale(2.8);
    opacity: 0;
  }
}
</style>
