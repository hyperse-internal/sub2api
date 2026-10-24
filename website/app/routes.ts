import { route, type RouteConfig } from '@react-router/dev/routes';

export default [
  // Docs marketing home — not `/` (same host as the Go panel).
  route(':lang?/tools', 'routes/home.tsx'),
  route(':lang?/docs/*', './routes/docs/page.tsx'),
  // Not under `/api/*` — that prefix belongs to the Go panel API behind Nginx.
  route('docs-api/search', './routes/docs/search.ts'),
  // Legacy `/` and `/cn` → `/tools` / `/cn/tools` (local SSR / mistaken hits).
  route(':lang?', 'routes/tools-redirect.ts'),
] satisfies RouteConfig;
