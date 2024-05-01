import type { PageServerLoad } from './$types';

import { getClusters } from '$lib/utilities/get-clusters';
import { HttpApi } from '$lib/utilities/http-api';

export const load: PageServerLoad = async ({ params, url }) => {
  const { searchParams } = url;

  if (searchParams.has('time-range')) searchParams.delete('time-range');

  const namespace = await HttpApi.namespace(params.namespace);
  const clusters = getClusters(namespace);

  return {
    namespace,
    clusters,
  };
};
