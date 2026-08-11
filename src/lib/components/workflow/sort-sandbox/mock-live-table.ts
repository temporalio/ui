/**
 * POC only. Serves the same seeded fake workflows to the live workflows table
 * so the sort sandbox can be demoed without a cluster behind it.
 *
 * Turn it on with ?mock on the workflows URL:
 *   /namespaces/default/workflows?mock
 */

import type { PaginatedRequest } from '$lib/holocene/table/paginated-table/api-paginated.svelte';
import type { WorkflowExecution } from '$lib/types/workflows';
import { routeForWorkflow } from '$lib/utilities/route-for';

import {
  getMockWorkflows,
  type SandboxWorkflow,
  TOTAL_MATCHING,
} from './mock-workflows';
import { filterByQuery } from './query-filter';

export const MOCK_PARAM = 'mock';

export const isMockLiveTableEnabled = (url: URL): boolean =>
  url.searchParams.has(MOCK_PARAM);

const toWorkflowExecution = (
  workflow: SandboxWorkflow,
  namespace: string,
): WorkflowExecution =>
  ({
    name: workflow.type,
    id: workflow.workflowId,
    runId: workflow.runId,
    startTime: new Date(workflow.startTime).toISOString(),
    endTime: workflow.endTime ? new Date(workflow.endTime).toISOString() : '',
    executionTime: new Date(workflow.startTime).toISOString(),
    status: workflow.status,
    taskQueue: workflow.taskQueue,
    historyEvents: String(6 + (workflow.startTime % 40)),
    historySizeBytes: String(1024 + (workflow.startTime % 8192)),
    externalPayloadCount: undefined,
    externalPayloadSizeBytes: undefined,
    searchAttributes: undefined,
    memo: { fields: {} },
    pendingChildren: [],
    pendingNexusOperations: [],
    pendingActivities: [],
    stateTransitionCount: String(3 + (workflow.startTime % 20)),
    url: routeForWorkflow({
      namespace,
      workflow: workflow.workflowId,
      run: workflow.runId,
    }),
    isRunning: workflow.status === 'Running',
    isPaused: false,
    canBeTerminated: workflow.status === 'Running',
    callbacks: [],
    workflowExtendedInfo: {},
  }) as WorkflowExecution;

export const mockCountForQuery = (query: string): number =>
  query.trim()
    ? filterByQuery(getMockWorkflows(), query).length
    : TOTAL_MATCHING;

export const mockPaginatedWorkflows = async (
  namespace: string,
  query = '',
): Promise<PaginatedRequest<WorkflowExecution>> => {
  const workflows = filterByQuery(getMockWorkflows(), query);

  return async (pageSize = 100, token = '') => {
    // fake latency so the table's loading state still reads as a fetch
    await new Promise((resolve) => setTimeout(resolve, 220));

    const offset = token ? Number(token) : 0;
    const end = Math.min(offset + pageSize, workflows.length);

    return {
      items: workflows
        .slice(offset, end)
        .map((workflow) => toWorkflowExecution(workflow, namespace)),
      nextPageToken: end < workflows.length ? String(end) : '',
    };
  };
};

export const MOCK_TOTAL = TOTAL_MATCHING;
