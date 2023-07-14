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
import { isNull } from '$lib/utilities/is';
import { writeActionsAreAllowed } from '$lib/utilities/write-actions-are-allowed';

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
  if (isNull(apiSearchAttributes) || isNull(apiSearchAttributes.indexedFields))
    return {};
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
  const name = response.workflowExecutionInfo.type.name;
  const id = response.workflowExecutionInfo.execution.workflowId;
  const runId = response.workflowExecutionInfo.execution.runId;
  const startTime = response.workflowExecutionInfo.startTime;
  const endTime = response.workflowExecutionInfo.closeTime;
  const executionTime = response.workflowExecutionInfo.executionTime;
  const status = response.workflowExecutionInfo.status;
  const isRunning = response.workflowExecutionInfo.status === 'Running';
  const historyEvents = response.workflowExecutionInfo.historyLength;
  const historySizeBytes = response.workflowExecutionInfo.historySizeBytes;
  const url = `/workflows/${id}/${runId}`;
  const taskQueue =
    response?.executionConfig?.taskQueue?.name ||
    response?.workflowExecutionInfo?.taskQueue;
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
    url,
    taskQueue,
    pendingActivities,
    pendingChildren,
    parentNamespaceId,
    parent,
    stateTransitionCount,
    isRunning,
    defaultWorkflowTaskTimeout,
    get canBeTerminated(): boolean {
      return isRunning && writeActionsAreAllowed();
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
