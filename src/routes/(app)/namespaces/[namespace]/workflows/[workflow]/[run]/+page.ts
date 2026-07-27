import { redirect } from '@sveltejs/kit';

import type { PageLoad } from './$types';

export const load: PageLoad = async function ({ url }) {
  redirect(302, `${url.pathname}/timeline`);
};
