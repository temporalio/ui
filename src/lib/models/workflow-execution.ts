import type {
  WorkflowExecutionStatus,
  PendingActivityInfo,
  WorkflowExecutionInfo,
  DescribeWorkflowExecutionResponse,
} from '$types';

import { formatDate } from '$lib/utilities/format-date';
import get from 'lodash/get';

type Optional<T extends unknown, K extends keyof T = keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type WorkflowExecution = {
  name: string;
  id: string;
  runId: string;
  startTime: string;
  endTime: string;
  status: WorkflowExecutionStatus;
  taskQueue?: string;
  historyEvents: Long;
  pendingActivities: PendingActivityInfo[];
  url: string;
  toggleUrl: (isFullScreen: boolean) => string;
};

type WorkflowExecutionAPIResponse = Optional<
  DescribeWorkflowExecutionResponse,
  'executionConfig' | 'pendingActivities' | 'pendingChildren'
>;

export const toWorkflowExecution = (
  response: WorkflowExecutionAPIResponse,
): WorkflowExecution => {
  const name = response.workflowExecutionInfo.type.name;
  const id = response.workflowExecutionInfo.execution.workflowId;
  const runId = response.workflowExecutionInfo.execution.runId;
  const startTime = formatDate(response.workflowExecutionInfo.startTime);
  const endTime = formatDate(response.workflowExecutionInfo.closeTime);
  const status = response.workflowExecutionInfo.status;
  const historyEvents = response.workflowExecutionInfo.historyLength;
  const url = `/workflows/${id}/${runId}`;
  const taskQueue = get(response, 'executionConfig.taskQueue.name');
  const pendingActivities = response.pendingActivities || [];

  const toggleUrl = (isFullScreen: boolean): string => {
    return `${url}?${new URLSearchParams({
      fullScreen: (!isFullScreen).toString(),
    })}`;
  };

  return {
    name,
    id,
    runId,
    startTime,
    endTime,
    status,
    historyEvents,
    url,
    toggleUrl,
    taskQueue,
    pendingActivities,
  };
};

export const toWorkflowExecutions = (
  executions: WorkflowExecutionInfo[],
): WorkflowExecution[] => {
  return (executions || []).map((workflowExecutionInfo) =>
    toWorkflowExecution({ workflowExecutionInfo }),
  );
};
