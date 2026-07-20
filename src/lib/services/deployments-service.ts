import type {
  ComputeConfig,
  ComputeConfigScalingGroup,
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

const emptyVersionSummary = { version: '', createTime: {} };

const emptyWorkerDeploymentResponse: WorkerDeploymentResponse = {
  conflictToken: '',
  workerDeploymentInfo: {
    name: '',
    createTime: {},
    routingConfig: {},
    currentVersionSummary: emptyVersionSummary,
    lastModifierIdentity: '',
    versionSummaries: [],
  },
};

const emptyWorkerDeploymentVersionResponse: WorkerDeploymentVersionResponse = {
  workerDeploymentVersionInfo: {
    version: '',
    deploymentName: '',
    createTime: {},
    routingChangedTime: {},
    currentSinceTime: {},
    rampingSinceTime: {},
    rampPercentage: 0,
    taskQueueInfos: [],
    drainageInfo: {
      status: '',
      lastChangedTime: {},
      lastCheckedTime: {},
    },
    metadata: {
      entries: {},
    },
  },
};

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
        pageSize: String(pageSize),
        nextPageToken: token,
        ...(query ? { query } : {}),
      },
      request,
      onError,
    }).then((response) => {
      const { workerDeployments, nextPageToken } = response ?? {};
      return {
        items: workerDeployments ?? [],
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
  }).then((response) => response ?? { conflictToken: '' });
};

export const fetchDeployment = async (
  parameters: DeploymentParameters,
  request = fetch,
  onError?: ErrorCallback,
  notifyOnError = true,
  signal?: AbortSignal,
): Promise<WorkerDeploymentResponse> => {
  const route = routeForApi('worker-deployment', parameters);
  return requestFromAPI<WorkerDeploymentResponse>(route, {
    request,
    onError,
    notifyOnError,
    options: { signal },
  }).then((response) => response ?? emptyWorkerDeploymentResponse);
};

export const fetchDeploymentVersion = async (
  parameters: DeploymentVersionParameters,
  request = fetch,
): Promise<WorkerDeploymentVersionResponse> => {
  const route = routeForApi('worker-deployment-version', parameters);
  return requestFromAPI<WorkerDeploymentVersionResponse>(route, {
    request,
  }).then((response) => response ?? emptyWorkerDeploymentVersionResponse);
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

const toScalingGroupsPayload = (
  computeConfig: ComputeConfig,
): Record<
  string,
  { scalingGroup: ComputeConfigScalingGroup; updateMask: string }
> =>
  Object.fromEntries(
    Object.entries(computeConfig.scalingGroups ?? {}).map(([name, group]) => [
      name,
      { scalingGroup: group, updateMask: 'provider,scaler' },
    ]),
  );

export const updateWorkerDeploymentVersionComputeConfig = async (
  parameters: DeploymentVersionParameters & { computeConfig: ComputeConfig },
  onError?: ErrorCallback,
): Promise<void> => {
  const route = routeForApi(
    'worker-deployment-version-compute-config',
    parameters,
  );
  const computeConfigScalingGroups = toScalingGroupsPayload(
    parameters.computeConfig,
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
  const computeConfigScalingGroups = toScalingGroupsPayload(
    parameters.computeConfig,
  );
  return requestFromAPI<{ valid: boolean; message?: string }>(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt({ computeConfigScalingGroups }),
    },
    onError,
    notifyOnError: false,
  }).then((response) => response ?? { valid: false });
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

export const unsetCurrentDeploymentVersion = async (
  parameters: DeploymentParameters & { conflictToken?: string },
  onError?: ErrorCallback,
): Promise<void> => {
  const route = routeForApi(
    'worker-deployment-set-current-version',
    parameters,
  );
  await requestFromAPI<unknown>(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt({
        buildId: '',
        ...(parameters.conflictToken
          ? { conflictToken: parameters.conflictToken }
          : {}),
      }),
    },
    onError,
    notifyOnError: false,
  });
};

export const setRampingDeploymentVersion = async (
  request: DeploymentVersionParameters & {
    rampingVersionPercentage: number;
    conflictToken?: string;
  },
  onError?: ErrorCallback,
): Promise<void> => {
  const route = routeForApi('worker-deployment-set-ramping-version', {
    namespace: request.namespace,
    deploymentName: request.deploymentName,
  });
  await requestFromAPI<unknown>(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt({
        buildId: request.buildId,
        percentage: request.rampingVersionPercentage,
        ...(request.conflictToken
          ? { conflictToken: request.conflictToken }
          : {}),
      }),
    },
    onError,
  });
};

