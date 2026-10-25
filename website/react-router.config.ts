import type { Config } from '@react-router/dev/config';

export default {
  // Node SSR — required for `/api/search` (Orama) and server loaders.
  ssr: true,
  // Lazy discovery relies on `/__manifest`, which returns 204 in this setup and
  // silently blocks client-side navigations (menu clicks do nothing).
  routeDiscovery: {
    mode: 'initial',
  },
  // Opt into React Router v8 defaults early to clear Future Flag warnings.
  // See https://reactrouter.com/v7/upgrading/future
  future: {
    v8_middleware: true,
    v8_splitRouteModules: true,
    v8_viteEnvironmentApi: true,
    v8_passThroughRequests: true,
    v8_trailingSlashAwareDataRequests: true,
  },
} satisfies Config;
