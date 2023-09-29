import { listBatchOperations } from '$lib/services/batch-service';
import { batchOperations } from '$lib/stores/batch-operations';

import type { LayoutLoad } from '../$types';

export const load: LayoutLoad = async ({ params, fetch }): Promise<void> => {
  const { operations } = await listBatchOperations(params.namespace, fetch);

  batchOperations.set(operations);
};
