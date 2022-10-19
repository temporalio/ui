import type { LayoutLoad } from '@sveltejs/kit';

import '../../../app.css';

import { fetchSettings } from '$lib/services/settings-service';
import { getAuthUser } from '$lib/stores/auth-user';

export const load: LayoutLoad.import = async function ({ fetch }) {
  const settings: Settings = await fetchSettings(fetch);
  const user = getAuthUser();

  return {
    user,
    settings,
  };
};
