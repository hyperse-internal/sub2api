<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium transition-colors',
      badgeClass
    ]"
  >
    <!-- Platform logo -->
    <PlatformIcon v-if="platform" :platform="platform" size="sm" />
    <!-- Group name -->
    <span :class="truncate ? 'truncate' : 'min-w-0 whitespace-normal [overflow-wrap:anywhere]'">{{ name }}</span>
    <!-- Right side label -->
    <span v-if="showLabel" :class="labelClass" :title="primaryTitle || undefined">
      <template v-if="isSubscription && !alwaysShowRate">
        {{ subscriptionLabelText }}
      </template>
      <template v-else-if="pricingHintMode === 'relative' && relativeLabel">
        <template v-if="groupRelativeLabel && groupRelativeLabel !== relativeLabel">
          <span class="line-through opacity-50 mr-0.5">{{ groupRelativeLabel }}</span>
          <span class="font-bold">{{ relativeLabel }}</span>
        </template>
        <template v-else>
          {{ relativeLabel }}
        </template>
      </template>
      <template v-else-if="pricingHintMode === 'by_model'">
        {{ t('keys.pricing.byModel') }}
      </template>
      <template v-else-if="hasCustomRate">
        <!-- 原倍率删除线 + 专属倍率高亮（legacy group_rate） -->
        <span class="line-through opacity-50 mr-0.5">{{ rateMultiplier }}x</span>
        <span class="font-bold">{{ userRateMultiplier }}x</span>
      </template>
      <template v-else>
        {{ legacyRateLabel }}
      </template>
    </span>
    <!-- 订阅主标签下的相对官价次要行 -->
    <span
      v-if="showSubscriptionRelative"
      :class="secondaryLabelClass"
      :title="relativeTitle || undefined"
    >
      {{ relativeLabel }}
    </span>
    <!-- by_model 时有信息量的分组费率 -->
    <span
      v-if="showSecondaryGroupRatePill"
      :class="secondaryLabelClass"
      :title="t('keys.pricing.groupRateHint')"
    >
      <template v-if="hasCustomRate">
        <span class="line-through opacity-50 mr-0.5">{{ rateMultiplier }}x</span>
        <span class="font-bold">{{ userRateMultiplier }}x</span>
      </template>
      <template v-else>{{ rateMultiplier }}x</template>
      {{ t('keys.pricing.groupRate') }}
    </span>
    <span v-if="hasPeakRate" :class="peakRateClass" :title="peakRateTitle">
      {{ peakRateText }}
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { SubscriptionType, GroupPlatform } from '@/types'
import { useAppStore } from '@/stores/app'
import { formatPeakRateWindow, serverTimezoneLabel } from '@/utils/peak-rate'
import {
  formatRelativeRateRange,
  type PricingHintMode
} from '@/utils/relativeOfficialRate'
import PlatformIcon from './PlatformIcon.vue'

interface Props {
  name: string
  platform?: GroupPlatform
  subscriptionType?: SubscriptionType
  rateMultiplier?: number
  userRateMultiplier?: number | null // 用户专属倍率
  peakRateEnabled?: boolean
  peakStart?: string
  peakEnd?: string
  peakRateMultiplier?: number
  showRate?: boolean
  /** Allow full group names to wrap in layouts that have room for multiple lines. */
  truncate?: boolean
  daysRemaining?: number | null // 剩余天数（订阅类型时使用）
  /**
   * 订阅分组默认在右侧 label 展示"订阅"或剩余天数；
   * 开启后订阅分组也改为显示倍率（保留订阅主题色 label，配合可用渠道这类
   * 只关心费率、不关心有效期的场景）。
   */
  alwaysShowRate?: boolean
  /**
   * 密钥页定价提示模式。未传时保持旧「分组费率 Nx」行为。
   * relative：相对官价区间；by_model：价格按模型；group_rate：显式分组费率。
   */
  pricingHintMode?: PricingHintMode
  relativeRateMin?: number
  relativeRateMax?: number
  /** 有专属倍率时，分组默认相对官价（划线）。 */
  groupRelativeRateMin?: number
  groupRelativeRateMax?: number
  /** by_model 时是否次要展示分组费率。 */
  showSecondaryGroupRate?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  subscriptionType: 'standard',
  showRate: true,
  truncate: true,
  daysRemaining: null,
  userRateMultiplier: null,
  peakRateEnabled: false,
  alwaysShowRate: false,
  showSecondaryGroupRate: false
})

