<template>
  <div class="flex h-screen min-h-0 flex-col bg-gray-50 text-gray-900 dark:bg-dark-950 dark:text-gray-100">
    <header class="shrink-0 border-b border-gray-200 dark:border-white/10">
      <div class="mx-auto flex h-16 w-full max-w-[1288px] items-center gap-3 px-4 sm:px-6">
        <router-link to="/home" class="flex min-w-0 shrink-0 items-center gap-2.5">
          <img :src="siteLogo || '/logo.svg'" alt="" class="h-8 w-8 object-contain" />
          <span class="truncate text-sm font-medium">{{ siteName }}</span>
        </router-link>
        <nav class="hidden min-w-0 flex-1 items-center justify-end gap-1 lg:flex" :aria-label="t('docsCenter.nav')">
          <button
            v-for="item in DOCS_NAV"
            :key="item.id"
            type="button"
            class="shrink-0 rounded-md px-3 py-1.5 text-sm"
            :class="item.id === selectedId ? 'bg-primary-500/15 font-medium text-primary-700 dark:text-primary-200' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-100'"
            :aria-current="item.id === selectedId ? 'page' : undefined"
            @click="selectDoc(item.id)"
          >
            {{ item.label }}
          </button>
          <router-link
            :to="homeLink"
            class="hidden shrink-0 rounded-md px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 lg:inline-flex dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-100"
          >{{ consoleLabel }}</router-link>
        </nav>
        <div class="ml-auto flex items-center gap-1 lg:ml-1">
          <select class="max-w-36 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm lg:hidden dark:border-white/10 dark:bg-white/5" :value="selectedId" :aria-label="t('docsCenter.nav')" @change="selectDoc(($event.target as HTMLSelectElement).value)">
            <option v-for="item in DOCS_NAV" :key="item.id" :value="item.id">{{ item.label }}</option>
          </select>
          <router-link
            :to="homeLink"
            class="rounded-md px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 lg:hidden dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-100"
          >{{ consoleLabel }}</router-link>
          <button type="button" class="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5" :title="isDark ? t('nav.lightMode') : t('nav.darkMode')" @click="toggleTheme">
            <Icon :name="isDark ? 'sun' : 'moon'" size="sm" />
          </button>
        </div>
      </div>
    </header>

    <div class="mx-auto flex min-h-0 w-full max-w-[1248px] flex-1 flex-col px-4 sm:px-6">
      <div class="grid min-h-0 flex-1 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[17rem_minmax(0,1fr)] xl:gap-12">
        <aside class="hidden min-h-0 overflow-y-auto py-8 lg:block">
          <p class="mb-4 px-3 text-[11px] tracking-[0.16em] text-gray-400 uppercase">{{ t('docsCenter.toc') }}</p>
          <DocsToc :headings="headings" :active-id="activeHeadingId" @select="scrollToHeading" />
        </aside>
        <div class="flex min-h-0 min-w-0 flex-col">
          <div class="py-3 lg:hidden">
            <button type="button" class="flex w-full items-center justify-between rounded-md bg-white px-4 py-3 text-sm dark:bg-white/5" @click="mobileTocOpen = !mobileTocOpen">
              <span>{{ t('docsCenter.tocMobile') }}</span>
              <span class="text-gray-400">{{ mobileTocOpen ? '−' : '+' }}</span>
            </button>
            <div v-if="mobileTocOpen" class="mt-2 max-h-[40vh] overflow-y-auto rounded-md bg-white p-2 dark:bg-white/5">
              <DocsToc :headings="headings" :active-id="activeHeadingId" @select="scrollToHeading" />
            </div>
          </div>
          <main ref="contentRef" class="min-h-0 flex-1 overflow-y-auto py-8">
            <article v-if="selectedDoc">
              <header class="border-b border-gray-200 pb-6 dark:border-white/10">
                <p v-if="selectedDoc.frontmatter.eyebrow" class="mb-4 flex items-center gap-2 text-xs font-medium text-primary-600 dark:text-primary-300">
                  <span class="size-1.5 rounded-full bg-primary-500"></span>
                  {{ selectedDoc.frontmatter.eyebrow }}
                </p>
                <h1 class="text-3xl font-semibold tracking-tight text-gray-950 dark:text-white md:text-4xl">{{ selectedDoc.frontmatter.title }}</h1>
                <p v-if="selectedDoc.frontmatter.description" class="mt-4 max-w-2xl text-sm leading-7 text-gray-500 dark:text-gray-400 md:text-base">{{ selectedDoc.frontmatter.description }}</p>
              </header>
              <div class="docs-markdown py-8" @click="onContentClick" v-html="renderedBody"></div>
            </article>
          </main>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/icons/Icon.vue'
