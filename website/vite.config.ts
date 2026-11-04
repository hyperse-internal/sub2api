import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { fumadocsMdx } from 'fumadocs-mdx/vite';
import { defineConfig } from 'vite';

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  server: {
    port: 3001,
  },
  resolve: {
    // Mirror tsconfig paths (avoids vite-tsconfig-paths + resolve.tsconfigPaths typing issues).
    alias: {
      '~': path.resolve(root, 'app'),
      '@/.source': path.resolve(root, '.source'),
    },
  },
  // Avoid colliding with the Vue panel's `/assets/*` when both share one origin
  // behind Nginx (ai.alphaio.vip).
  build: {
    assetsDir: 'docs-assets',
  },
  plugins: [tailwindcss(), fumadocsMdx(), reactRouter()],
});
