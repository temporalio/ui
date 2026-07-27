import type { PageLoad } from './$types';

import { getClusters } from '$lib/utilities/get-clusters';

export const load: PageLoad = async function ({ parent, url }) {
  const { searchParams } = url;

  if (searchParams.has('time-range')) searchParams.delete('time-range');

  const { namespace } = await parent();
  const clusters = getClusters(namespace);

  return {
    clusters,
  };
};
