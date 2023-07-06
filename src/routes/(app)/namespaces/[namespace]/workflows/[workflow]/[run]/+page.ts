import { redirect } from '@sveltejs/kit';

import type { PageLoad } from './$types';

export const load: PageLoad = async function ({ url }) {
  throw redirect(302, `${url.pathname}/history`);
};
