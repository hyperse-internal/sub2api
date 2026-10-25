<template>
  <AppLayout>
    <div class="mx-auto max-w-2xl space-y-6">
      <!-- Current Balance Card -->
      <div class="card overflow-hidden">
        <div class="bg-gradient-to-br from-primary-500 to-primary-600 px-6 py-8 text-center">
          <div
            class="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm"
          >
            <Icon name="creditCard" size="xl" class="text-white" />
          </div>
          <p class="text-sm font-medium text-primary-100">{{ t('redeem.currentBalance') }}</p>
          <p class="mt-2 text-4xl font-bold text-white">
            ${{ user?.balance?.toFixed(2) || '0.00' }}
          </p>
          <p class="mt-2 text-sm text-primary-100">
            {{ t('redeem.concurrency') }}: {{ user?.concurrency || 0 }} {{ t('redeem.requests') }}
          </p>
        </div>
      </div>

      <!-- Redeem Form -->
      <div class="card">
        <div class="p-6">
          <form @submit.prevent="handleRedeem" class="space-y-5">
            <div>
              <label for="code" class="input-label">
                {{ t('redeem.redeemCodeLabel') }}
              </label>
              <div class="relative mt-1">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Icon name="gift" size="md" class="text-gray-400 dark:text-dark-500" />
                </div>
                <input
                  id="code"
                  v-model="redeemCode"
                  type="text"
                  required
                  :placeholder="t('redeem.redeemCodePlaceholder')"
                  :disabled="submitting"
                  class="input py-3 pl-12 text-lg"
                />
              </div>
              <p class="input-hint">
                {{ t('redeem.redeemCodeHint') }}
              </p>
            </div>

            <button
              type="submit"
              :disabled="!redeemCode || submitting"
              class="btn btn-primary w-full py-3"
            >
              <svg
                v-if="submitting"
                class="-ml-1 mr-2 h-5 w-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <Icon v-else name="checkCircle" size="md" class="mr-2" />
              {{ submitting ? t('redeem.redeeming') : t('redeem.redeemButton') }}
            </button>
          </form>
        </div>
      </div>

      <!-- Success Message -->
      <transition name="fade">
        <div
          v-if="redeemResult"
          class="card border-emerald-200 bg-emerald-50 dark:border-emerald-800/50 dark:bg-emerald-900/20"
        >
          <div class="p-6">
            <div class="flex items-start gap-4">
              <div
                class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30"
              >
                <Icon name="checkCircle" size="md" class="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div class="flex-1">
                <h3 class="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                  {{ t('redeem.redeemSuccess') }}
                </h3>
                <div class="mt-2 text-sm text-emerald-700 dark:text-emerald-400">
                  <p>{{ redeemResult.message }}</p>
                  <div class="mt-3 space-y-1">
                    <p v-if="redeemResult.type === 'balance'" class="font-medium">
                      {{ t('redeem.added') }}: ${{ redeemResult.value.toFixed(2) }}
                    </p>
                    <p v-else-if="redeemResult.type === 'concurrency'" class="font-medium">
                      {{ t('redeem.added') }}: {{ redeemResult.value }}
                      {{ t('redeem.concurrentRequests') }}
                    </p>
                    <p v-else-if="redeemResult.type === 'subscription'" class="font-medium">
                      {{ t('redeem.subscriptionAssigned') }}
                      <span v-if="redeemResult.group_name"> - {{ redeemResult.group_name }}</span>
                      <span v-if="redeemResult.validity_days">
                        ({{
                          t('redeem.subscriptionDays', { days: redeemResult.validity_days })
                        }})</span
                      >
                    </p>
                    <p v-if="redeemResult.new_balance !== undefined">
                      {{ t('redeem.newBalance') }}:
                      <span class="font-semibold">${{ redeemResult.new_balance.toFixed(2) }}</span>
                    </p>
                    <p v-if="redeemResult.new_concurrency !== undefined">
                      {{ t('redeem.newConcurrency') }}:
                      <span class="font-semibold"
                        >{{ redeemResult.new_concurrency }} {{ t('redeem.requests') }}</span
                      >
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- Error Message -->
      <transition name="fade">
        <div
          v-if="errorMessage"
          class="card border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-900/20"
        >
          <div class="p-6">
            <div class="flex items-start gap-4">
              <div
                class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30"
              >
                <Icon
                  name="exclamationCircle"
                  size="md"
                  class="text-red-600 dark:text-red-400"
                />
              </div>
              <div class="flex-1">
                <h3 class="text-sm font-semibold text-red-800 dark:text-red-300">
                  {{ t('redeem.redeemFailed') }}
                </h3>
                <p class="mt-2 text-sm text-red-700 dark:text-red-400">
                  {{ errorMessage }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- Information Card -->
      <div
        class="card border-primary-200 bg-primary-50 dark:border-primary-800/50 dark:bg-primary-900/20"
      >
        <div class="p-6">
          <div class="flex items-start gap-4">
            <div
              class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30"
            >
              <Icon name="infoCircle" size="md" class="text-primary-600 dark:text-primary-400" />
            </div>
            <div class="flex-1">
              <h3 class="text-sm font-semibold text-primary-800 dark:text-primary-300">
                {{ t('redeem.aboutCodes') }}
              </h3>
              <ul
                class="mt-2 list-inside list-disc space-y-1 text-sm text-primary-700 dark:text-primary-400"
              >
                <li>{{ t('redeem.codeRule1') }}</li>
                <li>{{ t('redeem.codeRule2') }}</li>
                <li>
                  {{ t('redeem.codeRule3') }}
                  <span
                    v-if="contactInfo"
                    class="ml-1.5 inline-flex items-center rounded-md bg-primary-200/50 px-2 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-800/40 dark:text-primary-200"
                  >
                    {{ contactInfo }}
                  </span>
                </li>
                <li>{{ t('redeem.codeRule4') }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Subscription redeem confirmation -->
      <ConfirmDialog
        :show="showSubscriptionConfirm"
        :title="t('redeem.subscriptionConfirmTitle')"
        :message="t('redeem.subscriptionConfirmLead')"
        :confirm-text="t('redeem.subscriptionConfirmContinue')"
        :cancel-text="t('redeem.subscriptionConfirmCancel')"
        :danger="subscriptionConfirmTone === 'overwrite'"
        width="medium"
        @confirm="confirmSubscriptionRedeem"
        @cancel="cancelSubscriptionRedeem"
      >
        <div class="space-y-4">
          <div :class="['rounded-xl border p-4', subscriptionConfirmAlertClass]" role="alert">
            <div class="flex items-start gap-3">
              <Icon
                :name="subscriptionConfirmTone === 'create' ? 'checkCircle' : 'exclamationCircle'"
                size="md"
                :class="['mt-0.5 flex-shrink-0', subscriptionConfirmIconClass]"
              />
              <div :class="['space-y-2 text-sm', subscriptionConfirmTextClass]">
                <p class="font-semibold">{{ t('redeem.subscriptionConfirmPlanLabel') }}</p>
                <p class="whitespace-nowrap font-medium">
                  {{
                    t('redeem.subscriptionConfirmGroup', {
                      name: pendingPreview?.group?.name || `#${pendingPreview?.group_id || ''}`
                    })
                  }}
                </p>
                <p class="whitespace-nowrap">
                  {{
                    t('redeem.subscriptionConfirmDays', {
                      days: pendingPreviewValidityDays
                    })
                  }}
                </p>
                <p class="font-semibold leading-relaxed">{{ subscriptionImpactMessage }}</p>
                <p :class="subscriptionConfirmMutedTextClass">
                  {{ t('redeem.subscriptionConfirmOthersUnaffected') }}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
              {{ t('redeem.subscriptionConfirmListTitle') }}
            </h4>
            <div
              v-if="confirmSubscriptionList.length === 0"
              class="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-500 dark:border-dark-600 dark:text-dark-400"
            >
              {{ t('redeem.subscriptionConfirmListEmpty') }}
            </div>
            <ul v-else class="max-h-56 space-y-2 overflow-y-auto">
              <li
                v-for="item in confirmSubscriptionList"
                :key="item.id"
                :class="[
                  'rounded-xl border px-4 py-3 text-sm',
                  item.isTarget
                    ? subscriptionConfirmTargetRowClass
                    : 'border-gray-200 bg-gray-50 dark:border-dark-600 dark:bg-dark-800'
                ]"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="truncate font-medium text-gray-900 dark:text-white">
                      {{ item.name }}
                    </p>
                    <p class="mt-1 text-xs text-gray-500 dark:text-dark-400">
                      {{ item.expiresLabel }}
                    </p>
                  </div>
                  <span
                    v-if="item.isTarget"
                    :class="[
                      'shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold text-white',
                      subscriptionConfirmBadgeClass
                    ]"
                  >
                    {{ t('redeem.subscriptionConfirmCurrentBadge') }}
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </ConfirmDialog>

      <!-- Recent Activity -->
      <div class="card">
        <div class="border-b border-gray-100 px-6 py-4 dark:border-dark-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ t('redeem.recentActivity') }}
          </h2>
        </div>
        <div class="p-6">
          <!-- Loading State -->
          <div v-if="loadingHistory" class="flex items-center justify-center py-8">
            <svg class="h-6 w-6 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>

          <!-- History List -->
          <div v-else-if="history.length > 0" class="space-y-3">
            <div
              v-for="item in history"
              :key="item.id"
              class="flex items-center justify-between rounded-xl bg-gray-50 p-4 dark:bg-dark-800"
            >
              <div class="flex items-center gap-4">
                <div
                  :class="[
                    'flex h-10 w-10 items-center justify-center rounded-xl',
                    isBalanceType(item.type)
                      ? item.value >= 0
                        ? 'bg-emerald-100 dark:bg-emerald-900/30'
                        : 'bg-red-100 dark:bg-red-900/30'
                      : isSubscriptionType(item.type)
                        ? 'bg-purple-100 dark:bg-purple-900/30'
                        : item.value >= 0
                          ? 'bg-blue-100 dark:bg-blue-900/30'
                          : 'bg-orange-100 dark:bg-orange-900/30'
                  ]"
                >
                  <!-- 余额类型图标 -->
                  <Icon
                    v-if="isBalanceType(item.type)"
                    name="dollar"
                    size="md"
                    :class="
                      item.value >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    "
                  />
                  <!-- 订阅类型图标 -->
                  <Icon
                    v-else-if="isSubscriptionType(item.type)"
                    name="badge"
                    size="md"
                    class="text-purple-600 dark:text-purple-400"
                  />
                  <!-- 并发类型图标 -->
                  <Icon
                    v-else
                    name="bolt"
                    size="md"
                    :class="
                      item.value >= 0
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-orange-600 dark:text-orange-400'
                    "
                  />
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ getHistoryItemTitle(item) }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-dark-400">
                    {{ formatDateTime(item.used_at) }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p
                  :class="[
                    'text-sm font-semibold',
                    isBalanceType(item.type)
                      ? item.value >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                      : isSubscriptionType(item.type)
                        ? 'text-purple-600 dark:text-purple-400'
                        : item.value >= 0
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-orange-600 dark:text-orange-400'
                  ]"
                >
                  {{ formatHistoryValue(item) }}
                </p>
                <p
                  v-if="!isAdminAdjustment(item.type)"
                  class="font-mono text-xs text-gray-400 dark:text-dark-500"
                >
                  {{ item.code.slice(0, 8) }}...
                </p>
                <p v-else class="text-xs text-gray-400 dark:text-dark-500">
                  {{ t('redeem.adminAdjustment') }}
                </p>
                <!-- Display notes for admin adjustments -->
                <p
                  v-if="item.notes"
                  class="mt-1 text-xs text-gray-500 dark:text-dark-400 italic max-w-[200px] truncate"
                  :title="item.notes"
                >
                  {{ item.notes }}
                </p>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="empty-state py-8">
            <div
              class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-dark-800"
            >
              <Icon name="clock" size="xl" class="text-gray-400 dark:text-dark-500" />
            </div>
            <p class="text-sm text-gray-500 dark:text-dark-400">
              {{ t('redeem.historyWillAppear') }}
            </p>
          </div>
          <div class="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <span>{{ t('common.total') }}: {{ historyTotal }} {{ t('pagination.results') }}</span>
            <label>
              {{ t('pagination.perPage') }}
              <select
                v-model="historyPageSize"
                class="input w-20"
                :disabled="loadingHistory || submitting"
                @change="fetchHistory(1)"
              >
                <option v-for="size in [20, 50, 100]" :key="size" :value="size">{{ size }}</option>
              </select>
            </label>
            <button
              class="btn btn-secondary"
              :disabled="loadingHistory || submitting || historyPage <= 1"
              @click="fetchHistory(historyPage - 1)"
            >{{ t('pagination.previous') }}</button>
            <button
              class="btn btn-secondary"
              :disabled="loadingHistory || submitting || historyPage * historyPageSize >= historyTotal"
              @click="fetchHistory(historyPage + 1)"
            >{{ t('pagination.next') }}</button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { useSubscriptionStore } from '@/stores/subscriptions'
