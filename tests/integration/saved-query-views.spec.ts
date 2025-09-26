// import { expect, test } from '@playwright/test';

// import {
//   mockClusterApi,
//   mockWorkflowsApis,
//   waitForWorkflowsApis,
// } from '~/test-utilities/mock-apis';

// const getQueryParam = (url: string) =>
//   new URL(url, 'http://localhost').searchParams.get('query') || '';

// test.describe('Saved Query Views', () => {
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

//   test('System saved queries switch query', async ({ page }) => {
//     // Running
//     await page.getByTestId('running').click();
//     await expect.poll(() => getQueryParam(page.url())).toBe(
//       '`ExecutionStatus`="Running"',
//     );

//     // Parent Workflows
//     await page.getByTestId('child-workflows').click();
//     await expect.poll(() => getQueryParam(page.url())).toBe(
//       '`ParentWorkflowId` is null',
//     );

//     // Today
//     await page.getByTestId('today').click();
//     const todayQuery = await expect.poll(() => getQueryParam(page.url()));
//     expect(todayQuery).toMatch(/^StartTime >= \"\d{4}-\d{2}-\d{2}T/);

//     // Last Hour
//     await page.getByTestId('last-hour').click();
//     const lastHourQuery = await expect.poll(() => getQueryParam(page.url()));
//     expect(lastHourQuery).toMatch(/^StartTime >= \"\d{4}-\d{2}-\d{2}T/);

//     // All Workflows clears query
//     await page.getByTestId('all').click();
//     await expect.poll(() => getQueryParam(page.url())).toBe('');
//   });

//   test('User saved queries: create new, edit, delete', async ({ page }) => {
//     // Create an unsaved query via filter bar
//     await page.locator('#search-attribute-filter-button').click();
//     await page.locator('#filter-search').fill('WorkflowId');
//     await page.getByRole('menuitem', { name: 'WorkflowId' }).click();
//     await page.getByLabel('Value').fill('user-view-1');
//     await page.getByRole('button', { name: 'Apply' }).click();
//     await expect.poll(() => getQueryParam(page.url())).toBe(
//       'WorkflowId = "user-view-1"',
//     );

//     // Save as new user view
//     await page.getByTestId('unsaved').click();
//     await page.getByRole('button', { name: 'Save' }).click();
//     await page.locator('#view-name').fill('My View');
//     await page.getByRole('button', { name: 'Save' }).click();

//     // New saved view appears and is selectable
//     await page.getByRole('button', { name: 'My View' }).click();
//     await expect.poll(() => getQueryParam(page.url())).toBe(
//       'WorkflowId = "user-view-1"',
//     );

//     // Update the query and save edits
//     await page.locator('#search-attribute-filter-button').click();
//     await page.locator('#filter-search').fill('TaskQueue');
//     await page.getByRole('menuitem', { name: 'TaskQueue' }).click();
//     await page.getByLabel('Value').fill('queue-z');
//     await page.getByRole('button', { name: 'Apply' }).click();

//     const combined = await expect.poll(() => getQueryParam(page.url()));
//     expect(combined).toContain('WorkflowId = "user-view-1"');
//     expect(combined).toContain('TaskQueue = "queue-z"');
//     expect(combined).toContain(' AND ');

//     // Edit existing view (Save)
//     await page.getByRole('button', { name: 'My View' }).click();
//     await page.getByRole('button', { name: 'Save' }).click();
//     await page.locator('#view-name').fill('My View 2');
//     await page.getByRole('button', { name: 'Save' }).click();

//     await page.getByRole('button', { name: 'My View 2' }).click();
//     const afterEdit = await expect.poll(() => getQueryParam(page.url()));
//     expect(afterEdit).toContain('WorkflowId = "user-view-1"');
//     expect(afterEdit).toContain('TaskQueue = "queue-z"');

//     // Delete the view
//     await page.getByRole('button', { name: 'My View 2' }).click();
//     await page.getByRole('button', { name: 'Discard' }).click();
//     await page.getByRole('button', { name: 'Delete' }).click();

//     // Confirm it’s removed and query cleared
//     await expect
//       .poll(() => page.getByRole('button', { name: 'My View 2' }).count())
//       .toBe(0);
//     await expect.poll(() => getQueryParam(page.url())).toBe('');
//   });
// });
