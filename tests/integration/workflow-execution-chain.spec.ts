import { expect, test } from '@playwright/test';

import {
  chainUrl,
  closedChain,
  deferred,
  detailValue,
  header,
  mockChain,
  type MockRun,
  workflowId,
} from '~/test-utilities/mocks/workflow-execution-chain';

test.describe('Workflow execution chain page', () => {
  test('shows the skeleton, then the header fields', async ({ page }) => {
    const current = deferred();
    await mockChain(page, {
      runs: closedChain(),
      current: () => 'run-b',
      holdCurrent: current.promise,
    });

    await page.goto(chainUrl('run-a'));

    await expect(page.getByTestId('chain-skeleton')).toBeVisible();
    await expect(page.getByTestId('workflow-id-heading')).toHaveText(
      workflowId,
    );
    await expect(page.getByText('Chain of Executions')).toBeVisible();
    await expect(
      page
        .getByRole('navigation', { name: 'Breadcrumbs' })
        .getByRole('link', { name: 'Chain', exact: true }),
    ).toHaveAttribute('aria-current', 'page');
    await expect(
      page.getByRole('link', { name: workflowId, exact: true }),
    ).toHaveAttribute('href', /WorkflowId/);

    current.resolve();

    await expect(page.getByTestId('chain-skeleton')).toHaveCount(0);
    await expect(detailValue(page, 'Chain Start')).not.toHaveText(/Unknown/);
    await expect(detailValue(page, 'Chain Duration')).toHaveText('1 hour');
    await expect(
      header(page).getByRole('link', { name: 'run-b' }),
    ).toBeVisible();
    await expect(detailValue(page, 'Workflow SDK')).toContainText(
      /Go\s+1\.35\.0/,
    );
    await expect(
      page.getByRole('button', { name: /^Event WorkB:/ }),
    ).toBeVisible();
  });

  test('links the first run once it is found', async ({ page }) => {
    await mockChain(page, { runs: closedChain(), current: () => 'run-b' });

    await page.goto(chainUrl('run-a'));

    await expect(
      header(page).getByRole('link', { name: 'run-a' }),
    ).toHaveAttribute('href', /\/workflows\/chain-workflow\/run-a/);
  });

  test('shows the first run as past retention when it is not found', async ({
    page,
  }) => {
    const [, latest] = closedChain();
    await mockChain(page, { runs: [latest], current: () => 'run-b' });

    await page.goto(chainUrl('run-a'));

    await expect(detailValue(page, 'First run')).toHaveText(
      'run-a (past retention)',
    );
    await expect(header(page).getByRole('link', { name: 'run-a' })).toHaveCount(
      0,
    );
    await expect(detailValue(page, 'Chain Start')).toHaveText(
      'Unknown (past retention)',
    );
    await expect(detailValue(page, 'Chain Duration')).toHaveText('Unknown');
  });

  test('ticks the chain duration while the chain is open', async ({ page }) => {
    const [first] = closedChain();
    const open: MockRun = {
      runId: 'run-b',
      firstRunId: 'run-a',
      predecessorRunId: 'run-a',
      activity: 'WorkB',
      startTime: '2024-01-01T00:30:00.000Z',
      open: true,
    };
    await mockChain(page, { runs: [first, open], current: () => 'run-b' });

    await page.goto(chainUrl('run-a'));

    const duration = detailValue(page, 'Chain Duration');
    await expect(duration).toHaveText(/second/);
    const initial = await duration.textContent();
    await expect(duration).not.toHaveText(initial ?? '');
  });

  test('follows a continue-as-new hand-off and keeps filters in the URL', async ({
    page,
  }) => {
    const handOff = deferred();
    const runs: MockRun[] = [
      {
        runId: 'run-a',
        firstRunId: 'run-a',
        successorRunId: 'run-b',
        activity: 'WorkA',
        startTime: '2024-01-01T00:00:00.000Z',
        open: true,
        release: handOff.promise,
      },
      {
        runId: 'run-b',
        firstRunId: 'run-a',
        predecessorRunId: 'run-a',
        activity: 'WorkB',
        startTime: '2024-01-01T00:30:00.000Z',
        open: true,
      },
    ];
    let currentRunId = 'run-a';
    await mockChain(page, { runs, current: () => currentRunId });

    await page.goto(chainUrl('run-a', '?sort=ascending&category=activity'));

    await expect(header(page).getByRole('link', { name: 'run-a' })).toHaveCount(
      2,
    );
    await expect(
      page.getByRole('button', { name: /^Event WorkA:/ }),
    ).toBeVisible();
    await expect(page.getByTestId('zoom-in')).toHaveText(/Ascending/);

    currentRunId = 'run-b';
    handOff.resolve();

    await expect(
      detailValue(page, 'Latest run').getByRole('link', { name: 'run-b' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /^Event WorkB:/ }),
    ).toBeVisible();
    await expect(page.getByTestId('zoom-in')).toHaveText(/Ascending/);
    const url = new URL(page.url());
    expect(url.searchParams.get('sort')).toBe('ascending');
    expect(url.searchParams.get('category')).toBe('activity');
    expect(url.searchParams.has('run')).toBe(false);
  });

  test('keeps an explicit None event filter in the URL', async ({ page }) => {
    await mockChain(page, { runs: closedChain(), current: () => 'run-b' });
    await page.goto(chainUrl('run-a'));

    const workA = page.getByRole('button', { name: /^Event WorkA:/ });
    const workB = page.getByRole('button', { name: /^Event WorkB:/ });
    const filterButton = page.locator(
      'button[aria-controls="event-type-filter"]',
    );
    const filterMenu = page.locator('#event-type-filter');
    await expect(workB).toBeVisible();

    await filterButton.click();
    await filterMenu.getByTestId('None').click();

    await expect(page).toHaveURL(/[?&]category=(&|$)/);
    await expect(workB).toHaveCount(0);
    await expect(
      filterMenu.getByTestId('None').getByRole('checkbox'),
    ).toBeChecked();
    await page.keyboard.press('Escape');

    await page.reload();
    await expect(
      detailValue(page, 'Latest run').getByRole('link', { name: 'run-b' }),
    ).toBeVisible();
    await expect(workB).toHaveCount(0);

    await page
      .getByRole('group', { name: /^Runs, \d+ loaded$/ })
      .getByRole('button', { name: /^Run run-a, / })
      .click();
    await expect(page).toHaveURL(/[?&]run=run-a/);
    await expect(page).toHaveURL(/[?&]category=(&|$)/);
    await expect(workA).toHaveCount(0);

    await page.goBack();
    await expect(page).not.toHaveURL(/run=/);
    await expect(workB).toHaveCount(0);

    await page.goForward();
    await expect(page).toHaveURL(/[?&]run=run-a/);
    await expect(workA).toHaveCount(0);

    await filterButton.click();
    await filterMenu.getByTestId('All').click();

    await expect(page).not.toHaveURL(/category=/);
    await expect(workA).toBeVisible();
  });

  test('keeps an explicit None event filter across a live hand-off', async ({
    page,
  }) => {
    const handOff = deferred();
    const runs: MockRun[] = [
      {
        runId: 'run-a',
        firstRunId: 'run-a',
        successorRunId: 'run-b',
        activity: 'WorkA',
        startTime: '2024-01-01T00:00:00.000Z',
        open: true,
        release: handOff.promise,
      },
      {
        runId: 'run-b',
        firstRunId: 'run-a',
        predecessorRunId: 'run-a',
        activity: 'WorkB',
        startTime: '2024-01-01T00:30:00.000Z',
        open: true,
      },
    ];
    let currentRunId = 'run-a';
    await mockChain(page, { runs, current: () => currentRunId });

    await page.goto(chainUrl('run-a', '?category='));

    await expect(header(page).getByRole('link', { name: 'run-a' })).toHaveCount(
      2,
    );

    currentRunId = 'run-b';
    handOff.resolve();

    await expect(
      detailValue(page, 'Latest run').getByRole('link', { name: 'run-b' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /^Event WorkB:/ }),
    ).toHaveCount(0);
    expect(new URL(page.url()).searchParams.get('category')).toBe('');
  });

  test('stops at a closed chain', async ({ page }) => {
    await page.clock.install();
    await mockChain(page, { runs: closedChain(), current: () => 'run-b' });

    await page.goto(chainUrl('run-a'));

    await expect(detailValue(page, 'Chain Duration')).toHaveText('1 hour');
    await page.clock.runFor(5000);
    await expect(detailValue(page, 'Chain Duration')).toHaveText('1 hour');
    await expect(
      detailValue(page, 'Latest run').getByRole('link', { name: 'run-b' }),
    ).toBeVisible();
  });

  test('shows the chain error with a filtered back link on a 404', async ({
    page,
  }) => {
    await mockChain(page, { runs: [], current: () => 'missing' });

    await page.goto(chainUrl('run-a'));

    const error = page.getByTestId('workflow-chain-error');
    await expect(error).toContainText('404');
    await expect(error).toContainText(
      'This is not the workflow execution chain you are looking for',
    );
    const backLink = page.getByTestId('back-to-workflows');
    await expect(backLink).toHaveAttribute('href', /WorkflowId/);
    await expect(backLink).toHaveAttribute('href', /chain-workflow/);
  });

  test('shows the chain error after retrying a 5xx', async ({ page }) => {
    await page.addInitScript(() => {
      Math.random = () => 0;
    });
    await mockChain(page, {
      runs: closedChain(),
      current: () => 'run-b',
      currentStatus: 503,
    });

    await page.goto(chainUrl('run-a'));

    const error = page.getByTestId('workflow-chain-error');
    await expect(error).toContainText('503');
    await expect(error).toContainText(
      'We are having technical difficulties retrieving this workflow execution chain',
    );
    await expect(page.getByTestId('back-to-workflows')).toHaveAttribute(
      'href',
      /WorkflowId/,
    );
  });

  test('warns that the chain is older when the Workflow ID was reused', async ({
    page,
  }) => {
    await mockChain(page, {
      runs: [
        {
          runId: 'old-a',
          firstRunId: 'old-a',
          activity: 'OldWork',
          startTime: '2023-01-01T00:00:00.000Z',
        },
        ...closedChain(),
      ],
      current: () => 'run-b',
    });

    await page.goto(chainUrl('old-a'));

    const warning = page.getByTestId('chain-mismatch-warning');
    await expect(warning).toContainText('Workflow ID was reused');
    await expect(
      warning.getByRole('link', { name: 'View the newer chain' }),
    ).toHaveAttribute('href', chainUrl('run-a'));
    await expect(page.getByTestId('chain-header')).toHaveCount(0);
  });

  test('redirects a mid-chain Run ID to its chain and keeps ?run=', async ({
    page,
  }) => {
    await mockChain(page, { runs: closedChain(), current: () => 'run-b' });

    await page.goto(chainUrl('run-b', '?run=run-a&sort=ascending'));

    await expect(page).toHaveURL(/\/chains\/run-a\?run=run-a&sort=ascending$/);
    await expect(page.getByTestId('workflow-id-heading')).toBeVisible();
  });

  test('shows a neutral warning when the route chain is not visible', async ({
    page,
  }) => {
    await mockChain(page, { runs: closedChain(), current: () => 'run-b' });

    await page.goto(chainUrl('gone'));

    const warning = page.getByTestId('chain-mismatch-warning');
    await expect(warning).toContainText(
      'No workflow execution chain starting at gone is visible for this Workflow ID; it may be past retention',
    );
    await expect(
      warning.getByRole('link', { name: 'View the current chain' }),
    ).toHaveAttribute('href', chainUrl('run-a'));
  });
});
