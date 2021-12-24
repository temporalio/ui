import { get } from 'svelte/store';

import type { ListWorkflowExecutionsResponse } from '$types';
import type { WorkflowExecution } from '$lib/models/workflow-execution';

import { requestFromAPI } from '$lib/utilities/request-from-api';

import {
  toWorkflowExecution,
  toWorkflowExecutions,
} from '$lib/models/workflow-execution';
import { toEventHistory } from '$lib/models/event-history';

import { fetchEvents } from './events-service';
import { convertEventPayloadFromDataConverter } from './data-converter';

import { dataConverterPort } from '$lib/stores/data-converter-config';
import { getWorkflowFilterParameters } from '$lib/utilities/get-workflow-filter-parameters';

export type GetWorkflowExecutionRequest = NamespaceScopedRequest & {
  executionId: string;
  runId: string;
};

type CombinedWorkflowExecutionsResponse = {
  workflows: WorkflowExecution[];
  nextPageTokens: NextPageTokens;
};

const emptyWorkflowRequest = (): Promise<ListWorkflowExecutionsResponse> => {
  return Promise.resolve({
    executions: [],
  });
};

const checkForStatus =
  (workflowStatus: WorkflowStatus, value: boolean) =>
  ({ status }: FilterParameters): boolean => {
    if (status === workflowStatus) return value;
    return !value;
  };

const filterIsSetToRunning = checkForStatus('Running', true);
const filterIsNotSetToRunning = checkForStatus('Running', false);

export const fetchOpenWorkflows = (
  namespace: string,
  parameters: FilterParameters,
  request = fetch,
): Promise<ListWorkflowExecutionsResponse> => {
  if (filterIsNotSetToRunning(parameters)) return emptyWorkflowRequest();

  const params = getWorkflowFilterParameters(parameters);

  return requestFromAPI<ListWorkflowExecutionsResponse>(
    `/namespaces/${namespace}/workflows/open`,
    {
      params,
      request,
    },
  );
};

export const fetchClosedWorkflows = (
  namespace: string,
  parameters: FilterParameters,
  request = fetch,
): Promise<ListWorkflowExecutionsResponse> => {
  if (filterIsSetToRunning(parameters)) return emptyWorkflowRequest();

  const params = getWorkflowFilterParameters(parameters);

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
  parameters: FilterParameters,
  request = fetch,
): Promise<CombinedWorkflowExecutionsResponse> => {
  const [open, closed] = await Promise.all([
    fetchOpenWorkflows(namespace, parameters, request),
    fetchClosedWorkflows(namespace, parameters, request),
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
