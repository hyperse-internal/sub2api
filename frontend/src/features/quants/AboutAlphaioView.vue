<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppLayout from '@/components/layout/AppLayout.vue'

const { t } = useI18n()
const sections = ['capabilities', 'integration', 'ai', 'subscriptions', 'service', 'boundaries'] as const
const domains = ['market', 'capital', 'limit', 'chips', 'index', 'news', 'rules', 'tools'] as const
const integrations = ['web', 'graphql', 'rest', 'mcp'] as const
const plans = ['single', 'bundle', 'slots', 'usage'] as const
const prices = [
  { days: 30, economy: 59, standard: 79 },
  { days: 90, economy: 156, standard: 209 },
  { days: 180, economy: 276, standard: 370 }
]
</script>

<template>
  <AppLayout>
    <div class="about-alphaio mx-auto max-w-7xl" data-test="about-alphaio">
      <header class="alpha-hero">
        <div class="hero-copy">
        <p class="text-xs font-semibold tracking-widest text-primary-700 dark:text-primary-400">{{ t('aboutAlphaio.eyebrow') }}</p>
        <div class="hero-brand" aria-label="AlphaIO">Alpha<span>IO</span></div>
        <h1 class="mt-4 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white sm:text-4xl">{{ t('aboutAlphaio.headline') }}</h1>
        <p class="mt-5 max-w-3xl text-base leading-8 text-gray-600 dark:text-gray-300">{{ t('aboutAlphaio.intro') }}</p>
        <div class="mt-6 flex flex-wrap gap-3">
          <a href="https://www.alphaio.vip/" target="_blank" rel="noopener noreferrer" class="rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700">{{ t('aboutAlphaio.website') }}</a>
          <router-link to="/quant-models" class="rounded-xl border border-primary-200 bg-white px-5 py-3 text-sm font-semibold text-primary-700 dark:border-dark-600 dark:bg-dark-800 dark:text-primary-300">{{ t('aboutAlphaio.models') }}</router-link>
        </div>
        </div>
        <div class="hero-display">
        <div class="display-toolbar" aria-hidden="true"><span></span><span></span><span></span><span class="display-brand">portal://daily-bar</span></div>
        <div class="chart-preview">
          <div class="chart-heading">
            <div><h3>{{ t('aboutAlphaio.chart.title') }}</h3><p>{{ t('aboutAlphaio.chart.caption') }}</p></div>
            <span>tradeDate 2026-07-21</span>
          </div>
          <svg viewBox="0 0 200 110" class="daily-chart" role="img" :aria-label="t('aboutAlphaio.chart.title')">
            <line x1="8" y1="88" x2="192" y2="88" stroke="currentColor" class="chart-baseline" />
            <g v-for="(height, index) in [42, 28, 52, 36, 48, 58, 34, 46]" :key="index" :class="[1, 4, 6].includes(index) ? 'chart-neutral' : 'chart-primary'">
              <line :x1="24 + index * 20" :y1="80 - height" :x2="24 + index * 20" y2="94" stroke="currentColor" stroke-width="1.5" opacity="0.7" />
              <rect :x="18 + index * 20" :y="88 - height" width="12" :height="height" rx="1.5" fill="currentColor" />
            </g>
            <text x="8" y="106" class="chart-label">{{ t('aboutAlphaio.chart.note') }}</text>
          </svg>
        </div>
        </div>
        <dl class="hero-stats">
          <div v-for="stat in [{ key: 'domains', value: '8+' }, { key: 'features', value: '45+' }, { key: 'apis', value: '40+' }]" :key="stat.key">
            <dt class="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">{{ t(`aboutAlphaio.stats.${stat.key}`) }}</dt>
            <dd class="mt-2 text-3xl font-semibold tabular-nums text-gray-900 dark:text-white">{{ stat.value }}</dd>
          </div>
        </dl>
        <p class="mt-4 text-xs leading-6 text-gray-500 dark:text-gray-400">{{ t('aboutAlphaio.reviewed') }} · {{ t('aboutAlphaio.stats.note') }}</p>
      </header>

      <nav :aria-label="t('aboutAlphaio.contents')" class="section-nav">
        <a v-for="(section, index) in sections" :key="section" :href="`#${section}`"><span aria-hidden="true">0{{ index + 1 }}</span>{{ t(`aboutAlphaio.sections.${section}`) }}</a>
      </nav>

      <section id="capabilities" class="scroll-mt-24">
        <h2>{{ t('aboutAlphaio.sections.capabilities') }}</h2>
        <p class="section-intro">{{ t('aboutAlphaio.capabilitiesIntro') }}</p>
        <div class="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2 xl:grid-cols-4">
          <article v-for="(domain, index) in domains" :key="domain" class="domain-item">
            <span class="text-xs font-medium tabular-nums text-primary-600/70 dark:text-primary-400/70">0{{ index + 1 }}</span>
            <div>
              <h3>{{ t(`aboutAlphaio.domains.${domain}.title`) }}</h3>
              <p class="detail-copy">{{ t(`aboutAlphaio.domains.${domain}.body`) }}</p>
            </div>
          </article>
        </div>
      </section>

      <section id="integration" class="scroll-mt-24">
        <h2>{{ t('aboutAlphaio.sections.integration') }}</h2>
        <p class="section-intro">{{ t('aboutAlphaio.integrationIntro') }}</p>
        <div class="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2 xl:grid-cols-4">
          <article v-for="(integration, index) in integrations" :key="integration" class="integration-item">
            <span class="integration-step" aria-hidden="true">0{{ index + 1 }} <span>↗</span></span>
            <span class="text-xs font-medium text-primary-600 dark:text-primary-400">{{ t(`aboutAlphaio.integrations.${integration}.tag`) }}</span>
            <h3 class="mt-2">{{ t(`aboutAlphaio.integrations.${integration}.title`) }}</h3>
            <p class="detail-copy">{{ t(`aboutAlphaio.integrations.${integration}.body`) }}</p>
          </article>
        </div>
        <p class="section-intro">{{ t('aboutAlphaio.integrationNote') }}</p>
        <a class="section-link" href="https://www.alphaio.vip/docs" target="_blank" rel="noopener noreferrer">{{ t('aboutAlphaio.docsLink') }}</a>
      </section>

      <section id="ai" class="ai-section scroll-mt-24">
        <h2>{{ t('aboutAlphaio.sections.ai') }}</h2>
        <p class="section-intro">{{ t('aboutAlphaio.aiIntro') }}</p>
        <div class="mt-7 grid gap-7 lg:grid-cols-3 lg:gap-8">
          <article v-for="item in ['agent', 'brief', 'hermes']" :key="item">
            <h3>{{ t(`aboutAlphaio.ai.${item}.title`) }}</h3>
            <p class="detail-copy">{{ t(`aboutAlphaio.ai.${item}.body`) }}</p>
          </article>
        </div>
      </section>

      <section id="subscriptions" class="scroll-mt-24">
        <h2>{{ t('aboutAlphaio.sections.subscriptions') }}</h2>
        <p class="section-intro">{{ t('aboutAlphaio.subscriptionsIntro') }}</p>
        <div class="mt-8 grid items-start gap-10 xl:grid-cols-[1.2fr_1fr]">
        <div class="grid gap-x-8 gap-y-7 sm:grid-cols-2">
          <article v-for="plan in plans" :key="plan">
            <h3>{{ t(`aboutAlphaio.plans.${plan}.title`) }}</h3>
            <span class="mt-2 inline-block text-xs font-medium text-primary-700 dark:text-primary-300">{{ t(`aboutAlphaio.plans.${plan}.unit`) }}</span>
            <p class="detail-copy">{{ t(`aboutAlphaio.plans.${plan}.body`) }}</p>
          </article>
        </div>
        <div class="pricing-panel rounded-2xl p-5 sm:p-6">
          <h3>{{ t('aboutAlphaio.pricingTitle') }}</h3>
          <table class="mt-4 w-full text-left text-sm tabular-nums">
            <thead class="border-b border-gray-200 text-gray-500 dark:border-dark-700 dark:text-gray-400">
              <tr><th class="pb-3 font-medium" scope="col">{{ t('aboutAlphaio.period') }}</th><th class="pb-3 font-medium" scope="col">{{ t('aboutAlphaio.economy') }}</th><th class="pb-3 font-medium" scope="col">{{ t('aboutAlphaio.standard') }}</th></tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-gray-800 dark:divide-dark-700 dark:text-gray-200">
              <tr v-for="price in prices" :key="price.days"><th class="py-3 font-medium" scope="row">{{ t('aboutAlphaio.days', { count: price.days }) }}</th><td>¥{{ price.economy }}</td><td>¥{{ price.standard }}</td></tr>
            </tbody>
          </table>
          <p class="detail-copy">{{ t('aboutAlphaio.pricingNote') }}</p>
        </div>
        </div>
        <p class="section-intro">{{ t('aboutAlphaio.previewNote') }}</p>
        <a class="section-link" href="https://www.alphaio.vip/features" target="_blank" rel="noopener noreferrer">{{ t('aboutAlphaio.plansLink') }}</a>
      </section>

      <section id="service" class="scroll-mt-24">
        <h2>{{ t('aboutAlphaio.sections.service') }}</h2>
        <div class="mt-7 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <article class="service-column">
            <h3>{{ t('aboutAlphaio.supportTitle') }}</h3>
            <p class="font-medium">{{ t('aboutAlphaio.supportHours') }}</p>
            <p>{{ t('aboutAlphaio.supportBody') }}</p>
            <div class="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-800 dark:text-gray-200"><span>QQ · 953262712</span><a href="mailto:hi@alphaio.vip" class="underline underline-offset-4">hi@alphaio.vip</a></div>
            <p>{{ t('aboutAlphaio.supportLimit') }}</p>
            <a class="section-link" href="https://www.alphaio.vip/contact" target="_blank" rel="noopener noreferrer">{{ t('aboutAlphaio.contact') }}</a>
          </article>
          <article class="service-column">
            <h3>{{ t('aboutAlphaio.documentationTitle') }}</h3>
            <p>{{ t('aboutAlphaio.documentationBody') }}</p>
            <p>{{ t('aboutAlphaio.documentationLimit') }}</p>
            <a class="section-link" href="https://www.alphaio.vip/docs" target="_blank" rel="noopener noreferrer">{{ t('aboutAlphaio.docsLink') }}</a>
          </article>
        </div>
      </section>

      <section id="boundaries" class="scroll-mt-24 border-t border-gray-200 pt-8 dark:border-dark-700">
        <h2>{{ t('aboutAlphaio.sections.boundaries') }}</h2>
        <div class="mt-5 grid gap-6 lg:grid-cols-3">
          <div v-for="item in ['scope', 'qmt', 'quota']" :key="item">
            <h3>{{ t(`aboutAlphaio.boundaries.${item}.title`) }}</h3>
            <p class="section-intro">{{ t(`aboutAlphaio.boundaries.${item}.body`) }}</p>
          </div>
        </div>
      </section>

      <footer class="border-t border-gray-200 py-6 text-xs leading-6 text-gray-500 dark:border-dark-700 dark:text-gray-400">
        <p>{{ t('aboutAlphaio.disclaimer') }}</p>
        <p>{{ t('aboutAlphaio.source') }}</p>
        <div class="mt-3 flex flex-wrap gap-5">
          <a href="https://www.alphaio.vip/docs/agreement" target="_blank" rel="noopener noreferrer" class="underline underline-offset-4">{{ t('aboutAlphaio.agreement') }}</a>
          <a href="https://www.alphaio.vip/faq" target="_blank" rel="noopener noreferrer" class="underline underline-offset-4">{{ t('aboutAlphaio.faq') }}</a>
        </div>
      </footer>
    </div>
  </AppLayout>
