import { fetchWorkflow } from '$lib/services/workflow-service';
import type {
  WorkflowExecutionStatus,
  DescribeWorkflowExecutionResponse,
  ListWorkflowExecutionsResponse,
} from '$types';

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
  pendingActivities: PendingActivity[];
  url: string;
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
  const startTime = String(response.workflowExecutionInfo.startTime);
  const endTime = String(response.workflowExecutionInfo.closeTime);
  const status = response.workflowExecutionInfo.status;
  const historyEvents = response.workflowExecutionInfo.historyLength;
  const url = `/workflows/${id}/${runId}`;
  const taskQueue = response?.executionConfig?.taskQueue?.name;
  const pendingActivities: PendingActivity[] =
    (response.pendingActivities as unknown as PendingActivity[]) || [];

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
  };
};

export const toWorkflowExecutions = (
  response: Pick<ListWorkflowExecutionsResponse, 'executions'>,
): WorkflowExecution[] => {
  return (response.executions || []).map((workflowExecutionInfo) =>
    toWorkflowExecution({ workflowExecutionInfo }),
  );
};
