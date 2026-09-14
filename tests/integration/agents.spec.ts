import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { mockNamespaceApis } from '~/test-utilities/mock-apis';

test.beforeEach(async ({ page }) => {
  await mockNamespaceApis(page);
  await page.goto('/namespaces/default/agents');
});

test('shows the agents resource hub', async ({ page }) => {
  await expect(
    page.getByRole('heading', {
      name: 'Build Durable AI Agents on Temporal',
      level: 2,
    }),
  ).toBeVisible();

  await expect(
    page.getByRole('link', { name: 'Open Agent Harness' }),
  ).toHaveAttribute(
    'href',
    'https://github.com/temporal-community/temporal-agent-harness',
  );

  await expect(
    page.getByRole('link', { name: 'Open Google ADK integration' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Cookbooks and Demos' }),
  ).toBeVisible();
});

test('does not overflow the viewport horizontally', async ({ page }) => {
  const content = page.locator('#content');

  await expect
    .poll(async () =>
      content.evaluate((element) => element.scrollWidth <= element.clientWidth),
    )
    .toBe(true);
});

test('has no automatically detectable accessibility violations', async ({
  page,
}) => {
  await expect(page.locator('.agents-page')).toBeVisible();

  const results = await new AxeBuilder({ page })
    .include('.agents-page')
    .analyze();

  expect(results.violations).toEqual([]);
});
