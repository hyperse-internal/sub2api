<template>
  <div class="flex min-w-0 flex-1 items-start justify-between gap-3">
    <!-- Left: name + description -->
    <div
      class="flex min-w-0 flex-1 flex-col items-start"
      :title="description || undefined"
    >
      <!-- Row 1: platform badge (name bold) -->
      <GroupBadge
        :name="name"
        :platform="platform"
        :subscription-type="subscriptionType"
        :show-rate="false"
        class="groupOptionItemBadge"
      />
      <!-- Row 2: description with top spacing -->
      <span
        v-if="description"
        class="mt-1.5 w-full whitespace-pre-line [overflow-wrap:anywhere] text-left text-xs leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-3"
      >
        {{ description }}
      </span>
    </div>

    <!-- Right: rate pill + checkmark (vertically centered to first row) -->
    <div class="flex shrink-0 items-center gap-2 pt-0.5">
      <div class="flex shrink-0 flex-col items-end gap-1">
        <!-- Subscription primary (when not always showing rate as main) -->
        <span
          v-if="isSubscription && pricingHintMode"
          :class="['inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold', ratePillClass]"
        >
          {{ t('groups.subscription') }}
        </span>

        <!-- Relative official range -->
        <span
          v-if="pricingHintMode === 'relative' && relativeLabel"
          :class="['inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold', ratePillClass]"
          :title="relativeTitle"
        >
          <template v-if="groupRelativeLabel && groupRelativeLabel !== relativeLabel">
            <span class="mr-1 line-through opacity-50">{{ groupRelativeLabel }}</span>
            <span class="font-bold">{{ relativeLabel }}</span>
          </template>
          <template v-else>
            {{ relativeLabel }}
          </template>
          <span class="ml-1 font-medium opacity-80">{{ t('keys.pricing.relativeOfficial') }}</span>
        </span>

        <!-- By model (no relative) -->
        <span
          v-else-if="pricingHintMode === 'by_model'"
          :class="['inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold', ratePillClass]"
          :title="t('keys.pricing.byModelHint')"
        >
          {{ t('keys.pricing.byModel') }}
        </span>

        <!-- Legacy group rate (default when pricingHintMode unset) -->
        <span
          v-else-if="pricingHintMode == null && rateMultiplier !== undefined"
          :class="['inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold', ratePillClass]"
        >
          <template v-if="hasCustomRate">
            <span class="mr-1 line-through opacity-50">{{ rateMultiplier }}x</span>
            <span class="font-bold">{{ userRateMultiplier }}x</span>
          </template>
          <template v-else>
            {{ rateMultiplier }}x {{ t('admin.groups.rateLabel') }}
          </template>
        </span>

        <!-- Explicit group_rate mode -->
        <span
          v-else-if="pricingHintMode === 'group_rate' && rateMultiplier !== undefined"
          :class="['inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold', ratePillClass]"
        >
          <template v-if="hasCustomRate">
            <span class="mr-1 line-through opacity-50">{{ rateMultiplier }}x</span>
            <span class="font-bold">{{ userRateMultiplier }}x</span>
          </template>
          <template v-else>
            {{ rateMultiplier }}x {{ t('keys.pricing.groupRate') }}
          </template>
        </span>

        <!-- Secondary group rate under by_model -->
        <span
          v-if="pricingHintMode === 'by_model' && showSecondaryGroupRate && rateMultiplier !== undefined"
          class="inline-flex items-center whitespace-nowrap rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-dark-700 dark:text-gray-300"
          :title="t('keys.pricing.groupRateHint')"
        >
          <template v-if="hasCustomRate">
            <span class="mr-1 line-through opacity-50">{{ rateMultiplier }}x</span>
            <span class="font-bold">{{ userRateMultiplier }}x</span>
          </template>
          <template v-else>{{ rateMultiplier }}x</template>
          {{ t('keys.pricing.groupRate') }}
        </span>

        <span
          v-if="hasPeakRate"
          class="inline-flex items-center whitespace-nowrap rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
          :title="peakRateTitle"
        >
          {{ peakRateText }}
        </span>

        <RouterLink
          v-if="modelPlazaHref"
          :to="modelPlazaHref"
          class="text-[11px] font-medium text-primary-600 hover:underline dark:text-primary-400"
          @click.stop
        >
          {{ t('keys.pricing.modelDetails') }}
        </RouterLink>
      </div>
      <!-- Checkmark -->
      <svg
        v-if="showCheckmark && selected"
        class="h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import GroupBadge from './GroupBadge.vue'
import type { SubscriptionType, GroupPlatform } from '@/types'
import { useAppStore } from '@/stores/app'
import { formatPeakRateWindow, serverTimezoneLabel } from '@/utils/peak-rate'
import {
  formatRelativeRateRange,
  type PricingHintMode
} from '@/utils/relativeOfficialRate'

const { t } = useI18n()

interface Props {
  name: string
  platform: GroupPlatform
  subscriptionType?: SubscriptionType
  rateMultiplier?: number
  userRateMultiplier?: number | null
  peakRateEnabled?: boolean
  peakStart?: string
  peakEnd?: string
  peakRateMultiplier?: number
  description?: string | null
  selected?: boolean
  showCheckmark?: boolean
  pricingHintMode?: PricingHintMode
  relativeRateMin?: number
  relativeRateMax?: number
  groupRelativeRateMin?: number
  groupRelativeRateMax?: number
  showSecondaryGroupRate?: boolean
  /** SPA 路径，如 /model-plaza?group=23&embedded=1 */
  modelPlazaHref?: string
}

const props = withDefaults(defineProps<Props>(), {
  subscriptionType: 'standard',
  selected: false,
  showCheckmark: true,
  userRateMultiplier: null,
  peakRateEnabled: false,
  showSecondaryGroupRate: false
})

const isSubscription = computed(() => props.subscriptionType === 'subscription')

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
  return Boolean(props.peakRateEnabled && props.peakStart && props.peakEnd)
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

const ratePillClass = computed(() => {
  switch (props.platform) {
    case 'anthropic':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
    case 'openai':
      return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
    case 'gemini':
      return 'bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400'
    default:
      return 'bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400'
  }
})
</script>

<style scoped>
/* Bold the group name inside GroupBadge when used in dropdown option */
.groupOptionItemBadge :deep(span.truncate) {
  font-weight: 600;
}
</style>
