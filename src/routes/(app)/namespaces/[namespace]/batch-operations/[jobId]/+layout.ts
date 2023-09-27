import { describeBatchOperation } from '$lib/services/batch-service';

import type { LayoutData, LayoutLoad } from '../$types';

export const load: LayoutLoad = async ({
  params,
  fetch,
}): Promise<LayoutData> => {
  const batchOperation = await describeBatchOperation(
    { namespace: params.namespace, jobId: params.jobId },
    fetch,
  );

  return {
    batchOperation,
  };
};