import { redeemAPI, authAPI, type RedeemHistoryItem, type RedeemPreview } from '@/api'
import AppLayout from '@/components/layout/AppLayout.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import Icon from '@/components/icons/Icon.vue'
import { formatDateTime } from '@/utils/format'
import type { UserSubscription } from '@/types'

const { t } = useI18n()
const authStore = useAuthStore()
const appStore = useAppStore()
const subscriptionStore = useSubscriptionStore()

const user = computed(() => authStore.user)

const redeemCode = ref('')
const submitting = ref(false)
const redeemResult = ref<{
  message: string
  type: string
  value: number
  new_balance?: number
  new_concurrency?: number
  group_name?: string
  validity_days?: number
} | null>(null)
const errorMessage = ref('')

const showSubscriptionConfirm = ref(false)
const pendingPreview = ref<RedeemPreview | null>(null)
const pendingCode = ref('')

// History data
const history = ref<RedeemHistoryItem[]>([])
const loadingHistory = ref(false)
const historyPage = ref(1)
const historyPageSize = ref(20)
const historyTotal = ref(0)
let historyRequest = 0
let loadedHistoryPageSize = 20
const contactInfo = ref('')

const pendingPreviewValidityDays = computed(() => {
  const days = pendingPreview.value?.validity_days
  if (days && days > 0) return days
  return 30
})