import { useAppStore, useAuthStore } from '@/stores'
import { sanitizeUrl } from '@/utils/url'
import { DEFAULT_DOC_ID, DOCS_NAV, getDocsItem, loadAllDocs } from './docsConfig'
import { extractMarkdownHeadings, renderDocsMarkdown, type DocHeading } from './docsMarkdown'

const DocsToc = defineComponent({
  name: 'DocsToc',
  props: {
    headings: { type: Array as () => DocHeading[], required: true },
    activeId: { type: String, default: '' }
  },
  emits: ['select'],
  setup(props, { emit }) {
    const { t } = useI18n()
    return () => {
      if (!props.headings.length) return h('p', { class: 'px-3 py-2 text-xs text-gray-400' }, t('docsCenter.emptyToc'))
      return h('nav', { 'aria-label': t('docsCenter.toc'), class: 'space-y-0.5' }, props.headings.map((heading) => h('button', {
        key: heading.id,
        type: 'button',
        class: [
          'block w-full rounded-md py-2 text-left text-sm transition-colors',
          heading.depth <= 1 ? 'pl-3 font-medium' : heading.depth === 2 ? 'pl-8 text-[13px]' : 'pl-12 text-xs',
          heading.id === props.activeId
            ? 'bg-primary-500/15 text-primary-700 dark:text-primary-200'
            : heading.depth <= 1
              ? 'text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-white/5'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-500 dark:hover:bg-white/5 dark:hover:text-gray-200'
        ],
        onClick: () => emit('select', heading.id)
      }, heading.text)))
    }
  }
})

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()
const docs = loadAllDocs()
const isDark = ref(document.documentElement.classList.contains('dark'))
const selectedId = ref(DEFAULT_DOC_ID)
const mobileTocOpen = ref(false)
const activeHeadingId = ref('')
const contentRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null
let clickLock = false
let clickTimer = 0

const siteName = computed(() => appStore.cachedPublicSettings?.site_name || appStore.siteName || 'Sub2API')
const siteLogo = computed(() => sanitizeUrl(appStore.cachedPublicSettings?.site_logo || appStore.siteLogo || '', { allowRelative: true, allowDataUrl: true }))
const homeLink = computed(() => (authStore.isAuthenticated ? (authStore.isAdmin ? '/admin/dashboard' : '/dashboard') : '/login'))
const consoleLabel = computed(() => (authStore.isAuthenticated ? t('docsCenter.console') : t('home.login')))

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}
const selectedDoc = computed(() => docs[selectedId.value] ?? docs[DEFAULT_DOC_ID])
const headings = computed(() => extractMarkdownHeadings(selectedDoc.value?.body ?? ''))
const renderedBody = computed(() => renderDocsMarkdown(selectedDoc.value?.body ?? ''))

function selectDoc(id: string) {
  if (!getDocsItem(id)) return
  selectedId.value = id
  mobileTocOpen.value = false
  void router.replace({ query: { ...route.query, doc: id } })
}

function scrollToHeading(id: string) {
  const container = contentRef.value
  const target = container?.querySelector<HTMLElement>(`#${CSS.escape(id)}`)
  if (!container || !target) return
  activeHeadingId.value = id
  mobileTocOpen.value = false
  clickLock = true
  window.clearTimeout(clickTimer)
  const top = target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - 12
  container.scrollTo({ top, behavior: 'smooth' })
  clickTimer = window.setTimeout(() => {
    clickLock = false
  }, 600)
}

