<template>
  <AppLayout>
    <div class="mx-auto max-w-[1400px] space-y-8 pb-10" data-test="pelican-benchmark-view">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-2xl" aria-hidden="true">🐦</span>
            <h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              {{ t('pelicanBenchmark.title') }}
            </h1>
          </div>
          <p class="mt-2 max-w-3xl text-sm leading-6 text-gray-600 dark:text-dark-300">
            {{ displayPrompt }}
          </p>
        </div>
        <button
          type="button"
          class="btn btn-secondary inline-flex shrink-0 items-center gap-1.5 self-start"
          :disabled="loading"
          data-test="pelican-refresh"
          @click="refresh"
        >
          <Icon name="refresh" size="sm" :class="loading ? 'animate-spin' : ''" />
          {{ t('pelicanBenchmark.refresh') }}
        </button>
      </div>

      <div v-if="loading && !response" class="py-16 text-center text-sm text-gray-500 dark:text-dark-400">
        {{ t('pelicanBenchmark.loading') }}
      </div>

      <div
        v-else-if="loadFailed"
        class="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
      >
        {{ t('pelicanBenchmark.loadFailed') }}
        <button type="button" class="btn btn-secondary mt-3" @click="refresh">
          {{ t('pelicanBenchmark.retry') }}
        </button>
      </div>

      <template v-else>
        <section
          v-for="group in groups"
          :key="group.model"
          class="space-y-3"
          :data-test="`pelican-group-${group.model}`"
        >
          <h2 class="font-mono text-sm font-semibold text-gray-800 dark:text-dark-200">{{ group.model }}</h2>

          <div
            v-if="group.items.length === 0 && !group.nextBefore"
            class="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-400 dark:border-dark-700 dark:text-dark-500"
          >
            {{ t('pelicanBenchmark.emptyGroup') }}
          </div>

          <div v-else class="flex snap-x gap-5 overflow-x-auto pb-5">
            <PelicanEntryCard
              v-for="item in group.items"
              :key="item.id"
              :item="item"
              @open="openDetail(item)"
            />

            <button
              v-if="group.nextBefore"
              type="button"
              class="flex w-[140px] shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-600 transition hover:border-primary-400 hover:text-primary-700 dark:border-dark-600 dark:bg-dark-800/60 dark:text-dark-300 dark:hover:border-primary-500 dark:hover:text-primary-300"
              :disabled="loadingMoreModel === group.model"
              data-test="pelican-load-more"
              @click="loadMore(group.model, group.nextBefore)"
            >
              <Icon name="plus" size="sm" />
              {{
                loadingMoreModel === group.model
                  ? t('pelicanBenchmark.loadingMore')
                  : t('pelicanBenchmark.loadMore')
              }}
            </button>
          </div>
        </section>

        <section class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-dark-700 dark:bg-dark-900 sm:p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ t('pelicanBenchmark.aboutTitle') }}</h2>
          <div class="mt-3 space-y-3 text-sm leading-7 text-gray-600 dark:text-dark-300">
            <p>{{ t('pelicanBenchmark.aboutInterval', { minutes: response?.intervalMinutes ?? 30 }) }}</p>
            <p>{{ t('pelicanBenchmark.aboutPrompt', { prompt: fullPrompt }) }}</p>
            <p>{{ t('pelicanBenchmark.aboutWhy') }}</p>
          </div>
          <div v-if="enabledModels.length" class="mt-4">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">{{ t('pelicanBenchmark.modelsTitle') }}</h3>
            <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-600 dark:text-dark-300">
              <li v-for="model in enabledModels" :key="model" class="font-mono">{{ model }}</li>
            </ul>
          </div>
          <p class="mt-4 text-xs text-gray-400 dark:text-dark-500">
            {{ t('pelicanBenchmark.sourceHint') }}
          </p>
        </section>
      </template>
    </div>

    <PelicanDetailDialog :show="!!detailItem" :item="detailItem" @close="detailItem = null" />
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppLayout from '@/components/layout/AppLayout.vue'
import Icon from '@/components/icons/Icon.vue'
import { fetchPelicanBenchmark } from './api'
import PelicanDetailDialog from './PelicanDetailDialog.vue'
import PelicanEntryCard from './PelicanEntryCard.vue'
import type { PelicanBenchmarkGroup, PelicanBenchmarkItem, PelicanBenchmarkResponse } from './types'

const { t } = useI18n()

const response = ref<PelicanBenchmarkResponse | null>(null)
const loading = ref(false)
const loadFailed = ref(false)
const loadingMoreModel = ref<string | null>(null)
const detailItem = ref<PelicanBenchmarkItem | null>(null)

let abortController: AbortController | null = null

const groups = computed<PelicanBenchmarkGroup[]>(() => response.value?.groups ?? [])
const enabledModels = computed(() => response.value?.enabledModels ?? [])
const fullPrompt = computed(
  () =>
    response.value?.prompt ||
    t('pelicanBenchmark.defaultPrompt')
)
const displayPrompt = computed(() => {
  const prompt = fullPrompt.value
  // 列表页标题区用短提示；完整题干放 about
  const short = t('pelicanBenchmark.shortPrompt')
  return prompt.length > 80 ? short : prompt
})

async function loadInitial() {
  abortController?.abort()
  abortController = new AbortController()
  loading.value = true
  loadFailed.value = false
  try {
    response.value = await fetchPelicanBenchmark({
      limit: 20,
      signal: abortController.signal
    })
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') return
    loadFailed.value = true
    response.value = null
  } finally {
    loading.value = false
  }
}

async function refresh() {
  detailItem.value = null
  await loadInitial()
}

async function loadMore(model: string, before: string) {
  if (loadingMoreModel.value) return
  loadingMoreModel.value = model
  try {
    const page = await fetchPelicanBenchmark({ limit: 20, model, before })
    const incoming = page.groups.find((g) => g.model === model)
    if (!response.value || !incoming) return

    const groupsCopy = response.value.groups.map((g) => {
      if (g.model !== model) return g
      const seen = new Set(g.items.map((i) => i.id))
      const merged = [...g.items]
      for (const item of incoming.items) {
        if (!seen.has(item.id)) merged.push(item)
      }
      return { ...g, items: merged, nextBefore: incoming.nextBefore }
    })
    response.value = { ...response.value, groups: groupsCopy }
  } catch {
    // keep existing rows; silent fail with no toast spam
  } finally {
    loadingMoreModel.value = null
  }
}

function openDetail(item: PelicanBenchmarkItem) {
  detailItem.value = item
}

onMounted(() => {
  void loadInitial()
})

onUnmounted(() => {
  abortController?.abort()
})
</script>
