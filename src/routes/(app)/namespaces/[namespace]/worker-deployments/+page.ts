import { redirect } from '@sveltejs/kit';

import type { PageLoad } from './$types';

import { routeForWorkerDeployments } from '$lib/utilities/route-for';

export const load: PageLoad = async function ({ params }) {
  const { namespace } = params;
  const route = routeForWorkerDeployments({
    namespace,
  });
  redirect(301, route);
};
