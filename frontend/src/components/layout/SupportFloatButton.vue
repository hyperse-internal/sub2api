<template>
  <div
    v-if="contactInfo"
    ref="rootRef"
    class="pointer-events-none fixed z-[90] select-none"
    :style="rootStyle"
  >
    <Transition name="support-tip">
      <div
        v-if="open"
        id="support-float-panel"
        ref="panelRef"
        class="pointer-events-auto fixed right-[72px] max-h-[calc(100dvh-24px)] w-[292px] max-w-[calc(100%-84px)] overflow-y-auto rounded-2xl border border-gray-200 bg-white text-sm shadow-2xl dark:border-dark-700 dark:bg-dark-900"
        :style="panelStyle"
        role="dialog"
        :aria-label="t('common.supportPanelTitle')"
        data-test="support-float-tooltip"
      >
        <div class="flex items-center gap-3 border-b border-gray-100 px-5 py-4 dark:border-white/5">
          <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
            <Icon name="chat" size="md" />
          </div>
          <div class="min-w-0 flex-1">
            <h2 class="font-semibold text-gray-900 dark:text-white">{{ t('common.supportPanelTitle') }}</h2>
            <p class="mt-0.5 text-xs text-gray-500 dark:text-dark-400">{{ t('common.supportQrHint') }}</p>
          </div>
          <button
            type="button"
            class="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/5 dark:hover:text-white"
            :aria-label="t('common.close')"
            @click.stop="open = false"
          >
            <Icon name="x" size="sm" />
          </button>
        </div>

        <div class="px-5 pb-5 pt-4">
          <p class="text-center text-sm font-medium text-gray-900 dark:text-dark-100">AlphaIO AI</p>
          <div class="mx-auto mt-3 aspect-square w-full max-w-[224px] overflow-hidden rounded-xl bg-white dark:bg-dark-900">
            <img
              :src="qqLightImg"
              :alt="t('common.supportQrAlt')"
              class="block h-full w-full dark:hidden"
              width="1440"
              height="1440"
              data-test="support-float-qr-light"
              draggable="false"
            />
            <img
              :src="qqDarkImg"
              :alt="t('common.supportQrAlt')"
              class="hidden h-full w-full dark:block"
              width="1440"
              height="1440"
              data-test="support-float-qr-dark"
              draggable="false"
            />
          </div>
          <dl class="mt-4 divide-y divide-gray-200/70 rounded-xl border border-gray-200/70 bg-gray-50 px-3.5 dark:divide-white/5 dark:border-white/5 dark:bg-white/[0.03]">
            <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-3">
              <dt class="text-xs text-gray-500 dark:text-dark-400">{{ t('common.supportGroupNumber') }}</dt>
              <dd class="flex min-w-0 items-center gap-1.5">
                <span class="select-text font-mono text-sm font-medium tracking-wide text-gray-900 dark:text-dark-100" data-test="support-group-number">{{ groupNumber }}</span>
                <button
                  type="button"
                  class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-primary-50 hover:text-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 dark:hover:bg-primary-500/10 dark:hover:text-primary-400"
                  :title="groupCopied ? t('common.copied') : `${t('common.copy')} ${t('common.supportGroupNumber')}`"
                  :aria-label="`${t('common.copy')} ${t('common.supportGroupNumber')}`"
                  data-test="support-copy-group"
                  @click="copyGroupNumber(groupNumber)"
                >
                  <Icon :name="groupCopied ? 'check' : 'copy'" size="sm" />
                </button>
              </dd>
            </div>
            <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-3">
              <dt class="text-xs text-gray-500 dark:text-dark-400">{{ t('common.contactSupport') }}</dt>
              <dd class="flex min-w-0 max-w-full items-center gap-1.5">
                <span class="min-w-0 select-text whitespace-pre-line break-words text-sm font-medium text-gray-900 [overflow-wrap:anywhere] dark:text-dark-100" data-test="support-contact">{{ contactInfo }}</span>
                <button
                  type="button"
                  class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-primary-50 hover:text-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 dark:hover:bg-primary-500/10 dark:hover:text-primary-400"
                  :title="contactCopied ? t('common.copied') : `${t('common.copy')} ${t('common.contactSupport')}`"
                  :aria-label="`${t('common.copy')} ${t('common.contactSupport')}`"
                  data-test="support-copy-contact"
                  @click="copyContactInfo(contactInfo)"
                >
                  <Icon :name="contactCopied ? 'check' : 'copy'" size="sm" />
                </button>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </Transition>

    <button
      type="button"
      class="pointer-events-auto flex h-12 w-12 cursor-grab flex-col items-center justify-center rounded-full bg-primary-600 text-white shadow-lg shadow-primary-500/30 transition-shadow hover:bg-primary-700 hover:shadow-xl active:cursor-grabbing dark:bg-primary-500 dark:hover:bg-primary-600"
      :class="{ 'cursor-grabbing': dragging }"
      :aria-expanded="open"
      aria-controls="support-float-panel"
      aria-haspopup="dialog"
      :aria-label="t('common.support')"
      data-test="support-float-button"
      @pointerdown="onPointerDown"
      @click="onClick"
    >
      <Icon name="chat" size="sm" />
      <span class="mt-0.5 text-[10px] font-medium leading-none">{{ t('common.support') }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useElementSize, useWindowSize } from '@vueuse/core'
