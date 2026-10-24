import { redirect } from 'react-router';

import type { Route } from './+types/tools-redirect';
import { i18n } from '~/i18n';
import { toolsHomePath } from '~/layout.config';

/**
 * Former marketing home lived at `/` / `/cn`, which collides with the Go panel
 * behind the same host. Send those URLs to `/tools` (and `/cn/tools`).
 */
export function loader({ params }: Route.LoaderArgs) {
  const lang = params.lang;
  if (lang && !i18n.languages.includes(lang)) {
    throw new Response('Not Found', { status: 404 });
  }
  return redirect(toolsHomePath(lang ?? i18n.defaultLanguage));
}
