import type { Route } from './+types/home';
import { Link } from 'react-router';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import {
  ArrowRight,
  BookOpen,
  CircleQuestionMark,
  Image,
  KeyRound,
  Sparkles,
  Terminal,
  UserRound,
  Wallet,
  Waypoints,
} from 'lucide-react';
import { Logo } from '~/components/Logo';
import { getHomeCopy } from '~/home-copy';
import {
  baseOptions,
  legalDocumentUrl,
  siteConfig,
  toolsHomePath,
} from '~/layout.config';
import { i18n } from '~/i18n';

export function meta({ params }: Route.MetaArgs) {
  const lang = params.lang ?? i18n.defaultLanguage;
  const isCn = lang === 'cn';
  return [
    {
      title: isCn
        ? `${siteConfig.name} — ${siteConfig.slogan.cn}`
        : `${siteConfig.name} — ${siteConfig.slogan.en}`,
    },
    {
      name: 'description',
      content: isCn ? siteConfig.description.cn : siteConfig.description.en,
    },
  ];
}

function docsPath(localePrefix: string, slug = '') {
  return slug ? `${localePrefix}/docs/${slug}` : `${localePrefix}/docs`;
}

const guideIcons: Record<string, typeof BookOpen> = {
  'account/register': UserRound,
  'billing/topup': Wallet,
  'tools/cc-switch': Terminal,
  'ai/agent-skills': Sparkles,
  'image-generation': Image,
  faq: CircleQuestionMark,
};

const topicIcons: Record<string, typeof BookOpen> = {
  relay: KeyRound,
  switch: Waypoints,
  skills: Sparkles,
  studio: Image,
};

