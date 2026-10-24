import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { fumadocsMdx } from 'fumadocs-mdx/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  server: {
    port: 3001,
  },
  // Avoid colliding with the Vue panel's `/assets/*` when both share one origin
  // behind Nginx (ai.alphaio.vip).
  build: {
    assetsDir: 'docs-assets',
  },
  plugins: [tailwindcss(), fumadocsMdx(), reactRouter(), tsconfigPaths()],
});
