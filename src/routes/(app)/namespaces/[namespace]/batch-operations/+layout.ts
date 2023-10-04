import { listBatchOperations } from '$lib/services/batch-service';
import type { BatchOperationInfo } from '$lib/types/batch';

import type { LayoutLoad } from '../$types';

export const load: LayoutLoad = async ({
  params,
  fetch,
}): Promise<{ operations: BatchOperationInfo[] }> => {
  const { operations } = await listBatchOperations(params.namespace, fetch);

  return {
    operations,
  };
};
