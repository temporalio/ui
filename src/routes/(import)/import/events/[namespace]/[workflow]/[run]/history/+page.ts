import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { routeForImport } from '$lib/utilities/route-for';

export const load: PageLoad = async function () {
  const redirectPath = routeForImport({ importType: 'events', view: 'feed' });
  throw redirect(302, redirectPath);
};
