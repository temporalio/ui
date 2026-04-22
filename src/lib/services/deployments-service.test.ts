import { afterEach, describe, expect, test, vi } from 'vitest';

import { base } from '$app/paths';

import {
  buildLambdaComputeConfig,
  createWorkerDeployment,
  createWorkerDeploymentVersion,
  decodeLambdaProviderDetails,
  decodeScalerDetails,
  deleteWorkerDeployment,
  deleteWorkerDeploymentVersion,
  fetchDeployment,
  fetchDeploymentVersion,
  fetchPaginatedDeployments,
  setCurrentDeploymentVersion,
  updateWorkerDeploymentVersionComputeConfig,
  validateWorkerDeploymentVersionComputeConfig,
} from './deployments-service';
import { getApiOrigin } from '../utilities/get-api-origin';
import { requestFromAPI } from '../utilities/request-from-api';

vi.mock('../utilities/request-from-api', () => ({
  requestFromAPI: vi.fn().mockImplementation(
    () =>
      new Promise((resolve) =>
        resolve({
          workerDeployments: [],
          nextPageToken: '',
        }),
      ),
  ),
}));

const origin = getApiOrigin();
const namespace = 'test-namespace';
const deploymentName = 'test-deployment';
const buildId = 'v1';
const encodedNamespace = encodeURIComponent(namespace);
const encodedDeploymentName = encodeURIComponent(deploymentName);
const encodedBuildId = encodeURIComponent(buildId);

