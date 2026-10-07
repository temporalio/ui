import { describe, expect, it, vi } from 'vitest';

import { isServerlessDeployment } from './worker-availability-service';

const version = (deploymentName: string) => ({ deploymentName, buildId: 'v1' });

const deploymentResponse = (name: string, serverless: boolean) =>
  new Response(
    JSON.stringify({
      workerDeploymentInfo: {
        name,
        routingConfig: { currentDeploymentVersion: version(name) },
        versionSummaries: [
          {
            deploymentVersion: version(name),
            ...(serverless
              ? {
                  computeConfig: {
                    scalingGroups: { default: { providerType: 'aws-lambda' } },
                  },
                }
              : {}),
          },
        ],
      },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );

describe('isServerlessDeployment', () => {
  it('detects a deployment with compute config', async () => {
    const request = vi
      .fn()
      .mockResolvedValue(deploymentResponse('detect-serverless', true));

    await expect(
      isServerlessDeployment('default', 'detect-serverless', request),
    ).resolves.toBe(true);
  });

  it('shares one request between concurrent and repeat callers', async () => {
    const request = vi
      .fn()
      .mockImplementation(async () => deploymentResponse('shared', true));

    const [first, second] = await Promise.all([
      isServerlessDeployment('default', 'shared', request),
      isServerlessDeployment('default', 'shared', request),
    ]);
    const third = await isServerlessDeployment('default', 'shared', request);

    expect([first, second, third]).toEqual([true, true, true]);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('rejects with the abort reason instead of resolving false', async () => {
    const request = vi
      .fn()
      .mockImplementation(() => new Promise<Response>(() => {}));
    const controller = new AbortController();

    const result = isServerlessDeployment(
      'default',
      'aborted',
      request,
      controller.signal,
    );
    controller.abort();

    await expect(result).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('falls back to false when the lookup fails, without caching the failure', async () => {
    const request = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('network down'))
      .mockResolvedValueOnce(deploymentResponse('flaky', true));

    await expect(
      isServerlessDeployment('default', 'flaky', request),
    ).resolves.toBe(false);
    await expect(
      isServerlessDeployment('default', 'flaky', request),
    ).resolves.toBe(true);
    expect(request).toHaveBeenCalledTimes(2);
  });
});
