import { redirect } from '@sveltejs/kit';

import type { PageLoad } from './$types';

import { routeForEventHistoryImport } from '$lib/utilities/route-for';

export const load: PageLoad = async () => {
  const redirectPath = routeForEventHistoryImport();

  throw redirect(302, redirectPath);
};
