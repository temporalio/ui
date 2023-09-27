import { listBatchOperations } from '$lib/services/batch-service';

import type { LayoutData, LayoutLoad } from '../$types';

export const load: LayoutLoad = async ({
  params,
  fetch,
}): Promise<LayoutData> => {
  const batchOperations = await listBatchOperations(params.namespace, fetch);

  return {
    batchOperations,
  };
};
