import { redirect } from '@sveltejs/kit';
import type { PageLoad } from '@sveltejs/kit';
import { routeForImport } from '$lib/utilities/route-for';

export const load: PageLoad = async function () {
  const location = routeForImport({ importType: 'events', view: 'feed' });
  throw redirect(302, location);
};