const { t } = useI18n()

const isSubscription = computed(() => props.subscriptionType === 'subscription')

// 是否有专属倍率（且与默认倍率不同）
const hasCustomRate = computed(() => {
  return (
    props.userRateMultiplier !== null &&
    props.userRateMultiplier !== undefined &&
    props.rateMultiplier !== undefined &&
    props.userRateMultiplier !== props.rateMultiplier
  )
})

const appStore = useAppStore()

const hasPeakRate = computed(() => {
  return Boolean(props.showRate && props.peakRateEnabled && props.peakStart && props.peakEnd)
})

const peakRateText = computed(() => {
  return formatPeakRateWindow(
    {
      peak_rate_enabled: props.peakRateEnabled,
      peak_start: props.peakStart,
      peak_end: props.peakEnd,
      peak_rate_multiplier: props.peakRateMultiplier
    },
    serverTimezoneLabel(appStore.cachedPublicSettings?.server_utc_offset)
  )
})

const peakRateTitle = computed(() => {
  return t('common.peakRateTooltip', { window: peakRateText.value })
})

const relativeLabel = computed(() => {
  if (props.relativeRateMin == null || props.relativeRateMax == null) return ''
  return formatRelativeRateRange({ min: props.relativeRateMin, max: props.relativeRateMax })
})

const groupRelativeLabel = computed(() => {
  if (props.groupRelativeRateMin == null || props.groupRelativeRateMax == null) return ''
  return formatRelativeRateRange({
    min: props.groupRelativeRateMin,
    max: props.groupRelativeRateMax
  })
})

const relativeTitle = computed(() => {
  if (!relativeLabel.value) return ''
  return t('keys.pricing.relativeOfficialHint', { range: relativeLabel.value })
})

const primaryTitle = computed(() => {
  if (props.pricingHintMode === 'relative') return relativeTitle.value
  if (props.pricingHintMode === 'by_model') return t('keys.pricing.byModelHint')
  return ''
})

const showSubscriptionRelative = computed(() => {
  return (
    props.showRate &&
    isSubscription.value &&
    !props.alwaysShowRate &&
    props.pricingHintMode === 'relative' &&
    Boolean(relativeLabel.value)
  )
})

const showSecondaryGroupRatePill = computed(() => {
  return (
    props.showRate &&
    props.pricingHintMode === 'by_model' &&
    props.showSecondaryGroupRate &&
    props.rateMultiplier !== undefined
  )
})

// 是否显示右侧标签
const showLabel = computed(() => {
  if (!props.showRate) return false
  // 订阅类型：显示天数或"订阅"
  if (isSubscription.value && !props.alwaysShowRate) return true
  if (props.pricingHintMode === 'relative') return Boolean(relativeLabel.value)
  if (props.pricingHintMode === 'by_model') return true
  // 标准类型：显示倍率（包括专属倍率）
  return props.rateMultiplier !== undefined || hasCustomRate.value
})

const subscriptionLabelText = computed(() => {
  if (props.daysRemaining !== null && props.daysRemaining !== undefined) {
    if (props.daysRemaining <= 0) {
      return t('admin.users.expired')
    }
    return t('admin.users.daysRemaining', { days: props.daysRemaining })
  }
  return t('groups.subscription')
})

const legacyRateLabel = computed(() => {
  return props.rateMultiplier !== undefined ? `${props.rateMultiplier}x` : ''
})

const secondaryLabelClass = computed(() => {
  return 'px-1.5 py-0.5 rounded text-[10px] font-semibold bg-black/10 dark:bg-white/10'
})

