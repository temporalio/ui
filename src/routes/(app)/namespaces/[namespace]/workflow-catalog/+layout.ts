import { error } from '@sveltejs/kit';

import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent }) => {
  const { settings } = await parent();

  if (!settings?.runtimeEnvironment?.isLocal) {
    error(404);
  }
};
