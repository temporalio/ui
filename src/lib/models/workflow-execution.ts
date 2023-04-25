import { decodePayload } from '$lib/utilities/decode-payload';
import { isNull } from '$lib/utilities/is';
import { writeActionsAreAllowed } from '$lib/utilities/write-actions-are-allowed';
import { simplifyAttributes } from './event-history/simplify-attributes';
import type {
  PendingActivityInfo,
  PendingActivity,
  PendingChildren,
} from '$lib/types/events';
import type {
  WorkflowExecution,
  ListWorkflowExecutionsResponse,
  WorkflowSearchAttributes,
  DecodedWorkflowSearchAttributes,
  WorkflowExecutionAPIResponse,
} from '$lib/types/workflows';
import type { WorkflowExecutionStatus } from '$lib/types';

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

const mapStatusToFriendlyStatus = (status: WorkflowExecutionStatus): string => {
  const map = {
    WORKFLOW_EXECUTION_STATUS_UNSPECIFIED: '',
    WORKFLOW_EXECUTION_STATUS_RUNNING: 'Running',
    WORKFLOW_EXECUTION_STATUS_COMPLETED: 'Completed',
    WORKFLOW_EXECUTION_STATUS_FAILED: 'Failed',
    WORKFLOW_EXECUTION_STATUS_CANCELED: 'Canceled',
    WORKFLOW_EXECUTION_STATUS_TERMINATED: 'Terminated',
    WORKFLOW_EXECUTION_STATUS_CONTINUED_AS_NEW: "Cont'd as New",
    WORKFLOW_EXECUTION_STATUS_TIMED_OUT: 'TimedOut',
  };

  return map[status] ?? status;
};

export const toWorkflowExecution = (
  response?: WorkflowExecutionAPIResponse,
): WorkflowExecution => {
  const name = response.workflowExecutionInfo.type.name;
  const id = response.workflowExecutionInfo.execution.workflowId;
  const runId = response.workflowExecutionInfo.execution.runId;
  const startTime = response.workflowExecutionInfo.startTime;
  const endTime = response.workflowExecutionInfo.closeTime;
  const status = mapStatusToFriendlyStatus(
    response.workflowExecutionInfo.status,
  );
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
  const searchAttributes = toSearchAttributes(
    response.workflowExecutionInfo?.searchAttributes ?? null,
  );

  return {
    name,
    id,
    runId,
    startTime,
    endTime,
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
