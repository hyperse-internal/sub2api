import type { Config } from '@react-router/dev/config';

export default {
  // Node SSR — required for `/api/search` (Orama) and server loaders.
  ssr: true,
  // Lazy discovery relies on `/__manifest`, which returns 204 in this setup and
  // silently blocks client-side navigations (menu clicks do nothing).
  routeDiscovery: {
    mode: 'initial',
  },
} satisfies Config;
