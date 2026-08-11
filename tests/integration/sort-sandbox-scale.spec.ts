import { expect, test } from '@playwright/test';

/**
 * The goal this exists to prove: 12,000,000 rows held and sorted in a browser
 * tab. An array of objects OOMs well before this, so the store being columnar
 * is what makes it possible at all.
 */
test.describe('Sort sandbox scale', () => {
  test('holds and sorts 12M rows in a browser tab', async ({ page }) => {
    test.setTimeout(300_000);

    const failures: string[] = [];
    page.on('pageerror', (error) => failures.push(error.message));

    await page.goto('/sort-sandbox-scale');
    await page.getByTestId('start-load').click();

    const summary = page.getByTestId('load-summary');
    await expect(summary).toBeVisible({ timeout: 240_000 });

    const summaryText = (await summary.textContent()) ?? '';
    expect(summaryText).toContain('12,000,000 rows');

    const columnsMb = Number(/([\d.]+) MB/.exec(summaryText)?.[1] ?? '0');
    // an object array of the same data measures ~6.7 GB
    expect(columnsMb).toBeGreaterThan(100);
    expect(columnsMb).toBeLessThan(1500);

    const timings = page.getByTestId('timings');
    const completed = page.getByTestId('sorts-completed');
    let expectedSorts = 0;

    // every column sorts, including the two that cost the most
    for (const label of [
      'Start ↓',
      'Status',
      'End (nulls last)',
      'Status → Type → Start ↓',
      'Workflow ID',
    ]) {
      await page.getByRole('button', { name: label, exact: true }).click();
      // the worker is single-threaded and a 12M string sort takes seconds, so
      // wait for the sort to actually finish rather than for a stale number
      expectedSorts += 1;
      await expect(completed).toHaveText(String(expectedSorts), {
        timeout: 120_000,
      });
      const text = (await timings.textContent()) ?? '';
      const ms = Number(/sort\s*(\d+)ms/.exec(text)?.[1] ?? '-1');
      expect(ms, `${label} should report a sort time`).toBeGreaterThanOrEqual(
        0,
      );
      expect(ms, `${label} should sort in under 30s`).toBeLessThan(30_000);
      expect(text).toContain('showing 12,000,000');
    }

    // rows must actually render — and keep rendering at the bottom of 12M,
    // which is where a spacer sized to content hits the browser height cap
    const grid = page.getByTestId('grid');
    const renderedRows = grid.locator('div.absolute > div');
    await expect(renderedRows.first()).toBeVisible();
    const topCount = await renderedRows.count();
    expect(topCount, 'rows render at the top').toBeGreaterThan(5);
    const topText = await renderedRows.first().textContent();

    await grid.evaluate((el) => {
      el.scrollTop = el.scrollHeight - el.clientHeight;
    });
    await page.waitForTimeout(800);

    const bottomCount = await renderedRows.count();
    expect(
      bottomCount,
      'rows still render at the bottom of 12M',
    ).toBeGreaterThan(5);
    const bottomText = renderedRows.first();
    await expect(
      bottomText,
      'scrolling moved to different rows',
    ).not.toHaveText(topText);

    await page.screenshot({ path: 'playwright-report/sort-sandbox/12m.png' });
    expect(failures, `page errors: ${failures.join(' | ')}`).toHaveLength(0);
  });
});
