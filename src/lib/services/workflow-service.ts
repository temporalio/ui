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
import { getStatusFilterCode } from '$lib/utilities/get-workflow-status-filter-code';
import { convertEventPayloadFromDataConverter } from './data-converter';
import { get } from 'svelte/store';
import { dataConverterPort } from '$lib/stores/data-converter-config';

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
  { timeRange, status }: TimeRangeParameter & StatusParameters,
  request = fetch,
): Promise<ListWorkflowExecutionsResponse> => {
  if (status && status !== 'Running') return emptyWorkflowRequest();
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
  if (status === 'Running') return emptyWorkflowRequest();

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
  const [open, closed] = await Promise.all([
    fetchOpenWorkflows(namespace, { timeRange, status }, request),
    fetchClosedWorkflows(namespace, { timeRange, status }, request),
  ]);
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
  const port = get(dataConverterPort);

  const [workflow, events] = await Promise.all([
    fetchWorkflow(parameters, request),
    fetchEvents({ ...parameters, rawPayloads: Boolean(port) }, request)
      .then(toEventHistory)
      .then(async (events) => {
        if (port !== null) {
          try {
            // This is not my favorite code, but it mutates the events object inside the function call.
            // we should definitely refactor this but this was essentially pulled from the original web project
            // we can write this better using some Svelte primitives
            await convertEventPayloadFromDataConverter(events, port);
          } catch {
            // This code is a bit side effecty, but the convert function handles it's error
            // by just ignoring it and setting the error state for dataConverter then sending back the
            // original payload.
          }
        }

        // No matter what we want to return events. Even if they aren't data-converted
        return Promise.resolve(events);
      }),
  ]);

  return { workflow, events };
}