const targetGroupId = computed(() => pendingPreview.value?.group_id ?? null)

const existingTargetSubscription = computed(() => {
  const groupId = targetGroupId.value
  if (groupId == null) return null
  return (
    subscriptionStore.activeSubscriptions.find((sub) => sub.group_id === groupId) ?? null
  )
})

type SubscriptionConfirmTone = 'create' | 'overwrite' | 'extend'

const subscriptionConfirmTone = computed((): SubscriptionConfirmTone => {
  if (!existingTargetSubscription.value) return 'create'
  if (pendingPreview.value?.group?.reset_quota_on_renewal) return 'overwrite'
  return 'extend'
})

const subscriptionImpactMessage = computed(() => {
  switch (subscriptionConfirmTone.value) {
    case 'create':
      return t('redeem.subscriptionConfirmCreate')
    case 'overwrite':
      return t('redeem.subscriptionConfirmOverwrite')
    default:
      return t('redeem.subscriptionConfirmExtend')
  }
})

const subscriptionConfirmAlertClass = computed(() =>
  subscriptionConfirmTone.value === 'create'
    ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700/60 dark:bg-emerald-900/20'
    : 'border-amber-300 bg-amber-50 dark:border-amber-700/60 dark:bg-amber-900/20'
)

const subscriptionConfirmIconClass = computed(() =>
  subscriptionConfirmTone.value === 'create'
    ? 'text-emerald-600 dark:text-emerald-400'
    : 'text-amber-600 dark:text-amber-400'
)

