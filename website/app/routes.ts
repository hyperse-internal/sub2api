import { route, type RouteConfig } from '@react-router/dev/routes';

export default [
  route(':lang?', 'routes/home.tsx'),
  route(':lang?/docs/*', './routes/docs/page.tsx'),
  // Not under `/api/*` — that prefix belongs to the Go panel API behind Nginx.
  route('docs-api/search', './routes/docs/search.ts'),
] satisfies RouteConfig;