describe('deployments service', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchPaginatedDeployments', () => {
    test('calls requestFromAPI with correct route and params', async () => {
      const fn = await fetchPaginatedDeployments(namespace, '', vi.fn());
      await fn(50, 'token123');

      expect(requestFromAPI).toHaveBeenCalledOnce();
      expect(requestFromAPI).toHaveBeenCalledWith(
        `${origin}${base}/api/v1/namespaces/${encodedNamespace}/worker-deployments`,
        expect.objectContaining({
          params: {
            maximumPageSize: '50',
            nextPageToken: 'token123',
          },
          onError: expect.any(Function),
          request: expect.any(Function),
        }),
      );
    });

    test('includes query param when query is non-empty', async () => {
      const fn = await fetchPaginatedDeployments(
        namespace,
        'some-query',
        vi.fn(),
      );
      await fn(100, '');

      expect(requestFromAPI).toHaveBeenCalledWith(
        `${origin}${base}/api/v1/namespaces/${encodedNamespace}/worker-deployments`,
        expect.objectContaining({
          params: {
            maximumPageSize: '100',
            nextPageToken: '',
            query: 'some-query',
          },
        }),
      );
    });
  });

  describe('createWorkerDeployment', () => {
    test('calls requestFromAPI with POST and deploymentName in body', async () => {
      vi.mocked(requestFromAPI).mockResolvedValueOnce({} as never);

      await createWorkerDeployment({ namespace, deploymentName });

      expect(requestFromAPI).toHaveBeenCalledOnce();
      expect(requestFromAPI).toHaveBeenCalledWith(
        `${origin}${base}/api/v1/namespaces/${encodedNamespace}/worker-deployments/${encodedDeploymentName}`,
        expect.objectContaining({
          options: expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ deploymentName }),
          }),
          notifyOnError: false,
        }),
      );
    });
  });

  describe('fetchDeployment', () => {
    test('calls requestFromAPI with correct route', async () => {
      vi.mocked(requestFromAPI).mockResolvedValueOnce({} as never);

      await fetchDeployment({ namespace, deploymentName });

      expect(requestFromAPI).toHaveBeenCalledOnce();
      expect(requestFromAPI).toHaveBeenCalledWith(
        `${origin}${base}/api/v1/namespaces/${encodedNamespace}/worker-deployments/${encodedDeploymentName}`,
        expect.objectContaining({
          request: expect.any(Function),
        }),
      );
    });
  });

  describe('fetchDeploymentVersion', () => {
    test('calls requestFromAPI with correct route', async () => {
      vi.mocked(requestFromAPI).mockResolvedValueOnce({} as never);

      await fetchDeploymentVersion({ namespace, deploymentName, buildId });

      expect(requestFromAPI).toHaveBeenCalledOnce();
      expect(requestFromAPI).toHaveBeenCalledWith(
        `${origin}${base}/api/v1/namespaces/${encodedNamespace}/worker-deployment-versions/${encodedDeploymentName}/${encodedBuildId}`,
        expect.objectContaining({
          request: expect.any(Function),
        }),
      );
    });
  });

  describe('deleteWorkerDeployment', () => {
    test('calls requestFromAPI with DELETE method', async () => {
      vi.mocked(requestFromAPI).mockResolvedValueOnce(undefined as never);

      await deleteWorkerDeployment({ namespace, deploymentName });

      expect(requestFromAPI).toHaveBeenCalledOnce();
      expect(requestFromAPI).toHaveBeenCalledWith(
        `${origin}${base}/api/v1/namespaces/${encodedNamespace}/worker-deployments/${encodedDeploymentName}`,
        expect.objectContaining({
          options: expect.objectContaining({
            method: 'DELETE',
          }),
          notifyOnError: false,
        }),
      );
    });

    test('includes conflictToken in body when provided', async () => {
      vi.mocked(requestFromAPI).mockResolvedValueOnce(undefined as never);

      await deleteWorkerDeployment({
        namespace,
        deploymentName,
        conflictToken: 'abc123',
      });

      expect(requestFromAPI).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          options: expect.objectContaining({
            method: 'DELETE',
            body: JSON.stringify({ conflictToken: 'abc123' }),
          }),
        }),
      );
    });
  });

  describe('deleteWorkerDeploymentVersion', () => {
    test('calls requestFromAPI with DELETE method', async () => {
      vi.mocked(requestFromAPI).mockResolvedValueOnce(undefined as never);

      await deleteWorkerDeploymentVersion({
        namespace,
        deploymentName,
        buildId,
      });

      expect(requestFromAPI).toHaveBeenCalledOnce();
      expect(requestFromAPI).toHaveBeenCalledWith(
        `${origin}${base}/api/v1/namespaces/${encodedNamespace}/worker-deployment-versions/${encodedDeploymentName}/${encodedBuildId}`,
        expect.objectContaining({
          options: expect.objectContaining({
            method: 'DELETE',
          }),
          notifyOnError: false,
        }),
      );
    });

    test('includes conflictToken in body when provided', async () => {
      vi.mocked(requestFromAPI).mockResolvedValueOnce(undefined as never);

      await deleteWorkerDeploymentVersion({
        namespace,
        deploymentName,
        buildId,
        conflictToken: 'tok-xyz',
      });

      expect(requestFromAPI).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          options: expect.objectContaining({
            method: 'DELETE',
            body: JSON.stringify({ conflictToken: 'tok-xyz' }),
          }),
        }),
      );
    });
  });

  describe('createWorkerDeploymentVersion', () => {
    test('calls requestFromAPI with POST and correct body shape', async () => {
      vi.mocked(requestFromAPI).mockResolvedValueOnce(undefined as never);

      const deploymentVersion = { deploymentName, buildId };
      const computeConfig = { scalingGroups: {} };

      await createWorkerDeploymentVersion({
        namespace,
        deploymentVersion,
        computeConfig,
      });

      expect(requestFromAPI).toHaveBeenCalledOnce();
      expect(requestFromAPI).toHaveBeenCalledWith(
        `${origin}${base}/api/v1/namespaces/${encodedNamespace}/worker-deployment-versions/${encodedDeploymentName}`,
        expect.objectContaining({
          options: expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ deploymentVersion, computeConfig }),
          }),
          notifyOnError: false,
        }),
      );
    });

    test('includes optional identity and requestId in body when provided', async () => {
      vi.mocked(requestFromAPI).mockResolvedValueOnce(undefined as never);

      const deploymentVersion = { deploymentName, buildId };
      const computeConfig = { scalingGroups: {} };

      await createWorkerDeploymentVersion({
        namespace,
        deploymentVersion,
        computeConfig,
        identity: 'user@host',
        requestId: 'req-1',
      });

      expect(requestFromAPI).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          options: expect.objectContaining({
            body: JSON.stringify({
              deploymentVersion,
              computeConfig,
              identity: 'user@host',
              requestId: 'req-1',
            }),
          }),
        }),
      );
    });
  });

  describe('updateWorkerDeploymentVersionComputeConfig', () => {
    test('calls requestFromAPI with POST and computeConfigScalingGroups body', async () => {
      vi.mocked(requestFromAPI).mockResolvedValueOnce(undefined as never);

      const scalingGroup = {
        taskQueueTypes: ['TASK_QUEUE_TYPE_WORKFLOW'],
        provider: {
          type: 'aws-lambda',
          details: { data: 'abc', metadata: { encoding: 'xyz' } },
        },
        scaler: {
          type: 'no-sync',
          details: { data: 'def', metadata: { encoding: 'xyz' } },
        },
      };
      const computeConfig = { scalingGroups: { default: scalingGroup } };

      await updateWorkerDeploymentVersionComputeConfig({
        namespace,
        deploymentName,
        buildId,
        computeConfig,
      });

      expect(requestFromAPI).toHaveBeenCalledOnce();
      expect(requestFromAPI).toHaveBeenCalledWith(
        `${origin}${base}/api/v1/namespaces/${encodedNamespace}/worker-deployment-versions/${encodedDeploymentName}/${encodedBuildId}/update-compute-config`,
        expect.objectContaining({
          options: expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              computeConfigScalingGroups: {
                default: { scalingGroup },
              },
            }),
          }),
          notifyOnError: false,
        }),
      );
    });
  });

  describe('validateWorkerDeploymentVersionComputeConfig', () => {
    test('calls requestFromAPI with POST and computeConfigScalingGroups body', async () => {
      vi.mocked(requestFromAPI).mockResolvedValueOnce({ valid: true } as never);

      const scalingGroup = {
        taskQueueTypes: ['TASK_QUEUE_TYPE_ACTIVITY'],
        provider: {
          type: 'aws-lambda',
          details: { data: 'abc', metadata: { encoding: 'xyz' } },
        },
        scaler: {
          type: 'no-sync',
          details: { data: 'def', metadata: { encoding: 'xyz' } },
        },
      };
      const computeConfig = { scalingGroups: { default: scalingGroup } };

      await validateWorkerDeploymentVersionComputeConfig({
        namespace,
        deploymentName,
        buildId,
        computeConfig,
      });

      expect(requestFromAPI).toHaveBeenCalledOnce();
      expect(requestFromAPI).toHaveBeenCalledWith(
        `${origin}${base}/api/v1/namespaces/${encodedNamespace}/worker-deployment-versions/${encodedDeploymentName}/${encodedBuildId}/validate-compute-config`,
        expect.objectContaining({
          options: expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              computeConfigScalingGroups: {
                default: { scalingGroup },
              },
            }),
          }),
          notifyOnError: false,
        }),
      );
    });
  });

  describe('setCurrentDeploymentVersion', () => {
    test('calls requestFromAPI with POST and version as deploymentName.buildId', async () => {
      vi.mocked(requestFromAPI).mockResolvedValueOnce(undefined as never);

      await setCurrentDeploymentVersion({ namespace, deploymentName, buildId });

      expect(requestFromAPI).toHaveBeenCalledOnce();
      expect(requestFromAPI).toHaveBeenCalledWith(
        `${origin}${base}/api/v1/namespaces/${encodedNamespace}/worker-deployments/${encodedDeploymentName}/set-current-version`,
        expect.objectContaining({
          options: expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ version: `${deploymentName}.${buildId}` }),
          }),
        }),
      );
    });
  });

  describe('buildLambdaComputeConfig', () => {
    test('returns correct ComputeConfig shape with base64-encoded provider details', () => {
      const lambdaArn =
        'arn:aws:lambda:us-east-1:123456789012:function:my-func';
      const iamRoleArn = 'arn:aws:iam::123456789012:role/my-role';

      const result = buildLambdaComputeConfig(lambdaArn, iamRoleArn);

      const scalingGroup = result.scalingGroups?.['default'];
      expect(scalingGroup).toBeDefined();
      expect(scalingGroup?.taskQueueTypes).toEqual([
        'TASK_QUEUE_TYPE_WORKFLOW',
        'TASK_QUEUE_TYPE_ACTIVITY',
      ]);
      expect(scalingGroup?.provider?.type).toBe('aws-lambda');

      const providerData = scalingGroup?.provider?.details?.data;
      expect(providerData).toBeDefined();
      const decoded = JSON.parse(atob(providerData!));
      expect(decoded.arn).toBe(lambdaArn);
      expect(decoded.role).toBe(iamRoleArn);
      expect(decoded.role_external_id).toBeUndefined();
    });

    test('includes roleExternalId in provider data when provided', () => {
      const result = buildLambdaComputeConfig('arn:lambda', 'arn:role', {
        roleExternalId: 'ext-id-123',
      });

      const providerData =
        result.scalingGroups?.['default']?.provider?.details?.data;
      const decoded = JSON.parse(atob(providerData!));
      expect(decoded.role_external_id).toBe('ext-id-123');
    });

    test('includes scaling options in scaler details', () => {
      const result = buildLambdaComputeConfig('arn:lambda', 'arn:role', {
        scaleUpCooloffMs: 1000,
        maxWorkerLifetimeMs: 60000,
      });

      const scalerData =
        result.scalingGroups?.['default']?.scaler?.details?.data;
      const decoded = JSON.parse(atob(scalerData!));
      expect(decoded.scale_up_cooloff_ms).toBe(1000);
      expect(decoded.max_worker_lifetime_ms).toBe(60000);
    });
  });

  describe('decodeLambdaProviderDetails', () => {
    test('returns empty object when no computeConfig provided', () => {
      expect(decodeLambdaProviderDetails(undefined)).toEqual({});
    });

    test('round-trips with buildLambdaComputeConfig output', () => {
      const lambdaArn = 'arn:aws:lambda:us-east-1:123:function:fn';
      const iamRoleArn = 'arn:aws:iam::123:role/r';
      const config = buildLambdaComputeConfig(lambdaArn, iamRoleArn, {
        roleExternalId: 'external-123',
      });

      const result = decodeLambdaProviderDetails(config);
      expect(result.lambdaArn).toBe(lambdaArn);
      expect(result.iamRoleArn).toBe(iamRoleArn);
      expect(result.roleExternalId).toBe('external-123');
    });

    test('returns empty object when provider data is missing', () => {
      const config = { scalingGroups: { default: { taskQueueTypes: [] } } };
      expect(decodeLambdaProviderDetails(config)).toEqual({});
    });
  });

  describe('decodeScalerDetails', () => {
    test('returns empty object when no computeConfig provided', () => {
      expect(decodeScalerDetails(undefined)).toEqual({});
    });

    test('round-trips with buildLambdaComputeConfig scaling options', () => {
      const config = buildLambdaComputeConfig('arn:lambda', 'arn:role', {
        scaleUpCooloffMs: 500,
        scaleUpBacklogThreshold: 10,
        maxWorkerLifetimeMs: 30000,
        scaleUpDispatchRateEpsilon: 0.01,
        metricsPollIntervalMs: 2000,
      });

      const result = decodeScalerDetails(config);
      expect(result.scaleUpCooloffMs).toBe(500);
      expect(result.scaleUpBacklogThreshold).toBe(10);
      expect(result.maxWorkerLifetimeMs).toBe(30000);
      expect(result.scaleUpDispatchRateEpsilon).toBe(0.01);
      expect(result.metricsPollIntervalMs).toBe(2000);
    });

    test('returns empty object when scaler data is missing', () => {
      const config = { scalingGroups: { default: { taskQueueTypes: [] } } };
      expect(decodeScalerDetails(config)).toEqual({});
    });

    test('returns only defined fields', () => {
      const config = buildLambdaComputeConfig('arn:lambda', 'arn:role', {
        scaleUpCooloffMs: 100,
      });

      const result = decodeScalerDetails(config);
      expect(result.scaleUpCooloffMs).toBe(100);
      expect(result.scaleUpBacklogThreshold).toBeUndefined();
      expect(result.maxWorkerLifetimeMs).toBeUndefined();
    });
  });
});
