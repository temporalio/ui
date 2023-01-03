import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

import { routeForImport } from '$lib/utilities/route-for';

export const load: PageLoad = async () => {
  const redirectPath = routeForImport({ importType: 'events' });

  throw redirect(302, redirectPath);
};
