import { workflowsApi, mockSettingsApi } from '$utilities/mock-apis';
import { test, expect } from '@playwright/test';
import {
  clearLocalStorage,
  setLocalStorage,
} from '$utilities/mock-local-storage';

const workflowsUrl = '/namespaces/default/workflows';

test.describe('Data Encoder without Configuration Settings', () => {
  test.beforeEach(async ({ page }) => {
    await mockSettingsApi(page);
    await page.goto(workflowsUrl);
    await setLocalStorage(
      'viewedFeatureTags',
      JSON.stringify(['topNav']),
      page,
    );
    await page.waitForRequest(workflowsApi);
  });

  test('Navigate to Data Encoder UI and configure Local Setting', async ({
    page,
  }) => {
    const dataEncoderStatusButton = await page.getByTestId(
      'data-encoder-status',
    );
    await expect(dataEncoderStatusButton).toBeEnabled();
    await dataEncoderStatusButton.click();

    const dataEncoderTitle = await page
      .getByTestId('data-encoder-title')
      .innerText();
    await expect(dataEncoderTitle).toBe('Codec Server');

    const dataEncoderConfirmButton = await page.getByTestId(
      'confirm-data-encoder-button',
    );
    await expect(dataEncoderConfirmButton).toBeDisabled();

    const dataEncoderLocalSettingsTitle = await page
      .getByTestId('data-encoder-local-settings-title')
      .innerText();
    await expect(dataEncoderLocalSettingsTitle).toBe('Local Settings');

    const dataEncoderLocalCodecEndpointInput = await page.getByTestId(
      'data-encoder-endpoint-input',
    );
    // await expect(dataEncoderLocalCodecEndpointInput.inputValue()).toBe('');

    await dataEncoderLocalCodecEndpointInput.fill('http://localhost:8080');
    await expect(dataEncoderConfirmButton).toBeEnabled();
    await dataEncoderConfirmButton.click();

    const dataEncoderStatusConfiguredButton = await page.getByTestId(
      'data-encoder-status-configured',
    );
    await expect(dataEncoderStatusConfiguredButton).toBeEnabled();
  });
});

test.describe('Data Encoder with Configuration Settings', () => {
  test.beforeEach(async ({ page }) => {
    await mockSettingsApi(page, {
      Codec: {
        Endpoint: 'http://localhost:8081',
        PassAccessToken: false,
        IncludeCredentials: false,
      },
    });
    await page.goto(workflowsUrl);
    await setLocalStorage(
      'viewedFeatureTags',
      JSON.stringify(['topNav']),
      page,
    );
    await page.waitForRequest(workflowsApi);
  });

  test('Navigate to Data Encoder UI', async ({ page }) => {
    const dataEncoderStatusConfiguredButton = await page.getByTestId(
      'data-encoder-status-configured',
    );
    await expect(dataEncoderStatusConfiguredButton).toBeEnabled();
    await dataEncoderStatusConfiguredButton.click();
    const dataEncoderTitle = await page
      .getByTestId('data-encoder-title')
      .innerText();
    await expect(dataEncoderTitle).toBe('Codec Server');
  });
});
