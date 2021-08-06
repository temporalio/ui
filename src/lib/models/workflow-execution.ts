import { formatDate } from '$lib/utilities/format-date';
import type { WorkflowExecutionStatus } from '$types/temporal/api/enums/v1/workflow';
import type { PendingActivityInfo } from '$types/temporal/api/workflow/v1/message';
import type { DescribeWorkflowExecutionResponse } from '$types/temporal/api/workflowservice/v1/request_response';

type Optional<T extends unknown, K extends keyof T = keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export interface WorkflowExecution {
  name: string;
  id: string;
  runId: string;
  startTime: string;
  endTime: string;
  status: WorkflowExecutionStatus;
  taskQueue?: string;
  historyEvents: number;
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

    this.pendingActivities = pendingActivities || [];
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
