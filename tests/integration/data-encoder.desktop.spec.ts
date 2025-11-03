import { expect, test } from '@playwright/test';

import { DataEncoderSettingsPage } from '~/pages/data-encoder-settings';
import {
  mockSettingsApi,
  mockWorkflowsApis,
  waitForWorkflowsApis,
} from '~/test-utilities/mock-apis';

const workflowsUrl = '/namespaces/default/workflows';

test.describe('Data Encoder without Configuration Settings', () => {
  test.beforeEach(async ({ page }) => {
    await mockWorkflowsApis(page);
    await page.goto(workflowsUrl);
    await waitForWorkflowsApis(page, false);
  });

  test('Navigate to Data Encoder UI and configure Local Setting', async ({
    page,
  }) => {
    const dataEncoder = new DataEncoderSettingsPage(page);

    await expect(dataEncoder.statusButton).toBeEnabled();
    await dataEncoder.openSettings();

    const title = await dataEncoder.getTitle();
    expect(title).toBe('Codec Server');

    await expect(dataEncoder.confirmButton).toBeEnabled();

    await dataEncoder.selectLocalEndpoint();

    await expect(dataEncoder.endpointInput).toHaveValue('');

    await dataEncoder.setEndpoint('localhost:8080');
    await expect(dataEncoder.errorMessage).toHaveText(
      'Endpoint must start with http:// or https://',
    );
    await expect(dataEncoder.confirmButton).toBeDisabled();

    await dataEncoder.setEndpoint('http://localhost:8080');
    await dataEncoder.confirm();

    await expect(dataEncoder.statusConfiguredButton).toBeVisible();
    await dataEncoder.openConfiguredSettings();
    await expect(dataEncoder.endpointInput).toHaveValue(
      'http://localhost:8080',
    );
  });

  test('Navigate to Data Encoder UI and configure and cancel Local Settings', async ({
    page,
  }) => {
    const dataEncoder = new DataEncoderSettingsPage(page);

    await expect(dataEncoder.statusButton).toBeEnabled();
    await dataEncoder.openSettings();

    const title = await dataEncoder.getTitle();
    expect(title).toBe('Codec Server');

    await expect(dataEncoder.confirmButton).toBeEnabled();
    await dataEncoder.selectLocalEndpoint();

    await dataEncoder.setEndpoint('https://localhost:8080');

    await dataEncoder.confirm();

    await expect(dataEncoder.statusConfiguredButton).toBeVisible();
    await dataEncoder.openConfiguredSettings();
    await expect(dataEncoder.endpointInput).toHaveValue(
      'https://localhost:8080',
    );
    await dataEncoder.setEndpoint('http://localhost:9999');

    await dataEncoder.cancel();
    await expect(dataEncoder.statusConfiguredButton).toBeVisible();
    await dataEncoder.openConfiguredSettings();

    await expect(dataEncoder.endpointInput).toHaveValue(
      'https://localhost:8080',
    );
  });

  test('Navigate to Data Encoder UI and configure Local Settings with Pass Access Token', async ({
    page,
  }) => {
    const dataEncoder = new DataEncoderSettingsPage(page);

    await expect(dataEncoder.statusButton).toBeEnabled();
    await dataEncoder.openSettings();

    await expect(dataEncoder.confirmButton).toBeEnabled();
    await dataEncoder.selectLocalEndpoint();
    await expect(dataEncoder.endpointInput).toHaveValue('');

    await dataEncoder.setEndpoint('http://localhost:8080');

    await dataEncoder.enablePassAccessToken();

    await expect(dataEncoder.errorMessage).toHaveText(
      'Endpoint must be https:// if passing access token',
    );
    await expect(dataEncoder.confirmButton).toBeDisabled();

    await dataEncoder.setEndpoint('https://localhost:8080');

    await expect(dataEncoder.confirmButton).toBeEnabled();
    await dataEncoder.confirm();

    await expect(dataEncoder.statusConfiguredButton).toBeVisible();
    await dataEncoder.openConfiguredSettings();
    await expect(dataEncoder.endpointInput).toHaveValue(
      'https://localhost:8080',
    );
  });

  test('Navigate to Data Encoder UI and configure Local Settings with Include Credentials', async ({
    page,
  }) => {
    const dataEncoder = new DataEncoderSettingsPage(page);

    await expect(dataEncoder.statusButton).toBeEnabled();
    await dataEncoder.openSettings();

    await expect(dataEncoder.confirmButton).toBeEnabled();
    await dataEncoder.selectLocalEndpoint();
    await expect(dataEncoder.endpointInput).toHaveValue('');

    await dataEncoder.setEndpoint('http://localhost:8080');

    await dataEncoder.enableIncludeCredentials();

    await dataEncoder.confirm();

    await expect(dataEncoder.statusConfiguredButton).toBeVisible();
    await dataEncoder.openConfiguredSettings();
    await expect(dataEncoder.endpointInput).toHaveValue(
      'http://localhost:8080',
    );
  });
});

test.describe('Data Encoder with Configuration Settings', () => {
  test.beforeEach(async ({ page }) => {
    await mockWorkflowsApis(page);
    await mockSettingsApi(page, {
      Codec: {
        Endpoint: 'https://localhost:8081',
        PassAccessToken: false,
        IncludeCredentials: false,
      },
    });
    await page.goto(workflowsUrl);
    await waitForWorkflowsApis(page, false);
  });

  test('Navigate to Data Encoder UI', async ({ page }) => {
    const dataEncoder = new DataEncoderSettingsPage(page);

    await expect(dataEncoder.statusConfiguredButton).toBeEnabled();
    await dataEncoder.openConfiguredSettings();
    const title = await dataEncoder.getTitle();
    expect(title).toBe('Codec Server');

    await expect(dataEncoder.useConfigurationEndpointRadio).toBeChecked();
    await expect(dataEncoder.useLocalEndpointRadio).not.toBeChecked();

    await expect(dataEncoder.confirmButton).toBeEnabled();

    await dataEncoder.selectLocalEndpoint();
    await expect(dataEncoder.endpointInput).toHaveValue('');
    await dataEncoder.setEndpoint('http://localhost:8080');

    await expect(dataEncoder.useConfigurationEndpointRadio).not.toBeChecked();

    await expect(dataEncoder.useLocalEndpointRadio).toBeChecked();

    await dataEncoder.confirm();

    await expect(dataEncoder.statusConfiguredButton).toBeEnabled();

    await dataEncoder.openConfiguredSettings();
  });
});
