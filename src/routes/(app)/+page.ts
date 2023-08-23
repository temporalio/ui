import { redirect } from '@sveltejs/kit';

import type { PageLoad } from './$types';

import { routeForWorkflows } from '$lib/utilities/route-for';

export const load: PageLoad = async ({ parent }) => {
  const data = await parent();

  const defaultNamespace = data?.settings?.defaultNamespace;
  const isCloud = data.settings.runtimeEnvironment?.isCloud;

  if (isCloud) {
    throw redirect(
      302,
      routeForWorkflows({
        namespace: defaultNamespace,
      }),
    );
  }

  return { defaultNamespace };
};
