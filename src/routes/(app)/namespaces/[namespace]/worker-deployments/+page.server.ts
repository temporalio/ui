import type { RequestEvent } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

export const load = ({ params, url }: RequestEvent) => {
  const { namespace } = params;

  const queryString = url.searchParams.toString();
  const redirectUrl = `/namespaces/${namespace}/workers?view=deployments${queryString ? `&${queryString}` : ''}`;

  redirect(301, redirectUrl);
};
