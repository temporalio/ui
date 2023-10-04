import { describeBatchOperation } from '$lib/services/batch-service';
import type { BatchOperation } from '$lib/types/batch';

import type { LayoutLoad } from '../$types';

export const load: LayoutLoad = async ({
  params,
  fetch,
}): Promise<{ operation: BatchOperation }> => {
  const operation = await describeBatchOperation(
    { namespace: params.namespace, jobId: params.jobId },
    fetch,
  );

  return {
    operation,
  };
};