// Label style based on type and days remaining
const labelClass = computed(() => {
  const base = 'px-1.5 py-0.5 rounded text-[10px] font-semibold'
  const subtle = `${base} bg-black/10 dark:bg-white/10`

  // 标准分组、或订阅但强制展示费率/定价提示作为主标签时，用中性底
  if (!isSubscription.value || props.alwaysShowRate) {
    return subtle
  }

  // 订阅类型主标签：根据剩余天数显示不同颜色
  if (props.daysRemaining !== null && props.daysRemaining !== undefined) {
    if (props.daysRemaining <= 0 || props.daysRemaining <= 3) {
      return `${base} bg-red-200/80 text-red-800 dark:bg-red-800/50 dark:text-red-300`
    }
    if (props.daysRemaining <= 7) {
      return `${base} bg-amber-200/80 text-amber-800 dark:bg-amber-800/50 dark:text-amber-300`
    }
  }

  if (props.platform === 'anthropic') {
    return `${base} bg-orange-200/60 text-orange-800 dark:bg-orange-800/40 dark:text-orange-300`
  }
  if (props.platform === 'openai') {
    return `${base} bg-emerald-200/60 text-emerald-800 dark:bg-emerald-800/40 dark:text-emerald-300`
  }
  if (props.platform === 'gemini') {
    return `${base} bg-blue-200/60 text-blue-800 dark:bg-blue-800/40 dark:text-blue-300`
  }
  if (props.platform === 'antigravity') {
    return `${base} bg-purple-200/60 text-purple-800 dark:bg-purple-800/40 dark:text-purple-300`
  }
  if (props.platform === 'grok') {
    return `${base} bg-zinc-300/70 text-zinc-800 dark:bg-zinc-700/60 dark:text-zinc-200`
  }
  if (props.platform === 'kimi') {
    return `${base} bg-pink-200/60 text-pink-800 dark:bg-pink-800/40 dark:text-pink-300`
  }
  if (props.platform === 'zhipu') {
    return `${base} bg-indigo-200/60 text-indigo-800 dark:bg-indigo-800/40 dark:text-indigo-300`
  }
  if (props.platform === 'deepseek') {
    return `${base} bg-teal-200/60 text-teal-800 dark:bg-teal-800/40 dark:text-teal-300`
  }
  if (props.platform === 'minimax') {
    return `${base} bg-rose-200/60 text-rose-800 dark:bg-rose-800/40 dark:text-rose-300`
  }
  if (props.platform === 'composite') {
    return `${base} bg-cyan-200/70 text-cyan-900 dark:bg-cyan-900/50 dark:text-cyan-300`
  }
  return `${base} bg-violet-200/60 text-violet-800 dark:bg-violet-800/40 dark:text-violet-300`
})

const peakRateClass = computed(() => {
  return 'px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
})

// Badge color based on platform and subscription type
const badgeClass = computed(() => {
  if (props.platform === 'anthropic') {
    return isSubscription.value
      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
  } else if (props.platform === 'openai') {
    return isSubscription.value
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
  }
  if (props.platform === 'gemini') {
    return isSubscription.value
      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      : 'bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400'
  }
  if (props.platform === 'antigravity') {
    return isSubscription.value
      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      : 'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-900/20 dark:text-fuchsia-400'
  }
  if (props.platform === 'grok') {
    return isSubscription.value
      ? 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100'
      : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
  }
  if (props.platform === 'kimi') {
    return isSubscription.value
      ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'
      : 'bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400'
  }
  if (props.platform === 'zhipu') {
    return isSubscription.value
      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
      : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400'
  }
  if (props.platform === 'deepseek') {
    return isSubscription.value
      ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
      : 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400'
  }
  if (props.platform === 'minimax') {
    return isSubscription.value
      ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
      : 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'
  }
  if (props.platform === 'composite') {
    return isSubscription.value
      ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300'
      : 'bg-cyan-50 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300'
  }
  return isSubscription.value
    ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
})
</script>