function onContentClick(event: MouseEvent) {
  const anchor = (event.target as HTMLElement | null)?.closest('a')
  const href = anchor?.getAttribute('href') || ''
  if (!href || href.startsWith('#')) return
  if (href.startsWith('?doc=')) {
    event.preventDefault()
    const id = new URLSearchParams(href.slice(1)).get('doc')
    if (id) selectDoc(id)
    return
  }
  if (href.startsWith('/') && !href.startsWith('//')) {
    event.preventDefault()
    void router.push(href)
  }
}

function bindObserver() {
  observer?.disconnect()
  const container = contentRef.value
  if (!container || !headings.value.length) return
  observer = new IntersectionObserver((entries) => {
    if (clickLock) return
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
    const id = visible[0]?.target.id
    if (id) activeHeadingId.value = id
  }, { root: container, rootMargin: '-8% 0px -72% 0px', threshold: [0, 0.25, 1] })
  for (const heading of headings.value) {
    const el = container.querySelector(`#${CSS.escape(heading.id)}`)
    if (el) observer.observe(el)
  }
}

watch(selectedId, async () => {
  activeHeadingId.value = headings.value[0]?.id ?? ''
  await nextTick()
  if (contentRef.value) contentRef.value.scrollTop = 0
  bindObserver()
})

watch(() => route.query.doc, (value) => {
  const id = typeof value === 'string' ? value : ''
  if (id && getDocsItem(id) && id !== selectedId.value) selectedId.value = id
})

onMounted(async () => {
  const queryId = typeof route.query.doc === 'string' ? route.query.doc : ''
  if (queryId && getDocsItem(queryId)) selectedId.value = queryId
  activeHeadingId.value = headings.value[0]?.id ?? ''
  if (!appStore.publicSettingsLoaded) await appStore.fetchPublicSettings()
  await nextTick()
  bindObserver()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  window.clearTimeout(clickTimer)
})
</script>

<style scoped>
.docs-markdown {
  line-height: 1.75;
  overflow-wrap: anywhere;
}

.docs-markdown :deep(h1) { @apply mb-4 mt-10 text-2xl font-semibold text-gray-950 dark:text-white; }
.docs-markdown :deep(h2) { @apply mb-3 mt-9 text-xl font-semibold text-gray-950 dark:text-white; }
.docs-markdown :deep(h3) { @apply mb-2 mt-6 pl-1 text-base font-medium text-gray-800 dark:text-gray-200; }
.docs-markdown :deep(h4) { @apply mb-2 mt-5 pl-1 text-sm font-medium text-gray-700 dark:text-gray-300; }
.docs-markdown :deep(p) { @apply mb-4 text-gray-600 dark:text-gray-300; }
.docs-markdown :deep(a) { @apply text-primary-600 underline decoration-primary-600/40 underline-offset-4 hover:text-primary-500 dark:text-primary-300; }
.docs-markdown :deep(ul) { @apply mb-4 list-disc space-y-1 pl-6; }
.docs-markdown :deep(ol) { @apply mb-4 list-decimal space-y-1 pl-6; }
.docs-markdown :deep(li) { @apply text-gray-600 dark:text-gray-300; }
.docs-markdown :deep(li > ul),
.docs-markdown :deep(li > ol) { @apply mb-1 mt-1; }
.docs-markdown :deep(code) { @apply rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm dark:bg-dark-800; }
.docs-markdown :deep(pre) { @apply my-5 overflow-x-auto rounded-lg bg-gray-950 p-4 text-gray-100; }
.docs-markdown :deep(pre code) { @apply bg-transparent p-0 text-inherit; }
.docs-markdown :deep(table) { @apply my-5 block w-full overflow-x-auto border-collapse; }
.docs-markdown :deep(th) { @apply border border-gray-300 bg-gray-50 px-3 py-2 text-left font-semibold dark:border-dark-600 dark:bg-dark-800; }
.docs-markdown :deep(td) { @apply border border-gray-300 px-3 py-2 dark:border-dark-600; }
.docs-markdown :deep(img) { @apply my-5 h-auto max-w-full rounded-lg; }
.docs-markdown :deep(blockquote) { @apply my-5 border-l-4 border-gray-300 pl-4 text-gray-600 dark:border-dark-600 dark:text-dark-300; }
</style>
