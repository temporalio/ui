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
    const dataEncoderStatusButton = page
      .getByTestId('data-encoder-status')
      .locator('visible=true');
    await expect(dataEncoderStatusButton).not.toHaveClass('disabled');
    await dataEncoderStatusButton.click();

    const dataEncoderTitle = await page
      .getByTestId('data-encoder-title')
      .locator('visible=true')
      .innerText();
    expect(dataEncoderTitle).toBe('Codec Server');

    const dataEncoderConfirmButton = page
      .getByTestId('confirm-data-encoder-button')
      .locator('visible=true');
    await expect(dataEncoderConfirmButton).toBeEnabled();

    await expect(
      page.locator('#data-encoder-endpoint-input').locator('visible=true'),
    ).toHaveValue('');

    await page
      .locator('#data-encoder-endpoint-input')
      .locator('visible=true')
      .fill('localhost:8080');
    await expect(page.locator('.error-msg').locator('visible=true')).toHaveText(
      'Endpoint must start with http:// or https://',
    );
    await expect(dataEncoderConfirmButton).toBeDisabled();

    await page
      .locator('#data-encoder-endpoint-input')
      .locator('visible=true')
      .fill('http://localhost:8080');
    await dataEncoderConfirmButton.click();

    const dataEncoderStatusConfiguredButton = page
      .getByTestId('data-encoder-status-configured')
      .locator('visible=true');
    await dataEncoderStatusConfiguredButton.click();
    await expect(
      page.locator('#data-encoder-endpoint-input').locator('visible=true'),
    ).toHaveValue('http://localhost:8080');
  });

  test('Navigate to Data Encoder UI and configure and cancel Local Settings', async ({
    page,
  }) => {
    const dataEncoderStatusButton = page
      .getByTestId('data-encoder-status')
      .locator('visible=true');
    await expect(dataEncoderStatusButton).not.toHaveClass('disabled');
    await dataEncoderStatusButton.click();

    const dataEncoderTitle = await page
      .getByTestId('data-encoder-title')
      .locator('visible=true')
      .innerText();
    expect(dataEncoderTitle).toBe('Codec Server');

    const dataEncoderConfirmButton = page
      .getByTestId('confirm-data-encoder-button')
      .locator('visible=true');
    await expect(dataEncoderConfirmButton).toBeEnabled();

    await page
      .locator('#data-encoder-endpoint-input')
      .locator('visible=true')
      .fill('https://localhost:8080');

    await dataEncoderConfirmButton.click();

    const dataEncoderStatusConfiguredButton = page
      .getByTestId('data-encoder-status-configured')
      .locator('visible=true');
    await dataEncoderStatusConfiguredButton.click();
    await expect(
      page.locator('#data-encoder-endpoint-input').locator('visible=true'),
    ).toHaveValue('https://localhost:8080');
    await page
      .locator('#data-encoder-endpoint-input')
      .locator('visible=true')
      .fill('http://localhost:9999');

    const dataEncoderCancelButton = page
      .getByTestId('cancel-data-encoder-button')
      .locator('visible=true');
    await dataEncoderCancelButton.click();
    await expect(dataEncoderStatusConfiguredButton).toBeVisible();
    await dataEncoderStatusConfiguredButton.click();

    await expect(
      page.locator('#data-encoder-endpoint-input').locator('visible=true'),
    ).toHaveValue('https://localhost:8080');
  });

  test('Navigate to Data Encoder UI and configure Local Settings with Pass Access Token', async ({
    page,
  }) => {
    const dataEncoderStatusButton = page
      .getByTestId('data-encoder-status')
      .locator('visible=true');
    await expect(dataEncoderStatusButton).not.toHaveClass('disabled');
    await dataEncoderStatusButton.click();

    const dataEncoderConfirmButton = page
      .getByTestId('confirm-data-encoder-button')
      .locator('visible=true');
    await expect(dataEncoderConfirmButton).toBeEnabled();

    await expect(
      page.locator('#data-encoder-endpoint-input').locator('visible=true'),
    ).toHaveValue('');

    await page
      .locator('#data-encoder-endpoint-input')
      .locator('visible=true')
      .fill('http://localhost:8080');

    await page
      .locator('label')
      .filter({ hasText: 'Pass the user access token' })
      .locator('visible=true')
      .click();

    await expect(page.locator('.error-msg').locator('visible=true')).toHaveText(
      'Endpoint must be https:// if passing access token',
    );
    await expect(dataEncoderConfirmButton).toBeDisabled();

    await page
      .locator('#data-encoder-endpoint-input')
      .locator('visible=true')
      .fill('https://localhost:8080');

    await expect(dataEncoderConfirmButton).toBeEnabled();
    await dataEncoderConfirmButton.click();

    const dataEncoderStatusConfiguredButton = page
      .getByTestId('data-encoder-status-configured')
      .locator('visible=true');
    await dataEncoderStatusConfiguredButton.click();
    await expect(
      page.locator('#data-encoder-endpoint-input').locator('visible=true'),
    ).toHaveValue('https://localhost:8080');
  });

  test('Navigate to Data Encoder UI and configure Local Settings with Include Credentials', async ({
    page,
  }) => {
    const dataEncoderStatusButton = page
      .getByTestId('data-encoder-status')
      .locator('visible=true');
    await expect(dataEncoderStatusButton).not.toHaveClass('disabled');
    await dataEncoderStatusButton.click();

    const dataEncoderConfirmButton = page
      .getByTestId('confirm-data-encoder-button')
      .locator('visible=true');
    await expect(dataEncoderConfirmButton).toBeEnabled();

    await expect(
      page.locator('#data-encoder-endpoint-input').locator('visible=true'),
    ).toHaveValue('');

    await page
      .locator('#data-encoder-endpoint-input')
      .locator('visible=true')
      .fill('http://localhost:8080');

    await page
      .locator('label')
      .filter({ hasText: 'Include cross-origin credentials' })
      .locator('visible=true')
      .click();

    await dataEncoderConfirmButton.click();

    const dataEncoderStatusConfiguredButton = page
      .getByTestId('data-encoder-status-configured')
      .locator('visible=true');
    await dataEncoderStatusConfiguredButton.click();
    await expect(
      page.locator('#data-encoder-endpoint-input').locator('visible=true'),
    ).toHaveValue('http://localhost:8080');
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
    const dataEncoderStatusConfiguredButton = page
      .getByTestId('data-encoder-status-configured')
      .locator('visible=true');
    await expect(dataEncoderStatusConfiguredButton).not.toHaveClass('disabled');
    await dataEncoderStatusConfiguredButton.click();
    const dataEncoderTitle = await page
      .getByTestId('data-encoder-title')
      .locator('visible=true')
      .innerText();
    expect(dataEncoderTitle).toBe('Codec Server');

    await expect(
      page.getByTestId('override-accordion').locator('visible=true'),
    ).toHaveText(/Use Cluster-level setting, where available/);

    const dataEncoderConfirmButton = page
      .getByTestId('confirm-data-encoder-button')
      .locator('visible=true');
    await expect(dataEncoderConfirmButton).toBeEnabled();

    await expect(
      page.locator('#data-encoder-endpoint-input').locator('visible=true'),
    ).toHaveValue('');

    await page
      .locator('#data-encoder-endpoint-input')
      .locator('visible=true')
      .fill('http://localhost:8080');

    await page
      .getByTestId('override-accordion')
      .locator('visible=true')
      .click();
    await page
      .getByTestId('use-local-endpoint-input')
      .locator('visible=true')
      .click();

    await page
      .getByRole('button', {
        name: 'Use my browser setting and ignore Cluster-level setting.',
      })
      .locator('visible=true')
      .click();

    await expect(
      page.getByTestId('override-accordion').locator('visible=true'),
    ).toHaveText(/Use my browser setting and ignore Cluster-level setting/);

    await dataEncoderConfirmButton.click();

    await expect(dataEncoderStatusConfiguredButton).toBeEnabled();

    await dataEncoderStatusConfiguredButton.click();

    await expect(
      page.getByTestId('override-accordion').locator('visible=true'),
    ).toHaveText(/Use my browser setting and ignore Cluster-level setting/);
  });
});
