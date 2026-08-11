import { error } from '@sveltejs/kit';
import { DEV } from 'esm-env';

import type { LayoutLoad } from './$types';

import { isWorkflowCatalogRouteAvailable } from './availability';

export const load: LayoutLoad = async ({ parent }) => {
  const { settings } = await parent();

  if (
    !isWorkflowCatalogRouteAvailable({
      isDevelopment: DEV,
      runtimePolicyAllowsLocalCatalog: Boolean(
        settings?.runtimeEnvironment?.isLocal,
      ),
    })
  ) {
    error(404);
  }
};