import { Icon } from '@/components/icons'
import { useAppStore } from '@/stores/app'
import { useClipboard } from '@/composables/useClipboard'
import qqDarkImg from '@/assets/images/qq-group-qr-dark.png'
import qqLightImg from '@/assets/images/qq-group-qr-light.png'

const STORAGE_KEY = 'support_float_btn_top'
const DRAG_THRESHOLD_PX = 4
const BUTTON_SIZE = 48
const EDGE_PADDING = 12
const DEFAULT_TOP_RATIO = 0.65

const { t } = useI18n()
const appStore = useAppStore()
const contactInfo = computed(() => appStore.contactInfo?.trim() || '')
const groupNumber = '1084708543'
const { copied: groupCopied, copyToClipboard: copyGroupNumber } = useClipboard()
const { copied: contactCopied, copyToClipboard: copyContactInfo } = useClipboard()

const rootRef = useTemplateRef<HTMLElement>('rootRef')
const panelRef = useTemplateRef<HTMLElement>('panelRef')
const { height: panelHeight } = useElementSize(panelRef, undefined, { box: 'border-box' })
const { height: viewportHeight } = useWindowSize()
const open = ref(false)
const dragging = ref(false)
const topPx = ref(0)

let dragStartY = 0
let dragStartTop = 0
let movedBeyondThreshold = false
let suppressClick = false
let activePointerId: number | null = null

const rootStyle = computed(() => ({
  top: `${topPx.value}px`,
  right: `${EDGE_PADDING}px`,
}))

const panelStyle = computed(() => ({
  top: `${Math.max(EDGE_PADDING, Math.min(topPx.value + BUTTON_SIZE / 2 - panelHeight.value / 2, viewportHeight.value - panelHeight.value - EDGE_PADDING))}px`,
}))

function clampTop(value: number): number {
  const max = Math.max(EDGE_PADDING, window.innerHeight - BUTTON_SIZE - EDGE_PADDING)
  return Math.min(Math.max(EDGE_PADDING, value), max)
}

function readStoredTop(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw == null) return null
    const n = Number(raw)
    return Number.isFinite(n) ? n : null
  } catch {
    return null
  }
}

function persistTop(value: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(Math.round(value)))
  } catch {
    // ignore quota / private mode
  }
}

function initTop() {
  const stored = readStoredTop()
  const fallback = window.innerHeight * DEFAULT_TOP_RATIO
  topPx.value = clampTop(stored ?? fallback)
}

function onPointerDown(event: PointerEvent) {
  if (event.button !== 0) return
  const target = event.currentTarget as HTMLElement
  activePointerId = event.pointerId
  dragStartY = event.clientY
  dragStartTop = topPx.value
  movedBeyondThreshold = false
  dragging.value = false
  target.setPointerCapture(event.pointerId)
  target.addEventListener('pointermove', onPointerMove)
  target.addEventListener('pointerup', onPointerUp)
  target.addEventListener('pointercancel', onPointerUp)
}

function onPointerMove(event: PointerEvent) {
  if (activePointerId !== event.pointerId) return
  const deltaY = event.clientY - dragStartY
  if (!movedBeyondThreshold && Math.abs(deltaY) < DRAG_THRESHOLD_PX) return
  movedBeyondThreshold = true
  dragging.value = true
  if (open.value) open.value = false
  topPx.value = clampTop(dragStartTop + deltaY)
}

function onPointerUp(event: PointerEvent) {
  if (activePointerId !== event.pointerId) return
  const target = event.currentTarget as HTMLElement
  target.releasePointerCapture(event.pointerId)
  target.removeEventListener('pointermove', onPointerMove)
  target.removeEventListener('pointerup', onPointerUp)
  target.removeEventListener('pointercancel', onPointerUp)
  activePointerId = null
  if (movedBeyondThreshold) {
    suppressClick = true
    persistTop(topPx.value)
  }
  dragging.value = false
  movedBeyondThreshold = false
}

function onClick(event: MouseEvent) {
  // Suppress click that follows a drag
  if (suppressClick) {
    event.preventDefault()
    event.stopPropagation()
    suppressClick = false
    return
  }
  open.value = !open.value
}

function onDocumentPointerDown(event: PointerEvent) {
  if (!open.value) return
  const root = rootRef.value
  if (!root) return
  if (event.target instanceof Node && root.contains(event.target)) return
  open.value = false
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && open.value) {
    open.value = false
  }
}

function onResize() {
  topPx.value = clampTop(topPx.value)
}

onMounted(() => {
  initTop()
  document.addEventListener('pointerdown', onDocumentPointerDown, true)
  document.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown, true)
  document.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', onResize)
})

watch(contactInfo, (value) => {
  if (!value) open.value = false
})
</script>

<style scoped>
.support-tip-enter-active,
.support-tip-leave-active {
  transition: opacity 0.15s ease;
}

.support-tip-enter-from,
.support-tip-leave-to {
  opacity: 0;
}
</style>
