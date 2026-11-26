import { expect, test } from '@playwright/test';

import {
  mockNamespaceApi,
  mockNamespaceApis,
} from '~/test-utilities/mock-apis';

const archivalWorkflowsUrl = '/namespaces/default/archival';
let archived: boolean;

test.beforeEach(async ({ page }) => {
  await mockNamespaceApis(page);
});

test.describe('Archival - Archival disabled', () => {
  test.beforeAll(() => {
    archived = false;
  });

  test('it have the correct title on archival page', async ({ page }) => {
    await mockNamespaceApi(page, archived);
    await page.goto(archivalWorkflowsUrl);
    const title = page.getByTestId('archived-disabled-title');
    await expect(title).toHaveText(
      'This namespace is currently not enabled for archival.',
    );
  });
});

test.describe('Archival - Archival enabled', () => {
  test.beforeAll(() => {
    archived = true;
  });

  test('it have the correct title on archival page', async ({ page }) => {
    await mockNamespaceApi(page, archived);
    await page.goto(archivalWorkflowsUrl);
    const title = page.getByTestId('archived-enabled-title');
    await expect(title).toHaveText('Archived Workflows');
  });
});
