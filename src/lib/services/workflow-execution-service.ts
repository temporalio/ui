import { sub, formatISO } from 'date-fns';

import { paginated } from '$lib/utilities/paginated';
import { toURL } from '$lib/utilities/to-url';
import type {
  WorkflowExecutionInfo,
  PollerInfo,
  TaskQueueStatus,
  DescribeWorkflowExecutionResponse,
  GetWorkflowExecutionHistoryResponse,
  ListWorkflowExecutionsResponse,
} from '$types';

const base = 'http://localhost:8080/api/v1';

export type NamespaceScopedRequest = { namespace: string };
export type GetWorkflowExecutionRequest = NamespaceScopedRequest & {
  executionId: string;
  runId: string;
};

export type GetAllPollersRequest = NamespaceScopedRequest & { queue: string };
export type GetPollersResponse = {
  pollers: PollerInfo[];
  taskQueueStatus: TaskQueueStatus;
};

type FetchWorkflows<T> = NamespaceScopedRequest & {
  onUpdate?: (results: Omit<T, 'nextPageToken'>) => void;
  startTime?: Duration;
  request?: typeof fetch;
};

type FetchEvents = FetchWorkflows<GetWorkflowExecutionHistoryResponse> & {
  executionId: string;
  runId: string;
};

const fetchWorkflows =
  (type: 'open' | 'closed') =>
  async ({
    namespace,
    onUpdate = (x) => x,
    startTime = { days: 1 },
    request = fetch,
  }: FetchWorkflows<ListWorkflowExecutionsResponse>) => {
    const { executions } = await paginated(async (token: string) => {
      const url = toURL(`${base}/namespaces/${namespace}/workflows/${type}`, {
        next_page_token: token,
        'start_time_filter.earliest_time': 1631308914,
      });

      const response = await request(url);
      return await response.json();
    }, onUpdate);

    return executions;
  };

export const fetchOpenWorkflows = fetchWorkflows('open');
export const fetchClosedWorkflows = fetchWorkflows('closed');
export const fetchAllWorkflows = (
  options:
    | Parameters<typeof fetchOpenWorkflows>[0]
    | Parameters<typeof fetchClosedWorkflows>[0],
) => {
  fetchOpenWorkflows(options);
  fetchClosedWorkflows(options);
};

export const fetchEvents = async ({
  namespace,
  executionId,
  runId,
  onUpdate = (x) => x,
  request = fetch,
}: FetchEvents) => {
  const events: GetWorkflowExecutionHistoryResponse = await paginated(
    async (token: string) => {
      const url = toURL(
        `${base}/namespaces/${namespace}/workflows/${executionId}/executions/${runId}/events`,
        {
          next_page_token: token,
        },
      );

      const response = await request(url);
      return await response.json();
    },
    onUpdate,
  );

  return events;
};

export const WorkflowExecutionAPI = {
  async getAll(
    { namespace }: NamespaceScopedRequest,
    request = fetch,
  ): Promise<WorkflowExecutionInfo[]> {
    const open = await fetchOpenWorkflows({ namespace, request });
    const closed = await fetchClosedWorkflows({ namespace, request });

    return [].concat(open).concat(closed);
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
