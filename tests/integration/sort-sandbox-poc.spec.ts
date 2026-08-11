import { expect, test } from '@playwright/test';

import { mockClusterApi, mockWorkflowsApis } from '~/test-utilities/mock-apis';

const SHOTS = 'playwright-report/sort-sandbox';

test.describe('Sort sandbox POC', () => {
  test('walks prepare -> loading -> snapshot -> confirm', async ({ page }) => {
    test.setTimeout(90_000);

    await mockWorkflowsApis(page);
    await mockClusterApi(page, {
      visibilityStore: 'elasticsearch',
      persistenceStore: 'postgres,elasticsearch',
    });

    await page.goto('/namespaces/default/workflows?mock');
    // ?mock means the visibility API is never called — that is the point
    // 0. the mocked live table fills with seeded rows
    await expect(page.getByTestId('workflow-count')).toHaveText('12,347');
    await expect(
      page
        .locator('[data-testid="workflows-summary-configurable-table-row"]')
        .first(),
    ).toBeVisible();

    // 1. live list: locked headers + entry point
    const entry = page.getByTestId('workflows-sort-sandbox-button');
    await expect(entry).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/1-live-list.png` });

    const statusHeader = page.getByTestId(
      'workflows-summary-table-header-cell-Status',
    );
    await statusHeader.getByText('Status', { exact: true }).hover();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${SHOTS}/2-locked-header-tooltip.png` });

    // 2. prepare stage
    await entry.click();
    const drawer = page.locator('#workflows-sort-sandbox-drawer');
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText('20 pages × 500 rows')).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/3-prepare.png` });

    // 3. loading stage
    await drawer.getByRole('button', { name: /Load 10,000 workflows/ }).click();
    await expect(drawer.getByText(/Page \d+ of 20/)).toBeVisible();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SHOTS}/4-loading.png` });

    // 4. snapshot stage
    await expect(drawer.getByText('10,000 of 12,347 matching')).toBeVisible({
      timeout: 20_000,
    });
    await expect(drawer.getByText('Capped — 2,347 not loaded')).toBeVisible();
    await expect(
      drawer.getByText('Sorted by Start newest first.'),
    ).toBeVisible();
    await expect(
      drawer.getByText(/Showing 10,000 of 10,000\s+loaded · sorted in/),
    ).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/5-snapshot.png` });

    // 5. single-column sort on a field the server cannot order by
    await drawer.getByRole('button', { name: 'Sort by Status' }).click();
    await expect(drawer.getByText('Sorted by Status A→Z.')).toBeVisible();

    // 6. multi-column sort via shift-click
    await drawer
      .getByRole('button', { name: 'Sort by Type' })
      .click({ modifiers: ['Shift'] });
    await drawer
      .getByRole('button', { name: 'Sort by Start' })
      .click({ modifiers: ['Shift'] });
    await expect(
      drawer.getByText('Sorted by Status A→Z, then Type A→Z, then Start'),
    ).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/6-multi-sort.png` });

    // cap holds at three terms
    await drawer
      .getByRole('button', { name: 'Sort by Task Queue' })
      .click({ modifiers: ['Shift'] });
    await expect(
      drawer.getByText('Sorted by Status A→Z, then Type A→Z, then Start'),
    ).toBeVisible();

    // 7. filtering inside the snapshot
    await drawer.getByRole('button', { name: 'Failed', exact: true }).click();
    await expect(
      drawer.getByText(/Showing 1,\d{3} of 10,000\s+loaded/),
    ).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/7-filtered.png` });

    // empty state
    await drawer.getByPlaceholder('Filter loaded rows…').fill('zzzznope');
    await expect(
      drawer.getByText('No loaded workflows match these filters'),
    ).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/8-empty.png` });
    await drawer.getByPlaceholder('Filter loaded rows…').fill('');

    // 8. closing from the snapshot stage confirms first
    await page.keyboard.press('Escape');
    await expect(page.getByText('Discard this snapshot?')).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/9-confirm.png` });

    await page
      .locator('#sort-sandbox-discard-modal button', {
        hasText: 'Keep sorting',
      })
      .click();
    await expect(drawer).toBeVisible();

    await page.getByTestId('drawer-close-button').click();
    await page
      .locator('#sort-sandbox-discard-modal button', {
        hasText: 'Discard and close',
      })
      .click();
    await expect(drawer).toBeHidden();
  });

  test('snapshot stage reads correctly in dark mode', async ({ page }) => {
    test.setTimeout(90_000);

    await mockWorkflowsApis(page);
    await mockClusterApi(page, {
      visibilityStore: 'elasticsearch',
      persistenceStore: 'postgres,elasticsearch',
    });
    await page.addInitScript(() =>
      window.localStorage.setItem('dark mode', 'true'),
    );

    await page.goto('/namespaces/default/workflows?mock');
    await page.getByTestId('workflows-sort-sandbox-button').click();

    const drawer = page.locator('#workflows-sort-sandbox-drawer');
    await expect(drawer.getByText('20 pages × 500 rows')).toBeVisible();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${SHOTS}/dark-1-prepare.png` });

    await drawer.getByRole('button', { name: /Load 10,000 workflows/ }).click();
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${SHOTS}/dark-2-loading.png` });

    await expect(drawer.getByText('10,000 of 12,347 matching')).toBeVisible({
      timeout: 20_000,
    });
    await drawer.getByRole('button', { name: 'Sort by Status' }).click();
    await drawer
      .getByRole('button', { name: 'Sort by Type' })
      .click({ modifiers: ['Shift'] });
    await page.screenshot({ path: `${SHOTS}/dark-3-snapshot.png` });

    // the capped chip must not be dark-on-dark
    const chip = drawer.getByText('Capped — 2,347 not loaded');
    await expect(chip).toBeVisible();
    const contrast = await chip.evaluate((el) => {
      const luminance = (color: string) => {
        const [r, g, b] = color.match(/\d+/g).map(Number);
        const channel = (c: number) => {
          const s = c / 255;
          return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
      };
      const style = getComputedStyle(el);
      const a = luminance(style.color);
      const b = luminance(style.backgroundColor);
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    });
    expect(contrast).toBeGreaterThan(4.5);
  });

  test('scopes the snapshot to the query already on the list', async ({
    page,
  }) => {
    test.setTimeout(90_000);

    await mockWorkflowsApis(page);
    await mockClusterApi(page, {
      visibilityStore: 'elasticsearch',
      persistenceStore: 'postgres,elasticsearch',
    });

    const query = 'ExecutionStatus = "Failed"';
    await page.goto(
      `/namespaces/default/workflows?mock&query=${encodeURIComponent(query)}`,
    );

    await page.getByTestId('workflows-sort-sandbox-button').click();
    const drawer = page.locator('#workflows-sort-sandbox-drawer');

    // the filter, not the whole namespace, is what gets loaded
    await expect(drawer.getByText(query)).toBeVisible();
    await expect(drawer.getByText('Matching status is Failed.')).toBeVisible();

    // a narrow filter fits under the cap, so nothing is left behind
    await expect(drawer.getByText('Your filter fits')).toBeVisible();
    const loadButton = drawer.getByRole('button', {
      name: /^Load [\d,]+ workflows$/,
    });
    const label = (await loadButton.textContent()) ?? '';
    const willLoad = Number(label.replace(/\D/g, ''));
    expect(willLoad).toBeGreaterThan(0);
    expect(willLoad).toBeLessThan(10_000);

    await loadButton.click();

    const n = willLoad.toLocaleString('en-US');
    await expect(drawer.getByText(`${n} of ${n} matching`)).toBeVisible({
      timeout: 20_000,
    });

    // the snapshot names the filter it holds, and nothing is capped
    await expect(drawer.getByText('Snapshot of')).toBeVisible();
    await expect(drawer.getByText(/Capped —/)).toBeHidden();

    // every rendered row really does match the filter
    const gridText = await drawer.locator('[role="row"]').allTextContents();
    const body = gridText.join(' ');
    expect(body).toContain('Failed');
    expect(body).not.toContain('Completed');
    expect(body).not.toContain('Running');

    await page.screenshot({ path: `${SHOTS}/10-query-scoped.png` });
  });
});
