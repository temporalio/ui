import type { PageLoad } from './$types';

import { fetchNamespace } from '$lib/services/namespaces-service';
import { getClusters } from '$lib/utilities/get-clusters';

export const load: PageLoad = async function ({ params, url }) {
  const { searchParams } = url;

  if (searchParams.has('time-range')) searchParams.delete('time-range');

  const namespace = await fetchNamespace(params.namespace);
  const clusters = getClusters(namespace);

  return {
    namespace,
    clusters,
  };
};
