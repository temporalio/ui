import { redirect } from '@sveltejs/kit';

import { routeForWorkerDeployments } from '$lib/utilities/route-for';

export const load = async function ({
  params,
}: {
  params: { namespace: string };
}) {
  const { namespace } = params;
  const route = routeForWorkerDeployments({
    namespace,
  });
  redirect(301, route);
};
