import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { Logo } from '~/components/Logo';
import { i18n } from '~/i18n';

export const siteConfig = {
  name: 'AlphaIO',
  slogan: {
    en: 'One Key, All AI Models',
    cn: '一个密钥，畅用多个 AI 模型',
  },
  description: {
    en: 'No need to manage multiple subscriptions. Access Claude, GPT, Gemini and more with a single API key.',
    cn: '无需管理多个订阅账号，一站式接入 Claude、GPT、Gemini 等主流 AI 服务。',
  },
  url: 'https://ai.alphaio.vip',
  quantModelsUrl: 'https://www.alphaio.vip/',
  /** Console `/legal/<id>` pages (see repo `docs/protocol/`). */
  legalLinks: [
    { id: 'privacy', en: 'Privacy Policy', cn: '隐私政策' },
    { id: 'terms', en: 'Terms of Service', cn: '服务条款' },
    { id: 'cookies', en: 'Cookie Policy', cn: 'Cookie 政策' },
    { id: 'data-security', en: 'Data Security', cn: '数据安全说明' },
    { id: 'security-incident', en: 'Security Incident', cn: '安全事件反馈' },
  ] as const,
};

export function legalDocumentUrl(id: string) {
  return `${siteConfig.url}/legal/${id}`;
}

export function baseOptions(locale: string = i18n.defaultLanguage): BaseLayoutProps {
  const localePrefix =
    i18n.hideLocale === 'default-locale' && locale === i18n.defaultLanguage
      ? ''
      : `/${locale}`;
  const isCn = locale === 'cn';

  return {
    nav: {
      title: (
        <span className="inline-flex items-center gap-2">
          <Logo className="h-7 w-auto" title={siteConfig.name} />
        </span>
      ),
      url: localePrefix || '/',
    },
    links: [
      {
        text: isCn ? '文档' : 'Documentation',
        url: `${localePrefix}/docs`,
        active: 'nested-url',
      },
      {
        text: isCn ? '控制台' : 'Console',
        url: siteConfig.url,
        external: true,
      },
      {
        text: isCn ? '量化模型' : 'Quant Models',
        url: siteConfig.quantModelsUrl,
        external: true,
      },
    ],
    i18n,
  };
}
