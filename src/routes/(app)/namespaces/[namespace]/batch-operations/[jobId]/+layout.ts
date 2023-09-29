import { describeBatchOperation } from '$lib/services/batch-service';
import { batchOperation } from '$lib/stores/batch-operations';

import type { LayoutLoad } from '../$types';

export const load: LayoutLoad = async ({ params, fetch }): Promise<void> => {
  const operation = await describeBatchOperation(
    { namespace: params.namespace, jobId: params.jobId },
    fetch,
  );

  batchOperation.set(operation);
};