export const removeRampingDeploymentVersion = async (
  request: DeploymentParameters & { conflictToken?: string },
  onError?: ErrorCallback,
): Promise<void> => {
  const route = routeForApi('worker-deployment-set-ramping-version', request);
  await requestFromAPI<unknown>(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt({
        buildId: '',
        ...(request.conflictToken
          ? { conflictToken: request.conflictToken }
          : {}),
      }),
    },
    onError,
  });
};

export const setRampingUnversionedWorkers = async (
  parameters: DeploymentParameters & { percentage: number },
  onError?: ErrorCallback,
): Promise<void> => {
  const route = routeForApi(
    'worker-deployment-set-ramping-version',
    parameters,
  );
  await requestFromAPI<unknown>(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt({
        buildId: '',
        percentage: parameters.percentage,
      }),
    },
    onError,
    notifyOnError: false,
  });
};

export const removeRampingUnversionedWorkers = async (
  parameters: DeploymentParameters & { conflictToken?: string },
  onError?: ErrorCallback,
): Promise<void> => {
  const route = routeForApi(
    'worker-deployment-set-ramping-version',
    parameters,
  );
  await requestFromAPI<unknown>(route, {
    options: {
      method: 'POST',
      body: stringifyWithBigInt({
        buildId: '',
        ...(parameters.conflictToken
          ? { conflictToken: parameters.conflictToken }
          : {}),
      }),
    },
    onError,
    notifyOnError: false,
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
  if (scalingOptions?.scaleUpCooloffMs !== undefined)
    scalerConfig['scale_up_cooloff_ms'] = scalingOptions.scaleUpCooloffMs;
  if (scalingOptions?.scaleUpBacklogThreshold !== undefined)
    scalerConfig['scale_up_backlog_threshold'] =
      scalingOptions.scaleUpBacklogThreshold;
  if (scalingOptions?.maxWorkerLifetimeMs !== undefined)
    scalerConfig['max_worker_lifetime_ms'] = scalingOptions.maxWorkerLifetimeMs;
  if (scalingOptions?.scaleUpDispatchRateEpsilon !== undefined)
    scalerConfig['scale_up_dispatch_rate_epsilon'] =
      scalingOptions.scaleUpDispatchRateEpsilon;
  if (scalingOptions?.metricsPollIntervalMs !== undefined)
    scalerConfig['metrics_poll_interval_ms'] =
      scalingOptions.metricsPollIntervalMs;

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

export const buildGcpCloudRunComputeConfig = (
  project: string,
  region: string,
  workerPool: string,
  serviceAccount: string,
): ComputeConfig => {
  const providerPayload: Record<string, string> = {
    project,
    region,
    worker_pool: workerPool,
    service_account: serviceAccount,
  };
  const providerData = btoa(JSON.stringify(providerPayload));
  const encoding = btoa('json/plain');

  return {
    scalingGroups: {
      default: {
        taskQueueTypes: [
          'TASK_QUEUE_TYPE_WORKFLOW',
          'TASK_QUEUE_TYPE_ACTIVITY',
        ],
        provider: {
          type: 'gcp-cloud-run',
          details: { metadata: { encoding }, data: providerData },
        },
      },
    },
  };
};

const providerTypeOf = (scalingGroup?: ComputeConfigScalingGroup) =>
  scalingGroup?.providerType ?? scalingGroup?.provider?.type;

export const decodeLambdaProviderDetails = (
  computeConfig?: ComputeConfig,
): { lambdaArn?: string; iamRoleArn?: string; roleExternalId?: string } => {
  const scalingGroup = Object.values(computeConfig?.scalingGroups ?? {})[0];
  if (providerTypeOf(scalingGroup) !== 'aws-lambda') return {};
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

export const decodeGcpCloudRunProviderDetails = (
  computeConfig?: ComputeConfig,
): {
  gcpProject?: string;
  gcpRegion?: string;
  gcpWorkerPool?: string;
  gcpServiceAccount?: string;
} => {
  const scalingGroup = Object.values(computeConfig?.scalingGroups ?? {})[0];
  if (providerTypeOf(scalingGroup) !== 'gcp-cloud-run') return {};
  if (!scalingGroup?.provider?.details?.data) return {};
  try {
    const raw = JSON.parse(atob(scalingGroup.provider.details.data));
    const result: ReturnType<typeof decodeGcpCloudRunProviderDetails> = {};
    if (raw.project) result.gcpProject = raw.project;
    if (raw.region) result.gcpRegion = raw.region;
    if (raw.worker_pool) result.gcpWorkerPool = raw.worker_pool;
    if (raw.service_account) result.gcpServiceAccount = raw.service_account;
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
