import { v4 as uuidv4 } from 'uuid';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';
import type {
  StartBatchOperationRequest,
  StartBatchOperationResponse,
} from '$types';

type TerminateWorkflowOptions = {
  workflow: WorkflowExecution;
  namespace: string;
  reason: string;
};

export async function terminateWorkflow({
  workflow,
  namespace,
  reason,
}: TerminateWorkflowOptions): Promise<null> {
  const route = await routeForApi('workflow.terminate', {
    namespace,
    workflowId: workflow.id,
    runId: workflow.runId,
  });
  return await requestFromAPI<null>(route, {
    options: { method: 'POST', body: stringifyWithBigInt({ reason }) },
    shouldRetry: false,
    notifyOnError: false,
  });
}

type BulkTerminateWorkflowOptions = {
  namespace: string;
  query: string;
  reason: string;
};

export async function batchTerminateWorkflows({
  namespace,
  query,
  reason,
}: BulkTerminateWorkflowOptions): Promise<StartBatchOperationResponse> {
  const route = await routeForApi('workflows.batch.terminate', { namespace });

  return await requestFromAPI<StartBatchOperationResponse>(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt({
        jobId: uuidv4(),
        namespace,
        visibilityQuery: query,
        reason,
        terminationOperation: {
          details: {},
          identity: '',
        },
      }),
    },
    shouldRetry: false,
    notifyOnError: false,
  });
}
