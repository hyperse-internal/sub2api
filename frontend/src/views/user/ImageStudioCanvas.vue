<template>
  <div class="relative flex h-full min-h-0 flex-1 flex-col">
    <div class="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-3">
      <div class="pointer-events-auto flex flex-wrap items-center gap-1 rounded-lg border border-gray-200/80 bg-white/90 p-1 dark:border-dark-700 dark:bg-dark-800/90">
        <button type="button" class="btn btn-secondary btn-sm" @click="zoom(1 / 1.2)">−</button>
        <span class="min-w-12 text-center text-xs tabular-nums text-gray-500">{{ Math.round(view.scale * 100) }}%</span>
        <button type="button" class="btn btn-secondary btn-sm" @click="zoom(1.2)">+</button>
        <button type="button" class="btn btn-secondary btn-sm" @click="view.flipX = !view.flipX">{{ t('imageStudio.canvas.flipX') }}</button>
        <button type="button" class="btn btn-secondary btn-sm" @click="view.flipY = !view.flipY">{{ t('imageStudio.canvas.flipY') }}</button>
        <button type="button" class="btn btn-secondary btn-sm" @click="reset">{{ t('imageStudio.canvas.reset') }}</button>
        <button type="button" class="btn btn-secondary btn-sm" @click="activeItem && emit('download', activeItem)">{{ t('imageStudio.download') }}</button>
        <span class="relative" @mouseenter="infoOpen = true" @mouseleave="infoOpen = false">
          <button type="button" class="btn btn-secondary btn-sm" :aria-label="t('imageStudio.canvas.infoTitle')" :aria-expanded="infoOpen">
            <Icon name="infoCircle" size="sm" />
          </button>
          <div v-if="infoOpen && activeItem" class="absolute left-full top-0 z-20 pl-2">
            <div class="w-72 rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-600 shadow-lg dark:border-dark-700 dark:bg-dark-800 dark:text-gray-300">
            <p class="mb-2 font-medium text-gray-900 dark:text-gray-100">{{ t('imageStudio.canvas.infoTitle') }}</p>
            <dl>
              <div v-for="row in infoRows" :key="row.label" class="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-2 py-0.5">
                <dt class="text-gray-400">{{ row.label }}</dt>
                <dd class="break-words" :title="row.value">{{ row.value }}</dd>
              </div>
            </dl>
            </div>
          </div>
        </span>
      </div>
    </div>
    <div
      ref="stageRef"
      class="relative min-h-0 flex-1 cursor-grab overflow-hidden active:cursor-grabbing"
      :style="gridStyle"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="endDrag"
      @pointercancel="endDrag"
    >
      <div
        v-if="activeUrl"
        class="absolute inset-0 flex items-center justify-center"
        :style="{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale}) scaleX(${view.flipX ? -1 : 1}) scaleY(${view.flipY ? -1 : 1})`, transformOrigin: 'center center' }"
      >
        <img :src="activeUrl" :alt="activeItem?.name || alt" class="max-h-[90%] max-w-[90%] select-none object-contain" draggable="false" @load="onImageLoad" />
      </div>
    </div>
    <div v-if="items.length > 1" class="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center gap-2">
      <button v-for="(item, index) in items" :key="item.url" type="button" class="pointer-events-auto h-14 w-14 overflow-hidden rounded-lg border-2" :class="index === activeIndex ? 'border-primary-500' : 'border-transparent'" @click="activeIndex = index">
        <img :src="item.url" alt="" class="h-full w-full object-cover" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/icons/Icon.vue'

export interface ImageStudioCanvasItem {
  url: string
  name: string
  byteSize: number
  width: number
  height: number
  mimeType: string
  model: string
  prompt: string
  createdAt: number
  size: string
  quality: string
  format: string
}

const props = defineProps<{ items: ImageStudioCanvasItem[]; alt: string }>()
const emit = defineEmits<{ download: [item: ImageStudioCanvasItem] }>()
const { t, locale } = useI18n()
const stageRef = ref<HTMLElement | null>(null)
const activeIndex = ref(0)
const infoOpen = ref(false)
const measured = ref({ width: 0, height: 0 })
const view = reactive({ scale: 1, x: 0, y: 0, flipX: false, flipY: false })
const activeItem = computed(() => props.items[activeIndex.value] ?? props.items[0])
const activeUrl = computed(() => activeItem.value?.url ?? '')
const infoRows = computed(() => {
  const item = activeItem.value
  if (!item) return []
  const width = item.width || measured.value.width
  const height = item.height || measured.value.height
  const rows = [
    { label: t('imageStudio.canvas.info.name'), value: item.name },
    { label: t('imageStudio.canvas.info.byteSize'), value: formatBytes(item.byteSize) },
    { label: t('imageStudio.canvas.info.resolution'), value: width && height ? `${width} × ${height}` : '' },
    { label: t('imageStudio.canvas.info.format'), value: item.format || item.mimeType },
    { label: t('imageStudio.canvas.info.model'), value: item.model },
    { label: t('imageStudio.canvas.info.size'), value: item.size },
    { label: t('imageStudio.canvas.info.quality'), value: item.quality },
    { label: t('imageStudio.canvas.info.createdAt'), value: item.createdAt ? new Intl.DateTimeFormat(locale.value, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(item.createdAt) : '' },
    { label: t('imageStudio.canvas.info.prompt'), value: item.prompt }
  ]
  return rows.filter((row) => row.value)
})

function formatBytes(bytes: number) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function onImageLoad(event: Event) {
  const image = event.target
  if (!(image instanceof HTMLImageElement)) return
  measured.value = { width: image.naturalWidth, height: image.naturalHeight }
}

const gridStyle = {
  backgroundColor: 'transparent',
  backgroundImage: 'linear-gradient(to right, rgba(148,163,184,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.18) 1px, transparent 1px)',
  backgroundSize: '12px 12px'
}

watch(
  () => props.items.map((item) => item.url).join('|'),
  () => {
    activeIndex.value = 0
    measured.value = { width: 0, height: 0 }
    reset()
  }
)
watch(activeIndex, () => {
  measured.value = { width: 0, height: 0 }
})

function reset() {
  view.scale = 1
  view.x = 0
  view.y = 0
  view.flipX = false
  view.flipY = false
}

function zoom(factor: number) {
  view.scale = Math.min(8, Math.max(0.25, view.scale * factor))
}

let drag: { id: number; x: number; y: number; ox: number; oy: number } | null = null

function onPointerDown(event: PointerEvent) {
  if (event.button !== 0) return
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  drag = { id: event.pointerId, x: event.clientX, y: event.clientY, ox: view.x, oy: view.y }
}

function onPointerMove(event: PointerEvent) {
  if (!drag || drag.id !== event.pointerId) return
  view.x = drag.ox + (event.clientX - drag.x)
  view.y = drag.oy + (event.clientY - drag.y)
}

function endDrag(event: PointerEvent) {
  if (drag?.id === event.pointerId) drag = null
}

function onWheel(event: WheelEvent) {
  event.preventDefault()
  zoom(event.deltaY < 0 ? 1.2 : 1 / 1.2)
}

onMounted(() => stageRef.value?.addEventListener('wheel', onWheel, { passive: false }))
onBeforeUnmount(() => stageRef.value?.removeEventListener('wheel', onWheel))
</script>
