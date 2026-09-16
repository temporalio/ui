import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';
import { toBatchOperationStateReadable } from '$lib/utilities/screaming-enums';

import type {
  APIBatchOperationInfo,
  BatchOperation,
  BatchOperationInfo,
  BatchOperations,
  DescribeBatchOperationResponse,
  ListBatchOperationsResponse,
} from '$types/batch';

type DescribeBatchOperationOptions = {
  jobId: string;
  namespace: string;
};

export async function pollBatchOperation({
  namespace,
  jobId,
}: DescribeBatchOperationOptions): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    describeBatchOperation({ namespace, jobId }).then(
      ({ state, completeOperationCount }) => {
        if (state === 'Failed') {
          reject();
        } else if (state !== 'Running') {
          resolve(completeOperationCount ?? 0);
        } else {
          setTimeout(() => {
            try {
              resolve(pollBatchOperation({ namespace, jobId }));
            } catch {
              reject();
            }
          }, 5000);
        }
      },
    );
  });
}

export async function describeBatchOperation(
  { jobId, namespace }: DescribeBatchOperationOptions,
  request = fetch,
): Promise<BatchOperation> {
  const route = routeForApi('batch-operations', {
    namespace,
    batchJobId: jobId,
  });

  const response = await requestFromAPI<DescribeBatchOperationResponse>(route, {
    request,
  });

  return toBatchOperationDetails(response);
}

const toBatchOperationDetails = (
  apiBatchOperationDetails: DescribeBatchOperationResponse | undefined,
): BatchOperation => {
  return {
    ...apiBatchOperationDetails,
    operationType: apiBatchOperationDetails?.operationType,
    state: toBatchOperationStateReadable(
      apiBatchOperationDetails?.state ?? 'Unspecified',
    ),
    jobId: apiBatchOperationDetails?.jobId ?? '',
    identity: apiBatchOperationDetails?.identity ?? '',
    reason: apiBatchOperationDetails?.reason ?? '',
    startTime: apiBatchOperationDetails?.startTime ?? '',
    closeTime: apiBatchOperationDetails?.closeTime ?? '',
    totalOperationCount: parseInt(
      apiBatchOperationDetails?.totalOperationCount ?? '0',
      10,
    ),
    completeOperationCount: parseInt(
      apiBatchOperationDetails?.completeOperationCount ?? '0',
      10,
    ),
    failureOperationCount: parseInt(
      apiBatchOperationDetails?.failureOperationCount ?? '0',
      10,
    ),
  };
};

export async function listBatchOperations(
  namespace: string,
  request = fetch,
): Promise<BatchOperations> {
  const route = routeForApi('batch-operations.list', {
    namespace,
    batchJobId: '',
  });

  const response = await requestFromAPI<ListBatchOperationsResponse>(route, {
    request,
  });

  return {
    nextPageToken: response?.nextPageToken ?? null,
    operations: response?.operationInfo
      ? response.operationInfo.map(toBatchOperationInfo)
      : [],
  };
}

const toBatchOperationInfo = (
  apiBatchOperationInfo: APIBatchOperationInfo,
): BatchOperationInfo => {
  return {
    startTime: apiBatchOperationInfo.startTime,
    closeTime: apiBatchOperationInfo.closeTime,
    jobId: apiBatchOperationInfo.jobId,
    state: toBatchOperationStateReadable(apiBatchOperationInfo.state),
    operationType: apiBatchOperationInfo.operationType,
  };
};
