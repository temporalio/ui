import type {
  WorkflowExecutionStatus,
  PendingActivityInfo,
  WorkflowExecutionInfo,
  DescribeWorkflowExecutionResponse,
} from '$types';

import { formatDate } from '$lib/utilities/format-date';

type Optional<T extends unknown, K extends keyof T = keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export const toWorkflowExecution = (response: WorkflowExecutionAPIResponse) => {
  return new WorkflowExecution(response);
};

export const toWorkflowExecutions = (response: {
  executions: WorkflowExecutionInfo[];
}) => {
  return {
    executions: response.executions.map(
      (workflowExecutionInfo) =>
        new WorkflowExecution({ workflowExecutionInfo }),
    ),
  };
};

/*
 * Internal use only. Use the utility methods above for formatting workflow
 * execution API responses.
 */

export interface WorkflowExecution {
  name: string;
  id: string;
  runId: string;
  startTime: string;
  endTime: string;
  status: WorkflowExecutionStatus;
  taskQueue?: string;
  historyEvents: Long;
  pendingActivities: PendingActivityInfo[];
}

type WorkflowExecutionAPIResponse = Optional<
  DescribeWorkflowExecutionResponse,
  'executionConfig' | 'pendingActivities' | 'pendingChildren'
>;

export class WorkflowExecution {
  constructor({
    executionConfig,
    workflowExecutionInfo,
    pendingActivities,
  }: WorkflowExecutionAPIResponse) {
    this.name = workflowExecutionInfo.type.name;
    this.id = workflowExecutionInfo.execution.workflowId;
    this.runId = workflowExecutionInfo.execution.runId;
    this.startTime = formatDate(workflowExecutionInfo.startTime);
    this.endTime = formatDate(workflowExecutionInfo.closeTime);
    this.status = workflowExecutionInfo.status;
    this.historyEvents = workflowExecutionInfo.historyLength;

    if (executionConfig) {
      this.taskQueue = executionConfig.taskQueue.name;
    }

    this.pendingActivities = pendingActivities;
  }

  get url(): string {
    return `/workflows/${this.id}/${this.runId}`;
  }

  toggleUrl(isFullScreen: boolean): string {
    return `${this.url}?${new URLSearchParams({
      fullScreen: (!isFullScreen).toString(),
    })}`;
  }
}
