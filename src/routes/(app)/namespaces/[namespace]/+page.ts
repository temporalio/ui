import { error } from '@sveltejs/kit';
import { getClusters } from '$lib/utilities/get-clusters';

import type { PageLoad } from './$types';
import type { DescribeNamespaceResponse } from '$types';

export const load: PageLoad = async function ({ params, url, parent }) {
  const data = await parent();
  const { searchParams } = url;

  if (searchParams.has('time-range')) searchParams.delete('time-range');

  const namespace = params.namespace;
  const namespaces: DescribeNamespaceResponse[] = data.namespaces;

  const currentNamespace = namespaces.find(
    (namespaceConfig) => namespaceConfig.namespaceInfo.name === namespace,
  );

  if (!currentNamespace) {
    throw error(404, `The namespace "${namespace}" does not exist.`);
  }

  const clusters = getClusters(currentNamespace);

  return {
    currentNamespace,
    clusters,
  };
};
