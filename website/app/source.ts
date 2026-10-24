import { loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/plugins/lucide-icons';
import { defineDocs } from 'fumadocs-mdx/macro';
import { i18n } from '~/i18n';

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    async: true,
  },
});

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  i18n,
  // Resolves the `icon` frontmatter field into a Lucide React element for the
  // sidebar. Without this the value stays a string and renders as nothing.
  plugins: [lucideIconsPlugin()],
});
