import type { Page } from '@playwright/test';

export const WORKERS_API = /\/api\/v1\/namespaces\/[^/]+\/workers\?.*$/;

const MOCK_WORKERS = {
  workersInfo: [
    {
      workerHeartbeat: {
        workerInstanceKey: 'worker-instance-1',
        status: 'WORKER_STATUS_ALIVE',
        deploymentVersion: {
          deploymentName: 'my-deployment',
          buildId: 'build-abc123',
        },
        taskQueue: 'my-task-queue',
        workerIdentity: 'worker-1@host-1',
        hostInfo: {
          hostName: 'host-1.example.com',
        },
        startTime: { seconds: '1711500000', nanos: 0 },
        sdkName: 'temporal-go',
        sdkVersion: '1.41.0',
      },
    },
    {
      workerHeartbeat: {
        workerInstanceKey: 'worker-instance-2',
        status: 'WORKER_STATUS_ALIVE',
        deploymentVersion: {
          deploymentName: 'my-deployment',
          buildId: 'build-abc123',
        },
        taskQueue: 'my-task-queue',
        workerIdentity: 'worker-2@host-2',
        hostInfo: {
          hostName: 'host-2.example.com',
        },
        startTime: { seconds: '1711500100', nanos: 0 },
        sdkName: 'temporal-go',
        sdkVersion: '1.41.0',
      },
    },
  ],
  nextPageToken: '',
};

const MOCK_EMPTY_WORKERS = {
  workersInfo: [],
  nextPageToken: '',
};

export const mockWorkersApi = (page: Page, empty = false) => {
  return page.route(WORKERS_API, (route) => {
    route.fulfill({ json: empty ? MOCK_EMPTY_WORKERS : MOCK_WORKERS });
  });
};
