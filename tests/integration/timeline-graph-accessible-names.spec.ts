import { expect, test } from '@playwright/test';

import { mockWorkflowApis } from '~/test-utilities/mock-apis';
import { mockWorkflow } from '~/test-utilities/mocks/workflow';

const { workflowId, runId } = mockWorkflow.workflowExecutionInfo.execution;
const timelineUrl = `/namespaces/default/workflows/${workflowId}/${runId}/timeline`;

// The timeline graph labels its nodes for screen readers. The workflow bar is
// informational (role="img"); event nodes are interactive (role="button").
// These assertions fail if those accessible names regress.
test.describe('Timeline graph node accessible names', () => {
  test.beforeEach(async ({ page }) => {
    await mockWorkflowApis(page);
    await page.goto(timelineUrl);
  });

  test('workflow node announces its id and status', async ({ page }) => {
    await expect(
      page.getByRole('img', { name: `Workflow ${workflowId}: Running` }),
    ).toBeVisible();
  });

  test('event nodes announce their type and classification', async ({
    page,
  }) => {
    await expect(
      page.getByRole('button', { name: 'Event LongActivity: Scheduled' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Event customSignal: Signaled' }),
    ).toBeVisible();
  });

  test('renders the retry icon inside the pending attempt badge', async ({
    page,
  }) => {
    const pendingActivity = page.getByRole('button', {
      name: 'Event LongActivity: Scheduled',
    });
    const attemptBadge = pendingActivity.getByTestId('timeline-attempt-badge');

    await expect(attemptBadge).toContainText('1 / 1');
    await expect(attemptBadge).not.toContainText('Attempt');
    await expect(attemptBadge.locator('use[href="#ti-retry"]')).toHaveCount(1);
  });

  test('defaults no-payload events to a title-only card', async ({ page }) => {
    await page
      .getByRole('button', { name: 'Event LongActivity: Scheduled' })
      .click();

    const panel = page.getByTestId('timeline-group-details');
    const card = panel.locator('[data-testid="event-card"][data-event-id="6"]');

    await expect(card).toHaveAttribute('data-layout', 'attributes');
    await expect(card).toHaveAttribute('data-details-visible', 'false');
    await expect(
      card.getByText('Activity Task Scheduled', { exact: true }),
    ).toBeVisible();
    await expect(card.locator(':scope > *')).toHaveCount(1);
    await expect(card.getByTestId('event-card-details')).toHaveCount(0);
    await expect(card.getByTestId('event-card-payloads')).toHaveCount(0);
  });

  test('toggles timeline cards between payloads only and full details', async ({
    page,
  }) => {
    await page
      .getByRole('button', { name: 'Event customSignal: Signaled' })
      .click();

    const panel = page.getByTestId('timeline-group-details');
    const card = panel.getByTestId('event-card');
    const toggle = panel.getByRole('button', { name: 'Event details' });
    const payloads = card.getByTestId('event-card-payloads');

    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(card).toHaveAttribute('data-details-visible', 'false');
    await expect(card.getByTestId('event-card-details')).toHaveCount(0);
    await expect(payloads).toBeVisible();

    const [cardBox, payloadsBox] = await Promise.all([
      card.boundingBox(),
      payloads.boundingBox(),
    ]);
    expect(cardBox).not.toBeNull();
    expect(payloadsBox).not.toBeNull();
    expect(payloadsBox!.width).toBeGreaterThan(cardBox!.width * 0.95);

    await toggle.hover();
    await expect(page.getByRole('tooltip')).toHaveText('Show event details');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(card).toHaveAttribute('data-details-visible', 'true');
    await expect(card.getByTestId('event-card-details')).toBeVisible();
    await expect(card.getByText('Identity', { exact: true })).toBeVisible();
    await expect(payloads).toBeVisible();
    await expect(page.getByRole('tooltip')).toHaveText('Show payloads only');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(card.getByTestId('event-card-details')).toHaveCount(0);
  });

  test('persists the Timeline card mode across refreshes', async ({ page }) => {
    await page
      .getByRole('button', { name: 'Event customSignal: Signaled' })
      .click();

    const panel = page.getByTestId('timeline-group-details');
    await panel.getByRole('button', { name: 'Event details' }).click();
    expect(
      await page.evaluate(() =>
        localStorage.getItem('timelineShowEventDetails'),
      ),
    ).toBe('true');

    await page.reload();
    await page
      .getByRole('button', { name: 'Event customSignal: Signaled' })
      .click();

    await expect(
      page.getByTestId('timeline-group-details').getByRole('button', {
        name: 'Event details',
      }),
    ).toHaveAttribute('aria-pressed', 'true');
  });
});
