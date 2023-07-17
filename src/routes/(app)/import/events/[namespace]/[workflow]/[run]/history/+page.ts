import { redirect } from '@sveltejs/kit';

import type { PageLoad } from './$types';

import { routeForEventHistoryImport } from '$lib/utilities/route-for';

export const load: PageLoad = async function () {
  const redirectPath = routeForEventHistoryImport('feed');
  throw redirect(302, redirectPath);
};
