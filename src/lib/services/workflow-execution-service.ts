import type { WorkflowExecutionInfo } from '$types/temporal/api/workflow/v1/message';
import type {
  DescribeWorkflowExecutionResponse,
  GetWorkflowExecutionHistoryResponse,
  ListWorkflowExecutionsResponse,
} from '$types/temporal/api/workflowservice/v1/request_response';

const base = 'http://localhost:8080/api/v1';

type GetAllWorkflowExecutionsRequest = { namespace: string };
type GetWorkflowExecutionRequest = GetAllWorkflowExecutionsRequest & {
  executionId: string;
  runId: string;
};

export const WorkflowExecutionAPI = {
  async getAll(
    { namespace }: GetAllWorkflowExecutionsRequest,
    request = fetch,
  ): Promise<WorkflowExecutionInfo[]> {
    const { executions: open }: ListWorkflowExecutionsResponse = await request(
      `${base}/namespaces/${namespace}/workflows/open`,
    ).then((response) => response.json());

    const {
      executions: closed,
    }: ListWorkflowExecutionsResponse = await request(
      `${base}/namespaces/${namespace}/workflows/closed`,
    ).then((response) => response.json());

    return [...open, ...closed];
  },

  async get(
    { executionId, runId, namespace }: GetWorkflowExecutionRequest,
    request = fetch,
  ): Promise<{
    execution: DescribeWorkflowExecutionResponse;
  }> {
    const execution: DescribeWorkflowExecutionResponse = await request(
      `${base}/namespaces/${namespace}/workflows/${executionId}/executions/${runId}`,
    )
      .then((response) => response.json())
      .catch(console.error);

    return {
      execution,
    };
  },

  async getEvents(
    { executionId, runId, namespace }: GetWorkflowExecutionRequest,
    request = fetch,
  ): Promise<{
    events: GetWorkflowExecutionHistoryResponse;
  }> {
    const events: GetWorkflowExecutionHistoryResponse = await request(
      `${base}/namespaces/${namespace}/workflows/${executionId}/executions/${runId}/events`,
    )
      .then((response) => response.json())
      .catch(console.error);

    return {
      events,
    };
  },
};