const subscriptionConfirmTextClass = computed(() =>
  subscriptionConfirmTone.value === 'create'
    ? 'text-emerald-900 dark:text-emerald-100'
    : 'text-amber-900 dark:text-amber-100'
)

const subscriptionConfirmMutedTextClass = computed(() =>
  subscriptionConfirmTone.value === 'create'
    ? 'text-emerald-800/90 dark:text-emerald-200/90'
    : 'text-amber-800/90 dark:text-amber-200/90'
)

const subscriptionConfirmTargetRowClass = computed(() =>
  subscriptionConfirmTone.value === 'create'
    ? 'border-emerald-400 bg-emerald-50 ring-2 ring-emerald-300/70 dark:border-emerald-500 dark:bg-emerald-900/30 dark:ring-emerald-600/40'
    : 'border-amber-400 bg-amber-50 ring-2 ring-amber-300/70 dark:border-amber-500 dark:bg-amber-900/30 dark:ring-amber-600/40'
)

const subscriptionConfirmBadgeClass = computed(() =>
  subscriptionConfirmTone.value === 'create' ? 'bg-emerald-500' : 'bg-amber-500'
)

type ConfirmSubscriptionRow = {
  id: string
  name: string
  expiresLabel: string
  isTarget: boolean
}

const confirmSubscriptionList = computed((): ConfirmSubscriptionRow[] => {
  const groupId = targetGroupId.value
  const rows: ConfirmSubscriptionRow[] = subscriptionStore.activeSubscriptions.map(
    (sub: UserSubscription) => ({
      id: `sub-${sub.id}`,
      name: sub.group?.name || `#${sub.group_id}`,
      expiresLabel: sub.expires_at
        ? t('redeem.subscriptionConfirmExpires', { date: formatDateTime(sub.expires_at) })
        : t('redeem.subscriptionConfirmNoExpiry'),
      isTarget: groupId != null && sub.group_id === groupId
    })
  )

  // 当前码对应分组没有订阅时，仍在列表首位展示即将开通的分组，便于对照。
  if (groupId != null && !rows.some((row) => row.isTarget)) {
    rows.unshift({
      id: `preview-${groupId}`,
      name: pendingPreview.value?.group?.name || `#${groupId}`,
      expiresLabel: t('redeem.subscriptionConfirmDays', {
        days: pendingPreviewValidityDays.value
      }),
      isTarget: true
    })
  }

  return rows.sort((a, b) => Number(b.isTarget) - Number(a.isTarget))
})

