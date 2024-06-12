import { redirect } from '@sveltejs/kit';

import type { PageLoad } from './$types';

import { routeForWorkflows } from '$lib/utilities/route-for';

export const load: PageLoad = async function ({ params, parent }) {
  const data = await parent();
  if (data.settings.startWorkflowDisabled) {
    const { namespace } = params;
    redirect(302, routeForWorkflows({ namespace }));
  }
};
