import { decodePayloadAttributes } from '$lib/utilities/decode-payload';
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

export const toWorkflowExecution = (
  response?: WorkflowExecutionAPIResponse,
): WorkflowExecution => {
  const { searchAttributes, memo } = decodePayloadAttributes(
    response?.workflowExecutionInfo,
  );
  const name = response.workflowExecutionInfo.type.name;
  const id = response.workflowExecutionInfo.execution.workflowId;
  const runId = response.workflowExecutionInfo.execution.runId;
  const startTime = response.workflowExecutionInfo.startTime;
  const endTime = response.workflowExecutionInfo.closeTime;
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
    status,
    historyEvents,
    historySizeBytes,
    searchAttributes,
    memo,
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
