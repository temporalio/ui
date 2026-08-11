import { expect, test } from '@playwright/test';

import { mockClusterApi, mockWorkflowsApis } from '~/test-utilities/mock-apis';

/**
 * The goal: the sandbox drawer on the real Workflows page loads a whole
 * namespace over HTTP and sorts it. An array of objects OOMs long before 12M,
 * so this only passes because the store is columnar and lives in a worker.
 *
 * Shard bisection is bracketed by the client clock while the server pins its
 * own, so the oldest edge can be clipped by a row or two. The assertions allow
 * for that rather than demanding an exact total.
 */
for (const rows of [200_000, 12_000_000]) {
  test(`drawer loads ${rows.toLocaleString()} over HTTP and sorts it`, async ({
    page,
  }) => {
    test.setTimeout(900_000);

    const failures: string[] = [];
    page.on('pageerror', (error) => failures.push(error.message));

    await mockWorkflowsApis(page);
    await mockClusterApi(page, {
      visibilityStore: 'elasticsearch',
      persistenceStore: 'postgres,elasticsearch',
    });

    await page.goto(`/namespaces/default/workflows?mock&rows=${rows}`);
    await page.getByTestId('workflows-sort-sandbox-button').click();

    const drawer = page.locator('#workflows-sort-sandbox-drawer');
    const label = rows.toLocaleString('en-US');
    await drawer
      .getByRole('button', { name: new RegExp(`Load ${label} workflows`) })
      .click();

    const footer = drawer.getByText(/Showing [\d,]+ of [\d,]+\s+loaded/);
    const started = Date.now();
    await expect(footer).toBeVisible({ timeout: 800_000 });
    const loadSeconds = (Date.now() - started) / 1000;

    const summary = (await footer.textContent())?.replace(/\s+/g, ' ').trim();
    const loaded = Number(
      /of ([\d,]+) loaded/.exec(summary ?? '')?.[1]?.replace(/,/g, '') ?? 0,
    );
    console.log(
      `  ${label}: loaded in ${loadSeconds.toFixed(1)}s — ${summary}`,
    );

    // the whole namespace, give or take the window-edge rounding
    expect(loaded).toBeGreaterThan(rows * 0.999);
    expect(loaded).toBeLessThanOrEqual(rows);

    // sorting a column the visibility store cannot order by
    await drawer.getByRole('button', { name: 'Sort by Status' }).click();
    await expect(drawer.getByText('Sorted by Status A→Z.')).toBeVisible({
      timeout: 180_000,
    });
    await page.waitForTimeout(1500);
    console.log(
      `  ${label} sorted:`,
      (await footer.textContent())?.replace(/\s+/g, ' ').trim(),
    );

    // the label says A→Z, so the rows had better actually be A→Z
    const grid = page.getByTestId('snapshot-grid');
    const firstStatus = (
      await grid.locator('div.absolute > div').first().textContent()
    )?.trim();
    expect(
      firstStatus?.startsWith('Canceled'),
      `first status was ${firstStatus}`,
    ).toBe(true);

    const gridRows = grid.locator('div.absolute > div');
    expect(await gridRows.count(), 'rows render').toBeGreaterThan(5);
    const top = await gridRows.first().textContent();

    await grid.evaluate((el) => {
      el.scrollTop = el.scrollHeight - el.clientHeight;
    });
    await page.waitForTimeout(2000);
    expect(await gridRows.count(), 'rows render at the end').toBeGreaterThan(5);
    await expect(
      gridRows.first(),
      'scrolling reached different rows',
    ).not.toHaveText(top);

    await page.screenshot({
      path: `playwright-report/sort-sandbox/drawer-${rows}.png`,
    });
    expect(failures, `page errors: ${failures.join(' | ')}`).toHaveLength(0);
  });
}
