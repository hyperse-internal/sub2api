<template>
  <div ref="stageRef" class="relative min-h-0 flex-1 overflow-hidden" :style="gridStyle" @pointerdown="onPointerDown" @pointermove="onPointerMove" @pointerup="endDrag" @pointercancel="endDrag">
    <div class="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-3">
      <div class="pointer-events-auto flex items-center gap-1 rounded-lg border border-gray-200/80 bg-white/90 p-1 dark:border-dark-700 dark:bg-dark-800/90">
        <button type="button" class="btn btn-secondary btn-sm" @click="zoom(1 / 1.2)">−</button>
        <span class="min-w-12 text-center text-xs tabular-nums text-gray-500">{{ Math.round(view.scale * 100) }}%</span>
        <button type="button" class="btn btn-secondary btn-sm" @click="zoom(1.2)">+</button>
        <button type="button" class="btn btn-secondary btn-sm" @click="view.flipX = !view.flipX">{{ t('imageStudio.canvas.flipX') }}</button>
        <button type="button" class="btn btn-secondary btn-sm" @click="view.flipY = !view.flipY">{{ t('imageStudio.canvas.flipY') }}</button>
        <button type="button" class="btn btn-secondary btn-sm" @click="reset">{{ t('imageStudio.canvas.reset') }}</button>
        <button type="button" class="btn btn-secondary btn-sm" @click="emit('download', activeUrl, activeIndex)">{{ t('imageStudio.download') }}</button>
      </div>
    </div>
    <div class="flex h-full items-center justify-center">
      <img
        v-if="activeUrl"
        :src="activeUrl"
        :alt="alt"
        class="max-h-[70%] max-w-[70%] select-none object-contain"
        :style="{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale * (view.flipX ? -1 : 1)}, ${view.scale * (view.flipY ? -1 : 1)})` }"
        draggable="false"
      />
    </div>
    <div v-if="urls.length > 1" class="absolute inset-x-0 bottom-3 flex justify-center gap-2">
      <button v-for="(url, index) in urls" :key="url" type="button" class="h-14 w-14 overflow-hidden rounded-lg border-2" :class="index === activeIndex ? 'border-primary-500' : 'border-transparent'" @click="activeIndex = index">
        <img :src="url" alt="" class="h-full w-full object-cover" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{ urls: string[]; alt: string }>()
const emit = defineEmits<{ download: [url: string, index: number] }>()
const { t } = useI18n()
const stageRef = ref<HTMLElement | null>(null)
const activeIndex = ref(0)
const view = reactive({ scale: 1, x: 0, y: 0, flipX: false, flipY: false })
const activeUrl = computed(() => props.urls[activeIndex.value] ?? props.urls[0] ?? '')

const gridStyle = {
  backgroundColor: 'transparent',
  backgroundImage: 'linear-gradient(to right, rgba(148,163,184,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.18) 1px, transparent 1px)',
  backgroundSize: '12px 12px'
}

watch(
  () => props.urls.join('|'),
  () => {
    activeIndex.value = 0
    reset()
  }
)

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
