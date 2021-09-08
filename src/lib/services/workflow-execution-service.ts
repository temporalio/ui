import type {
  WorkflowExecutionInfo,
  PollerInfo,
  TaskQueueStatus,
  DescribeWorkflowExecutionResponse,
  GetWorkflowExecutionHistoryResponse,
  ListWorkflowExecutionsResponse,
} from '$types';

const base = 'http://localhost:8080/api/v1';

export type GetAllWorkflowExecutionsResponse = {
  executions: WorkflowExecutionInfo[];
  nextPageTokens: {
    open?: string;
    closed?: string;
  };
};
export type GetAllWorkflowExecutionsRequest = { namespace: string };
export type GetWorkflowExecutionRequest = GetAllWorkflowExecutionsRequest & {
  executionId: string;
  runId: string;
};

export type GetAllPollersRequest = { namespace: string; queue: string };
export type GetPollersResponse = {
  pollers: PollerInfo[];
  taskQueueStatus: TaskQueueStatus;
};

type FetchWorkflows = {
  namespace: string;
  nextPageToken?: string;
};

const fetchWorkflows =
  (type: string) =>
  async ({ namespace, nextPageToken }: FetchWorkflows, request = fetch) => {
    return request(`${base}/namespaces/${namespace}/workflows/${type}`).then(
      (response) => response.json(),
    );
  };

export const fetchOpenWorkflows = fetchWorkflows('open');
export const fetchClosedWorkflows = fetchWorkflows('closed');

export const WorkflowExecutionAPI = {
  async getAll(
    { namespace }: GetAllWorkflowExecutionsRequest,
    request = fetch,
  ): Promise<GetAllWorkflowExecutionsResponse> {
    const {
      executions: open,
      nextPageToken: nextPageTokenOpen,
    }: ListWorkflowExecutionsResponse = await fetchOpenWorkflows(
      { namespace },
      request,
    );

    const {
      executions: closed,
      nextPageToken: nextPageTokenClosed,
    }: ListWorkflowExecutionsResponse = await fetchClosedWorkflows(
      { namespace },
      request,
    );

    return {
      executions: [].concat(open).concat(closed),
      nextPageTokens: {
        open: String(nextPageTokenOpen),
        closed: String(nextPageTokenClosed),
      },
    };
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

  async getPollers(
    { queue, namespace }: GetAllPollersRequest,
    request = fetch,
  ): Promise<GetPollersResponse> {
    const pollersWorkflow: GetPollersResponse = await request(
      `${base}/namespaces/${namespace}/task-queues/${queue}?task_queue_type=1`,
    )
      .then((response) => response.json())
      .catch(console.error);

    const pollersActivity: GetPollersResponse = await request(
      `${base}/namespaces/${namespace}/task-queues/${queue}?task_queue_type=2`,
    )
      .then((response) => response.json())
      .catch(console.error);

    pollersActivity.pollers.forEach((poller) => {
      poller[`taskQueueTypes`] = ['ACTIVITY'];
    });

    pollersWorkflow.pollers.forEach((poller) => {
      poller[`taskQueueTypes`] = ['WORKFLOW'];
    });

    const r = (type) => (o, poller) => {
      const i = o[poller.identity] || {};

      o[poller.identity] = {
        lastAccessTime:
          !i.lastAccessTime || i.lastAccessTime < poller.lastAccessTime
            ? poller.lastAccessTime
            : i.lastAccessTime,
        taskQueueTypes: i.taskQueueTypes
          ? i.taskQueueTypes.concat([type])
          : [type],
      };

      return o;
    };

    pollersActivity.pollers.filter((pollerA) =>
      pollersWorkflow.pollers.some((pollerW) => {
        if (pollerA.identity === pollerW.identity) {
          pollerA['taskQueueTypes'] = [
            ...pollerW['taskQueueTypes'],
            ...pollerA['taskQueueTypes'],
          ];
          return pollerA;
        }
      }),
    );

    pollersActivity.pollers.reduce(
      r('ACTIVITY'),
      pollersWorkflow.pollers.reduce(r('WORKFLOW'), {}),
    );

    return {
      pollers: pollersActivity.pollers,
      taskQueueStatus: pollersActivity.taskQueueStatus,
    };
  },
};
