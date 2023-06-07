import { test, expect } from '@playwright/test';

import { workflowsApi, mockSettingsApi } from '~/test-utilities/mock-apis';
import { setLocalStorage } from '~/test-utilities/mock-local-storage';

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
    await expect(dataEncoderConfirmButton).toBeEnabled();

    await expect(
      await page.getByTestId('data-encoder-endpoint-input').inputValue(),
    ).toBe('');

    await page
      .getByTestId('data-encoder-endpoint-input')
      .fill('localhost:8080');
    await expect(
      await page.getByTestId('data-encoder-endpoint-error').innerText(),
    ).toBe('Endpoint must start with http:// or https://');
    await expect(dataEncoderConfirmButton).toBeDisabled();

    await page
      .getByTestId('data-encoder-endpoint-input')
      .fill('http://localhost:8080');
    await dataEncoderConfirmButton.click();

    const dataEncoderStatusConfiguredButton = await page.getByTestId(
      'data-encoder-status-configured',
    );
    await expect(dataEncoderStatusConfiguredButton).toBeVisible();
    await dataEncoderStatusConfiguredButton.click();
    await expect(
      await page.getByTestId('data-encoder-endpoint-input').inputValue(),
    ).toBe('http://localhost:8080');
  });

  test('Navigate to Data Encoder UI and configure and cancel Local Settings', async ({
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
    await expect(dataEncoderConfirmButton).toBeEnabled();

    await page
      .getByTestId('data-encoder-endpoint-input')
      .fill('https://localhost:8080');

    await dataEncoderConfirmButton.click();

    const dataEncoderStatusConfiguredButton = await page.getByTestId(
      'data-encoder-status-configured',
    );
    await expect(dataEncoderStatusConfiguredButton).toBeVisible();
    await dataEncoderStatusConfiguredButton.click();
    await expect(
      await page.getByTestId('data-encoder-endpoint-input').inputValue(),
    ).toBe('https://localhost:8080');
    await page
      .getByTestId('data-encoder-endpoint-input')
      .fill('http://localhost:9999');

    const dataEncoderCancelButton = await page.getByTestId(
      'cancel-data-encoder-button',
    );
    await dataEncoderCancelButton.click();
    await expect(dataEncoderStatusConfiguredButton).toBeVisible();
    await dataEncoderStatusConfiguredButton.click();

    await expect(
      await page.getByTestId('data-encoder-endpoint-input').inputValue(),
    ).toBe('https://localhost:8080');
  });

  test('Navigate to Data Encoder UI and configure Local Settings with Pass Access Token', async ({
    page,
  }) => {
    const dataEncoderStatusButton = await page.getByTestId(
      'data-encoder-status',
    );
    await expect(dataEncoderStatusButton).toBeEnabled();
    await dataEncoderStatusButton.click();

    const dataEncoderConfirmButton = await page.getByTestId(
      'confirm-data-encoder-button',
    );
    await expect(dataEncoderConfirmButton).toBeEnabled();

    await expect(
      await page.getByTestId('data-encoder-endpoint-input').inputValue(),
    ).toBe('');

    await page
      .getByTestId('data-encoder-endpoint-input')
      .fill('http://localhost:8080');

    await page
      .locator('label')
      .filter({ hasText: 'Pass the user access token with your endpoint.' })
      .locator('span')
      .click();

    await expect(
      await page.getByTestId('data-encoder-endpoint-error').innerText(),
    ).toBe('Endpoint must be https:// if passing access token');
    await expect(dataEncoderConfirmButton).toBeDisabled();

    await page
      .getByTestId('data-encoder-endpoint-input')
      .fill('https://localhost:8080');

    await expect(dataEncoderConfirmButton).toBeEnabled();
    await dataEncoderConfirmButton.click();

    const dataEncoderStatusConfiguredButton = await page.getByTestId(
      'data-encoder-status-configured',
    );
    await expect(dataEncoderStatusConfiguredButton).toBeVisible();
    await dataEncoderStatusConfiguredButton.click();
    await expect(
      await page.getByTestId('data-encoder-endpoint-input').inputValue(),
    ).toBe('https://localhost:8080');
  });

  test('Navigate to Data Encoder UI and configure Local Settings with Include Credentials', async ({
    page,
  }) => {
    const dataEncoderStatusButton = await page.getByTestId(
      'data-encoder-status',
    );
    await expect(dataEncoderStatusButton).toBeEnabled();
    await dataEncoderStatusButton.click();

    const dataEncoderConfirmButton = await page.getByTestId(
      'confirm-data-encoder-button',
    );
    await expect(dataEncoderConfirmButton).toBeEnabled();

    await expect(
      await page.getByTestId('data-encoder-endpoint-input').inputValue(),
    ).toBe('');

    await page
      .getByTestId('data-encoder-endpoint-input')
      .fill('http://localhost:8080');

    await page
      .locator('label')
      .filter({ hasText: 'Include cross-origin credentials.' })
      .click();

    await dataEncoderConfirmButton.click();

    const dataEncoderStatusConfiguredButton = await page.getByTestId(
      'data-encoder-status-configured',
    );
    await expect(dataEncoderStatusConfiguredButton).toBeVisible();
    await dataEncoderStatusConfiguredButton.click();
    await expect(
      await page.getByTestId('data-encoder-endpoint-input').inputValue(),
    ).toBe('http://localhost:8080');
  });

  test('Navigate to Data Encoder UI and configure Port', async ({ page }) => {
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
    await expect(dataEncoderConfirmButton).toBeEnabled();

    await expect(
      await page.getByTestId('data-encoder-port-input').inputValue(),
    ).toBe('');

    await page.getByTestId('data-encoder-port-input').fill('3456');

    await dataEncoderConfirmButton.click();

    const dataEncoderStatusConfiguredButton = await page.getByTestId(
      'data-encoder-status-configured',
    );
    await expect(dataEncoderStatusConfiguredButton).toBeVisible();
    await dataEncoderStatusConfiguredButton.click();
    await expect(
      await page.getByTestId('data-encoder-endpoint-input').inputValue(),
    ).toBe('');
    await expect(
      await page.getByTestId('data-encoder-port-input').inputValue(),
    ).toBe('3456');
  });
});

test.describe('Data Encoder with Configuration Settings', () => {
  test.beforeEach(async ({ page }) => {
    await mockSettingsApi(page, {
      Codec: {
        Endpoint: 'https://localhost:8081',
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

    await expect(await page.getByTestId('override-accordion').innerText()).toBe(
      'Uses Cluster-level settings, where available.',
    );

    const dataEncoderConfirmButton = await page.getByTestId(
      'confirm-data-encoder-button',
    );
    await expect(dataEncoderConfirmButton).toBeEnabled();

    await expect(
      await page.getByTestId('data-encoder-endpoint-input').inputValue(),
    ).toBe('');

    await page
      .getByTestId('data-encoder-endpoint-input')
      .fill('http://localhost:8080');

    await page.getByTestId('override-accordion').click();
    await page.getByTestId('use-local-endpoint-input').click();

    await page
      .getByRole('button', {
        name: 'Uses my local setting and ignores Cluster-level settings.',
      })
      .click();
    await expect(await page.getByTestId('override-accordion').innerText()).toBe(
      'Uses my local setting and ignores Cluster-level settings.',
    );

    await dataEncoderConfirmButton.click();

    await expect(dataEncoderStatusConfiguredButton).toBeEnabled();

    await dataEncoderStatusConfiguredButton.click();

    await expect(await page.getByTestId('override-accordion').innerText()).toBe(
      'Uses my local setting and ignores Cluster-level settings.',
    );
  });
});
