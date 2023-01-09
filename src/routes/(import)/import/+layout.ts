import type { LayoutLoad } from './$types';

import '../../../app.css';
import '$lib/vendor/prism/prism.css';
import '$lib/vendor/prism/prism.js';

import { fetchSettings } from '$lib/services/settings-service';
import { getAuthUser } from '$lib/stores/auth-user';

export const load: LayoutLoad = async function ({ fetch }) {
  const settings: Settings = await fetchSettings(fetch);
  const user = getAuthUser();

  return {
    user,
    settings,
  };
};
