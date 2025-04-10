import { WorkflowService } from '@buf/temporalio_api.bufbuild_es/temporal/api/workflowservice/v1/service_pb.js';
import { createClient } from '@connectrpc/connect';
import { createConnectTransport } from '@connectrpc/connect-web';

import type { CountWorkflowExecutionsResponse } from '$lib/types/workflows';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

export const fetchWorkflowCount = async (
  namespace: string,
  query: string,
  request = fetch,
): Promise<{ count: number }> => {
  let count = 0;
  try {
    const countRoute = routeForApi('workflows.count', { namespace });
    const result = await requestFromAPI<{ count: string }>(countRoute, {
      params: query ? { query } : {},
      onError: () => {},
      handleError: () => {},
      request,
    });
    count = parseInt(result?.count || '0');
  } catch (e) {
    // Don't fail the workflows call due to count
  }

  return { count };
};

type WorkflowCountByExecutionStatusOptions = {
  namespace: string;
  query: string;
};

const transport = createConnectTransport({
  baseUrl: 'https://demo.connectrpc.com',
});
const workflowServiceClient = createClient(WorkflowService, transport);

const letsHopeThisThing = workflowServiceClient.countWorkflowExecutions({
  namespace: '',
  query: {},
});

const letsHopeThisThingDuex = workflowServiceClient.countWorkflowExecutions({
  namespace: '',
  query: {},
});

// const thing = workflowServiceClient.

// letsHopeThisThing;

export const fetchWorkflowCountByExecutionStatus = async ({
  namespace,
  query,
}: WorkflowCountByExecutionStatusOptions): Promise<CountWorkflowExecutionsResponse> => {
  const groupByClause = 'GROUP BY ExecutionStatus';
  const countRoute = routeForApi('workflows.count', {
    namespace,
  });
  const { count, groups } =
    await requestFromAPI<CountWorkflowExecutionsResponse>(countRoute, {
      params: {
        query: query ? `${query} ${groupByClause}` : `${groupByClause}`,
      },
      notifyOnError: false,
    });
  return { count: count ?? '0', groups };
};

export const fetchScheduleCount = async ({
  namespace,
}: {
  namespace: string;
}): Promise<string> => {
  const query =
    'TemporalNamespaceDivision="TemporalScheduler" AND ExecutionStatus="Running"';
  const countRoute = routeForApi('workflows.count', {
    namespace,
  });
  const { count } = await requestFromAPI<CountWorkflowExecutionsResponse>(
    countRoute,
    {
      params: {
        query,
      },
      notifyOnError: false,
    },
  );
  return count ?? '0';
};
