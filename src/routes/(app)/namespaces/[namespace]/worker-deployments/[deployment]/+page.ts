import { redirect } from '@sveltejs/kit';

import { routeForWorkerDeployment } from '$lib/utilities/route-for';

export const load = async function ({
  params,
}: {
  params: { namespace: string; deployment: string };
}) {
  const { namespace, deployment } = params;
  const route = routeForWorkerDeployment({
    namespace,
    deployment,
  });
  redirect(301, route);
};
