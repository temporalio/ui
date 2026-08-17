import { expect, type Locator, type Page, test } from '@playwright/test';

import completedEvents from '~/fixtures/completed-event-history.json' with { type: 'json' };
import { mockWorkflowApis } from '~/test-utilities/mock-apis';
import {
  EVENT_HISTORY_API,
  EVENT_HISTORY_API_REVERSE,
} from '~/test-utilities/mocks/event-history';
import { mockWorkflow } from '~/test-utilities/mocks/workflow';

type FixtureEvent = Record<string, unknown> & {
  eventId: string;
  activityTaskScheduledEventAttributes?: Record<string, unknown>;
};

const { workflowId, runId } = mockWorkflow.workflowExecutionInfo.execution;
const eventUrl = (eventId: string) =>
  `/namespaces/default/workflows/${workflowId}/${runId}/history/events/${eventId}`;

const events = structuredClone(completedEvents.slice(0, 5)) as FixtureEvent[];
const scheduledEvent = events.find(({ eventId }) => eventId === '5');
const payloadEventId = '50';

if (!scheduledEvent?.activityTaskScheduledEventAttributes) {
  throw new Error('ActivityTaskScheduled fixture is missing its attributes');
}

// Keep the empty structural header in the fixture: it must not turn an event
// with no user data into a payload-bearing card.

const payloadScheduledEvent = structuredClone(scheduledEvent);
payloadScheduledEvent.eventId = payloadEventId;
payloadScheduledEvent.activityTaskScheduledEventAttributes = {
  ...payloadScheduledEvent.activityTaskScheduledEventAttributes,
  input: {
    payloads: [
      {
        metadata: { encoding: 'anNvbi9wbGFpbg==' },
        data: 'InJlZ3Jlc3Npb24i',
      },
    ],
  },
};
events.push(payloadScheduledEvent);

const history = {
  history: { events },
  rawHistory: [],
  nextPageToken: null,
  archived: false,
};

const workflowWithoutPending = {
  ...mockWorkflow,
  pendingActivities: [],
  pendingChildren: [],
};

const mockEventCards = async (page: Page) => {
  await mockWorkflowApis(page, workflowWithoutPending);
  await page.route(EVENT_HISTORY_API, (route) =>
    route.fulfill({ json: history }),
  );
  await page.route(EVENT_HISTORY_API_REVERSE, (route) =>
    route.fulfill({
      json: {
        ...history,
        history: { events: [...events].reverse() },
      },
    }),
  );
};

const boxesFor = (locator: Locator) =>
  locator.evaluateAll((elements) =>
    elements.map((element) => {
      const { x, y, width, height } = element.getBoundingClientRect();
      return { x, y, width, height };
    }),
  );

const distinctPositions = (positions: number[]) =>
  new Set(positions.map((position) => Math.round(position / 2) * 2)).size;

const labelValueGeometryFor = (details: Locator) =>
  details.locator(':scope > *').evaluateAll((fields) =>
    fields.flatMap((field) => {
      const [label, value] = field.children;
      if (!label || !value) return [];

      const labelRange = document.createRange();
      labelRange.selectNodeContents(label);
      const labelBox = labelRange.getBoundingClientRect();
      const valueBox = value.getBoundingClientRect();

      return [
        {
          label: label.textContent?.trim() ?? '',
          labelBox: {
            top: labelBox.top,
            right: labelBox.right,
            bottom: labelBox.bottom,
            left: labelBox.left,
          },
          valueBox: {
            top: valueBox.top,
            right: valueBox.right,
            bottom: valueBox.bottom,
            left: valueBox.left,
          },
        },
      ];
    }),
  );

const boxesOverlap = (
  first: { top: number; right: number; bottom: number; left: number },
  second: { top: number; right: number; bottom: number; left: number },
) =>
  Math.min(first.right, second.right) - Math.max(first.left, second.left) >
    0.5 &&
  Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top) > 0.5;

test.beforeEach(async ({ page }) => {
  await mockEventCards(page);
});

