import { error } from '@sveltejs/kit';
import { fetchSettings } from '$lib/services/settings-service';

import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async function ({ fetch }) {
  const settings: Settings = await fetchSettings(fetch);

  if (!settings.auth.enabled) {
    throw error(404);
  }

  return {
    settings,
  };
};
