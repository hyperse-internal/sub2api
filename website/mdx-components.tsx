import { Popup, PopupContent, PopupTrigger } from 'fumadocs-twoslash/ui';
import { Card, Cards } from 'fumadocs-ui/components/card';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import type { ComponentProps } from 'react';
import { Icon } from '~/components/Icon';
import { Mermaid } from '~/components/Mermaid';
import { i18n, localizeDocsHref } from '~/i18n';

type CardProps = ComponentProps<typeof Card>;
type AnchorProps = ComponentProps<typeof defaultMdxComponents.a>;

/**
 * Client-safe MDX components for React Router.
 *
 * Do NOT import `fumadocs-typescript` / `createGenerator` here — those pull the
 * TypeScript compiler (Node built-ins) into the route module and break SPA
 * navigations with: `Module "node:buffer" has been externalized`.
 */
export function getMDXComponents(
  lang: string = i18n.defaultLanguage,
  components?: MDXComponents,
) {
  const DefaultA = defaultMdxComponents.a;

  return {
    ...defaultMdxComponents,
    Steps,
    Step,
    Tabs,
    Tab,
    Popup,
    PopupContent,
    PopupTrigger,
    Cards,
    // Keep MDX hrefs as `/docs/...`; rewrite for non-default locales at render.
    Card: ({ href, ...props }: CardProps) => (
      <Card href={localizeDocsHref(href, lang)} {...props} />
    ),
    a: ({ href, ...props }: AnchorProps) => (
      <DefaultA href={localizeDocsHref(href, lang)} {...props} />
    ),
    // Injected by `remarkMdxMermaid` for ```mermaid code fences.
    Mermaid,
    // `<Icon name="Gauge" />` — resolves a Lucide icon by name in MDX.
    Icon,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