// Helper functions for history display
const isBalanceType = (type: string) => {
  return type === 'balance' || type === 'admin_balance'
}

const isSubscriptionType = (type: string) => {
  return type === 'subscription'
}

const isAdminAdjustment = (type: string) => {
  return type === 'admin_balance' || type === 'admin_concurrency'
}

const getHistoryItemTitle = (item: RedeemHistoryItem) => {
  if (item.type === 'balance') {
    return t('redeem.balanceAddedRedeem')
  } else if (item.type === 'admin_balance') {
    return item.value >= 0 ? t('redeem.balanceAddedAdmin') : t('redeem.balanceDeductedAdmin')
  } else if (item.type === 'concurrency') {
    return t('redeem.concurrencyAddedRedeem')
  } else if (item.type === 'admin_concurrency') {
    return item.value >= 0 ? t('redeem.concurrencyAddedAdmin') : t('redeem.concurrencyReducedAdmin')
  } else if (item.type === 'subscription') {
    return t('redeem.subscriptionAssigned')
  }
  return t('common.unknown')
}

const formatHistoryValue = (item: RedeemHistoryItem) => {
  if (isBalanceType(item.type)) {
    const sign = item.value >= 0 ? '+' : ''
    return `${sign}$${item.value.toFixed(2)}`
  } else if (isSubscriptionType(item.type)) {
    // 订阅类型显示有效天数和分组名称
    const days = item.validity_days || Math.round(item.value)
    const groupName = item.group?.name || ''
    return groupName ? `${days}${t('redeem.days')} - ${groupName}` : `${days}${t('redeem.days')}`
  } else {
    const sign = item.value >= 0 ? '+' : ''
    return `${sign}${item.value} ${t('redeem.requests')}`
  }
}

