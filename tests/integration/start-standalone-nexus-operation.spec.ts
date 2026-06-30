import { expect, test } from '@playwright/test';

import { StartStandaloneNexusOperationPage } from '~/pages/start-standalone-nexus-operation';
import {
  mockClusterApi,
  mockGlobalApis,
  mockNamespaceWithNexusOperations,
  mockSearchAttributesApi,
  mockSettingsApi,
} from '~/test-utilities/mock-apis';

test.describe('Start a Standalone Nexus Operation', () => {
  test.beforeEach(async ({ page }) => {
    await mockGlobalApis(page);
    await mockNamespaceWithNexusOperations(page);
    await mockSettingsApi(page);
    await mockSearchAttributesApi(page);
    await mockClusterApi(page, { serverVersion: '1.31.0' });
  });

  test('Allows select form fields to be pre-filled via URL Search Parameters', async ({
    page,
  }) => {
    const startNexusOperationPage = new StartStandaloneNexusOperationPage(page);

    await startNexusOperationPage.goto({
      operationId: 'op-abc-123',
      endpoint: 'my-endpoint',
      service: 'my-service',
      operation: 'my-operation',
      startToCloseTimeout: '30',
      scheduleToCloseTimeout: '60',
    });

    await expect(startNexusOperationPage.operationIdInput).toHaveValue(
      'op-abc-123',
    );
    await expect(startNexusOperationPage.endpointInput).toHaveValue(
      'my-endpoint',
    );
    await expect(startNexusOperationPage.serviceInput).toHaveValue(
      'my-service',
    );
    await expect(startNexusOperationPage.operationNameInput).toHaveValue(
      'my-operation',
    );
    await expect(startNexusOperationPage.startToCloseTimeoutInput).toHaveValue(
      '30',
    );
    await expect(
      startNexusOperationPage.scheduleToCloseTimeoutInput,
    ).toHaveValue('60');
  });

  test('Displays errors when required form fields are incomplete', async ({
    page,
  }) => {
    const startNexusOperationPage = new StartStandaloneNexusOperationPage(page);
    await startNexusOperationPage.goto();

    await startNexusOperationPage.submitButton.click();

    await expect(startNexusOperationPage.endpointInputError).toBeVisible();
    await expect(startNexusOperationPage.serviceInputError).toBeVisible();
    await expect(startNexusOperationPage.operationNameInputError).toBeVisible();
    await expect(startNexusOperationPage.timeoutError).toBeVisible();
  });

  test('shows the timeout error when Start to Close Timeout is zero', async ({
    page,
  }) => {
    const startNexusOperationPage = new StartStandaloneNexusOperationPage(page);
    await startNexusOperationPage.goto();

    await startNexusOperationPage.operationIdInput.fill('op-abc-123');
    await startNexusOperationPage.endpointInput.fill('my-endpoint');
    await startNexusOperationPage.serviceInput.fill('my-service');
    await startNexusOperationPage.operationNameInput.fill('my-operation');

    await startNexusOperationPage.editPoliciesButton.click();
    await startNexusOperationPage.startToCloseTimeoutInput.fill('0');

    await startNexusOperationPage.submitButton.click();

    await expect(startNexusOperationPage.timeoutError).toBeVisible();
  });

  test('shows the timeout error after a value is added and then removed from Start to Close Timeout', async ({
    page,
  }) => {
    const startNexusOperationPage = new StartStandaloneNexusOperationPage(page);
    await startNexusOperationPage.goto();

    await startNexusOperationPage.operationIdInput.fill('op-abc-123');
    await startNexusOperationPage.endpointInput.fill('my-endpoint');
    await startNexusOperationPage.serviceInput.fill('my-service');
    await startNexusOperationPage.operationNameInput.fill('my-operation');

    await startNexusOperationPage.editPoliciesButton.click();
    await startNexusOperationPage.startToCloseTimeoutInput.fill('30');
    await expect(startNexusOperationPage.timeoutError).toBeHidden();

    await startNexusOperationPage.startToCloseTimeoutInput.fill('');
    await startNexusOperationPage.submitButton.click();

    await expect(startNexusOperationPage.timeoutError).toBeVisible();
  });
});
