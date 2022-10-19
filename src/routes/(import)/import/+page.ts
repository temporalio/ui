import { redirect } from '@sveltejs/kit';
import { routeForImport } from '$lib/utilities/route-for';

import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  const location = routeForImport({ importType: 'events' });

  throw redirect(302, location);
};
