import { redirect } from '@sveltejs/kit';
import { routeForEventHistory } from '$lib/utilities/route-for';
import type { PageLoad } from './$types';

export const load: PageLoad = async function ({ params }) {
  const { namespace, workflow, run } = params;
  const route = routeForEventHistory({
    namespace,
    workflow,
    run,
  });
  throw redirect(302, route);
};
