<template>
  <div v-if="split" class="auth-shell">
    <aside class="auth-showcase">
      <router-link to="/" class="relative z-10 w-fit" :aria-label="siteName">
        <SiteLogo :src="siteLogo" :title="siteName" class="h-10 max-w-52" />
        <p class="mt-3 text-xs leading-5 text-gray-500 dark:text-white/50">{{ siteSubtitle }}</p>
      </router-link>

      <div class="auth-visual" aria-hidden="true">
        <img
          :src="apiGatewayIllustration"
          alt=""
          width="1024"
          height="1024"
          loading="eager"
          decoding="async"
          class="auth-showcase-image"
        />
      </div>

      <div class="relative z-10 max-w-lg">
        <div class="mb-6 h-1 w-10 rounded-full bg-primary-500 dark:bg-primary-300"></div>
        <p class="text-sm font-medium tracking-wide text-primary-700 dark:text-primary-200">{{ t('auth.showcaseEyebrow') }}</p>
        <h2 class="mt-4 text-3xl font-medium leading-snug tracking-tight text-gray-900 dark:text-white xl:text-4xl">{{ t('auth.showcaseTitle') }}</h2>
        <p class="mt-4 max-w-sm text-sm leading-7 text-gray-600 dark:text-white/55">{{ t('auth.showcaseDescription') }}</p>
      </div>
    </aside>

    <main class="auth-main">
      <header class="auth-mobile-brand">
        <router-link to="/" :aria-label="siteName">
          <SiteLogo :src="siteLogo" :title="siteName" class="h-9 max-w-48" />
        </router-link>
        <p class="mt-2 text-xs leading-5 text-gray-500 dark:text-dark-400">{{ siteSubtitle }}</p>
      </header>
      <div class="auth-content">
        <p class="mb-4 text-xs font-semibold tracking-[0.18em] text-primary-600 dark:text-primary-400">{{ t('auth.secureAccess') }}</p>
        <slot />
        <div v-if="$slots.footer" class="mt-7 text-center text-sm leading-6"><slot name="footer" /></div>
        <p class="mt-9 text-center text-xs leading-5 text-gray-400 dark:text-dark-500">&copy; {{ currentYear }} {{ siteName }}. All rights reserved.</p>
      </div>
    </main>
  </div>
  <div v-else class="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
    <!-- Background -->
    <div
      class="absolute inset-0 bg-gradient-to-br from-gray-50 via-primary-50/30 to-gray-100 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950"
    ></div>

    <!-- Decorative Elements -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <!-- Gradient Orbs -->
      <div
        class="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-primary-400/20 blur-3xl"
      ></div>
      <div
        class="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary-500/15 blur-3xl"
      ></div>
      <div
        class="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-300/10 blur-3xl"
      ></div>

      <!-- Grid Pattern -->
      <div
        class="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"
      ></div>
    </div>

    <!-- Content Container -->
    <div class="relative z-10 w-full max-w-md">
      <!-- Logo/Brand -->
      <div class="mb-8 text-center">
        <!-- Custom Logo or Default Logo -->
        <template v-if="settingsLoaded">
          <div
            class="mb-4 inline-flex h-16 items-center justify-center"
            :class="siteLogo ? 'w-16 overflow-hidden rounded-2xl shadow-lg shadow-primary-500/30' : 'max-w-full'"
          >
            <SiteLogo :src="siteLogo" :title="siteName" class="h-full max-w-full" :class="siteLogo ? 'w-full' : 'w-auto'" />
          </div>
          <!-- <h1 class="text-gradient mb-2 text-3xl font-bold">
            {{ siteName }}
          </h1> -->
          <p class="text-sm text-gray-500 dark:text-dark-400">
            {{ siteSubtitle }}
          </p>
        </template>
      </div>

      <!-- Card Container -->
      <div class="card-glass rounded-2xl p-8 shadow-glass">
        <slot />
      </div>

      <!-- Footer Links -->
      <div class="mt-6 text-center text-sm">
        <slot name="footer" />
      </div>

      <!-- Copyright -->
      <div class="mt-8 text-center text-xs text-gray-400 dark:text-dark-500">
        &copy; {{ currentYear }} {{ siteName }}. All rights reserved.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SiteLogo from '@/components/common/SiteLogo.vue'
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores'
import { sanitizeUrl } from '@/utils/url'
import apiGatewayIllustration from '@/assets/images/auth/api-gateway.svg'

