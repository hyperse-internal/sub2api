<template>
  <AppLayout>
    <div class="mx-auto max-w-[1200px] space-y-6 pb-10" data-test="upstream-price-monitor-view">
      <header
        class="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-900/5 dark:bg-dark-800 dark:ring-dark-700 sm:p-6"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <h1 class="text-xl font-black text-gray-900 dark:text-white">
              {{ t('upstreamPriceMonitor.title') }}
            </h1>
            <p class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              {{ t('upstreamPriceMonitor.description') }}
            </p>
          </div>
          <button
            type="button"
            class="btn btn-secondary shrink-0"
            :disabled="bootError || loading"
            data-test="upstream-price-open-config"
            @click="openConfigDialog"
          >
            {{ t('upstreamPriceMonitor.openConfig') }}
          </button>
        </div>
      </header>

      <div
        v-if="bootError"
        class="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
      >
        {{ t('upstreamPriceMonitor.loadFailed') }}
        <button type="button" class="btn btn-secondary mt-3" @click="bootstrap">
          {{ t('upstreamPriceMonitor.retry') }}
        </button>
      </div>

      <template v-else>
        <section
          class="space-y-3 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-900/5 dark:bg-dark-800 dark:ring-dark-700 sm:p-6"
        >
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="min-w-0">
              <h2 class="text-sm font-semibold text-gray-900 dark:text-white">
                {{ t('upstreamPriceMonitor.runsTitle') }}
              </h2>
              <p class="mt-0.5 text-[11px] text-gray-400">{{ t('upstreamPriceMonitor.runsRetentionHint') }}</p>
            </div>
            <button
              type="button"
              class="btn btn-primary btn-sm shrink-0"
              :disabled="running || loading"
              data-test="upstream-price-run"
              @click="triggerRun"
            >
              {{ running ? t('upstreamPriceMonitor.running') : t('upstreamPriceMonitor.runNow') }}
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full text-left text-sm">
              <thead class="text-xs text-gray-500">
                <tr>
                  <th class="px-2 py-2">{{ t('upstreamPriceMonitor.colStarted') }}</th>
                  <th class="px-2 py-2">{{ t('upstreamPriceMonitor.colStatus') }}</th>
                  <th class="px-2 py-2">{{ t('upstreamPriceMonitor.colMatched') }}</th>
                  <th class="px-2 py-2">{{ t('upstreamPriceMonitor.colOutOfRange') }}</th>
                  <th class="px-2 py-2">{{ t('upstreamPriceMonitor.colSummary') }}</th>
                  <th class="px-2 py-2">{{ t('upstreamPriceMonitor.colActions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!runs.length">
                  <td colspan="6" class="px-2 py-6 text-center text-gray-400">
                    {{ t('upstreamPriceMonitor.noRuns') }}
                  </td>
                </tr>
                <tr
                  v-for="run in runs"
                  :key="run.id"
                  class="border-t border-gray-100 dark:border-dark-700"
                >
                  <td class="whitespace-nowrap px-2 py-2 text-xs">{{ formatTime(run.started_at) }}</td>
                  <td class="px-2 py-2">
                    <span class="rounded-md px-2 py-0.5 text-xs font-medium" :class="runStatusClass(run.status)">
                      {{ t(`upstreamPriceMonitor.status.${run.status}`) }}
                    </span>
                  </td>
                  <td class="px-2 py-2">{{ run.matched_count }}</td>
                  <td class="px-2 py-2">{{ run.out_of_range_count }}</td>
                  <td class="max-w-xs truncate px-2 py-2 text-xs text-gray-500">{{ run.summary }}</td>
                  <td class="whitespace-nowrap px-2 py-2">
                    <button type="button" class="text-xs text-primary-600 hover:underline" @click="openDetail(run.id)">
                      {{ t('upstreamPriceMonitor.detail') }}
                    </button>
                    <button
                      type="button"
                      class="ml-3 text-xs text-red-600 hover:underline disabled:opacity-50"
                      :disabled="deletingRunId === run.id"
                      @click="removeRun(run.id)"
                    >
                      {{
                        deletingRunId === run.id
                          ? t('upstreamPriceMonitor.deleting')
                          : t('upstreamPriceMonitor.deleteRun')
                      }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="totalPages > 1" class="flex items-center justify-end gap-2 text-xs">
            <button type="button" class="btn btn-secondary" :disabled="page <= 1" @click="loadRuns(page - 1)">
              ‹
            </button>
            <span>{{ page }} / {{ totalPages }}</span>
            <button
              type="button"
              class="btn btn-secondary"
              :disabled="page >= totalPages"
              @click="loadRuns(page + 1)"
            >
              ›
            </button>
          </div>
        </section>
      </template>

      <div
        v-if="configOpen"
        class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
        data-test="upstream-price-config"
        @click.self="closeConfigDialog"
      >
        <div
          class="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-dark-800"
        >
          <div class="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-dark-700">
            <h3 class="font-semibold text-gray-900 dark:text-white">
              {{ t('upstreamPriceMonitor.configTitle') }}
            </h3>
            <button type="button" class="btn btn-secondary" :disabled="saving" @click="closeConfigDialog">
              {{ t('upstreamPriceMonitor.close') }}
            </button>
          </div>
          <div class="space-y-4 overflow-y-auto p-4 sm:p-5">
            <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-dark-200">
              <input v-model="form.enabled" type="checkbox" class="rounded border-gray-300" />
              {{ t('upstreamPriceMonitor.enabled') }}
            </label>

            <div class="grid gap-4 sm:grid-cols-2">
              <label class="block text-xs text-gray-500">
                {{ t('upstreamPriceMonitor.intervalSeconds') }}
                <input
                  v-model.number="form.intervalSeconds"
                  type="number"
                  min="3600"
                  max="86400"
                  class="input mt-1 w-full"
                />
                <span class="mt-1 block text-[11px] text-gray-400">{{
                  t('upstreamPriceMonitor.intervalHint')
                }}</span>
              </label>
              <label class="block text-xs text-gray-500">
                {{ t('upstreamPriceMonitor.profitMin') }}
                <input
                  v-model.number="form.profitMinPct"
                  type="number"
                  min="0"
                  max="99"
                  step="0.1"
                  class="input mt-1 w-full"
                />
              </label>
              <label class="block text-xs text-gray-500">
                {{ t('upstreamPriceMonitor.profitMax') }}
                <input
                  v-model.number="form.profitMaxPct"
                  type="number"
                  min="0"
                  max="99"
                  step="0.1"
                  class="input mt-1 w-full"
                />
              </label>
              <label class="block text-xs text-gray-500">
                {{ t('upstreamPriceMonitor.targetProfit') }}
                <input
                  v-model="form.targetProfitPct"
                  type="number"
                  min="0"
                  max="99"
                  step="0.1"
                  class="input mt-1 w-full"
                  placeholder="—"
                />
                <span class="mt-1 block text-[11px] text-gray-400">{{
                  t('upstreamPriceMonitor.targetProfitHint')
                }}</span>
              </label>
            </div>

            <div>
              <div class="text-xs text-gray-500">{{ t('upstreamPriceMonitor.channels') }}</div>
              <p class="mt-0.5 text-[11px] text-gray-400">{{ t('upstreamPriceMonitor.channelsHint') }}</p>
              <div
                class="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-xl border border-gray-200 p-3 dark:border-dark-600"
              >
                <label
                  v-for="ch in channels"
                  :key="ch.id"
                  class="flex items-center gap-2 text-sm text-gray-700 dark:text-dark-200"
                >
                  <input
                    v-model="form.channelIds"
                    type="checkbox"
                    :value="ch.id"
                    class="rounded border-gray-300"
                  />
                  <span>{{ ch.name }}</span>
                  <span class="text-xs text-gray-400">#{{ ch.id }}</span>
                </label>
                <p v-if="!channels.length" class="text-xs text-gray-400">—</p>
              </div>
            </div>

            <label class="block text-xs text-gray-500">
              {{ t('upstreamPriceMonitor.notifyEmails') }}
              <textarea
                v-model="form.notifyEmailsText"
                rows="2"
                class="input mt-1 w-full font-mono text-sm"
              />
              <span class="mt-1 block text-[11px] text-gray-400">{{
                t('upstreamPriceMonitor.notifyEmailsHint')
              }}</span>
            </label>
          </div>
          <div class="flex justify-end gap-2 border-t border-gray-100 px-4 py-3 dark:border-dark-700">
            <button type="button" class="btn btn-secondary" :disabled="saving" @click="closeConfigDialog">
              {{ t('upstreamPriceMonitor.close') }}
            </button>
            <button
              type="button"
              class="btn btn-primary"
              :disabled="saving || loading"
              data-test="upstream-price-save"
              @click="saveConfig"
            >
              {{ saving ? t('upstreamPriceMonitor.saving') : t('upstreamPriceMonitor.save') }}
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="detail"
        class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
        data-test="upstream-price-detail"
        @click.self="detail = null"
      >
        <div
          class="max-h-[90vh] w-full max-w-[96vw] overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-dark-800 xl:max-w-7xl"
        >
          <div class="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-dark-700">
            <h3 class="font-semibold text-gray-900 dark:text-white">
              {{ t('upstreamPriceMonitor.detailTitle') }} #{{ detail.id }}
            </h3>
            <button type="button" class="btn btn-secondary" @click="detail = null">
              {{ t('upstreamPriceMonitor.close') }}
            </button>
          </div>
          <div class="max-h-[78vh] overflow-auto p-4">
            <p class="mb-3 text-[11px] text-gray-400">{{ t('upstreamPriceMonitor.detailUnitHint') }}</p>
            <div class="overflow-x-auto">
              <table class="w-max min-w-full border-separate border-spacing-0 text-left text-xs">
                <thead class="sticky top-0 z-10 bg-white text-gray-500 dark:bg-dark-800">
                  <tr>
                    <th class="whitespace-nowrap px-3 py-2">{{ t('upstreamPriceMonitor.colChannel') }}</th>
                    <th class="whitespace-nowrap px-3 py-2">{{ t('upstreamPriceMonitor.colModel') }}</th>
                    <th class="whitespace-nowrap px-3 py-2">{{ t('upstreamPriceMonitor.colUpstreamIn') }}</th>
                    <th class="whitespace-nowrap px-3 py-2">{{ t('upstreamPriceMonitor.colUpstreamOut') }}</th>
                    <th class="whitespace-nowrap px-3 py-2">{{ t('upstreamPriceMonitor.colUpstreamCache') }}</th>
                    <th class="whitespace-nowrap px-3 py-2">{{ t('upstreamPriceMonitor.colLocalInMargin') }}</th>
                    <th class="whitespace-nowrap px-3 py-2">{{ t('upstreamPriceMonitor.colLocalOutMargin') }}</th>
                    <th class="whitespace-nowrap px-3 py-2">{{ t('upstreamPriceMonitor.colLocalCacheMargin') }}</th>
                    <th class="whitespace-nowrap px-3 py-2">{{ t('upstreamPriceMonitor.colItemStatus') }}</th>
                    <th class="min-w-[220px] whitespace-nowrap px-3 py-2">{{ t('upstreamPriceMonitor.colMessage') }}</th>
                    <th
                      class="sticky right-0 z-20 whitespace-nowrap bg-white px-3 py-2 shadow-[-6px_0_8px_-6px_rgba(0,0,0,0.15)] dark:bg-dark-800"
                    >
                      {{ t('upstreamPriceMonitor.colActions') }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in detail.items || []"
                    :key="item.id"
                    class="border-t border-gray-100 dark:border-dark-700"
                  >
                    <td class="whitespace-nowrap px-3 py-1.5">{{ item.channel_name }}</td>
                    <td class="whitespace-nowrap px-3 py-1.5 font-mono">{{ item.model }}</td>
                    <td class="whitespace-nowrap px-3 py-1.5 font-mono">{{ formatPrice(item.upstream_input) }}</td>
                    <td class="whitespace-nowrap px-3 py-1.5 font-mono">{{ formatPrice(item.upstream_output) }}</td>
                    <td class="whitespace-nowrap px-3 py-1.5 font-mono">{{ formatCachePrice(item) }}</td>
                    <td class="px-3 py-1.5 font-mono" :class="localPriceClass(item.status)">
                      <div class="whitespace-nowrap">
                        {{
                          formatLocalWithMargin(
                            item.local_input,
                            item.upstream_input,
                            item.margin_input
                          )
                        }}
                      </div>
                      <div
                        v-if="item.status === 'fail'"
                        class="mt-0.5 whitespace-nowrap text-[11px] opacity-90"
                      >
                        {{
                          formatSuggestedSellRange(
                            item.upstream_input,
                            detail.profit_min,
                            detail.profit_max
                          )
                        }}
                      </div>
                    </td>
                    <td class="px-3 py-1.5 font-mono" :class="localPriceClass(item.status)">
                      <div class="whitespace-nowrap">
                        {{ formatLocalWithMargin(item.local_output, item.upstream_output) }}
                      </div>
                      <div
                        v-if="item.status === 'fail'"
                        class="mt-0.5 whitespace-nowrap text-[11px] opacity-90"
                      >
                        {{
                          formatSuggestedSellRange(
                            item.upstream_output,
                            detail.profit_min,
                            detail.profit_max
                          )
                        }}
                      </div>
                    </td>
                    <td class="px-3 py-1.5 font-mono" :class="localPriceClass(item.status)">
                      <div class="whitespace-nowrap">
                        {{ formatLocalWithMargin(localCacheOf(item), upstreamCacheOf(item)) }}
                      </div>
                      <div
                        v-if="item.status === 'fail'"
                        class="mt-0.5 whitespace-nowrap text-[11px] opacity-90"
                      >
                        {{
                          formatSuggestedSellRange(
                            upstreamCacheOf(item),
                            detail.profit_min,
                            detail.profit_max
                          )
                        }}
                      </div>
                    </td>
                    <td class="whitespace-nowrap px-3 py-1.5">
                      <span class="rounded px-1.5 py-0.5" :class="itemStatusClass(item.status)">
                        {{ t(`upstreamPriceMonitor.status.${item.status}`) }}
                      </span>
                    </td>
                    <td class="px-3 py-1.5 text-gray-500">
                      <span
                        class="block max-w-[280px] cursor-help truncate"
                        :title="item.message || undefined"
                      >{{ item.message || '—' }}</span>
                    </td>
                    <td
                      class="sticky right-0 z-10 whitespace-nowrap bg-white px-3 py-1.5 shadow-[-6px_0_8px_-6px_rgba(0,0,0,0.15)] dark:bg-dark-800"
                    >
                      <button
                        v-if="canSyncItem(item)"
                        type="button"
                        class="btn btn-secondary btn-sm"
                        @click="openSyncDialog(item)"
                      >
                        {{ t('upstreamPriceMonitor.syncPrice') }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="syncTarget"
        class="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-4 sm:items-center"
        data-test="upstream-price-sync"
        @click.self="closeSyncDialog"
      >
        <div class="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl dark:bg-dark-800">
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">
            {{ t('upstreamPriceMonitor.syncPriceTitle') }}
          </h3>
          <p class="mt-1 text-xs text-gray-500">
            {{ syncTarget.channel_name }} · <span class="font-mono">{{ syncTarget.model }}</span>
          </p>
          <p class="mt-2 text-xs text-gray-500">{{ t('upstreamPriceMonitor.syncPriceHint') }}</p>
          <label class="mt-4 block text-sm text-gray-700 dark:text-dark-200">
            {{ t('upstreamPriceMonitor.syncProfitPct') }}
            <input
              v-model.number="syncProfitPct"
              type="number"
              min="0.1"
              max="99.9"
              step="0.1"
              class="input mt-1 w-full"
              data-test="upstream-price-sync-profit"
            />
          </label>
          <div class="mt-5 flex justify-end gap-2">
            <button type="button" class="btn btn-secondary" :disabled="syncing" @click="closeSyncDialog">
              {{ t('upstreamPriceMonitor.syncCancel') }}
            </button>
            <button
              type="button"
              class="btn btn-primary"
              :disabled="syncing || !isValidSyncProfit"
              data-test="upstream-price-sync-confirm"
              @click="confirmSync"
            >
              {{ syncing ? t('upstreamPriceMonitor.syncing') : t('upstreamPriceMonitor.syncConfirm') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppLayout from '@/components/layout/AppLayout.vue'
import * as upstreamApi from '@/api/admin/upstreamPriceMonitor'
import type {
  UpstreamPriceMonitorRun,
  UpstreamPriceMonitorRunItem
} from '@/api/admin/upstreamPriceMonitor'
import * as channelsApi from '@/api/admin/channels'
import type { Channel } from '@/api/admin/channels'
import { useAppStore } from '@/stores/app'
import {
  defaultSyncProfitPct,
  formatLocalWithMargin,
  formatPrice,
  formatSuggestedSellRange,
  percentToRatio
} from './format'

const { t, locale } = useI18n()
const appStore = useAppStore()

const loading = ref(true)
const bootError = ref(false)
const saving = ref(false)
const running = ref(false)
const channels = ref<Channel[]>([])
const runs = ref<UpstreamPriceMonitorRun[]>([])
const page = ref(1)
const totalPages = ref(1)
const detail = ref<UpstreamPriceMonitorRun | null>(null)
const configOpen = ref(false)
const deletingRunId = ref<number | null>(null)
const syncTarget = ref<UpstreamPriceMonitorRunItem | null>(null)
const syncProfitPct = ref(30)
const syncing = ref(false)
const isValidSyncProfit = computed(() => {
  const v = Number(syncProfitPct.value)
  return Number.isFinite(v) && v > 0 && v < 100
})

const form = reactive({
  enabled: false,
  intervalSeconds: 43200,
  channelIds: [] as number[],
  notifyEmailsText: '',
  profitMinPct: 25,
  profitMaxPct: 35,
  targetProfitPct: '' as number | ''
})

function parseEmails(text: string): string[] {
  return text
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function applyConfig(cfg: upstreamApi.UpstreamPriceMonitorConfig) {
  form.enabled = cfg.enabled
  form.intervalSeconds = cfg.interval_seconds
  form.channelIds = [...(cfg.channel_ids || [])]
  form.notifyEmailsText = (cfg.notify_emails || []).join('\n')
  form.profitMinPct = Math.round(cfg.profit_min * 10000) / 100
  form.profitMaxPct = Math.round(cfg.profit_max * 10000) / 100
  form.targetProfitPct =
    cfg.target_profit != null ? Math.round(cfg.target_profit * 10000) / 100 : ''
}

async function bootstrap() {
  loading.value = true
  bootError.value = false
  try {
    const [cfg, chPage] = await Promise.all([
      upstreamApi.getConfig(),
      channelsApi.list(1, 200)
    ])
    applyConfig(cfg)
    channels.value = chPage.items || []
    await loadRuns(1)
  } catch {
    bootError.value = true
  } finally {
    loading.value = false
  }
}

async function loadRuns(p: number) {
  page.value = p
  const res = await upstreamApi.listRuns(p, 20)
  runs.value = res.items || []
  totalPages.value = res.pages || 1
}

async function openConfigDialog() {
  try {
    const cfg = await upstreamApi.getConfig()
    applyConfig(cfg)
  } catch {
    // 仍打开弹窗，沿用当前表单
  }
  configOpen.value = true
}

function closeConfigDialog() {
  if (saving.value) return
  configOpen.value = false
}

async function saveConfig() {
  saving.value = true
  try {
    const targetEmpty = form.targetProfitPct === '' || form.targetProfitPct == null
    const cfg = await upstreamApi.updateConfig({
      enabled: form.enabled,
      interval_seconds: form.intervalSeconds,
      channel_ids: form.channelIds,
      notify_emails: parseEmails(form.notifyEmailsText),
      profit_min: percentToRatio(Number(form.profitMinPct)),
      profit_max: percentToRatio(Number(form.profitMaxPct)),
      target_profit: targetEmpty ? undefined : percentToRatio(Number(form.targetProfitPct)),
      clear_target: targetEmpty
    })
    applyConfig(cfg)
    appStore.showSuccess(t('upstreamPriceMonitor.saved'))
    configOpen.value = false
  } catch (e: any) {
    appStore.showError(e?.message || t('upstreamPriceMonitor.loadFailed'))
  } finally {
    saving.value = false
  }
}

async function triggerRun() {
  running.value = true
  try {
    const run = await upstreamApi.runNow()
    appStore.showSuccess(t('upstreamPriceMonitor.runStarted'))
    await loadRuns(1)
    detail.value = run
  } catch (e: any) {
    appStore.showError(e?.message || t('upstreamPriceMonitor.loadFailed'))
  } finally {
    running.value = false
  }
}

async function openDetail(id: number) {
  try {
    detail.value = await upstreamApi.getRun(id)
  } catch (e: any) {
    appStore.showError(e?.message || t('upstreamPriceMonitor.loadFailed'))
  }
}

async function removeRun(id: number) {
  if (!window.confirm(t('upstreamPriceMonitor.deleteRunConfirm'))) return
  deletingRunId.value = id
  try {
    await upstreamApi.deleteRun(id)
    if (detail.value?.id === id) detail.value = null
    appStore.showSuccess(t('upstreamPriceMonitor.deleteRunSuccess'))
    await loadRuns(page.value)
  } catch (e: any) {
    appStore.showError(e?.message || t('upstreamPriceMonitor.loadFailed'))
  } finally {
    deletingRunId.value = null
  }
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString(locale.value === 'zh' ? 'zh-CN' : 'en-US')
  } catch {
    return iso
  }
}

function upstreamCacheOf(item: UpstreamPriceMonitorRunItem): number | null {
  return item.upstream_cache_read ?? item.upstream_cache_write ?? null
}

function localCacheOf(item: UpstreamPriceMonitorRunItem): number | null {
  return item.local_cache_read ?? item.local_cache_write ?? null
}

function formatCachePrice(item: UpstreamPriceMonitorRunItem): string {
  const read = formatPrice(item.upstream_cache_read)
  const write = formatPrice(item.upstream_cache_write)
  if (read === '—' && write === '—') return '—'
  if (write === '—' || write === read) return read
  if (read === '—') return write
  return `${read} / ${write}`
}

function runStatusClass(status: string) {
  switch (status) {
    case 'passed':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
    case 'failed':
      return 'bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200'
    case 'error':
      return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-dark-700 dark:text-dark-300'
  }
}

function itemStatusClass(status: string) {
  if (status === 'pass') return 'bg-emerald-50 text-emerald-700'
  if (status === 'fail') return 'bg-amber-50 text-amber-800'
  return 'bg-gray-100 text-gray-600'
}

function localPriceClass(status: string) {
  return status === 'fail' ? 'text-red-600 dark:text-red-400' : undefined
}

function canSyncItem(item: UpstreamPriceMonitorRunItem) {
  return (
    item.channel_id > 0 &&
    !!item.model &&
    item.status === 'fail' &&
    item.upstream_input != null &&
    item.upstream_input > 0
  )
}

function openSyncDialog(item: UpstreamPriceMonitorRunItem) {
  if (!canSyncItem(item) || !detail.value) return
  syncTarget.value = item
  syncProfitPct.value = defaultSyncProfitPct(detail.value.profit_min, detail.value.profit_max)
}

function closeSyncDialog() {
  if (syncing.value) return
  syncTarget.value = null
}

async function confirmSync() {
  if (!syncTarget.value || !isValidSyncProfit.value) return
  const target = syncTarget.value
  const profitRatio = percentToRatio(Number(syncProfitPct.value))
  syncing.value = true
  try {
    const result = await upstreamApi.syncPrice({
      channel_id: target.channel_id,
      model: target.model,
      profit: profitRatio
    })
    // 巡检明细是历史快照：就地刷新本行本地价，方便立刻对照。
    if (detail.value?.items) {
      const row = detail.value.items.find((it) => it.id === target.id)
      if (row) {
        row.local_input = result.input
        row.local_output = result.output
        row.local_cache_read = result.cache_read ?? null
        row.local_cache_write = result.cache_write ?? null
        row.margin_input = profitRatio
        row.status = 'pass'
        row.message = 'synced to target profit'
      }
    }
    appStore.showSuccess(t('upstreamPriceMonitor.syncSuccess'))
    syncTarget.value = null
  } catch (e: any) {
    appStore.showError(e?.message || t('upstreamPriceMonitor.loadFailed'))
  } finally {
    syncing.value = false
  }
}

onMounted(bootstrap)
</script>
