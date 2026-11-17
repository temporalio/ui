import { expect, type Page, test } from '@playwright/test';

import {
  chainUrl,
  closedChain,
  deferred,
  linearChain,
  mockChain,
  type MockRun,
} from '~/test-utilities/mocks/workflow-execution-chain';

const strip = (page: Page) =>
  page.getByRole('group', { name: /^Runs, \d+ loaded$/ });

const card = (page: Page, runId: string) =>
  strip(page).getByRole('button', { name: new RegExp(`^Run ${runId}, `) });

const cardActions = (page: Page, runId: string) =>
  page.locator(`[data-testid="run-card"][data-run-id="${runId}"]`);

const previousButton = (page: Page) =>
  page.getByRole('button', { name: 'View previous run' });

const jumpButton = (page: Page) =>
  page.getByRole('button', { name: /^(Jump to live|View latest run)$/ });

const announcements = (page: Page) =>
  page.getByTestId('run-strip-announcer-polite');

const runParam = (page: Page) => new URL(page.url()).searchParams.get('run');

const focusedName = (page: Page) =>
  page.evaluate(() => document.activeElement?.getAttribute('aria-label'));

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Math.random = () => 0;
  });
});

test.describe('Workflow execution chain Run strip', () => {
  test('pins a card with a pushed entry, and Back returns to live', async ({
    page,
  }) => {
    await mockChain(page, { runs: closedChain(), current: () => 'run-b' });
    await page.goto(chainUrl('run-a'));

    await expect(card(page, 'run-b')).toHaveAttribute('aria-current', 'true');

    await card(page, 'run-a').click();

    await expect(page).toHaveURL(/[?&]run=run-a/);
    await expect(card(page, 'run-a')).toHaveAttribute('aria-current', 'true');
    await expect(card(page, 'run-b')).not.toHaveAttribute('aria-current');
    await expect(
      page.getByRole('button', { name: /^Event WorkA:/ }),
    ).toBeVisible();

    await page.goBack();

    await expect(page).not.toHaveURL(/run=/);
    await expect(card(page, 'run-b')).toHaveAttribute('aria-current', 'true');
    await expect(
      page.getByRole('button', { name: /^Event WorkB:/ }),
    ).toBeVisible();
  });

  test('selecting the latest card returns to live mode', async ({ page }) => {
    await mockChain(page, { runs: closedChain(), current: () => 'run-b' });
    await page.goto(chainUrl('run-a', '?run=run-a'));

    await expect(card(page, 'run-a')).toHaveAttribute('aria-current', 'true');

    await card(page, 'run-b').click();

    await expect(page).not.toHaveURL(/run=/);
    await expect(card(page, 'run-b')).toHaveAttribute('aria-current', 'true');
    await expect(jumpButton(page)).toHaveAttribute('aria-disabled', 'true');
  });

  test('?run= naming the Latest Run opens it pinned', async ({ page }) => {
    await mockChain(page, { runs: closedChain(), current: () => 'run-b' });
    await page.goto(chainUrl('run-a', '?run=run-b'));

    await expect(card(page, 'run-b')).toHaveAttribute('aria-current', 'true');
    await expect(page.getByTestId('run-ruler-pinned')).toBeVisible();
    await expect(jumpButton(page)).not.toHaveAttribute('aria-disabled');

    await jumpButton(page).click();

    await expect(page).not.toHaveURL(/run=/);
    await expect(page.getByTestId('run-ruler-pinned')).toHaveCount(0);
    await expect(jumpButton(page)).toHaveAttribute('aria-disabled', 'true');
  });

  test('‹ selects the previous Run and walks back past the window', async ({
    page,
  }) => {
    await mockChain(page, { runs: linearChain(12), current: () => 'run-12' });
    await page.goto(chainUrl('run-01', '?run=run-03'));

    await expect(strip(page)).toHaveAccessibleName('Runs, 10 loaded');
    await expect(card(page, 'run-03')).toHaveAttribute('aria-current', 'true');

    await previousButton(page).click();

    await expect(strip(page)).toHaveAccessibleName('Runs, 12 loaded');
    await expect(page).toHaveURL(/[?&]run=run-02/);
    await expect(card(page, 'run-02')).toHaveAttribute('aria-current', 'true');
    await expect(announcements(page)).toContainText('Loaded 2 older runs');

    await previousButton(page).click();

    await expect(page).toHaveURL(/[?&]run=run-01/);
    await expect(previousButton(page)).toHaveAttribute('aria-disabled', 'true');
    await previousButton(page).hover();
    await expect(
      page.getByRole('tooltip').filter({ hasText: 'Start of chain' }),
    ).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/[?&]run=run-02/);
  });

  test('‹ is disabled past retention', async ({ page }) => {
    const [, latest] = closedChain();
    await mockChain(page, { runs: [latest], current: () => 'run-b' });
    await page.goto(chainUrl('run-a'));

    await expect(card(page, 'run-b')).toBeVisible();
    await expect(previousButton(page)).toHaveAttribute('aria-disabled', 'true');
    await previousButton(page).hover();
    await expect(
      page.getByRole('tooltip').filter({ hasText: 'Past retention' }),
    ).toBeVisible();

    await previousButton(page).dispatchEvent('click');
    await expect(page).not.toHaveURL(/run=/);
  });

  test('→| is disabled in live mode with a tooltip saying why', async ({
    page,
  }) => {
    const runs: MockRun[] = [
      {
        runId: 'run-a',
        firstRunId: 'run-a',
        activity: 'WorkA',
        startTime: '2024-01-01T00:00:00.000Z',
        open: true,
      },
    ];
    await mockChain(page, { runs, current: () => 'run-a' });
    await page.goto(chainUrl('run-a'));

    const jump = page.getByRole('button', { name: 'Jump to live' });
    await expect(jump).toHaveAttribute('aria-disabled', 'true');
    await jump.hover();
    await expect(
      page.getByRole('tooltip').filter({ hasText: 'Viewing live' }),
    ).toBeVisible();
    await expect(page.getByTestId('run-ruler-now')).toBeVisible();
  });

  test('→| reads "View latest run" once the chain is closed', async ({
    page,
  }) => {
    await mockChain(page, { runs: closedChain(), current: () => 'run-b' });
    await page.goto(chainUrl('run-a'));

    await expect(page.getByTestId('run-strip-status')).toContainText(
      'Chain closed',
    );
    const jump = page.getByRole('button', { name: 'View latest run' });
    await expect(jump).toHaveAttribute('aria-disabled', 'true');
    await jump.hover();
    await expect(
      page.getByRole('tooltip').filter({ hasText: 'Viewing the latest run' }),
    ).toBeVisible();

    await card(page, 'run-a').click();
    await expect(jump).not.toHaveAttribute('aria-disabled');
  });

  test('keeps a pinned Run selected when a newer Run arrives', async ({
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
    await page.goto(chainUrl('run-a', '?run=run-a'));

    await expect(card(page, 'run-a')).toHaveAttribute('aria-current', 'true');
    await expect(
      page.getByRole('button', { name: /^Event WorkA:/ }),
    ).toBeVisible();

    currentRunId = 'run-b';
    handOff.resolve();

    await expect(card(page, 'run-b')).toBeVisible();
    await expect(card(page, 'run-a')).toHaveAttribute('aria-current', 'true');
    expect(runParam(page)).toBe('run-a');
    await expect(announcements(page)).toContainText('Newer run available');
    await expect(page.getByTestId('newer-run-indicator')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /^Event WorkA:/ }),
    ).toBeVisible();
  });

  test('shows a card error and retries it', async ({ page }) => {
    const runs = linearChain(3);
    runs[0].historyErrorStatus = 503;
    await mockChain(page, { runs, current: () => 'run-03' });
    await page.goto(chainUrl('run-01'));

    const failed = cardActions(page, 'run-01');
    await expect(failed).toContainText("Couldn't load events");
    await expect(card(page, 'run-01')).toHaveAccessibleDescription(
      /couldn't load events/,
    );
    await expect(card(page, 'run-02')).not.toHaveAccessibleDescription(
      /couldn't load events/,
    );

    runs[0].historyErrorStatus = undefined;
    await failed.getByRole('button', { name: 'Retry' }).click();

    await expect(failed).not.toContainText("Couldn't load events");
    await expect(card(page, 'run-01')).toHaveAccessibleDescription(
      /1 activity/,
    );
  });

  test('drops a ?run= that is not found and says so', async ({ page }) => {
    await mockChain(page, { runs: closedChain(), current: () => 'run-b' });
    await page.goto(chainUrl('run-a', '?run=missing&sort=ascending'));

    const notice = page.getByTestId('run-notice');
    await expect(notice).toContainText(
      "Run missing couldn't be found. It may be past retention.",
    );
    await expect(page).not.toHaveURL(/run=/);
    await expect(page).toHaveURL(/sort=ascending/);
    await expect(card(page, 'run-b')).toHaveAttribute('aria-current', 'true');

    await expect(notice.getByRole('button')).toHaveCount(0);

    await card(page, 'run-a').click();
    await expect(page).toHaveURL(/[?&]run=run-a/);
    await expect(notice).toHaveCount(0);

    await page.goBack();
    await expect(page).not.toHaveURL(/run=/);
    await expect(notice).toHaveCount(0);
  });

  test('drops a ?run= from another chain and links to it', async ({ page }) => {
    await mockChain(page, {
      runs: [
        ...closedChain(),
        {
          runId: 'other',
          firstRunId: 'other',
          activity: 'OtherWork',
          startTime: '2023-01-01T00:00:00.000Z',
        },
      ],
      current: () => 'run-b',
    });
    await page.goto(chainUrl('run-a', '?run=other'));

    const notice = page.getByTestId('run-notice');
    await expect(notice).toContainText("Run other isn't part of this chain.");
    await expect(
      notice.getByRole('link', { name: 'View run' }),
    ).toHaveAttribute('href', /\/workflows\/chain-workflow\/other/);
    await expect(page).not.toHaveURL(/run=/);
  });

  test('is one tab stop; arrows move focus only and Enter selects', async ({
    page,
  }) => {
    await mockChain(page, { runs: linearChain(3), current: () => 'run-03' });
    await page.goto(chainUrl('run-01'));

    await expect(strip(page)).toHaveAccessibleName('Runs, 3 loaded');
    await expect(strip(page)).toHaveAccessibleDescription(
      'Use arrow keys to move between runs, Enter to select',
    );
    await expect(
      strip(page).locator('button[aria-label^="Run "][tabindex="0"]'),
    ).toHaveCount(1);

    await previousButton(page).focus();
    await page.keyboard.press('Tab');
    expect(await focusedName(page)).toMatch(/^Run run-03, /);

    await page.keyboard.press('ArrowLeft');
    expect(await focusedName(page)).toMatch(/^Run run-02, /);
    expect(runParam(page)).toBeNull();
    await expect(card(page, 'run-03')).toHaveAttribute('aria-current', 'true');

    await page.keyboard.press('Tab');
    expect(await focusedName(page)).toBe('Copy Run ID');
    await expect(
      cardActions(page, 'run-02').getByRole('button', { name: 'Copy Run ID' }),
    ).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(
      cardActions(page, 'run-02').getByRole('link', { name: 'Go to run page' }),
    ).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(jumpButton(page)).toBeFocused();

    await page.keyboard.press('Shift+Tab');
    await expect(
      cardActions(page, 'run-03').getByRole('link', { name: 'Go to run page' }),
    ).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(card(page, 'run-03')).toBeFocused();

    await page.keyboard.press('Home');
    await expect(card(page, 'run-01')).toBeFocused();
    await page.keyboard.press('End');
    await expect(card(page, 'run-03')).toBeFocused();
    await page.keyboard.press('Home');
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/[?&]run=run-01/);
    await expect(card(page, 'run-01')).toHaveAttribute('aria-current', 'true');
  });

  test('names and describes each card', async ({ page }) => {
    const runs = linearChain(3);
    runs[1].continueAsNewInitiator = 'CONTINUE_AS_NEW_INITIATOR_RETRY';
    await mockChain(page, { runs, current: () => 'run-03' });
    await page.goto(chainUrl('run-01', '?run=run-02'));

    await expect(card(page, 'run-03')).toHaveAccessibleName(
      'Run run-03, Completed, latest, 1h',
    );
    await expect(card(page, 'run-02')).toHaveAccessibleName(
      'Run run-02, Continued as New, 1h',
    );
    const description =
      /run-02, 1 activity, Continued from previous run by retry/;
    await expect(card(page, 'run-02')).toHaveAccessibleDescription(description);
    await expect(
      page.locator('[data-testid="run-transition"][data-transition="retry"]'),
    ).toHaveCount(1);
    await expect(card(page, 'run-01')).toHaveAccessibleDescription(
      /Start of chain$/,
    );
  });

  test('describes the incoming transition of the oldest loaded card', async ({
    page,
  }) => {
    const runs = linearChain(12);
    runs[2].continueAsNewInitiator = 'CONTINUE_AS_NEW_INITIATOR_RETRY';
    await mockChain(page, { runs, current: () => 'run-12' });
    await page.goto(chainUrl('run-01'));

    await expect(strip(page)).toHaveAccessibleName('Runs, 10 loaded');
    await expect(card(page, 'run-03')).toHaveAccessibleDescription(
      /Continued from previous run by retry$/,
    );
    await expect(page.getByTestId('run-transition')).toHaveCount(9);
  });
});
