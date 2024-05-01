import type {
  PendingActivity,
  PendingActivityInfo,
  PendingChildren,
} from '$lib/types/events';
import type {
  DecodedWorkflowSearchAttributes,
  ListWorkflowExecutionsResponse,
  WorkflowExecution,
  WorkflowExecutionAPIResponse,
  WorkflowSearchAttributes,
} from '$lib/types/workflows';
import { decodePayload } from '$lib/utilities/decode-payload';
import { toWorkflowStatusReadable } from '$lib/utilities/screaming-enums';

import { simplifyAttributes } from './event-history/simplify-attributes';

const toPendingActivities = (
  pendingActivity: PendingActivityInfo[] = [],
): PendingActivity[] => {
  return pendingActivity.map((activity): PendingActivity => {
    const attributes = simplifyAttributes(activity, true);
    const id = activity.activityId;

    return { ...attributes, id };
  });
};

const toSearchAttributes = (
  apiSearchAttributes: WorkflowSearchAttributes,
): DecodedWorkflowSearchAttributes => {
  if (!apiSearchAttributes || !apiSearchAttributes.indexedFields) return {};
  const decoded = Object.entries(apiSearchAttributes.indexedFields).reduce(
    (searchAttributes, [searchAttributeName, payload]) => {
      return {
        ...searchAttributes,
        [searchAttributeName]: decodePayload(payload),
      };
    },
    {},
  );

  return {
    indexedFields: decoded,
  };
};

export const toWorkflowExecution = (
  response?: WorkflowExecutionAPIResponse,
): WorkflowExecution => {
  const searchAttributes = toSearchAttributes(
    response.workflowExecutionInfo.searchAttributes,
  );
  const memo = response.workflowExecutionInfo.memo;
  const name = response.workflowExecutionInfo.type.name;
  const id = response.workflowExecutionInfo.execution.workflowId;
  const runId = response.workflowExecutionInfo.execution.runId;
  const startTime = response.workflowExecutionInfo.startTime;
  const endTime = response.workflowExecutionInfo.closeTime;
  const executionTime = response.workflowExecutionInfo.executionTime;
  const status = toWorkflowStatusReadable(
    response.workflowExecutionInfo.status,
  );
  const isRunning = status === 'Running';
  const historyEvents = response.workflowExecutionInfo.historyLength;
  const historySizeBytes = response.workflowExecutionInfo.historySizeBytes;
  const url = `/workflows/${id}/${runId}`;
  const taskQueue =
    response?.executionConfig?.taskQueue?.name ||
    response?.workflowExecutionInfo?.taskQueue;
  const mostRecentWorkerVersionStamp =
    response?.workflowExecutionInfo?.mostRecentWorkerVersionStamp;
  const parentNamespaceId = response?.workflowExecutionInfo?.parentNamespaceId;
  const parent = response?.workflowExecutionInfo?.parentExecution;
  const stateTransitionCount =
    response.workflowExecutionInfo.stateTransitionCount;
  const defaultWorkflowTaskTimeout =
    response.executionConfig?.defaultWorkflowTaskTimeout;

  const pendingActivities: PendingActivity[] = toPendingActivities(
    response.pendingActivities,
  );
  const pendingChildren: PendingChildren[] = response?.pendingChildren ?? [];

  return {
    name,
    id,
    runId,
    startTime,
    endTime,
    executionTime,
    status,
    historyEvents,
    historySizeBytes,
    searchAttributes,
    memo,
    url,
    taskQueue,
    mostRecentWorkerVersionStamp,
    pendingActivities,
    pendingChildren,
    parentNamespaceId,
    parent,
    stateTransitionCount,
    isRunning,
    defaultWorkflowTaskTimeout,
    get canBeTerminated(): boolean {
      // Figure out how to pass settings
      // return isRunning && writeActionsAreAllowed();
      return isRunning;
    },
  };
};

export const toWorkflowExecutions = (
  response: Pick<ListWorkflowExecutionsResponse, 'executions'>,
): WorkflowExecution[] => {
  return (response.executions || []).map((workflowExecutionInfo) =>
    toWorkflowExecution({ workflowExecutionInfo }),
  );
};
