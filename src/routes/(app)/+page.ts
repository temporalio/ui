import { redirect } from '@sveltejs/kit';
import { routeForWorkflows } from '$lib/utilities/route-for';
import { getNamespace } from '$lib/utilities/get-namespace';

import type { PageLoad, PageParentData } from './$types';

export const load: PageLoad = async ({ parent }) => {
  const data: PageParentData = await parent();
  const namespaces = data.namespaces;
  const defaultNamespace = data.settings?.defaultNamespace;

  const namespace = getNamespace({ namespaces, defaultNamespace });
  const location = routeForWorkflows({
    namespace,
  });

  throw redirect(302, location);
};
