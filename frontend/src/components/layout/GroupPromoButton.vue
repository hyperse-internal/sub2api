<template>
  <button
    type="button"
    class="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 px-2 text-white shadow-lg shadow-cyan-500/25 ring-1 ring-cyan-400/30 transition-all hover:-translate-y-0.5 hover:shadow-cyan-500/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 sm:px-3"
    :aria-label="t('common.groupPromoButton')"
    :title="t('common.groupPromoButton')"
    data-test="group-promo-button"
    @click="open = true"
  >
    <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110 motion-reduce:transform-none">
      <Icon name="gift" size="sm" />
    </span>
    <span class="hidden whitespace-nowrap text-left leading-tight lg:block">
      <span class="block text-xs font-bold">{{ t('common.groupPromoButton') }}</span>
      <span class="block text-[10px] font-medium text-white/90">{{ t('common.groupPromoUnlimited') }}</span>
    </span>
  </button>

  <BaseDialog
    :show="open"
    :title="t('common.groupPromoTitle')"
    width="narrow"
    :z-index="100"
    :close-on-click-outside="true"
    @close="open = false"
  >
    <div class="-mx-4 -my-3 overflow-hidden rounded-b-2xl bg-gradient-to-b from-[#043746] via-[#075870] to-[#112e5b] text-white sm:-mx-6 sm:-my-4" data-test="group-promo-dialog">
      <div class="relative px-6 pb-16 pt-7">
        <span aria-hidden="true" class="pointer-events-none absolute -right-14 -top-16 h-48 w-48 rounded-full border-[24px] border-white/10" />
        <span aria-hidden="true" class="pointer-events-none absolute -bottom-20 right-4 h-44 w-44 rounded-full bg-cyan-300/25 blur-3xl" />
        <div class="relative">
          <span class="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-50">
            <Icon name="gift" size="sm" />
            {{ t('common.groupPromoTag') }}
          </span>
          <h3 class="mt-4 text-3xl font-black tracking-tight sm:text-[34px]">
            DeepSeek
            <span class="block text-amber-300">{{ t('common.groupPromoFreeDay') }}</span>
          </h3>
          <span class="mt-3 inline-flex rounded-full bg-amber-300 px-3 py-1 text-xs font-bold text-slate-900">{{ t('common.groupPromoUnlimited') }}</span>
          <p class="mt-3 max-w-[300px] text-sm leading-relaxed text-cyan-50/90">{{ t('common.groupPromoDescription') }}</p>
          <ol class="mt-4 grid grid-cols-3 gap-2">
            <li class="rounded-lg bg-white/10 px-2 py-2 text-center ring-1 ring-white/15">
              <span aria-hidden="true" class="block text-[10px] font-bold text-amber-300">01</span>
              <span class="mt-0.5 block text-[11px] font-semibold leading-tight">{{ t('common.groupPromoStepJoin') }}</span>
            </li>
            <li class="rounded-lg bg-white/10 px-2 py-2 text-center ring-1 ring-white/15">
              <span aria-hidden="true" class="block text-[10px] font-bold text-amber-300">02</span>
              <span class="mt-0.5 block text-[11px] font-semibold leading-tight">{{ t('common.groupPromoStepContact') }}</span>
            </li>
            <li class="rounded-lg bg-white/10 px-2 py-2 text-center ring-1 ring-white/15">
              <span aria-hidden="true" class="block text-[10px] font-bold text-amber-300">03</span>
              <span class="mt-0.5 block text-[11px] font-semibold leading-tight">{{ t('common.groupPromoStepClaim') }}</span>
            </li>
          </ol>
        </div>
      </div>

      <div class="relative -mt-8 px-5 pb-5">
        <div class="rounded-2xl border border-cyan-100/25 bg-white/[0.08] p-4 shadow-[0_18px_48px_rgba(0,17,43,0.25)] backdrop-blur-sm">
          <p class="text-center text-sm font-semibold text-cyan-50">{{ t('common.supportQrHint') }}</p>
          <div class="mx-auto mt-3 w-fit rounded-2xl border border-cyan-100/20 bg-white p-2 shadow-[0_10px_30px_rgba(0,15,35,0.3)] dark:bg-[#262626]">
            <div class="aspect-square w-[188px] overflow-hidden rounded-lg bg-white dark:bg-[#262626] sm:w-[208px]">
              <img
                :src="qqLightImg"
                :alt="t('common.supportQrAlt')"
                class="block h-full w-full dark:hidden"
                width="930"
                height="930"
                data-test="group-promo-qr-light"
                draggable="false"
              />
              <img
                :src="qqDarkImg"
                :alt="t('common.supportQrAlt')"
                class="hidden h-full w-full dark:block"
                width="930"
                height="930"
                data-test="group-promo-qr-dark"
                draggable="false"
              />
            </div>
          </div>

          <div class="mt-4 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#031e32]/35 px-3 py-2">
            <span class="text-xs text-cyan-100/75">{{ t('common.supportGroupNumber') }}</span>
            <div class="flex items-center gap-2">
              <span class="select-text font-mono text-sm font-semibold tracking-wide text-white" data-test="group-promo-number">{{ QQ_GROUP_NUMBER }}</span>
              <button
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-300/15 text-cyan-100 transition-colors hover:bg-cyan-300/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                :aria-label="`${t('common.copy')} ${t('common.supportGroupNumber')}`"
                :title="copied ? t('common.copied') : t('common.copy')"
                data-test="group-promo-copy"
                @click="copyToClipboard(QQ_GROUP_NUMBER)"
              >
                <Icon :name="copied ? 'check' : 'copy'" size="sm" />
              </button>
            </div>
          </div>
        </div>

        <p class="mt-3 text-center text-xs leading-relaxed text-cyan-100/75">{{ t('common.groupPromoJoinHint') }}</p>
      </div>
    </div>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseDialog from '@/components/common/BaseDialog.vue'
import Icon from '@/components/icons/Icon.vue'
import { useClipboard } from '@/composables/useClipboard'
import { QQ_GROUP_NUMBER } from '@/constants/community'
import qqDarkImg from '@/assets/images/qq-group-qr-dark.png'
import qqLightImg from '@/assets/images/qq-group-qr-light.png'

const { t } = useI18n()
const { copied, copyToClipboard } = useClipboard()
const open = ref(false)
</script>