const fetchHistory = async (page = 1) => {
  const request = ++historyRequest
  const pageSize = historyPageSize.value
  loadingHistory.value = true
  try {
    const result = await redeemAPI.getHistory(page, pageSize)
    if (request !== historyRequest) return
    history.value = result.items
    historyTotal.value = result.total
    historyPage.value = page
    historyPageSize.value = pageSize
    loadedHistoryPageSize = pageSize
  } catch (error) {
    if (request !== historyRequest) return
    historyPageSize.value = loadedHistoryPageSize
    appStore.showError(t('redeem.historyLoadFailed'))
    console.error('Failed to fetch history:', error)
  } finally {
    if (request === historyRequest) loadingHistory.value = false
  }
}

const extractErrorMessage = (error: unknown) => {
  const err = error as { response?: { data?: { detail?: string; message?: string } }; message?: string }
  return (
    err?.response?.data?.detail ||
    err?.response?.data?.message ||
    err?.message ||
    t('redeem.failedToRedeem')
  )
}

const performRedeem = async (code: string) => {
  submitting.value = true
  errorMessage.value = ''
  redeemResult.value = null

  try {
    const result = await redeemAPI.redeem(code)

    redeemResult.value = result

    // Refresh user data to get updated balance/concurrency
    try {
      await authStore.refreshUser()
    } catch (error) {
      console.error('Failed to refresh user after redeem:', error)
      appStore.showWarning(t('redeem.userRefreshFailed'))
    }

    // If subscription type, immediately refresh subscription status
    if (result.type === 'subscription') {
      try {
        await subscriptionStore.fetchActiveSubscriptions(true) // force refresh
      } catch (error) {
        console.error('Failed to refresh subscriptions after redeem:', error)
        appStore.showWarning(t('redeem.subscriptionRefreshFailed'))
      }
    }

    // Clear the input
    redeemCode.value = ''

    // Refresh history
    await fetchHistory()

    // Show success toast
    appStore.showSuccess(t('redeem.codeRedeemSuccess'))
  } catch (error: unknown) {
    errorMessage.value = extractErrorMessage(error)
    appStore.showError(t('redeem.redeemFailed'))
  } finally {
    submitting.value = false
  }
}

const cancelSubscriptionRedeem = () => {
  showSubscriptionConfirm.value = false
  pendingPreview.value = null
  pendingCode.value = ''
}

const confirmSubscriptionRedeem = async () => {
  const code = pendingCode.value
  cancelSubscriptionRedeem()
  if (!code) return
  await performRedeem(code)
}

const handleRedeem = async () => {
  const code = redeemCode.value.trim()
  if (!code) {
    appStore.showError(t('redeem.pleaseEnterCode'))
    return
  }

  submitting.value = true
  errorMessage.value = ''
  redeemResult.value = null

  try {
    const preview = await redeemAPI.preview(code)
    if (preview.type === 'subscription') {
      pendingPreview.value = preview
      pendingCode.value = code
      try {
        await subscriptionStore.fetchActiveSubscriptions(true)
      } catch (error) {
        console.error('Failed to load subscriptions before redeem confirm:', error)
      }
      showSubscriptionConfirm.value = true
      submitting.value = false
      return
    }

    submitting.value = false
    await performRedeem(code)
  } catch (error: unknown) {
    errorMessage.value = extractErrorMessage(error) || t('redeem.subscriptionConfirmPreviewFailed')
    appStore.showError(t('redeem.redeemFailed'))
    submitting.value = false
  }
}

onMounted(async () => {
  fetchHistory()
  try {
    const settings = await authAPI.getPublicSettings()
    contactInfo.value = settings.contact_info || ''
  } catch (error) {
    console.error('Failed to load contact info:', error)
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
