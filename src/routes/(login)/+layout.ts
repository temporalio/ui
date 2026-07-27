import '../../app.css';

import { error, redirect } from '@sveltejs/kit';

import type { LayoutLoad } from './$types';

import { fetchSettings } from '$lib/services/settings-service';
import type { Settings } from '$lib/types/global';
import { routeForAuthentication } from '$lib/utilities/route-for';

export const ssr = false;

export const load: LayoutLoad = async function ({ fetch, url }) {
  const settings: Settings = await fetchSettings(fetch);

  if (!settings.auth.enabled) {
    error(404);
  }

  if (settings.auth.redirectToProvider) {
    redirect(
      302,
      routeForAuthentication({
        settings,
        searchParams: url.searchParams,
        originUrl: url.origin,
      }),
    );
  }

  return {
    settings,
  };
};