</template>

<style scoped>
.about-alphaio {
  --alpha-ink: theme('colors.gray.900');
  --alpha-muted: theme('colors.gray.500');
  --alpha-line: theme('colors.gray.200');
  --alpha-primary: theme('colors.primary.600');
  --alpha-soft: color-mix(in srgb, var(--alpha-primary) 6%, transparent);
  --alpha-surface: theme('colors.white');
  color: var(--alpha-ink);
}
:global(.dark .about-alphaio) {
  --alpha-ink: theme('colors.gray.100');
  --alpha-muted: theme('colors.gray.400');
  --alpha-line: theme('colors.dark.700');
  --alpha-primary: theme('colors.primary.400');
  --alpha-soft: color-mix(in srgb, var(--alpha-primary) 5%, transparent);
  --alpha-surface: theme('colors.dark.900');
}
.alpha-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  align-items: center;
  gap: 32px;
  padding-top: 12px;
}
.alpha-hero > p, .hero-stats { grid-column: 1 / -1; }
.alpha-hero > p { margin-top: -16px; }
.hero-brand {
  margin-top: 24px;
  font-size: clamp(44px, 5vw, 72px);
  font-weight: 650;
  letter-spacing: -4px;
  line-height: 1.15;
}
.hero-brand span { color: var(--alpha-primary); }
.about-alphaio .hero-copy h1 {
  color: var(--alpha-ink);
  font-size: clamp(24px, 2.5vw, 36px);
  line-height: 1.4;
  font-weight: 600;
}
.hero-copy a { border-radius: 999px; }
.hero-display {
  min-width: 0;
  border: 1px solid var(--alpha-line);
  border-radius: 26px;
  background: radial-gradient(ellipse at 50% 0%, var(--alpha-soft), transparent 75%), var(--alpha-surface);
  overflow: hidden;
}
.display-toolbar {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--alpha-line);
}
.display-toolbar > span:not(.display-brand) {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--alpha-line);
}
.display-toolbar > span:nth-child(3) { background: var(--alpha-primary); }
.display-brand { margin-left: 10px; font: 11px monospace; color: var(--alpha-muted); }
.chart-preview { padding: 24px; }
.chart-heading { display: flex; align-items: end; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.chart-heading p { margin-top: 4px; font-size: 12px; }
.chart-heading > span { font: 10px monospace; color: var(--alpha-primary); }
.daily-chart { width: 100%; height: 220px; margin-top: 12px; }
.chart-primary { color: var(--alpha-primary); }
.chart-neutral { color: var(--alpha-muted); opacity: 0.5; }
.chart-baseline { color: var(--alpha-line); }
.chart-label { fill: var(--alpha-muted); font-size: 9px; }
.hero-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); padding-top: 24px; gap: 16px; border-top: 1px solid var(--alpha-line); }
.hero-stats > div { display: flex; flex-direction: column-reverse; gap: 8px; }
.hero-stats dd { margin: 0; }
.section-nav { display: flex; flex-wrap: wrap; gap: 12px 26px; padding: 24px 0; margin-top: 28px; border-block: 1px solid var(--alpha-line); }
.section-nav a { display: flex; gap: 7px; align-items: center; color: var(--alpha-muted); font-size: 13px; padding-block: 4px; transition: color 180ms; }
.section-nav a span { font: 10px monospace; color: var(--alpha-primary); }
.section-nav a:hover { color: var(--alpha-primary); }
.about-alphaio > section { margin-block: 64px; scroll-margin-top: 100px; }
.about-alphaio h2 { color: var(--alpha-ink); font-size: clamp(24px, 2.5vw, 32px); font-weight: 600; letter-spacing: -0.03em; }
.about-alphaio h3 { color: var(--alpha-ink); font-size: 16px; font-weight: 600; }
.section-intro { margin-top: 12px; font-size: 14px; line-height: 1.9; }
.domain-item { display: flex; align-items: baseline; gap: 12px; padding-top: 18px; border-top: 1px solid var(--alpha-line); }
.detail-copy, .service-column p { margin-top: 8px; font-size: 14px; line-height: 1.9; }
.service-column { padding-top: 20px; border-top: 1px solid var(--alpha-line); }
.section-link { display: inline-block; margin-top: 16px; color: var(--alpha-primary); font-size: 14px; font-weight: 500; text-underline-offset: 5px; }
.section-link:hover { text-decoration: underline; }
.about-alphaio p, .about-alphaio dt, .about-alphaio footer, .about-alphaio thead { color: var(--alpha-muted); }
.about-alphaio .hero-copy > p:first-child { color: var(--alpha-primary); }
.about-alphaio dd, .about-alphaio tbody, .about-alphaio .service-column > div { color: var(--alpha-ink); }
.about-alphaio article > span, .domain-item > span { color: var(--alpha-primary); }
.about-alphaio footer, .about-alphaio #boundaries, .about-alphaio thead, .about-alphaio tbody > tr { border-color: var(--alpha-line); }
.integration-item { padding-top: 18px; border-top: 1px solid var(--alpha-line); }
.integration-step { display: flex; justify-content: space-between; margin-bottom: 22px; font: 24px monospace; }
.integration-step > span { font-size: 20px; color: var(--alpha-primary); }
.ai-section { padding-block: 32px; border-block: 1px solid var(--alpha-line); background: radial-gradient(ellipse at 50% 50%, var(--alpha-soft), transparent 75%); }
.pricing-panel { border: 1px solid var(--alpha-line); background: var(--alpha-surface); }
.about-alphaio .pricing-panel tbody td { font-size: 18px; }
.about-alphaio a:focus-visible { outline: 2px solid var(--alpha-primary); outline-offset: 5px; border-radius: 4px; }
@media (max-width: 1023px) {
  .alpha-hero { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 639px) {
  .alpha-hero { padding-top: 0; gap: 24px; }
  .about-alphaio > section { margin-block: 44px; }
  .hero-brand { margin-top: 20px; }
  .hero-stats dt { font-size: 11px; }
  .section-nav { gap: 10px 18px; }
  .chart-preview { padding: 20px; }
  .daily-chart { height: 180px; }
  .ai-section { padding-block: 24px; }
}
@media (prefers-reduced-motion: reduce) {
  .about-alphaio a { transition: none; }
}
</style>
