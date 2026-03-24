import type { EditFormData } from '$lib/components/workers/serverless-worker-form/shared';
import type {
  MockValidationResult,
  ServerlessWorker,
  ServerlessWorkerDetail,
} from '$lib/types/serverless-workers';

const MOCK_TASK_QUEUES = [
  'order-processing',
  'payment-tasks',
  'notification-queue',
  'etl-pipeline',
];

let mockWorkers: ServerlessWorker[] = [
  {
    id: 'slw-a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    name: 'order-processor',
    status: 'running',
    compute: 'Lambda',
    lambdaArn:
      'arn:aws:lambda:us-east-1:123456789012:function:temporal-order-processor',
    iamRoleArn:
      'arn:aws:iam::123456789012:role/temporal-order-processor-execution-role',
    region: 'us-east-1',
    minInstances: 1,
    maxInstances: 10,
    lastHeartbeat: '2025-12-27T23:06:15.500Z',
    sdkVersion: 'Python 1.17.0',
    createdAt: '2024-11-01T09:00:00Z',
    updatedAt: '2024-11-15T14:22:00Z',
  },
  {
    id: 'slw-b2c3d4e5-f6a7-8901-bcde-f12345678901',
    name: 'payment-handler',
    status: 'running',
    compute: 'Lambda',
    lambdaArn:
      'arn:aws:lambda:us-west-2:123456789012:function:temporal-payment-handler',
    iamRoleArn:
      'arn:aws:iam::123456789012:role/temporal-payment-handler-execution-role',
    region: 'us-west-2',
    minInstances: 0,
    maxInstances: 5,
    lastHeartbeat: '2025-12-27T23:06:15.500Z',
    sdkVersion: 'TypeScript 2.9.2',
    createdAt: '2024-10-15T11:30:00Z',
    updatedAt: '2024-11-20T08:45:00Z',
  },
  {
    id: 'slw-c3d4e5f6-a7b8-9012-cdef-123456789012',
    name: 'notification-sender',
    status: 'stopped',
    compute: 'Cloud Run',
    lambdaArn:
      'arn:aws:lambda:eu-west-1:123456789012:function:temporal-notification-sender',
    iamRoleArn:
      'arn:aws:iam::123456789012:role/temporal-notification-sender-execution-role',
    region: 'eu-west-1',
    minInstances: 2,
    maxInstances: 20,
    lastHeartbeat: '2025-12-27T23:06:15.500Z',
    sdkVersion: 'Python 1.17.0',
    createdAt: '2024-09-20T16:00:00Z',
    updatedAt: '2024-11-22T03:12:00Z',
  },
  {
    id: 'slw-d4e5f6a7-b8c9-0123-defa-234567890123',
    name: 'data-pipeline',
    status: 'draining',
    compute: 'Self-Managed',
    lambdaArn:
      'arn:aws:lambda:ap-southeast-1:123456789012:function:temporal-data-pipeline',
    iamRoleArn:
      'arn:aws:iam::123456789012:role/temporal-data-pipeline-execution-role',
    region: 'ap-southeast-1',
    minInstances: 1,
    maxInstances: 8,
    lastHeartbeat: '2025-12-27T23:06:15.500Z',
    sdkVersion: 'Python 1.17.0',
    createdAt: '2024-11-25T10:00:00Z',
    updatedAt: '2024-11-25T10:00:00Z',
  },
];

const MOCK_LAMBDA_ARNS = mockWorkers.map((w) => w.lambdaArn);
const MOCK_IAM_ROLE_ARNS = mockWorkers.map((w) => w.iamRoleArn);

export function getServerlessWorkers(): ServerlessWorker[] {
  return mockWorkers;
}

export function getServerlessWorker(id: string): ServerlessWorker | undefined {
  return mockWorkers.find((w) => w.id === id);
}

