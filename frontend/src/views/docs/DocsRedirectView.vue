<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores'
import { resolveDocsUrl } from '@/utils/docsUrl'

const route = useRoute()
const appStore = useAppStore()
const { t, locale } = useI18n()

onMounted(() => {
  const slug = typeof route.query.doc === 'string' ? route.query.doc.trim() : ''
  const target = resolveDocsUrl(
    appStore.docUrl || appStore.cachedPublicSettings?.doc_url,
    slug,
    locale.value
  )
  window.location.replace(target)
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center px-4 text-sm text-gray-500 dark:text-dark-400">
    {{ t('home.viewDocs') }}…
  </div>
</template>
