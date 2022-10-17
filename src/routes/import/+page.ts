import { redirect } from '@sveltejs/kit';
import type { PageLoad } from '@sveltejs/kit';

import { routeForImport } from '$lib/utilities/route-for';

export const load: PageLoad = async () => {
  const location = routeForImport({ importType: 'events' });

  throw redirect(302, location);
};
