<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseDialog from '@/components/common/BaseDialog.vue'

defineProps<{ product: 'assist' | 'super' }>()
defineEmits<{ close: [] }>()
const { t } = useI18n()
const images = import.meta.glob<string>('../../assets/images/quants/cases/*.png', { eager: true, import: 'default', query: '?url' })
const slides = ['assist-1', 'assist-2', 'assist-3', 'assist-4', 'assist-5', 'assist-6', 'super-1', 'super-2']
const current = ref(0)
const source = computed(() => images[`../../assets/images/quants/cases/${slides[current.value]}.png`])
const description = computed(() => t(`quantModels.cases.${slides[current.value]?.replace('-', '')}`))
let timer: ReturnType<typeof setInterval> | undefined

function restart() {
  clearInterval(timer)
  timer = setInterval(() => {
    current.value = (current.value + 1) % slides.length
  }, 6000)
}

function select(index: number) {
  current.value = (index + slides.length) % slides.length
  restart()
}

onMounted(restart)
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <BaseDialog :show="true" :title="t('quantModels.caseTitle', { name: t(`quantModels.products.${product}.name`) })" width="full" close-on-click-outside @close="$emit('close')">
    <section class="mx-2 py-3 sm:mx-0 sm:py-2" :aria-label="t('quantModels.viewCases')">
      <figure>
        <div class="relative h-[68dvh] overflow-hidden rounded-xl bg-gray-50">
          <Transition name="case-slide">
            <img :key="current" :src="source" :alt="description" class="absolute inset-0 h-full w-full object-contain" data-test="case-image" />
          </Transition>
          <button type="button" class="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md transition-colors hover:bg-white hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 sm:left-4" :aria-label="t('quantModels.previousCase')" data-test="case-previous" @click="select(current - 1)">
            <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="m15 18-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <button type="button" class="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md transition-colors hover:bg-white hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 sm:right-4" :aria-label="t('quantModels.nextCase')" data-test="case-next" @click="select(current + 1)">
            <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="m9 6 6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
        <figcaption class="mt-3 px-2 text-sm leading-7 text-gray-600 dark:text-gray-300" data-test="case-description" aria-live="off">{{ description }}</figcaption>
      </figure>
      <div class="mt-3 flex justify-center gap-1">
        <button v-for="(slide, index) in slides" :key="slide" type="button" class="flex h-8 w-8 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500" :aria-label="t('quantModels.goToCase', { number: index + 1 })" :aria-current="current === index ? 'true' : undefined" :data-test="`case-indicator-${index + 1}`" @click="select(index)">
          <span class="h-2 rounded-full transition-all duration-300 motion-reduce:transition-none" :class="current === index ? 'w-6 bg-primary-500' : 'w-2 bg-gray-300 dark:bg-dark-600'"></span>
        </button>
      </div>
    </section>
  </BaseDialog>
</template>

<style scoped>
.case-slide-enter-active,
.case-slide-leave-active {
  transition: opacity 350ms ease, transform 350ms ease;
}

.case-slide-enter-from {
  opacity: 0;
  transform: translateX(24px);
}

.case-slide-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}

@media (prefers-reduced-motion: reduce) {
  .case-slide-enter-active,
  .case-slide-leave-active {
    transition: none;
  }
}
</style>
