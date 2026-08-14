import { redirect } from '@sveltejs/kit';

import type { PageLoad } from './$types';

import { routeForStandaloneNexusOperations } from '$lib/utilities/route-for';

export const load: PageLoad = async function ({ params, parent }) {
  const data = await parent();
  const disabled = data?.settings?.disableWriteActions;

  if (disabled) {
    const { namespace } = params;
    redirect(302, routeForStandaloneNexusOperations({ namespace }));
  }
};
