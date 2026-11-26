import { redirect } from '@sveltejs/kit';

import type { PageLoad } from './$types';

import { routeForWorkflows } from '$lib/utilities/route-for';
import { workflowCreateDisabled } from '$lib/utilities/workflow-create-disabled';

export const load: PageLoad = async function ({ params, parent }) {
  const data = await parent();
  const { namespace } = params;
  const disabled = workflowCreateDisabled(namespace, data?.settings);

  if (disabled) {
    redirect(302, routeForWorkflows({ namespace }));
  }
};
