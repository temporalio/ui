// import { expect, test } from '@playwright/test';

// import {
//   mockClusterApi,
//   mockWorkflowsApis,
//   waitForWorkflowsApis,
// } from '~/test-utilities/mock-apis';

// const getQueryParam = (url: string) =>
//   new URL(url, 'http://localhost').searchParams.get('query') || '';

// test.describe('Filter Bar - Search Attribute Filters', () => {
//   test.beforeEach(async ({ page }) => {
//     await mockWorkflowsApis(page);
//     await mockClusterApi(page, {
//       visibilityStore: 'elasticsearch',
//       persistenceStore: 'postgres,elasticsearch',
//     });

//     await page.goto('/namespaces/default/workflows');
//     await waitForWorkflowsApis(page);
//     await page.waitForSelector('[data-testid="workflow-count"]');
//   });

//   test('Text attribute: add, update, remove', async ({ page }) => {
//     await page.locator('#search-attribute-filter-button').click();
//     await page.locator('#filter-search').fill('CustomStringField');
//     await page.getByRole('menuitem', { name: 'CustomStringField' }).click();

//     await page.getByLabel('Value').fill('alpha');
//     await page.getByRole('button', { name: 'Apply' }).click();

//     await expect.poll(() => getQueryParam(page.url())).toContain(
//       'CustomStringField = "alpha"',
//     );

//     // Update value
//     await page.getByRole('button', { name: /CustomStringField/i }).click();
//     await page.getByLabel('Value').fill('beta');
//     await page.getByRole('button', { name: 'Apply' }).click();

//     await expect.poll(() => getQueryParam(page.url())).toContain(
//       'CustomStringField = "beta"',
//     );

//     // Remove filter
//     await page.getByRole('button', { name: /CustomStringField/i }).click();
//     await page.getByRole('button', { name: 'Remove' }).click();

//     await expect.poll(() => getQueryParam(page.url())).not.toContain(
//       'CustomStringField',
//     );
//   });

//   test('Keyword attribute: add and combine', async ({ page }) => {
//     // First filter: WorkflowId
//     await page.locator('#search-attribute-filter-button').click();
//     await page.locator('#filter-search').fill('WorkflowId');
//     await page.getByRole('menuitem', { name: 'WorkflowId' }).click();
//     await page.getByLabel('Value').fill('wf-123');
//     await page.getByRole('button', { name: 'Apply' }).click();

//     await expect.poll(() => getQueryParam(page.url())).toContain(
//       'WorkflowId = "wf-123"',
//     );

//     // Second filter: TaskQueue
//     await page.locator('#search-attribute-filter-button').click();
//     await page.locator('#filter-search').fill('TaskQueue');
//     await page.getByRole('menuitem', { name: 'TaskQueue' }).click();
//     await page.getByLabel('Value').fill('queue-a');
//     await page.getByRole('button', { name: 'Apply' }).click();

//     const q = await expect.poll(() => getQueryParam(page.url()));
//     expect(q).toContain('WorkflowId = "wf-123"');
//     expect(q).toContain('TaskQueue = "queue-a"');
//     expect(q).toContain(' AND ');
//   });

//   test('Boolean attribute: true/false', async ({ page }) => {
//     await page.locator('#search-attribute-filter-button').click();
//     await page.locator('#filter-search').fill('CustomBoolField');
//     await page.getByRole('menuitem', { name: 'CustomBoolField' }).click();

//     // Select True
//     await page.getByRole('button', { name: 'True' }).click();
//     await page.getByRole('button', { name: 'Apply' }).click();
//     await expect.poll(() => getQueryParam(page.url())).toContain(
//       'CustomBoolField = true',
//     );

//     // Update to False
//     await page.getByRole('button', { name: /CustomBoolField/i }).click();
//     await page.getByRole('button', { name: 'False' }).click();
//     await page.getByRole('button', { name: 'Apply' }).click();
//     await expect.poll(() => getQueryParam(page.url())).toContain(
//       'CustomBoolField = false',
//     );
//   });

//   test('Int and Double attributes', async ({ page }) => {
//     // Int
//     await page.locator('#search-attribute-filter-button').click();
//     await page.locator('#filter-search').fill('CustomIntField');
//     await page.getByRole('menuitem', { name: 'CustomIntField' }).click();
//     await page.getByRole('button', { name: '>' }).click();
//     await page.getByLabel('Value').fill('5');
//     await page.getByRole('button', { name: 'Apply' }).click();
//     await expect.poll(() => getQueryParam(page.url())).toContain(
//       'CustomIntField > 5',
//     );

//     // Double
//     await page.locator('#search-attribute-filter-button').click();
//     await page.locator('#filter-search').fill('CustomDoubleField');
//     await page.getByRole('menuitem', { name: 'CustomDoubleField' }).click();
//     await page.getByLabel('Value').fill('1.5');
//     await page.getByRole('button', { name: 'Apply' }).click();
//     await expect.poll(() => getQueryParam(page.url())).toContain(
//       'CustomDoubleField = 1.5',
//     );
//   });

//   test('Datetime attribute (absolute After)', async ({ page }) => {
//     await page.locator('#search-attribute-filter-button').click();
//     await page.locator('#filter-search').fill('StartTime');
//     await page.getByRole('menuitem', { name: 'StartTime' }).click();
//     await page.getByRole('button', { name: 'After' }).click();

//     // Switch to Absolute time and set a specific time
//     await page.getByLabel('Absolute', { exact: true }).check();
//     await page.getByLabel('hrs', { exact: true }).fill('5');
//     await page.getByLabel('mins', { exact: true }).fill('0');
//     await page.getByLabel('secs', { exact: true }).fill('0');
//     await page.getByRole('button', { name: 'Apply' }).click();

//     const query = await expect.poll(() => getQueryParam(page.url()));
//     expect(query).toContain('StartTime >= "');
//     expect(query).toMatch(/StartTime >= \"\d{4}-\d{2}-\d{2}T\d{2}:.+Z\"/);
//   });

//   test('Remove a filter from chip menu', async ({ page }) => {
//     await page.locator('#search-attribute-filter-button').click();
//     await page.locator('#filter-search').fill('WorkflowId');
//     await page.getByRole('menuitem', { name: 'WorkflowId' }).click();
//     await page.getByLabel('Value').fill('to-remove');
//     await page.getByRole('button', { name: 'Apply' }).click();
//     await expect.poll(() => getQueryParam(page.url())).toContain(
//       'WorkflowId = "to-remove"',
//     );

//     await page.getByRole('button', { name: /WorkflowId/i }).click();
//     await page.getByRole('button', { name: 'Remove' }).click();
//     await expect.poll(() => getQueryParam(page.url())).not.toContain(
//       'WorkflowId',
//     );
//   });

//   test('Raw query via URL loads chips', async ({ page }) => {
//     await page.goto(
//       '/namespaces/default/workflows?query=' +
//         encodeURIComponent('WorkflowId = "manual-1"'),
//     );
//     await waitForWorkflowsApis(page);

//     const query = getQueryParam(page.url());
//     expect(query).toBe('WorkflowId = "manual-1"');

//     // The chip should be present and clickable by its label
//     await page.getByRole('button', { name: /WorkflowId/i }).click();
//     await page.getByRole('button', { name: 'Remove' }).click();
//     await expect.poll(() => getQueryParam(page.url())).toBe('');
//   });
// });
