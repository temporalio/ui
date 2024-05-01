import { error } from '@sveltejs/kit';

import type { LayoutServerLoad } from './$types';

import { HttpApi } from '$lib/utilities/http-api';

export const load: LayoutServerLoad = async function () {
  const settings = await HttpApi.settings();

  if (!settings.auth.enabled) {
    error(404);
  }

  return {
    settings,
  };
};
