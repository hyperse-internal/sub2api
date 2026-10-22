<template>
  <AppLayout>
    <div class="mx-auto max-w-[1400px] pb-8">
      <header class="mb-6">
        <h1 class="text-2xl font-semibold tracking-tight text-gray-950 dark:text-white">
          {{ t('admin.consumptionReport.title') }}
        </h1>
        <p class="mt-2 max-w-3xl text-sm text-gray-500 dark:text-dark-300">
          {{ t('admin.consumptionReport.description') }}
        </p>
      </header>

      <section class="card mb-6 p-4 sm:p-6">
        <div class="flex flex-wrap items-end gap-4">
          <div ref="userSearchRef" class="relative w-full sm:w-auto sm:min-w-[280px]">
            <label class="input-label">{{ t('admin.consumptionReport.userFilter') }}</label>
            <input
              v-model="userKeyword"
              type="text"
              class="input pr-8"
              data-test="consumption-user-search"
              :placeholder="t('admin.consumptionReport.searchUserPlaceholder')"
              @input="onUserKeywordInput"
              @focus="showUserDropdown = true"
            />
            <button
              v-if="selectedUser"
              type="button"
              class="absolute right-2 top-9 text-gray-400"
              aria-label="Clear user"
              @click="clearUser"
            >
              ✕
            </button>
            <div
              v-if="showUserDropdown && (userResults.length > 0 || userKeyword)"
              class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border bg-white shadow-lg dark:border-dark-600 dark:bg-dark-800"
            >
              <button
                v-for="u in userResults"
                :key="u.id"
                type="button"
                class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-dark-700"
                @click="selectUser(u)"
              >
                <span>
                  {{ u.email }}
                  <span v-if="u.deleted" class="ml-1 text-xs text-gray-400">
                    （{{ t('admin.consumptionReport.userDeletedBadge') }}）
                  </span>
                </span>
                <span class="ml-2 text-xs text-gray-400">#{{ u.id }}</span>
              </button>
              <p v-if="userResults.length === 0 && userKeyword" class="px-4 py-2 text-sm text-gray-400">
                —
              </p>
            </div>
          </div>

          <div class="w-full sm:w-auto sm:min-w-[200px]">
            <label class="input-label">{{ t('admin.consumptionReport.modelFilter') }}</label>
            <input
              v-model="modelFilter"
              type="text"
              class="input"
              data-test="consumption-model-filter"
              :placeholder="t('admin.consumptionReport.modelPlaceholder')"
            />
          </div>

          <div class="w-full sm:w-auto">
            <label class="input-label">{{ t('admin.consumptionReport.startDate') }}</label>
            <input
              v-model="startDate"
              type="date"
              class="input"
              data-test="consumption-start-date"
              :max="endDate || todayStr"
            />
          </div>

          <div class="w-full sm:w-auto">
            <label class="input-label">{{ t('admin.consumptionReport.endDate') }}</label>
            <input
              v-model="endDate"
              type="date"
              class="input"
              data-test="consumption-end-date"
              :min="startDate"
              :max="todayStr"
            />
          </div>

          <button type="button" class="btn btn-secondary" data-test="consumption-last-7" @click="setLast7Days">
            {{ t('admin.consumptionReport.last7Days') }}
          </button>

          <button
            type="button"
            class="btn btn-primary"
            data-test="consumption-query"
            :disabled="loading"
            @click="runQuery"
          >
            {{ loading ? t('admin.consumptionReport.querying') : t('admin.consumptionReport.query') }}
          </button>
        </div>
        <p class="mt-3 text-xs text-gray-400 dark:text-dark-400">
          {{ t('admin.consumptionReport.timezone') }}: {{ timezone }}
        </p>
      </section>

      <div
        v-if="error"
        role="alert"
        class="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
      >
        {{ error }}
      </div>

      <template v-if="report">
        <section class="mb-6">
          <div class="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ t('admin.consumptionReport.summary.title') }}
            </h2>
            <p class="text-sm text-gray-500 dark:text-dark-300">
              {{ report.user.email }}
              <span class="text-gray-400">#{{ report.user.id }}</span>
              <span v-if="report.user.deleted" class="ml-1 text-xs text-amber-600">
                （{{ t('admin.consumptionReport.userDeletedBadge') }}）
              </span>
              · {{ report.start_date }} → {{ report.end_date }}
              <span v-if="report.model" class="ml-1">· {{ report.model }}</span>
            </p>
          </div>

          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <div v-for="card in summaryCards" :key="card.key" class="card p-4">
              <p class="text-xs text-gray-500 dark:text-dark-400" :title="card.hint">{{ card.label }}</p>
              <p class="mt-1 text-xl font-semibold tabular-nums text-gray-950 dark:text-white">
                {{ card.value }}
              </p>
            </div>
          </div>
        </section>

        <section class="card mb-6 overflow-x-auto">
          <div class="border-b border-gray-100 px-4 py-3 dark:border-dark-700 sm:px-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ t('admin.consumptionReport.daily.title') }}
            </h2>
          </div>
          <table class="min-w-full text-sm" data-test="consumption-daily-table">
            <thead>
              <tr class="border-b border-gray-100 text-left text-xs text-gray-500 dark:border-dark-700 dark:text-dark-400">
                <th class="px-4 py-3 font-medium sm:px-6">{{ t('admin.consumptionReport.daily.date') }}</th>
                <th class="px-3 py-3 font-medium">{{ t('admin.consumptionReport.daily.model') }}</th>
                <th class="px-3 py-3 font-medium text-right">{{ t('admin.consumptionReport.daily.requests') }}</th>
                <th class="px-3 py-3 font-medium text-right">{{ t('admin.consumptionReport.daily.inputTokens') }}</th>
                <th class="px-3 py-3 font-medium text-right">{{ t('admin.consumptionReport.daily.outputTokens') }}</th>
                <th class="px-3 py-3 font-medium text-right">{{ t('admin.consumptionReport.daily.cacheReadTokens') }}</th>
                <th
                  class="px-3 py-3 font-medium text-right"
                  :title="t('admin.consumptionReport.hints.cacheRatio')"
                >
                  {{ t('admin.consumptionReport.daily.cacheRatio') }}
                </th>
                <th class="px-3 py-3 font-medium text-right">{{ t('admin.consumptionReport.daily.totalTokens') }}</th>
                <th class="px-3 py-3 font-medium text-right" :title="t('admin.consumptionReport.hints.listCost')">
                  {{ t('admin.consumptionReport.daily.listCost') }}
                </th>
                <th class="px-4 py-3 font-medium text-right sm:px-6" :title="t('admin.consumptionReport.hints.actualCost')">
                  {{ t('admin.consumptionReport.daily.actualCost') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in report.daily"
                :key="`${row.date}::${row.model}`"
                class="border-b border-gray-50 last:border-0 dark:border-dark-800"
              >
                <td class="px-4 py-2.5 font-medium tabular-nums text-gray-900 dark:text-white sm:px-6">
                  {{ row.date }}
                </td>
                <td class="px-3 py-2.5 font-medium text-gray-900 dark:text-white">{{ row.model || '—' }}</td>
                <td class="px-3 py-2.5 text-right tabular-nums">{{ formatNumberLocaleString(row.requests) }}</td>
                <td class="px-3 py-2.5 text-right tabular-nums">{{ formatTokensM(row.input_tokens) }}</td>
                <td class="px-3 py-2.5 text-right tabular-nums">{{ formatTokensM(row.output_tokens) }}</td>
                <td class="px-3 py-2.5 text-right tabular-nums">{{ formatTokensM(row.cache_read_tokens) }}</td>
                <td
                  class="px-3 py-2.5 text-right tabular-nums"
                  :title="t('admin.consumptionReport.hints.cacheRatio')"
                >
                  {{ formatCacheRatio(row.cache_read_tokens, row.input_tokens, row.cache_creation_tokens) }}
                </td>
                <td class="px-3 py-2.5 text-right tabular-nums">{{ formatTokensM(row.total_tokens) }}</td>
                <td class="px-3 py-2.5 text-right tabular-nums">${{ formatCostFixed(row.cost) }}</td>
                <td class="px-4 py-2.5 text-right tabular-nums font-medium text-teal-700 dark:text-teal-400 sm:px-6">
                  ${{ formatCostFixed(row.actual_cost) }}
                </td>
              </tr>
            </tbody>
            <tfoot v-if="report.daily.length > 0">
              <tr class="border-t border-gray-200 bg-gray-50/80 dark:border-dark-600 dark:bg-dark-900/40">
                <td class="px-4 py-2.5 font-semibold sm:px-6" colspan="2">Σ</td>
                <td class="px-3 py-2.5 text-right font-semibold tabular-nums">
                  {{ formatNumberLocaleString(report.summary.total_requests) }}
                </td>
                <td class="px-3 py-2.5 text-right font-semibold tabular-nums">
                  {{ formatTokensM(report.summary.total_input_tokens) }}
                </td>
                <td class="px-3 py-2.5 text-right font-semibold tabular-nums">
                  {{ formatTokensM(report.summary.total_output_tokens) }}
                </td>
                <td class="px-3 py-2.5 text-right font-semibold tabular-nums">
                  {{ formatTokensM(report.summary.total_cache_read_tokens) }}
                </td>
                <td
                  class="px-3 py-2.5 text-right font-semibold tabular-nums"
                  :title="t('admin.consumptionReport.hints.cacheRatio')"
                >
                  {{
                    formatCacheRatio(
                      report.summary.total_cache_read_tokens,
                      report.summary.total_input_tokens,
                      report.summary.total_cache_creation_tokens
                    )
                  }}
                </td>
                <td class="px-3 py-2.5 text-right font-semibold tabular-nums">
                  {{ formatTokensM(report.summary.total_tokens) }}
                </td>
                <td class="px-3 py-2.5 text-right font-semibold tabular-nums">
                  ${{ formatCostFixed(report.summary.total_cost) }}
                </td>
                <td class="px-4 py-2.5 text-right font-semibold tabular-nums text-teal-700 dark:text-teal-400 sm:px-6">
                  ${{ formatCostFixed(report.summary.total_actual_cost) }}
                </td>
              </tr>
            </tfoot>
          </table>
          <p
            v-if="!report.daily.length"
            class="px-4 py-8 text-center text-sm text-gray-400 sm:px-6"
          >
            {{ t('admin.consumptionReport.noData') }}
          </p>
        </section>

        <section v-if="report.models && report.models.length > 0" class="card overflow-x-auto">
          <div class="border-b border-gray-100 px-4 py-3 dark:border-dark-700 sm:px-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ t('admin.consumptionReport.models.title') }}
            </h2>
          </div>
          <table class="min-w-full text-sm" data-test="consumption-models-table">
            <thead>
              <tr class="border-b border-gray-100 text-left text-xs text-gray-500 dark:border-dark-700 dark:text-dark-400">
                <th class="px-4 py-3 font-medium sm:px-6">{{ t('admin.consumptionReport.models.model') }}</th>
                <th class="px-3 py-3 font-medium text-right">{{ t('admin.consumptionReport.models.requests') }}</th>
                <th class="px-3 py-3 font-medium text-right">{{ t('admin.consumptionReport.models.totalTokens') }}</th>
                <th class="px-3 py-3 font-medium text-right">{{ t('admin.consumptionReport.models.listCost') }}</th>
                <th class="px-4 py-3 font-medium text-right sm:px-6">{{ t('admin.consumptionReport.models.actualCost') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="m in report.models"
                :key="m.model"
                class="border-b border-gray-50 last:border-0 dark:border-dark-800"
              >
                <td class="px-4 py-2.5 font-medium text-gray-900 dark:text-white sm:px-6">{{ m.model || '—' }}</td>
                <td class="px-3 py-2.5 text-right tabular-nums">{{ formatNumberLocaleString(m.requests) }}</td>
                <td class="px-3 py-2.5 text-right tabular-nums">{{ formatTokensM(m.total_tokens) }}</td>
                <td class="px-3 py-2.5 text-right tabular-nums">${{ formatCostFixed(m.cost) }}</td>
                <td class="px-4 py-2.5 text-right tabular-nums font-medium text-teal-700 dark:text-teal-400 sm:px-6">
                  ${{ formatCostFixed(m.actual_cost) }}
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </template>

      <p
        v-else-if="!loading && !error"
        class="rounded-xl border border-dashed border-gray-200 px-4 py-12 text-center text-sm text-gray-400 dark:border-dark-600"
      >
        {{ t('admin.consumptionReport.emptyHint') }}
      </p>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useAppStore } from '@/stores/app'
import { extractApiErrorMessage } from '@/utils/apiError'
import { formatCostFixed, formatNumberLocaleString, getBrowserTimeZone } from '@/utils/format'
import { formatMultiplier } from '@/utils/formatters'
import {
  getConsumptionReport,
  searchUsers,
  type ConsumptionReport,
  type SimpleUser
} from './api'

const { t } = useI18n()
const appStore = useAppStore()

const timezone = getBrowserTimeZone()
const todayStr = formatDateLocal(new Date())

const startDate = ref('')
const endDate = ref('')
const modelFilter = ref('')
const selectedUser = ref<SimpleUser | null>(null)
const userKeyword = ref('')
const userResults = ref<SimpleUser[]>([])
const showUserDropdown = ref(false)
const userSearchRef = ref<HTMLElement | null>(null)
let userSearchTimer: ReturnType<typeof setTimeout> | null = null

const loading = ref(false)
const error = ref('')
const report = ref<ConsumptionReport | null>(null)
let abortController: AbortController | null = null

const summaryCards = computed(() => {
  const s = report.value?.summary
  if (!s) return []
  return [
    {
      key: 'actual',
      label: t('admin.consumptionReport.summary.actualCost'),
      value: `$${formatCostFixed(s.total_actual_cost)}`,
      hint: t('admin.consumptionReport.hints.actualCost')
    },
    {
      key: 'list',
      label: t('admin.consumptionReport.summary.listCost'),
      value: `$${formatCostFixed(s.total_cost)}`,
      hint: t('admin.consumptionReport.hints.listCost')
    },
    {
      key: 'rate',
      label: t('admin.consumptionReport.summary.avgRate'),
      value: s.avg_rate_multiplier > 0 ? `${formatMultiplier(s.avg_rate_multiplier)}×` : '—'
    },
    {
      key: 'requests',
      label: t('admin.consumptionReport.summary.requests'),
      value: formatNumberLocaleString(s.total_requests)
    },
    {
      key: 'tokens',
      label: t('admin.consumptionReport.summary.totalTokens'),
      value: formatTokensM(s.total_tokens)
    },
    {
      key: 'input',
      label: t('admin.consumptionReport.summary.inputTokens'),
      value: formatTokensM(s.total_input_tokens)
    },
    {
      key: 'output',
      label: t('admin.consumptionReport.summary.outputTokens'),
      value: formatTokensM(s.total_output_tokens)
    },
    {
      key: 'cache',
      label: t('admin.consumptionReport.summary.cacheReadTokens'),
      value: formatTokensM(s.total_cache_read_tokens)
    },
    {
      key: 'cacheCreate',
      label: t('admin.consumptionReport.summary.cacheCreationTokens'),
      value: formatTokensM(s.total_cache_creation_tokens)
    },
    {
      key: 'duration',
      label: t('admin.consumptionReport.summary.avgDuration'),
      value: `${Math.round(s.average_duration_ms)} ms`
    }
  ]
})

function formatDateLocal(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatTokensM(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(2)}M`
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}K`
  return formatNumberLocaleString(tokens)
}

/** 缓存命中 ÷（输入 + 缓存命中 + 缓存创建），与 TokenUsageTrend 口径一致 */
function formatCacheRatio(
  cacheReadTokens: number,
  inputTokens: number,
  cacheCreationTokens: number
): string {
  const promptTokens = inputTokens + cacheReadTokens + cacheCreationTokens
  if (promptTokens <= 0) return '—'
  return `${((cacheReadTokens / promptTokens) * 100).toFixed(1)}%`
}

function inclusiveDaySpan(start: string, end: string): number {
  const a = new Date(`${start}T00:00:00`)
  const b = new Date(`${end}T00:00:00`)
  return Math.floor((b.getTime() - a.getTime()) / 86_400_000) + 1
}

function setLast7Days() {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 6)
  endDate.value = formatDateLocal(end)
  startDate.value = formatDateLocal(start)
}

function selectUser(u: SimpleUser) {
  selectedUser.value = u
  userKeyword.value = u.email
  showUserDropdown.value = false
  userResults.value = []
}

function clearUser() {
  selectedUser.value = null
  userKeyword.value = ''
  userResults.value = []
}

function onUserKeywordInput() {
  selectedUser.value = null
  if (userSearchTimer) clearTimeout(userSearchTimer)
  userSearchTimer = setTimeout(async () => {
    const q = userKeyword.value.trim()
    if (!q) {
      userResults.value = []
      return
    }
    try {
      userResults.value = await searchUsers(q)
      showUserDropdown.value = true
    } catch {
      userResults.value = []
    }
  }, 280)
}

function validate(): string | null {
  if (!selectedUser.value) return t('admin.consumptionReport.userRequired')
  if (!startDate.value || !endDate.value) return t('admin.consumptionReport.endBeforeStart')
  if (endDate.value < startDate.value) return t('admin.consumptionReport.endBeforeStart')
  if (inclusiveDaySpan(startDate.value, endDate.value) > 7) {
    return t('admin.consumptionReport.rangeTooLong')
  }
  return null
}

async function runQuery() {
  const validationError = validate()
  if (validationError) {
    error.value = validationError
    appStore.showError(validationError)
    return
  }

  abortController?.abort()
  abortController = new AbortController()
  loading.value = true
  error.value = ''

  try {
    const model = modelFilter.value.trim()
    report.value = await getConsumptionReport(
      {
        user_id: selectedUser.value!.id,
        start_date: startDate.value,
        end_date: endDate.value,
        timezone,
        ...(model ? { model } : {})
      },
      { signal: abortController.signal }
    )
  } catch (err: unknown) {
    if ((err as { name?: string })?.name === 'CanceledError' || (err as { code?: string })?.code === 'ERR_CANCELED') {
      return
    }
    const msg = extractApiErrorMessage(err, t('admin.consumptionReport.failedToLoad'))
    error.value = msg
    report.value = null
    appStore.showError(msg)
  } finally {
    loading.value = false
  }
}

function onDocumentClick(e: MouseEvent) {
  if (userSearchRef.value && !userSearchRef.value.contains(e.target as Node)) {
    showUserDropdown.value = false
  }
}

onMounted(() => {
  setLast7Days()
  document.addEventListener('click', onDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
  abortController?.abort()
  if (userSearchTimer) clearTimeout(userSearchTimer)
})
</script>
