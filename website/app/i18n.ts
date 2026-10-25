import type { I18nConfig } from 'fumadocs-core/i18n';

export const i18n: I18nConfig = {
  defaultLanguage: 'en',
  hideLocale: 'default-locale',
  languages: ['en', 'cn'],
};

/** Locale prefix for URLs (`''` for default locale when hidden). */
export function localePathPrefix(lang: string): string {
  if (i18n.hideLocale === 'default-locale' && lang === i18n.defaultLanguage) {
    return '';
  }
  return `/${lang}`;
}

/**
 * Rewrite absolute `/docs/...` page links for the active locale.
 * Leaves assets, relative URLs, and already-prefixed paths unchanged.
 * MDX can keep writing `/docs/...` in both en and cn files.
 */
export function localizeDocsHref(
  href: string | undefined,
  lang: string,
): string | undefined {
  if (!href) return href;

  const isDocsPath =
    href === '/docs' ||
    href.startsWith('/docs/') ||
    href.startsWith('/docs?') ||
    href.startsWith('/docs#');
  if (!isDocsPath) return href;

  // Static / built assets are not locale-scoped.
  if (href.startsWith('/docs/assets') || href.startsWith('/docs-assets')) {
    return href;
  }

  const prefix = localePathPrefix(lang);
  if (!prefix) return href;
  return `${prefix}${href}`;
}
