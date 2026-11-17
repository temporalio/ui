import { createGroupedEventBuffer } from '$lib/services/grouped-event-buffer';
import { WorkflowHistoryController } from '$lib/services/workflow-history-controller.svelte';
import { fetchWorkflow } from '$lib/services/workflow-service';
import type { GetWorkflowExecutionHistoryResponse } from '$lib/types/events';
import { handleUnauthorizedOrForbiddenError } from '$lib/utilities/handle-error';
import {
  type APIErrorResponse,
  type ErrorCallback,
  requestFromAPI,
} from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

import type { ChainClient } from './types';

const handleRequestError: ErrorCallback = (error) => {
  handleUnauthorizedOrForbiddenError(error);
  throw error;
};

const describe: ChainClient['describe'] = async (
  { namespace, workflowId, runId },
  signal,
) => {
  const { workflow, error } = await fetchWorkflow(
    { namespace, workflowId, runId },
    (input, init) => fetch(input, { ...init, signal }),
  );
  if (error) {
    handleUnauthorizedOrForbiddenError(error as unknown as APIErrorResponse);
    throw error;
  }
  if (!workflow) {
    throw new Error('Missing workflow execution response.');
  }
  return workflow;
};

const fetchStartedEvent: ChainClient['fetchStartedEvent'] = async (
  { namespace, workflowId, runId },
  signal,
) => {
  const response = await requestFromAPI<GetWorkflowExecutionHistoryResponse>(
    routeForApi('events.ascending', { namespace, workflowId }),
    {
      request: fetch,
      params: { 'execution.runId': runId, maximumPageSize: '1' },
      options: { signal },
      handleError: handleRequestError,
    },
  );
  const startedEvent = response?.history?.events?.[0];
  if (!startedEvent) {
    throw new Error('Missing workflow execution started event.');
  }
  return startedEvent;
};

const createController: ChainClient['createController'] = (
  workflowExecutionIdentity,
  { onClose, onFirstEvent },
) => {
  const buffer = createGroupedEventBuffer();
  const unsubscribe = buffer.onChange(() => {
    if (buffer.getLazyGroups().length === 0) {
      return;
    }
    unsubscribe();
    onFirstEvent();
  });
  return new WorkflowHistoryController({
    workflowExecutionIdentity,
    buffer,
    onClose,
  });
};

export const client: ChainClient = {
  describe,
  fetchStartedEvent,
  createController,
};
