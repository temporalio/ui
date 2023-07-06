import '../../app.css';

import { error } from '@sveltejs/kit';

import type { LayoutLoad } from './$types';

import { fetchSettings } from '$lib/services/settings-service';
import type { Settings } from '$lib/types/global';

export const ssr = false;

export const load: LayoutLoad = async function ({ fetch }) {
  const settings: Settings = await fetchSettings(fetch);

  if (!settings.auth.enabled) {
    throw error(404);
  }

  return {
    settings,
  };
};
