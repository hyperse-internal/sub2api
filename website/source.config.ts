import { rehypeCodeDefaultOptions } from 'fumadocs-core/mdx-plugins';
import { remarkMdxMermaid } from 'fumadocs-core/mdx-plugins/remark-mdx-mermaid';
import { remarkNpm } from 'fumadocs-core/mdx-plugins/remark-npm';
import { remarkSteps } from 'fumadocs-core/mdx-plugins/remark-steps';
import { defineConfig } from 'fumadocs-mdx/config';
import { transformerTwoslash } from 'fumadocs-twoslash';

/**
 * Global MDX options — aligned with pipeline/website where possible.
 *
 * Note: `remarkAutoTypeTable` / `fumadocs-typescript` are omitted on purpose.
 * React Router loads route modules in the browser; the TypeScript generator
 * depends on Node built-ins and would break client-side navigations.
 */
export default defineConfig({
  mdxOptions: {
    // `remarkMdxMermaid` rewrites ```mermaid fences into `<Mermaid />`, which is
    // registered in `mdx-components.tsx`.
    remarkPlugins: [remarkSteps, remarkNpm, remarkMdxMermaid],
    rehypeCodeOptions: {
      ...rehypeCodeDefaultOptions,
      transformers: [
        ...(rehypeCodeDefaultOptions.transformers ?? []),
        transformerTwoslash({
          throws: false,
          twoslashOptions: {
            handbookOptions: {
              noErrors: true,
              noErrorValidation: true,
            },
          },
          onTwoslashError: (error, _code, lang) => {
            console.warn(
              `\n[twoslash] ${lang} FAILED:\n${String(
                (error as Error)?.message ?? error,
              ).slice(0, 600)}\n`,
            );
            return undefined;
          },
        }),
      ],
    },
  },
});
