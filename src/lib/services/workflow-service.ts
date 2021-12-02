import { sub, formatISO } from 'date-fns';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import {
  toWorkflowExecution,
  toWorkflowExecutions,
} from '$lib/models/workflow-execution';
import { toDuration } from '$lib/utilities/to-duration';

import { fetchEvents } from './events-service';
import { toEventHistory } from '$lib/models/event-history';

import type { ListWorkflowExecutionsResponse } from '$types';
import type { WorkflowExecution } from '$lib/models/workflow-execution';
import type { HistoryEventWithId } from '$lib/models/event-history';
import { getStatusFilterCode } from '$lib/utilities/get-workflow-status-filter-code';

export type GetWorkflowExecutionRequest = NamespaceScopedRequest & {
  executionId: string;
  runId: string;
};

type CombinedWorkflowExecutionsResponse = {
  workflows: WorkflowExecution[];
  nextPageTokens: NextPageTokens;
};

type TimeRangeParameter = {
  timeRange?: Duration | string;
};

type StatusParameters = {
  status?: WorkflowStatus;
};

const createDate = (timeRange: Duration | string) => {
  const duration =
    typeof timeRange === 'string' ? toDuration(timeRange) : timeRange;
  return formatISO(sub(new Date(), duration));
};

const emptyWorkflowRequest = (): Promise<ListWorkflowExecutionsResponse> => {
  return Promise.resolve({
    executions: [],
  });
};

export const fetchOpenWorkflows = (
  namespace: string,
  { timeRange }: TimeRangeParameter,
  request = fetch,
): Promise<ListWorkflowExecutionsResponse> => {
  return requestFromAPI<ListWorkflowExecutionsResponse>(
    `/namespaces/${namespace}/workflows/open`,
    {
      params: {
        'start_time_filter.earliest_time': createDate(
          timeRange || { hours: 24 },
        ),
      },
      request,
    },
  );
};

export const fetchClosedWorkflows = (
  namespace: string,
  { timeRange, status }: TimeRangeParameter & StatusParameters,
  request = fetch,
): Promise<ListWorkflowExecutionsResponse> => {
  const params: Record<string, string> = {
    'start_time_filter.earliest_time': createDate(timeRange || { hours: 24 }),
  };
  const statusFilter = getStatusFilterCode(status);
  if (statusFilter) params['status_filter.status'] = statusFilter;

  return requestFromAPI<ListWorkflowExecutionsResponse>(
    `/namespaces/${namespace}/workflows/closed`,
    {
      params,
      request,
    },
  );
};

export const fetchAllWorkflows = async (
  namespace: string,
  { timeRange, status }: TimeRangeParameter & StatusParameters,
  request = fetch,
): Promise<CombinedWorkflowExecutionsResponse> => {
  const requests: Promise<ListWorkflowExecutionsResponse>[] = [];

  if (!status || status === 'Running') {
    requests.push(fetchOpenWorkflows(namespace, { timeRange }, request));
  } else {
    requests.push(emptyWorkflowRequest());
  }

  if (status || status !== 'Running') {
    requests.push(fetchClosedWorkflows(namespace, { status }, request));
  } else {
    requests.push(emptyWorkflowRequest());
  }

  const [open, closed] = await Promise.all(requests);
  const executions = [...open?.executions, ...closed?.executions];

  return {
    workflows: toWorkflowExecutions({ executions }),
    nextPageTokens: {
      open: open.nextPageToken,
      closed: closed.nextPageToken,
    },
  };
};

export async function fetchWorkflow(
  { executionId, runId, namespace }: GetWorkflowExecutionRequest,
  request = fetch,
): Promise<WorkflowExecution> {
  return requestFromAPI(
    `/namespaces/${namespace}/workflows/${executionId}/executions/${runId}`,
    { request },
  ).then(toWorkflowExecution);
}

export async function fetchWorkflowWithEventHistory(
  parameters: GetWorkflowExecutionRequest,
  request = fetch,
): Promise<{ workflow: WorkflowExecution; events: HistoryEventWithId[] }> {
  const [workflow, events] = await Promise.all([
    fetchWorkflow(parameters, request),
    fetchEvents(parameters, request).then(toEventHistory),
  ]);

  return { workflow, events };
}
