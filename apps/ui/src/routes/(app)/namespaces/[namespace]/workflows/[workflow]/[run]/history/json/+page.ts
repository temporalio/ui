import { redirect } from '@sveltejs/kit';

import type { PageLoad } from './$types';

import { routeForEventHistory } from '$lib/utilities/route-for';

export const load: PageLoad = async function ({ params }) {
  const { namespace, workflow, run } = params;
  const route = routeForEventHistory({
    namespace,
    workflow,
    run,
  });
  redirect(302, route);
};
