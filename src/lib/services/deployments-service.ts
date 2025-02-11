import type {
  DeploymentParameters,
  DeploymentVersionParameters,
  ListWorkerDeploymentsResponse,
  WorkerDeploymentResponse,
  WorkerDeploymentSummary,
  WorkerDeploymentVersionResponse,
} from '$lib/types/deployments';
import type { ErrorCallback } from '$lib/utilities/request-from-api';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

type PaginatedDeploymentsPromise = (
  pageSize: number,
  token: string,
) => Promise<{ items: WorkerDeploymentSummary[]; nextPageToken: string }>;

const mockDeployments = [
  {
    name: 'my-app',
    createTime: '2025-02-10T15:54:55.423Z',
    routingConfig: {
      currentVersion: 'build.alpha.1',
      rampingVersion: 'build.alpha.2',
      rampingVersionPercentage: 25,
      currentVersionChangedTime: '2025-02-10T15:54:55.423Z',
      rampingVersionChangedTime: '2025-02-10T15:54:55.423Z',
      rampingVersionPercentageChangedTime: '2025-02-10T15:54:55.423Z',
    },
  },
  {
    name: 'my-other-app',
    createTime: '2025-02-10T18:54:55.423Z',
    routingConfig: {
      currentVersion: 'build.omega.1',
      rampingVersion: 'build.omega.2',
      rampingVersionPercentage: 5,
      currentVersionChangedTime: '2025-02-10T18:54:55.423Z',
      rampingVersionChangedTime: '2025-02-10T20:54:55.423Z',
      rampingVersionPercentageChangedTime: '2025-02-10T19:54:55.423Z',
    },
  },
];

export const mockWorkerDeploymentResponse = {
  nextPageToken: 'string',
  items: mockDeployments,
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
        maximumPageSize: String(pageSize),
        nextPageToken: token,
        ...(query ? { query } : {}),
      },
      request,
      onError,
      notifyOnError: false,
    })
      .then(({ workerDeployments, nextPageToken }) => {
        return {
          items: workerDeployments,
          nextPageToken: nextPageToken ? String(nextPageToken) : '',
        };
      })
      .catch((_error) => {
        return mockWorkerDeploymentResponse;
      });
  };
};

const mockDeployment = {
  conflictToken: 'string',
  workerDeploymentInfo: {
    name: 'my-app',
    versionSummaries: [
      {
        version: 'build.alpha.1',
        createTime: '2025-02-10T17:54:57.986Z',
        drainageStatus: 'Draining',
      },
      {
        version: 'build.alpha.2',
        createTime: '2025-02-10T17:54:57.986Z',
        drainageStatus: 'Drained',
      },
      {
        version: 'build.beta.3',
        createTime: '2025-02-11T18:54:57.986Z',
        drainageStatus: 'Drained',
      },
    ],
    createTime: '2025-02-10T17:54:57.986Z',
    routingConfig: {
      currentVersion: 'build.alpha.1',
      rampingVersion: 'build.alpha.2',
      rampingVersionPercentage: 25,
      currentVersionChangedTime: '2025-02-10T15:54:55.423Z',
      rampingVersionChangedTime: '2025-02-10T15:54:55.423Z',
      rampingVersionPercentageChangedTime: '2025-02-10T15:54:55.423Z',
    },
    lastModifierIdentity: '@me',
  },
};

export const fetchDeployment = async (
  parameters: DeploymentParameters,
  request = fetch,
): Promise<WorkerDeploymentResponse> => {
  const route = routeForApi('worker-deployment', parameters);
  return requestFromAPI(route, { request, notifyOnError: false }).catch(
    (_error) => {
      return mockDeployment;
    },
  );
};

const mockDeploymentVersion = {
  workerDeploymentVersionInfo: {
    version: 'build.alpha.1',
    deploymentName: 'my-app',
    createTime: '2025-02-11T15:13:16.972Z',
    routingChangedTime: '2025-02-11T15:13:16.972Z',
    currentSinceTime: '2025-02-11T15:13:16.972Z',
    rampingSinceTime: '2025-02-11T15:13:16.972Z',
    rampPercentage: 25,
    taskQueueInfos: [
      {
        name: 'default',
        type: 'TASK_QUEUE_TYPE_UNSPECIFIED',
      },
    ],
    drainageInfo: {
      status: 'VERSION_DRAINAGE_STATUS_UNSPECIFIED',
      lastChangedTime: '2025-02-11T15:13:16.972Z',
      lastCheckedTime: '2025-02-11T15:13:16.972Z',
    },
    metadata: {
      entries: {
        additionalProp1: 'string',
        additionalProp2: 'string',
        additionalProp3: 'string',
      },
    },
  },
};

export const fetchDeploymentVersion = async (
  parameters: DeploymentVersionParameters,
  request = fetch,
): Promise<WorkerDeploymentVersionResponse> => {
  const route = routeForApi('worker-deployment-version', parameters);
  return requestFromAPI(route, { request, notifyOnError: false }).catch(
    (_error) => {
      return mockDeploymentVersion;
    },
  );
};
