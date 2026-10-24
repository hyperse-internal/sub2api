<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppLayout from '@/components/layout/AppLayout.vue'
import BaseDialog from '@/components/common/BaseDialog.vue'
import assistLight from '@/assets/images/quants/assist-light.png'
import assistDark from '@/assets/images/quants/assist-dark.png'
import qmtLight from '@/assets/images/quants/qmt-light.png'
import qmtDark from '@/assets/images/quants/qmt-dark.png'
import superLight from '@/assets/images/quants/super-light.png'
import superDark from '@/assets/images/quants/super-dark.png'
import leaderLight from '@/assets/images/quants/leader-light.png'
import leaderDark from '@/assets/images/quants/leader-dark.png'

const { t } = useI18n()

const products = [
  { id: 'assist', slug: 'follow_t_assist', light: assistLight, dark: assistDark },
  { id: 'qmt', slug: 'follow_t_qmt', light: qmtLight, dark: qmtDark },
  { id: 'super', slug: 'fenshi_super', light: superLight, dark: superDark },
  { id: 'leader', slug: 'fenshi_leader', light: leaderLight, dark: leaderDark }
] as const

const previewProduct = ref<(typeof products)[number] | null>(null)
</script>

<template>
  <AppLayout>
    <div class="mx-auto max-w-7xl space-y-8">
      <div class="max-w-3xl">
        <p class="text-xs font-semibold tracking-widest text-primary-600 dark:text-primary-400">{{ t('quantModels.eyebrow') }}</p>
        <h1 class="mt-3 text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">{{ t('quantModels.intro') }}</h1>
        <p class="mt-3 text-sm leading-7 text-gray-500 dark:text-gray-400">{{ t('quantModels.introDescription') }}</p>
      </div>

      <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <article
          v-for="product in products"
          :key="product.id"
          :data-test="`quant-card-${product.id}`"
          class="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:border-primary-400 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-4 dark:border-dark-700 dark:bg-dark-900 dark:hover:border-primary-500 dark:focus-visible:ring-offset-dark-950"
        >
          <div class="pointer-events-none absolute right-0 top-0 z-10 h-16 w-16 overflow-hidden">
            <span class="absolute -right-6 top-3 flex h-6 w-24 rotate-45 items-center justify-center bg-red-500 text-sm font-semibold text-white shadow-sm">{{ t('quantModels.recommended') }}</span>
          </div>
          <button
            type="button"
            class="relative block aspect-[2/1] w-full shrink-0 cursor-zoom-in overflow-hidden border-b border-gray-100 bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 dark:border-dark-700 dark:bg-dark-800"
            :aria-label="t('quantModels.previewImage', { name: t(`quantModels.products.${product.id}.name`) })"
            @click="previewProduct = product"
          >
            <img :src="product.light" :alt="t('quantModels.imageAlt', { name: t(`quantModels.products.${product.id}.name`) })" class="absolute inset-0 h-full w-full object-cover object-top dark:hidden" loading="lazy" />
            <img :src="product.dark" :alt="t('quantModels.imageAlt', { name: t(`quantModels.products.${product.id}.name`) })" class="absolute inset-0 hidden h-full w-full object-cover object-top dark:block" loading="lazy" />
            <span class="absolute bottom-3 right-3 rounded-lg bg-gray-900/85 px-3 py-1.5 text-xs font-medium text-white">{{ t('quantModels.viewImage') }}</span>
          </button>

          <a
            :href="`https://www.alphaio.vip/features/${product.slug}`"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="`${t(`quantModels.products.${product.id}.name`)} · ${t('quantModels.external')}`"
            class="flex flex-1 flex-col p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 sm:p-6"
          >
            <p class="text-xs font-medium text-primary-600 dark:text-primary-400">{{ t(`quantModels.products.${product.id}.category`) }}</p>
            <h2 class="mt-2 text-xl font-bold text-gray-900 dark:text-white">{{ t(`quantModels.products.${product.id}.name`) }}</h2>
            <p class="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">{{ t(`quantModels.products.${product.id}.description`) }}</p>
            <div class="mt-4 flex flex-wrap gap-2">
              <span v-for="tag in t(`quantModels.products.${product.id}.tags`).split(' / ')" :key="tag" class="rounded-md bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">{{ tag }}</span>
            </div>

            <div class="mt-6 space-y-4 text-sm">
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-gray-100">{{ t('quantModels.features') }}</h3>
                <ul class="mt-2 space-y-2 text-gray-600 dark:text-gray-400">
                  <li v-for="feature in ['feature1', 'feature2', 'feature3']" :key="feature" class="flex gap-2 leading-6">
                    <span aria-hidden="true" class="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500"></span>
                    <span>{{ t(`quantModels.products.${product.id}.${feature}`) }}</span>
                  </li>
                </ul>
              </div>
              <div v-for="section in ['advantage', 'scenarios']" :key="section">
                <h3 class="font-semibold text-gray-900 dark:text-gray-100">{{ t(`quantModels.${section}`) }}</h3>
                <p class="mt-1 leading-6 text-gray-600 dark:text-gray-400">{{ t(`quantModels.products.${product.id}.${section}`) }}</p>
              </div>
            </div>

            <div class="mt-auto pt-5">
              <p class="rounded-lg bg-gray-50 px-3 py-2.5 text-xs leading-5 text-gray-500 dark:bg-dark-800 dark:text-gray-400">{{ t(`quantModels.products.${product.id}.note`) }}</p>
              <div class="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-dark-700">
                <span class="text-sm font-semibold text-primary-600 dark:text-primary-400">{{ t('quantModels.details') }}</span>
                <svg class="h-5 w-5 text-primary-600 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 dark:text-primary-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                  <path d="M7 17 17 7M7 7h10v10" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
            </div>
          </a>
        </article>
      </div>

      <p class="text-xs leading-6 text-gray-500 dark:text-gray-400">{{ t('quantModels.notice') }}</p>
    </div>
    <BaseDialog
      :show="previewProduct !== null"
      :title="previewProduct ? t('quantModels.imageAlt', { name: t(`quantModels.products.${previewProduct.id}.name`) }) : ''"
      width="full"
      close-on-click-outside
      @close="previewProduct = null"
    >
      <template v-if="previewProduct">
        <div class="flex justify-center">
          <img :src="previewProduct.light" :alt="t('quantModels.imageAlt', { name: t(`quantModels.products.${previewProduct.id}.name`) })" class="block h-auto max-h-[calc(90dvh-8rem)] w-auto max-w-full rounded-lg object-contain dark:hidden" />
          <img :src="previewProduct.dark" :alt="t('quantModels.imageAlt', { name: t(`quantModels.products.${previewProduct.id}.name`) })" class="hidden h-auto max-h-[calc(90dvh-8rem)] w-auto max-w-full rounded-lg object-contain dark:block" />
        </div>
      </template>
    </BaseDialog>
  </AppLayout>
</template>
