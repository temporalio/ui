import { expect, type Page, test } from '@playwright/test';

import {
  mockClusterApi,
  mockNamespaceApi,
  mockNamespacesApi,
  mockSearchAttributesApi,
  mockSettingsApi,
  mockSystemInfoApi,
} from '~/test-utilities/mock-apis';

const createUrl = '/namespaces/default/workers/deployments/create';

const openCreateForm = async (page: Page) => {
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
  await page.goto(createUrl);
};

/**
 * The picker opens summarised, showing only the chosen provider, so every
 * assertion about the others has to reveal the list first.
 */
const openProviderPicker = async (page: Page) => {
  await page.getByRole('button', { name: 'Change' }).click();
  await expect(page.locator('#provider-modal')).toBeVisible();
};

const chooseModal = async (page: Page) => {
  await openProviderPicker(page);
  await page.locator('label[for="provider-modal"]').click();
};

test('offers every compute provider, in registry order', async ({ page }) => {
  await openCreateForm(page);
  await openProviderPicker(page);

  const values = await page
    .locator('input[id^="provider-"]')
    .evaluateAll((inputs) =>
      inputs.map((input) => (input as HTMLInputElement).value),
    );
  // A provider added to the registry and forgotten in the picker fails here,
  // as does one listed twice or offered out of order.
  expect(values).toEqual(['lambda', 'agentcore', 'cloud-run', 'modal']);
});

test('names Modal and says what it runs', async ({ page }) => {
  await openCreateForm(page);
  await openProviderPicker(page);

  const label = page.locator('label[for="provider-modal"]');
  await expect(label).toContainText('Modal');
  await expect(label).toContainText(
    'Run Workers as Modal Functions in your Modal workspace.',
  );
  // Pre-release, so it carries the stage chip rather than being offered as
  // finished. The chip is uppercased in CSS, so the text here is title case.
  await expect(label).toContainText('Pre-release');

  // Its own brand mark. A provider given no icon renders an empty box and
  // passes every text assertion above. The icon is a sibling of the label
  // rather than inside it, so the assertion is on the card around both.
  // The card nests the mark beside the label; one svg inside that slot is the
  // provider's own icon.
  await expect(label.locator('..').locator('svg').first()).toBeVisible();
});

test('choosing Modal summarises it and keeps the rest available', async ({
  page,
}) => {
  await openCreateForm(page);
  await chooseModal(page);

  await expect(page.getByText('Also supports 3 other providers')).toBeVisible();
});

test('Modal asks for the coordinates of the Function to run', async ({
  page,
}) => {
  await openCreateForm(page);
  await chooseModal(page);

  // app_name, function_name and environment are all required by the worker
  // controller, which rejects a config missing any of them.
  for (const id of ['modalAppName', 'modalFunctionName', 'modalEnvironment']) {
    await expect(page.locator(`#${id}`)).toBeVisible();
    await expect(page.locator(`#${id}`)).toHaveAttribute('required', '');
  }

  // workspace_id and version are optional: blank means "whatever the
  // credential owns" and "the App's current deployment".
  for (const id of ['modalWorkspaceId', 'modalVersion']) {
    await expect(page.locator(`#${id}`)).toBeVisible();
    await expect(page.locator(`#${id}`)).not.toHaveAttribute('required', '');
  }
});

test('Modal offers no access fields, because it holds no credential', async ({
  page,
}) => {
  await openCreateForm(page);
  await chooseModal(page);

  // The worker controller resolves Modal credentials itself, so there is
  // nothing for the form to collect. An IAM role field appearing here would
  // mean the Lambda branch had leaked through.
  await expect(page.locator('#iamRoleArn')).toHaveCount(0);
  await expect(page.locator('#gcpServiceAccount')).toHaveCount(0);
});

test('switching away from Modal swaps the coordinates back', async ({
  page,
}) => {
  await openCreateForm(page);
  await chooseModal(page);
  await expect(page.locator('#modalAppName')).toBeVisible();

  await openProviderPicker(page);
  await page.locator('label[for="provider-lambda"]').click();

  await expect(page.locator('#modalAppName')).toHaveCount(0);
  await expect(page.locator('#lambdaArn')).toBeVisible();
});
