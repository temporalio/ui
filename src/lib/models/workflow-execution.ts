import { simplifyAttributes } from './event-history/simplify-attributes';

const toPendingActivities = (
  pendingActivity: PendingActivityInfo[] = [],
): PendingActivity[] => {
  return pendingActivity.map((activity) => {
    const attributes = simplifyAttributes(activity, true);
    const id = activity.activityId;

    return { ...attributes, id } as unknown as PendingActivity;
  });
};

export const toWorkflowExecution = (
  response?: WorkflowExecutionAPIResponse,
): WorkflowExecution => {
  const name = response.workflowExecutionInfo.type.name;
  const id = response.workflowExecutionInfo.execution.workflowId;
  const runId = response.workflowExecutionInfo.execution.runId;
  const startTime = String(response.workflowExecutionInfo.startTime);
  const endTime = String(response.workflowExecutionInfo.closeTime);
  const status = response.workflowExecutionInfo.status;
  const isRunning = response.workflowExecutionInfo.status === 'Running';
  const historyEvents = response.workflowExecutionInfo.historyLength;
  const url = `/workflows/${id}/${runId}`;
  const taskQueue = response?.executionConfig?.taskQueue?.name;
  const parentNamespaceId = response?.workflowExecutionInfo?.parentNamespaceId;
  const parent = response?.workflowExecutionInfo?.parentExecution;
  const stateTransitionCount =
    response.workflowExecutionInfo.stateTransitionCount;
  const defaultWorkflowTaskTimeout = response.executionConfig?.defaultWorkflowTaskTimeout;

  const pendingActivities: PendingActivity[] = toPendingActivities(
    response.pendingActivities,
  );

  return {
    name,
    id,
    runId,
    startTime,
    endTime,
    status,
    historyEvents,
    url,
    taskQueue,
    pendingActivities,
    parentNamespaceId,
    parent,
    stateTransitionCount,
    isRunning,
    defaultWorkflowTaskTimeout,
  };
};

export const toWorkflowExecutions = (
  response: Pick<ListWorkflowExecutionsResponse, 'executions'>,
): WorkflowExecution[] => {
  return (response.executions || []).map((workflowExecutionInfo) =>
    toWorkflowExecution({ workflowExecutionInfo }),
  );
};
