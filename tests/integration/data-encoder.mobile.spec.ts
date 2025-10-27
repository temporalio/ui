import { expect, test } from '@playwright/test';

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
    await page.getByTestId('nav-profile-button').click();
  });

  test('Navigate to Data Encoder UI and configure Local Setting', async ({
    page,
  }) => {
    const dataEncoderStatusButton = page.getByTestId(
      'mobile-data-encoder-status',
    );
    await expect(dataEncoderStatusButton).not.toHaveClass('disabled');
    await dataEncoderStatusButton.click();

    const dataEncoderTitle = await page
      .getByTestId('data-encoder-title')
      .innerText();
    expect(dataEncoderTitle).toBe('Codec Server');

    const dataEncoderConfirmButton = page.locator(
      '#data-encoder-settings >> [data-testid="confirm-modal-button"]',
    );
    await expect(dataEncoderConfirmButton).toBeEnabled();
    await page.getByTestId('use-local-endpoint-input').click();
    await expect(page.locator('#data-encoder-endpoint-input')).toHaveValue('');

    await page.locator('#data-encoder-endpoint-input').fill('localhost:8080');

    await expect(page.locator('.error-msg')).toHaveText(
      'Endpoint must start with http:// or https://',
    );
    await expect(dataEncoderConfirmButton).toBeDisabled();

    await page
      .locator('#data-encoder-endpoint-input')
      .fill('http://localhost:8080');
    await dataEncoderConfirmButton.click();

    const dataEncoderStatusConfiguredButton = page.getByTestId(
      'mobile-data-encoder-status-configured',
    );
    await dataEncoderStatusConfiguredButton.click();
    await expect(page.locator('#data-encoder-endpoint-input')).toHaveValue(
      'http://localhost:8080',
    );
  });

  test('Navigate to Data Encoder UI and configure and cancel Local Settings', async ({
    page,
  }) => {
    const dataEncoderStatusButton = page.getByTestId(
      'mobile-data-encoder-status',
    );
    await expect(dataEncoderStatusButton).not.toHaveClass('disabled');
    await dataEncoderStatusButton.click();

    const dataEncoderTitle = await page
      .getByTestId('data-encoder-title')
      .innerText();
    expect(dataEncoderTitle).toBe('Codec Server');

    const dataEncoderConfirmButton = page.locator(
      '#data-encoder-settings >> [data-testid="confirm-modal-button"]',
    );
    await expect(dataEncoderConfirmButton).toBeEnabled();
    await page.getByTestId('use-local-endpoint-input').click();
    await page
      .locator('#data-encoder-endpoint-input')
      .fill('https://localhost:8080');

    await dataEncoderConfirmButton.click();

    const dataEncoderStatusConfiguredButton = page.getByTestId(
      'mobile-data-encoder-status-configured',
    );
    await dataEncoderStatusConfiguredButton.click();
    await expect(page.locator('#data-encoder-endpoint-input')).toHaveValue(
      'https://localhost:8080',
    );
    await page
      .locator('#data-encoder-endpoint-input')
      .fill('http://localhost:9999');

    const dataEncoderCancelButton = page.locator(
      '#data-encoder-settings >> [data-testid="cancel-modal-button"]',
    );
    await dataEncoderCancelButton.click();
    await expect(dataEncoderStatusConfiguredButton).toBeVisible();
    await dataEncoderStatusConfiguredButton.click();

    await expect(page.locator('#data-encoder-endpoint-input')).toHaveValue(
      'https://localhost:8080',
    );
  });

  test('Navigate to Data Encoder UI and configure Local Settings with Pass Access Token', async ({
    page,
  }) => {
    const dataEncoderStatusButton = page.getByTestId(
      'mobile-data-encoder-status',
    );
    await expect(dataEncoderStatusButton).not.toHaveClass('disabled');
    await dataEncoderStatusButton.click();

    const dataEncoderConfirmButton = page.locator(
      '#data-encoder-settings >> [data-testid="confirm-modal-button"]',
    );
    await expect(dataEncoderConfirmButton).toBeEnabled();
    await page.getByTestId('use-local-endpoint-input').click();
    await expect(page.locator('#data-encoder-endpoint-input')).toHaveValue('');

    await page
      .locator('#data-encoder-endpoint-input')
      .fill('http://localhost:8080');

    await page
      .locator('label')
      .filter({ hasText: 'Pass the user access token' })
      .click();

    await expect(page.locator('.error-msg')).toHaveText(
      'Endpoint must be https:// if passing access token',
    );
    await expect(dataEncoderConfirmButton).toBeDisabled();

    await page
      .locator('#data-encoder-endpoint-input')
      .fill('https://localhost:8080');

    await expect(dataEncoderConfirmButton).toBeEnabled();
    await dataEncoderConfirmButton.click();

    const dataEncoderStatusConfiguredButton = page.getByTestId(
      'mobile-data-encoder-status-configured',
    );
    await dataEncoderStatusConfiguredButton.click();
    await expect(page.locator('#data-encoder-endpoint-input')).toHaveValue(
      'https://localhost:8080',
    );
  });

  test('Navigate to Data Encoder UI and configure Local Settings with Include Credentials', async ({
    page,
  }) => {
    const dataEncoderStatusButton = page.getByTestId(
      'mobile-data-encoder-status',
    );
    await expect(dataEncoderStatusButton).not.toHaveClass('disabled');
    await dataEncoderStatusButton.click();

    const dataEncoderConfirmButton = page.locator(
      '#data-encoder-settings >> [data-testid="confirm-modal-button"]',
    );
    await expect(dataEncoderConfirmButton).toBeEnabled();
    await page.getByTestId('use-local-endpoint-input').click();
    await expect(page.locator('#data-encoder-endpoint-input')).toHaveValue('');

    await page
      .locator('#data-encoder-endpoint-input')
      .fill('http://localhost:8080');

    await page
      .locator('label')
      .filter({ hasText: 'Include cross-origin credentials' })
      .click();

    await dataEncoderConfirmButton.click();

    const dataEncoderStatusConfiguredButton = page.getByTestId(
      'mobile-data-encoder-status-configured',
    );
    await dataEncoderStatusConfiguredButton.click();
    await expect(page.locator('#data-encoder-endpoint-input')).toHaveValue(
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
    await page.getByTestId('nav-profile-button').click();
  });

  test('Navigate to Data Encoder UI', async ({ page }) => {
    const dataEncoderStatusConfiguredButton = page.getByTestId(
      'mobile-data-encoder-status-configured',
    );
    await expect(dataEncoderStatusConfiguredButton).not.toHaveClass('disabled');
    await dataEncoderStatusConfiguredButton.click();
    const dataEncoderTitle = await page
      .getByTestId('data-encoder-title')

      .innerText();
    expect(dataEncoderTitle).toBe('Codec Server');

    const dataEncoderConfirmButton = page.locator(
      '#data-encoder-settings >> [data-testid="confirm-modal-button"]',
    );
    await expect(dataEncoderConfirmButton).toBeEnabled();
    await page.getByTestId('use-local-endpoint-input').click();
    await expect(page.locator('#data-encoder-endpoint-input')).toHaveValue('');

    await page
      .locator('#data-encoder-endpoint-input')
      .fill('http://localhost:8080');

    await page.getByTestId('use-local-endpoint-input').click();
    await expect(
      page.getByTestId('use-configuration-endpoint-input'),
    ).not.toBeChecked();

    await expect(page.getByTestId('use-local-endpoint-input')).toBeChecked();

    await dataEncoderConfirmButton.click();

    await expect(dataEncoderStatusConfiguredButton).toBeEnabled();

    await dataEncoderStatusConfiguredButton.click();
  });
});
