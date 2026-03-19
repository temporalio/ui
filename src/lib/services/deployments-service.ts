import type {
  CreateWorkerDeploymentRequest,
  CreateWorkerDeploymentResponse,
  DeploymentParameters,
  DeploymentVersionParameters,
  ListWorkerDeploymentsResponse,
  WorkerDeploymentResponse,
  WorkerDeploymentSummary,
  WorkerDeploymentVersionResponse,
} from '$lib/types/deployments';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
import type { ErrorCallback } from '$lib/utilities/request-from-api';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

type PaginatedDeploymentsPromise = (
  pageSize: number,
  token: string,
) => Promise<{ items: WorkerDeploymentSummary[]; nextPageToken: string }>;

export const fetchPaginatedDeployments = async (
  namespace: string,
  query: string,
  onError: ErrorCallback,
  request = fetch,
): Promise<PaginatedDeploymentsPromise> => {
  return (pageSize = 100, token = '') => {
    const route = routeForApi('worker-deployments', { namespace });
    return requestFromAPI<ListWorkerDeploymentsResponse>(route, {
      params: {
        maximumPageSize: String(pageSize),
        nextPageToken: token,
        ...(query ? { query } : {}),
      },
      request,
      onError,
    }).then(({ workerDeployments, nextPageToken }) => {
      return {
        items: workerDeployments,
        nextPageToken: nextPageToken ? String(nextPageToken) : '',
      };
    });
  };
};

export const createWorkerDeployment = async (
  request: CreateWorkerDeploymentRequest,
  onError?: ErrorCallback,
): Promise<CreateWorkerDeploymentResponse> => {
  const route = routeForApi('worker-deployment', {
    namespace: request.namespace,
    deploymentName: request.deploymentName,
  });
  return requestFromAPI<CreateWorkerDeploymentResponse>(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt({
        deploymentName: request.deploymentName,
        computeConfig: request.computeConfig,
      }),
    },
    onError,
    notifyOnError: false,
  });
};

export const fetchDeployment = async (
  parameters: DeploymentParameters,
  request = fetch,
): Promise<WorkerDeploymentResponse> => {
  const route = routeForApi('worker-deployment', parameters);
  return requestFromAPI(route, { request });
};

export const fetchDeploymentVersion = async (
  parameters: DeploymentVersionParameters,
  request = fetch,
): Promise<WorkerDeploymentVersionResponse> => {
  const route = routeForApi('worker-deployment-version', parameters);
  return requestFromAPI(route, { request });
};