export function getServerlessWorkerDetail(
  id: string,
): ServerlessWorkerDetail | undefined {
  const worker = getServerlessWorker(id);
  if (!worker) return undefined;

  const mockMetricsCard = (slotType: string, pollerStrategy: string) => ({
    slotType,
    slotsUsed: Math.floor(Math.random() * 8) + 1,
    slotsAvailable: 100,
    tasksProcessed: Math.floor(Math.random() * 5000) + 100,
    pollerCount: Math.floor(Math.random() * 5) + 1,
    pollerStrategy,
    lastPoll: new Date(Date.now() - Math.random() * 60000).toISOString(),
  });

  return {
    ...worker,
    metrics: {
      workflow: mockMetricsCard('Fixed', 'Autoscaling'),
      activity: mockMetricsCard('Resource based', 'Autoscaling'),
      nexus: mockMetricsCard('Fixed', 'Manual'),
      localActivities: mockMetricsCard('Fixed', 'Autoscaling'),
    },
    hostInfo: {
      region: worker.region,
      hostName: `ip-10-0-${Math.floor(Math.random() * 255)}-${Math.floor(Math.random() * 255)}.ec2.internal`,
      processId: String(Math.floor(Math.random() * 65535) + 1000),
      instanceKey: crypto.randomUUID().slice(0, 8),
      workerGroupingKey: `${worker.name}-group-1`,
      cpuUsage: Math.floor(Math.random() * 60) + 10,
      memoryUsage: Math.floor(Math.random() * 50) + 20,
    },
    cache: {
      cacheSize: Math.floor(Math.random() * 500) + 50,
      cacheHitsPercent: Math.floor(Math.random() * 30) + 70,
      activeThreadCount: Math.floor(Math.random() * 8) + 2,
    },
    diagnostics: {
      pollSuccessRatePercent: Math.floor(Math.random() * 5) + 95,
      rateLimit: 0,
    },
    versions: [
      {
        status: 'Current' as const,
        name: `${worker.name}-v3`,
        buildId: `build-${crypto.randomUUID().slice(0, 8)}`,
        deployedAt: worker.updatedAt,
      },
      {
        status: 'Ramping' as const,
        name: `${worker.name}-v4`,
        buildId: `build-${crypto.randomUUID().slice(0, 8)}`,
        deployedAt: new Date(Date.now() - 86400000).toISOString(),
        rampingPercentage: 25,
      },
      {
        status: 'Draining' as const,
        name: `${worker.name}-v2`,
        buildId: `build-${crypto.randomUUID().slice(0, 8)}`,
        deployedAt: new Date(Date.now() - 604800000).toISOString(),
      },
      {
        status: 'Drained' as const,
        name: `${worker.name}-v1`,
        buildId: `build-${crypto.randomUUID().slice(0, 8)}`,
        deployedAt: new Date(Date.now() - 2592000000).toISOString(),
      },
    ],
  };
}

export function deleteServerlessWorker(id: string): boolean {
  const index = mockWorkers.findIndex((w) => w.id === id);
  if (index === -1) return false;
  mockWorkers = mockWorkers.filter((w) => w.id !== id);
  return true;
}

export function updateServerlessWorker(
  id: string,
  input: EditFormData,
): ServerlessWorker | undefined {
  const index = mockWorkers.findIndex((w) => w.id === id);
  if (index === -1) return undefined;
  const updated = {
    ...mockWorkers[index],
    ...input,
    updatedAt: new Date().toISOString(),
  };
  mockWorkers = mockWorkers.map((w) => (w.id === id ? updated : w));
  return updated;
}

export async function validateLambdaArn(
  arn: string,
): Promise<MockValidationResult> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  if (!arn.startsWith('arn:aws:lambda:')) {
    return { valid: false, message: 'Invalid Lambda ARN format' };
  }
  if (MOCK_LAMBDA_ARNS.includes(arn)) {
    return { valid: true, message: 'Lambda function verified' };
  }
  return {
    valid: false,
    message:
      'Lambda function not found. Verify the ARN and ensure the function exists in the specified region.',
  };
}

export async function validateIamRole(
  arn: string,
): Promise<MockValidationResult> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  if (!arn.startsWith('arn:aws:iam::')) {
    return { valid: false, message: 'Invalid IAM role ARN format' };
  }
  if (MOCK_IAM_ROLE_ARNS.includes(arn)) {
    return { valid: true, message: 'Permissions verified' };
  }
  return {
    valid: false,
    message:
      'IAM role lacks required permissions. Ensure the role has a trust policy allowing Temporal to assume it.',
  };
}

export async function validateRegion(
  region: string,
  namespaceRegion: string = 'us-west-2',
): Promise<MockValidationResult> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  if (region === namespaceRegion) {
    return { valid: true, message: 'Region matches namespace region' };
  }
  return {
    valid: true,
    message: `Cross-region latency warning: worker in ${region}, namespace in ${namespaceRegion}`,
  };
}

export async function validateTaskQueue(
  name: string,
): Promise<MockValidationResult> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  if (MOCK_TASK_QUEUES.includes(name)) {
    return { valid: true, message: 'Task queue found' };
  }
  return {
    valid: true,
    message:
      'This will create a new task queue. Serverless workers require a dedicated task queue.',
  };
}
