import { expect, test } from '@playwright/test';

import { mockWorkflowsApis } from '~/test-utilities/mock-apis';

test.use({ timezoneId: 'Europe/Helsinki' });

test('applies UTC and local timezone to the ISO timestamp preview', async ({
  page,
}) => {
  await mockWorkflowsApis(page);
  await page.clock.setFixedTime(new Date('2026-01-15T12:00:00.000Z'));
  await page.goto('/namespaces/default/workflows');
  await page.getByTestId('timezones-menu-button').click();
  await page.getByRole('button', { name: 'ISO', exact: true }).click();

  const preview = page.locator('#timezones-menu p.text-xs');
  await page.getByTestId('timezones-UTC').click();
  await page.getByTestId('timezones-menu-button').click();
  await expect(preview).toHaveText('2026-01-15T12:00:00.000Z');

  await page.getByTestId('timezones-local').click();
  await page.getByTestId('timezones-menu-button').click();
  await expect(preview).toHaveText('2026-01-15T14:00:00.000+02:00');
});