test('attribute-only events fill the card with compact label-over-value fields', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(eventUrl('5'));

  const card = page.getByTestId('event-card').filter({
    has: page.getByText('Activity Task Scheduled', { exact: true }),
  });
  const details = card.getByTestId('event-card-details');

  await expect(card).toHaveAttribute('data-layout', 'attributes');
  await expect(card.getByTestId('event-card-payloads')).toHaveCount(0);

  const [cardBox, detailsBox] = await Promise.all([
    card.boundingBox(),
    details.boundingBox(),
  ]);
  expect(cardBox).not.toBeNull();
  expect(detailsBox).not.toBeNull();
  expect(detailsBox!.width).toBeGreaterThan(cardBox!.width * 0.95);

  const fields = details.locator(':scope > *');
  const fieldBoxes = await boxesFor(fields);
  expect(fieldBoxes.length).toBeGreaterThan(4);
  expect(distinctPositions(fieldBoxes.map(({ x }) => x))).toBeGreaterThan(1);
  expect(distinctPositions(fieldBoxes.map(({ y }) => y))).toBeLessThan(
    fieldBoxes.length,
  );

  const firstFieldParts = await boxesFor(fields.first().locator(':scope > *'));
  expect(firstFieldParts.length).toBeGreaterThanOrEqual(2);
  const labelBottom = firstFieldParts[0].y + firstFieldParts[0].height;
  expect(firstFieldParts[1].y).toBeGreaterThanOrEqual(labelBottom - 1);
  expect(firstFieldParts[1].y - labelBottom).toBeLessThanOrEqual(1);
});

test('attribute-only fields collapse to one lane in narrow cards', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(eventUrl('5'));

  const card = page.getByTestId('event-card').filter({
    has: page.getByText('Activity Task Scheduled', { exact: true }),
  });
  await expect(card).toHaveAttribute('data-layout', 'attributes');

  await card.evaluate((element) => {
    element.style.flex = 'none';
    element.style.inlineSize = '343px';
  });

  const details = card.getByTestId('event-card-details');
  const fields = details.locator(':scope > *');
  await expect(details).toBeVisible();
  await expect(fields.first()).toBeVisible();

  const fieldBoxes = await boxesFor(fields);

  expect(fieldBoxes.length).toBeGreaterThan(4);
  expect(distinctPositions(fieldBoxes.map(({ x }) => x))).toBe(1);
  expect(
    await card.evaluate((element) => element.scrollWidth - element.clientWidth),
  ).toBeLessThanOrEqual(1);
});

test('payload events retain the existing two-pane layout', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(eventUrl('1'));

  const card = page.getByTestId('event-card').filter({
    has: page.getByText('Workflow Execution Started', { exact: true }),
  });
  const details = card.getByTestId('event-card-details');
  const payloads = card.getByTestId('event-card-payloads');

  await expect(card).toHaveAttribute('data-layout', 'payload');
  await expect(payloads).toBeVisible();

  const [detailsBox, payloadsBox] = await Promise.all([
    details.boundingBox(),
    payloads.boundingBox(),
  ]);
  expect(detailsBox).not.toBeNull();
  expect(payloadsBox).not.toBeNull();
  expect(payloadsBox!.x).toBeGreaterThan(detailsBox!.x);
  expect(payloadsBox!.width).toBeGreaterThan(detailsBox!.width * 0.9);
});

for (const width of [375, 1440]) {
  test(`payload detail labels do not overlap their values at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(eventUrl(payloadEventId));

    const card = page.locator(
      `[data-testid="event-card"][data-event-id="${payloadEventId}"]`,
    );
    const details = card.getByTestId('event-card-details');

    await expect(card).toHaveAttribute('data-layout', 'payload');
    await expect(card.getByTestId('event-card-payloads')).toBeVisible();
    await expect(details).toBeVisible();

    const geometries = await labelValueGeometryFor(details);
    expect(geometries.length).toBeGreaterThan(4);
    expect(geometries.map(({ label }) => label)).toContain(
      'Workflow Task Completed Event ID',
    );

    const overlappingLabels = geometries
      .filter(({ labelBox, valueBox }) => boxesOverlap(labelBox, valueBox))
      .map(({ label }) => label);

    expect(overlappingLabels).toEqual([]);
  });
}
