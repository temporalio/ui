import { redirect } from '@sveltejs/kit';
import type { PageLoad } from '@sveltejs/kit';

import { routeForWorkflows } from '$lib/utilities/route-for';
import { getNamespace } from '$lib/utilities/get-namespace';

export const load: PageLoad = async ({ stuff }) => {
  const namespaces = stuff.namespaces;
  const defaultNamespace = stuff?.settings?.defaultNamespace;

  const namespace = getNamespace({ namespaces, defaultNamespace });
  const location = routeForWorkflows({
    namespace,
  });

  throw redirect(302, location);
};
