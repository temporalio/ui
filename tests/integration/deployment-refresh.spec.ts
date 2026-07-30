import { expect, test } from '@playwright/test';

import {
  mockClusterApi,
  mockNamespaceApi,
  mockNamespacesApi,
  mockSearchAttributesApi,
  mockSettingsApi,
  mockSystemInfoApi,
} from '~/test-utilities/mock-apis';

const DEPLOYMENT_API =
  /\/api\/v1\/namespaces\/default\/worker-deployments\/my-deployment(\?.*)?$/;
const VALIDATE_API =
  /\/api\/v1\/namespaces\/default\/worker-deployment-versions\/my-deployment\/build-1\/validate-compute-config(\?.*)?$/;
const deploymentUrl = '/namespaces/default/workers/deployments/my-deployment';

type ConnectionStatus = 'pending' | 'connected' | 'failed';

const deploymentResponse = (connectionStatus: ConnectionStatus) => {
  const lastCheckTime = {
    seconds: Math.floor(Date.now() / 1000),
    nanos: 0,
  };
  const version = {
    version: 'my-deployment.build-1',
    deploymentVersion: {
      deploymentName: 'my-deployment',
      buildId: 'build-1',
    },
    createTime: { seconds: 0, nanos: 0 },
    computeConfig: {
      scalingGroups: {
        default: { provider: { type: 'aws-lambda' } },
      },
    },
    computeStatus: {
      providerValidation:
        connectionStatus === 'pending'
          ? {}
          : {
              lastCheckTime,
              errorMessage:
                connectionStatus === 'failed' ? 'Connection failed' : '',
            },
    },
  };

  return {
    conflictToken: 'conflict-token',
    workerDeploymentInfo: {
      name: 'my-deployment',
      createTime: { seconds: 0, nanos: 0 },
      routingConfig: {
        currentDeploymentVersion: version.deploymentVersion,
      },
      currentVersionSummary: version,
      lastModifierIdentity: 'test',
      versionSummaries: [version],
    },
  };
};

test('keeps validation available while connection status is hidden', async ({
  page,
}) => {
  let connectionStatus: ConnectionStatus = 'pending';
  let deploymentRequests = 0;
  let validationRequests = 0;

  await Promise.all([
    mockClusterApi(page),
    mockNamespaceApi(page),
    mockNamespacesApi(page),
    mockSearchAttributesApi(page),
    mockSettingsApi(page),
    mockSystemInfoApi(page, {
      capabilities: { serverScaledDeployments: true },
    }),
  ]);
  await page.route(DEPLOYMENT_API, (route) => {
    deploymentRequests += 1;
    return route.fulfill({ json: deploymentResponse(connectionStatus) });
  });
  await page.route(VALIDATE_API, (route) => {
    validationRequests += 1;
    connectionStatus = validationRequests === 1 ? 'connected' : 'failed';
    if (validationRequests === 3) {
      return route.fulfill({
        status: 400,
        json: { message: 'Connection failed' },
      });
    }
    return route.fulfill({ json: {} });
  });

  await page.goto(deploymentUrl);
  await expect(
    page.getByRole('columnheader', { name: 'Connection', exact: true }),
  ).toHaveCount(0);
  await expect(page.getByText('Pending', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Connected', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Failed', { exact: true })).toHaveCount(0);

  await page.getByRole('button', { name: 'Actions', exact: true }).click();
  const validateConnection = page.getByRole('menuitem', {
    name: 'Validate Connection',
  });
  await expect(validateConnection).toBeVisible();
  await validateConnection.click();

  const modal = page.locator('#validate-connection-modal-build-1');
  await expect(modal).toBeVisible();
  await expect(modal.getByText('Connection is valid')).toBeVisible();
  await expect.poll(() => validationRequests).toBe(1);
  await expect.poll(() => deploymentRequests).toBeGreaterThanOrEqual(2);
  await expect(page.getByText('Connected', { exact: true })).toHaveCount(0);

  const requestsBeforeRetry = deploymentRequests;
  await modal.getByRole('button', { name: 'Retry' }).click();

  await expect.poll(() => validationRequests).toBe(2);
  await expect
    .poll(() => deploymentRequests)
    .toBeGreaterThan(requestsBeforeRetry);
  await expect(modal).toBeVisible();
  await expect(modal.getByText('Connection is valid')).toBeVisible();
  await expect(page.getByText('Failed', { exact: true })).toHaveCount(0);

  await modal.getByRole('button', { name: 'Retry' }).click();

  await expect.poll(() => validationRequests).toBe(3);
  await expect(modal.getByText('Connection is invalid')).toBeVisible();
  await expect(
    modal.getByText('Connection failed', { exact: true }),
  ).toBeVisible();
});