const appStore = useAppStore()
defineProps<{ split?: boolean }>()
const { t } = useI18n()

const siteName = computed(() => appStore.siteName || 'Sub2API')
const siteLogo = computed(() => sanitizeUrl(appStore.siteLogo || '', { allowRelative: true, allowDataUrl: true }))
const siteSubtitle = computed(() => appStore.cachedPublicSettings?.site_subtitle || 'Subscription to API Conversion Platform')
const settingsLoaded = computed(() => appStore.publicSettingsLoaded)

const currentYear = computed(() => new Date().getFullYear())

onMounted(() => {
  appStore.fetchPublicSettings()
})
</script>

<style scoped>
:global(html:has(.auth-shell)) {
  overflow-y: scroll;
}

.auth-shell {
  @apply grid min-h-screen grid-cols-1 bg-white p-3 dark:bg-dark-950;
  min-height: 100dvh;
}

.auth-showcase {
  @apply relative hidden flex-col overflow-hidden rounded-3xl p-10 text-gray-900 lg:flex dark:text-white;
  /* 浅色：淡青绿底 */
  background: rgba(85, 181, 166, 0.12);
}

/* 深色：墨绿径向高光（勿用 :global(html…) 拆选择器，会误挂到 html 上） */
.dark .auth-showcase {
  background:
    radial-gradient(ellipse at 10% 5%, #181b32 0, transparent 25%),
    radial-gradient(ellipse at 100% 100%, #181b32 0, transparent 25%),
    #0f1121;
}

.auth-showcase::before {
  @apply pointer-events-none absolute inset-0;
  content: '';
  background-image:
    linear-gradient(rgba(15, 118, 110, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15, 118, 110, 0.06) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: linear-gradient(transparent, black, transparent);
}

.dark .auth-showcase::before {
  background-image:
    linear-gradient(#ffffff08 1px, transparent 1px),
    linear-gradient(90deg, #ffffff08 1px, transparent 1px);
}

.auth-visual {
  @apply relative my-5 w-full flex-1;
  min-height: 240px;
}

.auth-showcase-image {
  @apply pointer-events-none absolute inset-0 m-auto h-full w-auto max-w-full object-contain;
}

.auth-main { @apply flex min-w-0 flex-col px-5 py-7 sm:px-10; }
.auth-mobile-brand { @apply mb-12 lg:hidden; }
.auth-content { @apply mx-auto my-auto w-full max-w-md py-4; }
.auth-content :deep(.auth-heading) { @apply text-left; }
.auth-content :deep(.auth-heading h2) { @apply text-3xl font-semibold tracking-tight sm:text-4xl; }
.auth-content :deep(.auth-heading p) { @apply mt-3 leading-6; }
.auth-content :deep(.auth-navigation) { @apply grid grid-cols-2 gap-1 rounded-full bg-gray-100 p-1.5 dark:bg-dark-800; }
.auth-content :deep(.auth-navigation a) { @apply flex min-h-10 items-center justify-center gap-2 rounded-full text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 dark:text-dark-400 dark:hover:text-white; }
.auth-content :deep(.auth-navigation a[aria-current='page']) { @apply bg-white text-gray-900 shadow-sm dark:bg-dark-700 dark:text-white; }
.auth-content :deep(.input) { @apply min-h-12 rounded-full bg-gray-50 shadow-none dark:bg-dark-900; }
.auth-content :deep(.input:not(.input-error):not(.border-red-500):not(.border-green-500):not(:focus)) { @apply border-gray-200/50 dark:border-dark-600/50; }
.auth-content :deep(.input-label) { @apply mb-2 text-[13px]; }
.auth-content :deep(.input-hint) { @apply mt-2; }
.auth-content :deep(.btn) { @apply min-h-12 rounded-full; }
.auth-content :deep(.btn-primary) { @apply bg-none bg-primary-600 shadow-lg shadow-primary-600/15 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600; }

@media (min-width: 1024px) {
  .auth-shell { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; }
  .auth-showcase { position: sticky; top: 12px; height: calc(100dvh - 24px); min-height: 680px; }
  .auth-main { padding-top: 48px; padding-bottom: 48px; }
}

.text-gradient {
  @apply bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent;
}
</style>
