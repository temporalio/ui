import { formatDate } from '$lib/utilities/format-date';
import type { WorkflowExecutionStatus } from '$types/temporal/api/enums/v1/workflow';
import type { DescribeWorkflowExecutionResponse } from '$types/temporal/api/workflowservice/v1/request_response';

export interface WorkflowExecutionResponse {
  name: string;
  id: string;
  runId: string;
  startTime: string;
  endTime: string;
  status: WorkflowExecutionStatus;
  taskQueue: string;
  historyEvents: number;
}

export class WorkflowExecutionResponse {
  constructor(response: DescribeWorkflowExecutionResponse) {
    this.name = response.workflowExecutionInfo.type.name;
    this.id = response.workflowExecutionInfo.execution.workflowId;
    this.runId = response.workflowExecutionInfo.execution.runId;
    this.startTime = formatDate(response.workflowExecutionInfo.startTime);
    this.endTime = formatDate(response.workflowExecutionInfo.closeTime);
    this.status = response.workflowExecutionInfo.status;
    this.taskQueue = response.executionConfig.taskQueue.name;
    this.historyEvents = response.workflowExecutionInfo.historyLength;
  }

  toggleUrl(isFullScreen: boolean) {
    return `/workflows/${this.id}/${this.runId}?${new URLSearchParams({
      fullScreen: (!isFullScreen).toString(),
    })}`;
  }
}
