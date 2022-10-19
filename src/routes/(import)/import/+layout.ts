import '../../../app.css';

import { fetchSettings } from '$lib/services/settings-service';
import { getAuthUser } from '$lib/stores/auth-user';

import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async function ({ fetch }) {
  const settings: Settings = await fetchSettings(fetch);
  const user = getAuthUser();

  return {
    user,
    settings,
  };
};
