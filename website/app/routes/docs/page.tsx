import type { Route } from './+types/page';
import { use } from 'react';
import { redirect } from 'react-router';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/page';
import { useFumadocsLoader } from 'fumadocs-core/source/client';
import { getMDXComponents } from '../../../mdx-components';
import { baseOptions } from '~/layout.config';
import { docs, source } from '~/source';
import { i18n } from '~/i18n';

/** Legacy flat paths → nested docs after the menu restructure. */
const legacyRedirects: Record<string, string> = {
  register: 'account/register',
  purchase: 'billing/topup',
  'config-tool': 'tools/cc-switch',
  'agent-skills': 'ai/agent-skills',
};

export async function loader({ params }: Route.LoaderArgs) {
  const lang = params.lang ?? i18n.defaultLanguage;
  const slugs = (params['*'] ?? '').split('/').filter((v) => v.length > 0);
  const legacyKey = slugs.join('/');
  if (legacyRedirects[legacyKey]) {
    const localePrefix =
      i18n.hideLocale === 'default-locale' && lang === i18n.defaultLanguage
        ? ''
        : `/${lang}`;
    throw redirect(`${localePrefix}/docs/${legacyRedirects[legacyKey]}`);
  }
  const page = source.getPage(slugs, lang);
  if (!page) throw new Response('Not found', { status: 404 });

  await docs.getPage(page.path)?.preload();

  return {
    path: page.path,
    pageTree: await source.serializePageTree(source.getPageTree(lang)),
  };
}

function Content({ path }: { path: string }) {
  const page = docs.getPage(path);
  if (!page) throw new Error(`unknown page: ${path}`);

  const { toc } = use(page.load());
  const Mdx = page.body;

  return (
    <DocsPage toc={toc} full={page.full}>
      <title>{page.title}</title>
      <meta name="description" content={page.description} />
      <DocsTitle>{page.title}</DocsTitle>
      <DocsDescription>{page.description}</DocsDescription>
      <DocsBody>
        <Mdx components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}

export default function Page({ loaderData, params }: Route.ComponentProps) {
  const { path, pageTree } = useFumadocsLoader(loaderData);
  const lang = params.lang ?? i18n.defaultLanguage;

  return (
    <DocsLayout
      tree={pageTree}
      {...baseOptions(lang)}
      sidebar={{ defaultOpenLevel: 1 }}
    >
      <Content path={path} />
    </DocsLayout>
  );
}
