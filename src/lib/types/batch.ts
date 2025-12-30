export type BatchOperationType =
  | 'Cancel'
  | 'Terminate'
  | 'Reset'
  | 'Signal'
  | 'Delete'
  | 'Unspecified';

export type BatchOperationState =
  | 'Running'
  | 'Completed'
  | 'Failed'
  | 'Unspecified';

export type DescribeBatchOperationResponse = {
  operationType: BatchOperationType;
  jobId: string;
  state: BatchOperationState;
  startTime: string;
  closeTime: string;
  totalOperationCount: string;
  completeOperationCount: string;
  failureOperationCount: string;
  identity: string;
  reason: string;
};

export type ListBatchOperationsResponse = {
  nextPageToken: string | null;
  operationInfo: APIBatchOperationInfo[];
};

export type BatchOperations = {
  nextPageToken: string | null;
  operations: BatchOperationInfo[];
};

export type APIBatchOperationInfo = {
  startTime: string;
  closeTime: string;
  state: BatchOperationState;
  jobId: string;
};

export type BatchOperationInfo = {
  startTime: string;
  closeTime: string;
  state: BatchOperationState;
  jobId: string;
};

export type BatchOperation = {
  operationType: BatchOperationType;
  jobId: string;
  state: BatchOperationState;
  startTime: string;
  closeTime: string;
  totalOperationCount?: number;
  completeOperationCount?: number;
  failureOperationCount?: number;
  identity: string;
  reason: string;
};
