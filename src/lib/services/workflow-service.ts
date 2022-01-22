import type { ListWorkflowExecutionsResponse } from '$types';
import type { WorkflowExecution } from '$lib/models/workflow-execution';

import { requestFromAPI } from '$lib/utilities/request-from-api';

import {
  toWorkflowExecution,
  toWorkflowExecutions,
} from '$lib/models/workflow-execution';

import { routeForApi } from '$lib/utilities/route-for-api';
import { toListWorkflowQuery } from '$lib/utilities/list-workflow-query';

export type GetWorkflowExecutionRequest = NamespaceScopedRequest & {
  executionId: string;
  runId: string;
};

type CombinedWorkflowExecutionsResponse = {
  workflows: WorkflowExecution[];
  nextPageToken: string;
};

export const fetchAllWorkflows = async (
  namespace: string,
  parameters: FilterParameters,
  request = fetch,
): Promise<CombinedWorkflowExecutionsResponse> => {
  const query = toListWorkflowQuery(parameters);

  const { executions, nextPageToken } =
    (await requestFromAPI<ListWorkflowExecutionsResponse>(
      routeForApi('workflows', { namespace }),
      {
        params: { query },
        request,
      },
    )) ?? { executions: [], nextPageToken: '' };

  return {
    workflows: toWorkflowExecutions({ executions }),
    nextPageToken: String(nextPageToken),
  };
};

export async function fetchWorkflow(
  parameters: GetWorkflowExecutionRequest,
  request = fetch,
): Promise<WorkflowExecution> {
  return requestFromAPI(routeForApi('workflow', parameters), { request }).then(
    toWorkflowExecution,
  );
}

export const fetchAllArchivedWorkflows = async (
  namespace: string,
  parameters: FilterParameters,
  request = fetch,
): Promise<CombinedWorkflowExecutionsResponse> => {
  const query = toListWorkflowQuery(parameters);

  const { executions, nextPageToken } =
    (await requestFromAPI<ListWorkflowExecutionsResponse>(
      routeForApi('archive', { namespace }),
      {
        params: { query },
        request,
      },
    )) ?? { executions: [], nextPageToken: '' };

  return {
    workflows: toWorkflowExecutions({ executions }),
    nextPageToken: String(nextPageToken),
  };
};

// Finish archive fetch.
// export async function fetchArchive(
//   parameters: GetWorkflowExecutionRequest,
//   request = fetch,
// ): Promise<WorkflowExecution> {
//   return requestFromAPI(routeForApi('archive', parameters), { request }).then(
//     toWorkflowExecution,
//   );
// }

// curl 'http://localhost:8088/api/namespaces/default/workflows/archived?endTime=2022-01-21T23%3A59%3A59.999Z&startTime=2022-01-20T23%3A00%3A00.000Z&status=COMPLETED' \
//   -H 'Connection: keep-alive' \
//   -H 'sec-ch-ua: " Not;A Brand";v="99", "Google Chrome";v="97", "Chromium";v="97"' \
//   -H 'Accepts: application/json' \
//   -H 'sec-ch-ua-mobile: ?0' \
//   -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36' \
//   -H 'sec-ch-ua-platform: "macOS"' \
//   -H 'Accept: */*' \
//   -H 'Sec-Fetch-Site: same-origin' \
//   -H 'Sec-Fetch-Mode: cors' \
//   -H 'Sec-Fetch-Dest: empty' \
//   -H 'Referer: http://localhost:8088/namespaces/default/archival/basic?status=Failed' \
//   -H 'Accept-Language: en-US,en;q=0.9' \
//   -H 'Cookie: _csrf=DL62PWO1aHqLqPVjBzpfrcv2rBHAQuAA; koa.sess=eyJzZWNyZXQiOiJINEV6NFZVeWptNkY5MWhUdUVadk43NHIiLCJfZXhwaXJlIjoxNjQyODkwODI5NTYwLCJfbWF4QWdlIjo4NjQwMDAwMH0=; koa.sess.sig=P_dYs0itiC4pQb5kx1BtC1cCM-c; csrf-token=VAobFVye-r4qCvodwWFbfl_4xG69F6wy6cpU; csrf-token.sig=MNQVnm7uNGZeMNHDt-EpvbD_uX8' \
//   --compressed

// curl 'http://localhost:8080/api/v1/namespaces/default/workflows/archived?endTime=2022-01-18T23%3A59%3A59.999Z&startTime=2022-01-19T23%3A00%3A00.000Z&status=COMPLETED' \
// -H 'Connection: keep-alive' \
// -H 'sec-ch-ua: " Not;A Brand";v="99", "Google Chrome";v="97", "Chromium";v="97"' \
// -H 'Accepts: application/json' \
// -H 'sec-ch-ua-mobile: ?0' \
// -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36' \
// -H 'sec-ch-ua-platform: "macOS"' \
// -H 'Accept: */*' \
// -H 'Sec-Fetch-Site: same-origin' \
// -H 'Sec-Fetch-Mode: cors' \
// -H 'Sec-Fetch-Dest: empty' \
// -H 'Referer: http://localhost:8088/namespaces/default/archival/basic?status=Failed' \
// -H 'Accept-Language: en-US,en;q=0.9' \
// -H 'Cookie: _csrf=DL62PWO1aHqLqPVjBzpfrcv2rBHAQuAA; koa.sess=eyJzZWNyZXQiOiJINEV6NFZVeWptNkY5MWhUdUVadk43NHIiLCJfZXhwaXJlIjoxNjQyODkwODI5NTYwLCJfbWF4QWdlIjo4NjQwMDAwMH0=; koa.sess.sig=P_dYs0itiC4pQb5kx1BtC1cCM-c; csrf-token=VAobFVye-r4qCvodwWFbfl_4xG69F6wy6cpU; csrf-token.sig=MNQVnm7uNGZeMNHDt-EpvbD_uX8' \
// --compressed