export default function Home(props: Route.ComponentProps) {
  const { lang = i18n.defaultLanguage } = props.params;
  const localePrefix =
    i18n.hideLocale === 'default-locale' && lang === i18n.defaultLanguage
      ? ''
      : `/${lang}`;
  const t = getHomeCopy(lang);
  const isCn = lang === 'cn';
  const year = new Date().getFullYear();
  const docsHome = docsPath(localePrefix);
  const consoleLogin = `${siteConfig.url}/login`;
  const keyUsage = `${siteConfig.url}/key-usage`;
  const legalLinks = siteConfig.legalLinks.map((item) => ({
    href: legalDocumentUrl(item.id),
    label: isCn ? item.cn : item.en,
  }));

  return (
    <HomeLayout {...baseOptions(lang)} className="home-page py-0">
      {/* Hero — brand + docs entry */}
      <section className="home-hero relative overflow-hidden px-4 pb-14 pt-16 text-center sm:pt-20">
        <div className="home-hero-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-3xl">
          <p className="home-eyebrow">{t.eyebrow}</p>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl md:text-[2.75rem]">
            {t.title}
            <br />
            <span className="home-accent-text">{t.titleEnd}</span>
          </h1>
          <p className="text-fd-muted-foreground mx-auto mt-5 max-w-2xl text-base leading-relaxed sm:text-lg">
            {t.description}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to={docsHome} className="home-pill home-pill-primary">
              {t.ctaDocs}
              <BookOpen className="size-4" />
            </Link>
            <Link to={docsPath(localePrefix, 'account/register')} className="home-pill">
              {t.ctaStart}
              <ArrowRight className="size-4" />
            </Link>
            <a href={consoleLogin} target="_blank" rel="noreferrer" className="home-pill">
              {t.ctaConsole}
            </a>
          </div>
        </div>
      </section>

      {/* Doc guides — mirror docs sidebar topics */}
      <section
        className="mx-auto max-w-5xl px-4 py-14 sm:py-16"
        aria-labelledby="guides-title"
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="home-eyebrow">{t.guidesLabel}</p>
          <h2 id="guides-title" className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
            {t.guidesTitle}
          </h2>
          <p className="text-fd-muted-foreground mt-3 text-sm sm:text-base">
            {t.guidesDescription}
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.guides.map((guide) => {
            const Icon = guideIcons[guide.slug] ?? BookOpen;
            return (
              <Link
                key={guide.slug}
                to={docsPath(localePrefix, guide.slug)}
                className="home-glass home-guide-card group flex flex-col p-5 text-left transition-colors hover:border-[color:var(--home-accent)]"
              >
                <Icon className="text-fd-muted-foreground size-5 transition-colors group-hover:text-[color:var(--home-accent)]" />
                <h3 className="mt-4 text-base font-medium">{guide.title}</h3>
                <p className="text-fd-muted-foreground mt-2 flex-1 text-sm leading-relaxed">
                  {guide.description}
                </p>
                <span className="home-text-link mt-4 inline-flex">
                  <ArrowRight className="size-3.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Doc-covered capabilities */}
      <section
        className="mx-auto max-w-5xl px-4 py-10 sm:py-14"
        aria-labelledby="topics-title"
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="home-eyebrow">{t.topicsLabel}</p>
          <h2 id="topics-title" className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
            {t.topicsTitle}
          </h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {t.topics.map((topic) => {
            const Icon = topicIcons[topic.id] ?? BookOpen;
            return (
              <article key={topic.id} className="home-glass flex flex-col p-6 text-left">
                <div className="home-icon-disc grid size-11 place-items-center rounded-full">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-4 text-lg font-medium">{topic.title}</h3>
                <p className="text-fd-muted-foreground mt-2 flex-1 text-sm leading-relaxed">
                  {topic.description}
                </p>
                <Link
                  to={docsPath(localePrefix, topic.slug)}
                  className="home-text-link mt-5 inline-flex"
                >
                  {topic.action}
                  <ArrowRight className="size-3.5" />
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      {/* Reading path */}
      <section
        className="mx-auto max-w-5xl px-4 py-10 sm:py-14"
        aria-labelledby="path-title"
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="home-eyebrow">{t.pathLabel}</p>
          <h2 id="path-title" className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
            {t.pathTitle}
          </h2>
        </div>
        <ol className="mt-10 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {t.pathSteps.map((step) => (
            <li key={step.slug}>
              <Link
                to={docsPath(localePrefix, step.slug)}
                className="home-glass flex h-full flex-col p-5 text-left transition-colors hover:border-[color:var(--home-accent)]"
              >
                <span className="font-mono text-xs tracking-widest text-[color:var(--home-accent)]">
                  {step.n}
                </span>
                <span className="mt-3 text-sm font-medium leading-snug">{step.title}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* Closing */}
      <section className="home-closing relative px-4 py-16 text-center sm:py-20">
        <div className="home-closing-glow pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-2xl">
          <div className="home-icon-disc mx-auto grid size-14 place-items-center rounded-full">
            <BookOpen className="size-6" />
          </div>
          <h2 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
            {t.closingTitle}
          </h2>
          <p className="text-fd-muted-foreground mx-auto mt-4 max-w-xl text-sm sm:text-base">
            {t.closingDescription}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to={docsHome} className="home-pill home-pill-primary">
              {t.ctaDocs}
              <ArrowRight className="size-4" />
            </Link>
            <Link to={docsPath(localePrefix, 'tools/cc-switch')} className="home-pill">
              {t.topics[0]?.action ?? t.ctaStart}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-fd-border border-t px-4 py-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <Link to={toolsHomePath(lang)} className="inline-flex items-center gap-2">
              <Logo className="h-6 w-auto" title={siteConfig.name} />
            </Link>
            <nav
              aria-label={t.footerNav}
              className="text-fd-muted-foreground flex flex-wrap gap-x-5 gap-y-2 text-xs"
            >
              <Link to={docsHome} className="hover:text-fd-foreground transition-colors">
                {t.footerDocs}
              </Link>
              <a
                href={keyUsage}
                target="_blank"
                rel="noreferrer"
                className="hover:text-fd-foreground transition-colors"
              >
                {t.footerKeyUsage}
              </a>
              {legalLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-fd-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <a
                href={siteConfig.url}
                target="_blank"
                rel="noreferrer"
                className="hover:text-fd-foreground transition-colors"
              >
                {t.footerConsole}
              </a>
              <a
                href={siteConfig.quantModelsUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-fd-foreground transition-colors"
              >
                {t.footerQuant}
              </a>
            </nav>
          </div>
          <p className="text-fd-muted-foreground text-xs">
            {t.copyright(year, siteConfig.name)}
          </p>
        </div>
      </footer>
    </HomeLayout>
  );
}
