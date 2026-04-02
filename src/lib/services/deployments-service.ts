import type {
  ComputeConfig,
  CreateWorkerDeploymentRequest,
  CreateWorkerDeploymentResponse,
  CreateWorkerDeploymentVersionRequest,
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

export const deleteWorkerDeployment = async (
  parameters: DeploymentParameters & { conflictToken?: string },
  onError?: ErrorCallback,
): Promise<void> => {
  const route = routeForApi('worker-deployment', parameters);
  return requestFromAPI<void>(route, {
    options: {
      method: 'DELETE',
      ...(parameters.conflictToken
        ? {
            body: stringifyWithBigInt({
              conflictToken: parameters.conflictToken,
            }),
          }
        : {}),
    },
    onError,
    notifyOnError: false,
  });
};

export const deleteWorkerDeploymentVersion = async (
  parameters: DeploymentVersionParameters & { conflictToken?: string },
  onError?: ErrorCallback,
): Promise<void> => {
  const route = routeForApi('worker-deployment-version', parameters);
  return requestFromAPI<void>(route, {
    options: {
      method: 'DELETE',
      ...(parameters.conflictToken
        ? {
            body: stringifyWithBigInt({
              conflictToken: parameters.conflictToken,
            }),
          }
        : {}),
    },
    onError,
    notifyOnError: false,
  });
};

export const createWorkerDeploymentVersion = async (
  request: CreateWorkerDeploymentVersionRequest,
  onError?: ErrorCallback,
): Promise<void> => {
  const route = routeForApi('worker-deployment-versions', {
    namespace: request.namespace,
    deploymentName: request.deploymentVersion.deploymentName,
  });
  return requestFromAPI<void>(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt({
        deploymentVersion: request.deploymentVersion,
        computeConfig: request.computeConfig,
        ...(request.identity ? { identity: request.identity } : {}),
        ...(request.requestId ? { requestId: request.requestId } : {}),
      }),
    },
    onError,
    notifyOnError: false,
  });
};

export const validateWorkerDeploymentVersionComputeConfig = async (
  parameters: DeploymentVersionParameters & { computeConfig: ComputeConfig },
  onError?: ErrorCallback,
): Promise<{ valid: boolean; message?: string }> => {
  const route = routeForApi(
    'worker-deployment-version-validate-compute-config',
    parameters,
  );
  return requestFromAPI<{ valid: boolean; message?: string }>(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt({ computeConfig: parameters.computeConfig }),
    },
    onError,
    notifyOnError: false,
  });
};

export const buildLambdaComputeConfig = (
  lambdaArn: string,
  iamRoleArn: string,
  scalingOptions?: {
    maxWorkers?: number;
    maxConcurrentActivities?: number;
    maxTaskQueueRate?: number;
    idleTimeoutSeconds?: number;
  },
): ComputeConfig => {
  const providerJson = JSON.stringify({ arn: lambdaArn, role: iamRoleArn });
  const providerData = btoa(providerJson);

  const scalerDetails =
    scalingOptions && Object.values(scalingOptions).some((v) => v !== undefined)
      ? scalingOptions
      : {};
  const scalerJson = JSON.stringify(scalerDetails);
  const scalerData = btoa(scalerJson);

  const encoding = btoa('json/plain');

  return {
    scalingGroups: {
      default: {
        taskQueueTypes: [
          'TASK_QUEUE_TYPE_WORKFLOW',
          'TASK_QUEUE_TYPE_ACTIVITY',
        ],
        provider: {
          type: 'aws-lambda',
          details: {
            metadata: { encoding },
            data: providerData,
          },
        },
        scaler: {
          type: 'no-sync',
          details: {
            metadata: { encoding },
            data: scalerData,
          },
        },
      },
    },
  };
};

export const decodeLambdaProviderDetails = (
  computeConfig?: ComputeConfig,
): { lambdaArn?: string; iamRoleArn?: string } => {
  const scalingGroup = Object.values(computeConfig?.scalingGroups ?? {})[0];
  if (!scalingGroup?.provider?.details?.data) return {};
  try {
    return JSON.parse(atob(scalingGroup.provider.details.data));
  } catch {
    return {};
  }
};
