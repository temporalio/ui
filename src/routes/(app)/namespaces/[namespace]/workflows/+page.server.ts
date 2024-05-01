import type { PageServerLoad } from './$types';

import { HttpApi } from '$lib/utilities/http-api';

export const load: PageServerLoad = async ({ params, url }) => {
  const { searchParams } = url;
  const query = searchParams.get('query');

  const workflows = await HttpApi.workflows(params.namespace, query);
  const { count, groups } = await HttpApi.workflowCount(
    params.namespace,
    query,
  );

  return {
    workflows,
    count,
    groups,
  };
};
