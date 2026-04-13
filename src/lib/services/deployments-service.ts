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

export const updateWorkerDeploymentVersionComputeConfig = async (
  parameters: DeploymentVersionParameters & { computeConfig: ComputeConfig },
  onError?: ErrorCallback,
): Promise<void> => {
  const route = routeForApi(
    'worker-deployment-version-compute-config',
    parameters,
  );
  const computeConfigScalingGroups = Object.fromEntries(
    Object.entries(parameters.computeConfig.scalingGroups ?? {}).map(
      ([name, group]) => [name, { scalingGroup: group }],
    ),
  );
  return requestFromAPI<void>(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt({ computeConfigScalingGroups }),
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
  const computeConfigScalingGroups = Object.fromEntries(
    Object.entries(parameters.computeConfig.scalingGroups ?? {}).map(
      ([name, group]) => [name, { scalingGroup: group }],
    ),
  );
  return requestFromAPI<{ valid: boolean; message?: string }>(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt({ computeConfigScalingGroups }),
    },
    onError,
    notifyOnError: false,
  });
};

export const setCurrentDeploymentVersion = async (
  request: DeploymentVersionParameters,
  onError?: ErrorCallback,
): Promise<void> => {
  const route = routeForApi('worker-deployment-set-current-version', {
    namespace: request.namespace,
    deploymentName: request.deploymentName,
  });
  await requestFromAPI<unknown>(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt({
        version: `${request.deploymentName}.${request.buildId}`,
      }),
    },
    onError,
  });
};

export const buildLambdaComputeConfig = (
  lambdaArn: string,
  iamRoleArn: string,
  scalingOptions?: {
    scaleUpCooloffMs?: number;
    scaleUpBacklogThreshold?: number;
    maxWorkerLifetimeMs?: number;
    scaleUpDispatchRateEpsilon?: number;
    metricsPollIntervalMs?: number;
    roleExternalId?: string;
  },
): ComputeConfig => {
  const providerPayload: Record<string, string> = {
    arn: lambdaArn,
    role: iamRoleArn,
  };
  if (scalingOptions?.roleExternalId)
    providerPayload['role_external_id'] = scalingOptions.roleExternalId;
  const providerJson = JSON.stringify(providerPayload);
  const providerData = btoa(providerJson);
  const encoding = btoa('json/plain');

  const scalerConfig: Record<string, number> = {};
  if (scalingOptions) {
    if (scalingOptions.scaleUpCooloffMs !== undefined)
      scalerConfig['scale_up_cooloff_ms'] = scalingOptions.scaleUpCooloffMs;
    if (scalingOptions.scaleUpBacklogThreshold !== undefined)
      scalerConfig['scale_up_backlog_threshold'] =
        scalingOptions.scaleUpBacklogThreshold;
    if (scalingOptions.maxWorkerLifetimeMs !== undefined)
      scalerConfig['max_worker_lifetime_ms'] =
        scalingOptions.maxWorkerLifetimeMs;
    if (scalingOptions.scaleUpDispatchRateEpsilon !== undefined)
      scalerConfig['scale_up_dispatch_rate_epsilon'] =
        scalingOptions.scaleUpDispatchRateEpsilon;
    if (scalingOptions.metricsPollIntervalMs !== undefined)
      scalerConfig['metrics_poll_interval_ms'] =
        scalingOptions.metricsPollIntervalMs;
  }

  return {
    scalingGroups: {
      default: {
        taskQueueTypes: [
          'TASK_QUEUE_TYPE_WORKFLOW',
          'TASK_QUEUE_TYPE_ACTIVITY',
        ],
        provider: {
          type: 'aws-lambda',
          details: { metadata: { encoding }, data: providerData },
        },
        scaler: {
          type: 'no-sync',
          details: {
            metadata: { encoding },
            data: btoa(JSON.stringify(scalerConfig)),
          },
        },
      },
    },
  };
};

export const decodeLambdaProviderDetails = (
  computeConfig?: ComputeConfig,
): { lambdaArn?: string; iamRoleArn?: string; roleExternalId?: string } => {
  const scalingGroup = Object.values(computeConfig?.scalingGroups ?? {})[0];
  if (!scalingGroup?.provider?.details?.data) return {};
  try {
    const raw = JSON.parse(atob(scalingGroup.provider.details.data));
    const result: {
      lambdaArn?: string;
      iamRoleArn?: string;
      roleExternalId?: string;
    } = {};
    if (raw.arn) result.lambdaArn = raw.arn;
    if (raw.role) result.iamRoleArn = raw.role;
    if (raw.role_external_id) result.roleExternalId = raw.role_external_id;
    return result;
  } catch {
    return {};
  }
};

export const decodeScalerDetails = (
  computeConfig?: ComputeConfig,
): {
  scaleUpCooloffMs?: number;
  scaleUpBacklogThreshold?: number;
  maxWorkerLifetimeMs?: number;
  scaleUpDispatchRateEpsilon?: number;
  metricsPollIntervalMs?: number;
} => {
  const scalingGroup = Object.values(computeConfig?.scalingGroups ?? {})[0];
  if (!scalingGroup?.scaler?.details?.data) return {};
  try {
    const raw = JSON.parse(atob(scalingGroup.scaler.details.data));
    const result: ReturnType<typeof decodeScalerDetails> = {};
    if (raw['scale_up_cooloff_ms'] !== undefined)
      result.scaleUpCooloffMs = raw['scale_up_cooloff_ms'];
    if (raw['scale_up_backlog_threshold'] !== undefined)
      result.scaleUpBacklogThreshold = raw['scale_up_backlog_threshold'];
    if (raw['max_worker_lifetime_ms'] !== undefined)
      result.maxWorkerLifetimeMs = raw['max_worker_lifetime_ms'];
    if (raw['scale_up_dispatch_rate_epsilon'] !== undefined)
      result.scaleUpDispatchRateEpsilon = raw['scale_up_dispatch_rate_epsilon'];
    if (raw['metrics_poll_interval_ms'] !== undefined)
      result.metricsPollIntervalMs = raw['metrics_poll_interval_ms'];
    return result;
  } catch {
    return {};
  }
};
