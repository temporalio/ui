import type {
  DescribeWorkflowExecutionResponse,
  GetWorkflowExecutionHistoryResponse,
  ListWorkflowExecutionsResponse,
} from '$types/temporal/api/workflowservice/v1/request_response';

const base = 'http://localhost:8080/api/v1';

export const WorkflowExecutionAPI = {
  async getAll(request = fetch) {
    const { executions: open }: ListWorkflowExecutionsResponse = await request(
      `${base}/namespaces/default/workflows/open`,
    ).then((response) => response.json());

    const {
      executions: closed,
    }: ListWorkflowExecutionsResponse = await request(
      `${base}/namespaces/default/workflows/closed`,
    ).then((response) => response.json());

    return [...open, ...closed];
  },

  async get({ executionId, runId }, request = fetch) {
    const execution: DescribeWorkflowExecutionResponse = await request(
      `${base}/namespaces/default/workflows/${executionId}/executions/${runId}`,
    )
      .then((response) => response.json())
      .catch(console.error);

    const events: GetWorkflowExecutionHistoryResponse = await request(
      `${base}/namespaces/default/workflows/${executionId}/executions/${runId}/events`,
    )
      .then((response) => response.json())
      .catch(console.error);

    return {
      execution,
      events,
    };
  },
};
