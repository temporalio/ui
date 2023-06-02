import { test, expect } from '@playwright/test';
import { mockNamespaceApi } from '~/test-utilities/mock-apis';

const archivalWorkflowsUrl = '/namespaces/default/archival';

const address = process.env.E2E_UI_ADDRESS ?? 'http://localhost:8233';

test.beforeEach(async ({ page }) => {
  await page.goto(address);
});

test.describe('Archival - Archival disabled', () => {
  test('it have the correct title on archival page', async ({ page }) => {
    await page.goto(archivalWorkflowsUrl);
    const title = await page.getByTestId('archived-disabled-title').innerText();
    expect(title).toBe('This namespace is currently not enabled for archival.');
  });
});

test.describe('Archival - Archival enabled', () => {
  test('it have the correct title on archival page', async ({ page }) => {
    await mockNamespaceApi(page);
    await page.goto(archivalWorkflowsUrl);
    const title = await page.getByTestId('archived-enabled-title').innerText();
    expect(title).toBe('Archived Workflows');
  });
});
