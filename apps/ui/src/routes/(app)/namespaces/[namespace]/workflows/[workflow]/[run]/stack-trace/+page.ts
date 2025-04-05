import { redirect } from '@sveltejs/kit';

import type { PageLoad } from './$types';

import { routeForCallStack } from '$lib/utilities/route-for';

export const load: PageLoad = async function ({ params }) {
  redirect(302, routeForCallStack(params));
};
