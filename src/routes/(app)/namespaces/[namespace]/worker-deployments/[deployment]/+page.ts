import { redirect } from '@sveltejs/kit';

import type { PageLoad } from './$types';

import { routeForWorkerDeployment } from '$lib/utilities/route-for';

export const load: PageLoad = async function ({ params }) {
  const { namespace, deployment } = params;
  const route = routeForWorkerDeployment({
    namespace,
    deployment,
  });
  redirect(301, route);
};
