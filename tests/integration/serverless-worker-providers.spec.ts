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

test('offers every compute provider, in registry order', async ({ page }) => {
  await openCreateForm(page);

  // The card is one radio, so counting them counts the providers. A provider
  // added to the registry and forgotten in the picker fails here, as does one
  // listed twice.
  await expect(page.getByRole('radio')).toHaveCount(4);

  const values = await page
    .getByRole('radio')
    .evaluateAll((inputs) =>
      inputs.map((input) => (input as HTMLInputElement).value),
    );
  expect(values).toEqual(['lambda', 'agentcore', 'cloud-run', 'modal']);
});

test('names Modal and says what it runs', async ({ page }) => {
  await openCreateForm(page);

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
  const card = label.locator('..');
  await expect(card.locator('svg')).toHaveCount(1);
});

test('choosing Modal selects it and deselects the default', async ({
  page,
}) => {
  await openCreateForm(page);

  const modal = page.locator('#provider-modal');
  const lambda = page.locator('#provider-lambda');

  await expect(lambda).toBeChecked();

  await page.locator('label', { has: modal }).click();

  await expect(modal).toBeChecked();
  await expect(lambda).not.toBeChecked();
});
