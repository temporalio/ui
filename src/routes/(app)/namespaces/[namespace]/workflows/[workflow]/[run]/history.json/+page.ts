import { redirect } from '@sveltejs/kit';

import type { PageLoad } from './$types';

import { getEndpointForRawHistory } from '$lib/services/events-service';

export const load: PageLoad = async function ({ parent, params }) {
  await parent();

  const { namespace, workflow, run } = params;
  const route = getEndpointForRawHistory({
    namespace,
    workflowId: workflow,
    runId: run,
  });
  redirect(302, route);
};
