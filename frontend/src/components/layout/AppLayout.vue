<template>
  <div
    data-test="console-layout"
    class="fixed inset-0 flex h-dvh flex-col overflow-hidden bg-gray-50 dark:bg-dark-950"
  >
    <!-- Background Decoration -->
    <div class="pointer-events-none fixed inset-0 bg-mesh-gradient"></div>

    <div class="relative z-50 shrink-0">
      <GlobalAnnouncementBar />
    </div>

    <div class="relative flex min-h-0 flex-1 overflow-hidden">
      <AppSidebar />
      <div class="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <AppHeader />
        <div
          data-test="console-scroll"
          class="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain"
        >
          <div class="shrink-0">
            <AnnouncementNoticeBar />
          </div>
          <main class="app-main shrink-0 p-4 md:p-6 lg:p-8">
            <slot />
          </main>
        </div>
      </div>
    </div>

    <!-- Floating customer support button (right edge, vertical drag) -->
    <SupportFloatButton />
  </div>
</template>

<script setup lang="ts">
import '@/styles/onboarding.css'
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useOnboardingTour } from '@/composables/useOnboardingTour'
import { useOnboardingStore } from '@/stores/onboarding'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import SupportFloatButton from './SupportFloatButton.vue'
import AnnouncementNoticeBar from '@/components/common/AnnouncementNoticeBar.vue'
import GlobalAnnouncementBar from '@/components/common/GlobalAnnouncementBar.vue'

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.user?.role === 'admin')

const { replayTour } = useOnboardingTour({
  storageKey: isAdmin.value ? 'admin_guide' : 'user_guide',
  autoStart: true
})

const onboardingStore = useOnboardingStore()

onMounted(() => {
  onboardingStore.setReplayCallback(replayTour)
})

defineExpose({ replayTour })
</script>

<style scoped>
.app-main:has(> .custom-page-layout) {
  flex: 1 1 0%;
  min-height: 0;
}

@media (min-width: 1024px) {
  .app-main:has(> .table-page-layout) {
    flex: 1 1 0%;
    min-height: 0;
  }
}
</style>
