import { expect, type Locator, type Page, test } from '@playwright/test';

import { mockWorkflowApis } from '~/test-utilities/mock-apis';
import { mockWorkflow } from '~/test-utilities/mocks/workflow';

const { workflowId, runId } = mockWorkflow.workflowExecutionInfo.execution;
const workflowBaseUrl = `/namespaces/default/workflows/${workflowId}/${runId}`;
const historyUrl = `${workflowBaseUrl}/history`;
const timelineUrl = `${workflowBaseUrl}/timeline`;

const narrowViewport = { width: 375, height: 900 };
const stickyStackViewports = [
  {
    destinationHeight: 44,
    height: 640,
    name: '375px',
    toolbarHeight: 44,
    width: 375,
  },
  {
    destinationHeight: 32,
    height: 720,
    name: '1280px',
    toolbarHeight: 40,
    width: 1280,
  },
] as const;

const stickyStackRoutes = [
  {
    commandRailTestId: 'event-history-command-rail',
    contentTestId: 'event-summary-table',
    name: 'Event History',
    url: historyUrl,
  },
  {
    commandRailTestId: 'timeline-command-rail',
    contentId: 'event-history-timeline-graph',
    name: 'Timeline',
    url: timelineUrl,
  },
] as const;

const railMetrics = (viewport: Locator) =>
  viewport.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollLeft: element.scrollLeft,
    scrollWidth: element.scrollWidth,
  }));

const expectScrollControlState = async (
  control: Locator,
  enabled: boolean,
  { focusVisible = false }: { focusVisible?: boolean } = {},
) => {
  await expect(control).toBeAttached();
  await expect(control).toHaveAttribute('aria-disabled', String(!enabled));
  await expect(control).toHaveAttribute('tabindex', enabled ? '0' : '-1');
  await expect(control).toHaveCSS('pointer-events', enabled ? 'auto' : 'none');
  await expect(control).toHaveCSS(
    'opacity',
    enabled || focusVisible ? '1' : '0',
  );
};

const expectNarrowOverflowControls = async (
  page: Page,
  commandRailTestId: string,
) => {
  const rail = page.getByTestId(commandRailTestId);
  const viewport = page.getByTestId(`${commandRailTestId}-viewport`);
  const previous = page.getByTestId(`${commandRailTestId}-previous`);
  const next = page.getByTestId(`${commandRailTestId}-next`);

  await expect(rail).toBeVisible();
  await expect(viewport).toBeVisible();
  await expect
    .poll(async () => {
      const { clientWidth, scrollWidth } = await railMetrics(viewport);
      return scrollWidth > clientWidth + 1;
    })
    .toBe(true);
  await expect
    .poll(() =>
      viewport.evaluate((element) => {
        const styles = getComputedStyle(element);
        return [styles.paddingInlineStart, styles.paddingInlineEnd];
      }),
    )
    .toEqual(['0px', '0px']);

  // Active-item reveal and late-loading controls may establish a non-zero
  // initial position. Normalize to the start before testing edge behavior.
  await viewport.evaluate((element) => {
    element.scrollTo({ left: 0, behavior: 'auto' });
  });
  await expect(rail).toHaveAttribute('data-overflow-start', 'false');
  await expect(rail).toHaveAttribute('data-overflow-end', 'true');
  await expectScrollControlState(previous, false);
  await expectScrollControlState(next, true);

  const initialScrollLeft = (await railMetrics(viewport)).scrollLeft;
  await next.click();

  await expect
    .poll(async () => (await railMetrics(viewport)).scrollLeft)
    .toBeGreaterThan(initialScrollLeft);
  await expect(rail).toHaveAttribute('data-overflow-start', 'true');
  await expectScrollControlState(previous, true);

  await viewport.evaluate((element) => {
    element.scrollTo({ left: element.scrollWidth, behavior: 'auto' });
  });
  await expect(rail).toHaveAttribute('data-overflow-end', 'false');
  await expectScrollControlState(previous, true);
  await expectScrollControlState(next, false);
};

const expectVisibleLabels = async (rail: Locator, labels: string[]) => {
  for (const label of labels) {
    await expect(rail.getByText(label, { exact: true })).toBeVisible();
  }
};

const isFullyVisibleIn = (item: Locator, viewportTestId: string) =>
  item.evaluate((element, testId) => {
    const viewport = document.querySelector<HTMLElement>(
      `[data-testid="${testId}"]`,
    );
    if (!viewport) return false;

    const itemBounds = element.getBoundingClientRect();
    const viewportBounds = viewport.getBoundingClientRect();

    return (
      itemBounds.left >= viewportBounds.left - 1 &&
      itemBounds.right <= viewportBounds.right + 1
    );
  }, viewportTestId);

const expectApproximately = (
  actual: number,
  expected: number,
  message: string,
) => {
  expect(Math.abs(actual - expected), message).toBeLessThanOrEqual(1);
};

const paintOrderAtIntersection = (
  page: Page,
  overlaySelector: string,
  underlaySelectors: string[],
) =>
  page.evaluate(
    ({ overlaySelector, underlaySelectors }) => {
      const overlay = Array.from(
        document.querySelectorAll<HTMLElement>(overlaySelector),
      ).find((element) => element.getClientRects().length > 0);
      const underlays = underlaySelectors
        .map((selector) => document.querySelector<HTMLElement>(selector))
        .filter((element): element is HTMLElement => Boolean(element));

      if (!overlay || underlays.length === 0) return null;

      const overlayBounds = overlay.getBoundingClientRect();

      for (const underlay of underlays) {
        const underlayBounds = underlay.getBoundingClientRect();
        const intersection = {
          bottom: Math.min(overlayBounds.bottom, underlayBounds.bottom),
          left: Math.max(overlayBounds.left, underlayBounds.left),
          right: Math.min(overlayBounds.right, underlayBounds.right),
          top: Math.max(overlayBounds.top, underlayBounds.top),
        };

        if (
          intersection.right <= intersection.left ||
          intersection.bottom <= intersection.top
        ) {
          continue;
        }

        const elements = document.elementsFromPoint(
          (intersection.left + intersection.right) / 2,
          (intersection.top + intersection.bottom) / 2,
        );

        return {
          intersects: true,
          overlayIndex: elements.findIndex(
            (element) => element === overlay || overlay.contains(element),
          ),
          underlayIndex: elements.findIndex(
            (element) => element === underlay || underlay.contains(element),
          ),
        };
      }

      return { intersects: false, overlayIndex: -1, underlayIndex: -1 };
    },
    { overlaySelector, underlaySelectors },
  );

const stickyStackMetrics = async (page: Page, commandRailTestId: string) =>
  page.evaluate((secondaryRailTestId) => {
    const contentWrapper =
      document.querySelector<HTMLElement>('#content-wrapper');
    const destinationRail = document.querySelector<HTMLElement>(
      '[data-testid="workflow-detail-command-rail"]',
    );
    const secondaryRail = document.querySelector<HTMLElement>(
      `[data-testid="${secondaryRailTestId}"]`,
    );
    const topNavigation = Array.from(
      document.querySelectorAll<HTMLElement>('[data-testid="top-nav"]'),
    ).find((element) => element.getClientRects().length > 0);

    if (!contentWrapper || !destinationRail || !secondaryRail) return null;

    const bounds = (element: HTMLElement) => {
      const { bottom, height, top } = element.getBoundingClientRect();
      return { bottom, height, top };
    };

    return {
      contentWrapper: bounds(contentWrapper),
      destinationRail: bounds(destinationRail),
      scrollTop: contentWrapper.scrollTop,
      secondaryRail: bounds(secondaryRail),
      topNavigation: topNavigation ? bounds(topNavigation) : null,
    };
  }, commandRailTestId);

const expectStickyStack = async (
  page: Page,
  scenario: (typeof stickyStackRoutes)[number],
  viewport: (typeof stickyStackViewports)[number],
) => {
  await page.setViewportSize({
    width: viewport.width,
    height: viewport.height,
  });
  await page.goto(scenario.url);

  const destinationRail = page.getByTestId('workflow-detail-command-rail');
  const secondaryRail = page.getByTestId(scenario.commandRailTestId);
  const scrollContainer = page.locator('#content-wrapper');
  const scrollContent =
    'contentTestId' in scenario
      ? page.getByTestId(scenario.contentTestId)
      : page.locator(`#${scenario.contentId}`);

  await expect(destinationRail).toBeVisible();
  await expect(secondaryRail).toBeVisible();
  await expect(scrollContent).toBeVisible();

  const initialDestinationTop = await destinationRail.evaluate(
    (element) => element.getBoundingClientRect().top,
  );

  // Give both sticky rows ample real scroll travel without coupling this
  // geometry regression to the number or height of mocked history events.
  await scrollContent.evaluate((element) => {
    element.style.minHeight = '1600px';
  });
  await scrollContainer.evaluate((element) => {
    element.scrollTo({ top: 800, behavior: 'auto' });
  });
  await expect
    .poll(() => scrollContainer.evaluate((element) => element.scrollTop))
    .toBeGreaterThanOrEqual(799);

  const metrics = await stickyStackMetrics(page, scenario.commandRailTestId);
  expect(metrics, 'the sticky command-rail stack should render').not.toBeNull();
  if (!metrics) return;

  expect(
    initialDestinationTop,
    'the destination rail should move into its sticky position',
  ).toBeGreaterThan(metrics.destinationRail.top + 1);
  expectApproximately(
    metrics.destinationRail.height,
    viewport.destinationHeight,
    'the destination rail should retain its responsive height',
  );
  expectApproximately(
    metrics.secondaryRail.height,
    viewport.toolbarHeight,
    'the secondary command rail should retain its responsive height',
  );
  expectApproximately(
    metrics.secondaryRail.top,
    metrics.destinationRail.bottom,
    'the secondary command rail should stay directly below the destination rail',
  );

  if (viewport.width >= 768) {
    expect(
      metrics.topNavigation,
      'desktop should render the top navigation',
    ).not.toBeNull();
    if (metrics.topNavigation) {
      expectApproximately(
        metrics.destinationRail.top,
        metrics.topNavigation.bottom,
        'the destination rail should stay directly below desktop navigation',
      );
    }
  } else {
    expectApproximately(
      metrics.destinationRail.top,
      metrics.contentWrapper.top,
      'the destination rail should stay at the top of the narrow content viewport',
    );
  }
};

test.beforeEach(async ({ page }) => {
  await page.setViewportSize(narrowViewport);
  await mockWorkflowApis(page);
});

test('workflow destination rail exposes contextual overflow controls at 375px', async ({
  page,
}) => {
  await page.goto(historyUrl);

  await expect(page.getByTestId('workflow-detail-command-rail')).toBeVisible();
  await expectNarrowOverflowControls(page, 'workflow-detail-command-rail');
});

test('Event History command rail exposes contextual overflow controls at 375px', async ({
  page,
}) => {
  await page.goto(historyUrl);

  await expect(page.getByTestId('event-history-command-rail')).toBeVisible();
  await expectNarrowOverflowControls(page, 'event-history-command-rail');
});

test('Timeline command rail exposes contextual overflow controls at 375px', async ({
  page,
}) => {
  await page.goto(timelineUrl);

  await expect(page.getByTestId('timeline-command-rail')).toBeVisible();
  await expectNarrowOverflowControls(page, 'timeline-command-rail');
});

for (const scenario of stickyStackRoutes) {
  for (const viewport of stickyStackViewports) {
    test(`${scenario.name} keeps its command rails stacked after page scroll at ${viewport.name}`, async ({
      page,
    }) => {
      await expectStickyStack(page, scenario, viewport);
      await expect(page.getByTestId(scenario.commandRailTestId)).toBeVisible();
    });
  }
}

test('the user menu renders above sticky workflow navigation', async ({
  page,
}) => {
  await expectStickyStack(page, stickyStackRoutes[1], stickyStackViewports[1]);

  const userMenuTrigger = page.getByTestId('user-menu-trigger');
  await userMenuTrigger.click();
  await expect(userMenuTrigger).toHaveAttribute('aria-expanded', 'true');

  const userMenu = page.locator('#user-menu');
  await expect(userMenu).toBeVisible();

  const stackingOrder = await paintOrderAtIntersection(page, '#user-menu', [
    '[data-testid="workflow-detail-command-rail"]',
  ]);

  expect(
    stackingOrder,
    'the menu and sticky rail should render',
  ).not.toBeNull();
  expect(
    stackingOrder?.intersects,
    'the regression must exercise the overlapping surfaces',
  ).toBe(true);
  expect(stackingOrder?.overlayIndex).toBeGreaterThanOrEqual(0);
  expect(stackingOrder?.underlayIndex).toBeGreaterThanOrEqual(0);
  expect(
    stackingOrder?.overlayIndex,
    'the user menu should be painted above the sticky workflow rail',
  ).toBeLessThan(stackingOrder?.underlayIndex ?? -1);
});

test('the workflow actions menu renders above sticky workflow navigation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(historyUrl);

  const actionsTrigger = page.getByRole('button', { name: 'More Actions' });
  await actionsTrigger.click();
  await expect(actionsTrigger).toHaveAttribute('aria-expanded', 'true');

  const actionsMenu = page.locator('#workflow-actions:visible');
  await expect(actionsMenu).toBeVisible();

  const stackingOrder = await paintOrderAtIntersection(
    page,
    '#workflow-actions',
    [
      '[data-testid="workflow-detail-command-rail"]',
      '[data-testid="event-history-command-rail"]',
    ],
  );

  expect(
    stackingOrder,
    'the menu and sticky rails should render',
  ).not.toBeNull();
  expect(
    stackingOrder?.intersects,
    'the regression must exercise the overlapping surfaces',
  ).toBe(true);
  expect(stackingOrder?.overlayIndex).toBeGreaterThanOrEqual(0);
  expect(stackingOrder?.underlayIndex).toBeGreaterThanOrEqual(0);
  expect(
    stackingOrder?.overlayIndex,
    'the workflow actions menu should be painted above sticky workflow rails',
  ).toBeLessThan(stackingOrder?.underlayIndex ?? -1);
});

test('History and Timeline keep their command labels visible at 375px', async ({
  page,
}) => {
  await page.goto(historyUrl);
  const historyRail = page.getByTestId('event-history-command-rail');
  await expect(historyRail).toBeVisible();
  await expectVisibleLabels(historyRail, [
    'All',
    'Compact',
    'JSON',
    'Filter',
    'Live',
    'Download',
  ]);

  await page.goto(timelineUrl);
  const timelineRail = page.getByTestId('timeline-command-rail');
  await expect(timelineRail).toBeVisible();
  await expectVisibleLabels(timelineRail, ['Filter', 'Live', 'Download']);
});

test('focusing an offscreen workflow tab reveals it without navigating', async ({
  page,
}) => {
  await page.goto(historyUrl);

  const viewportTestId = 'workflow-detail-command-rail-viewport';
  const viewport = page.getByTestId(viewportTestId);
  const historyTab = page.getByTestId('history-tab');
  const memoTab = page.getByTestId('memo-tab');
  const initialUrl = page.url();

  await viewport.evaluate((element) => {
    element.scrollTo({ left: 0, behavior: 'auto' });
  });
  await expect
    .poll(() => isFullyVisibleIn(memoTab, viewportTestId))
    .toBe(false);

  await memoTab.focus();

  await expect(memoTab).toBeFocused();
  await expect.poll(() => isFullyVisibleIn(memoTab, viewportTestId)).toBe(true);
  await expect(historyTab).toHaveAttribute('aria-selected', 'true');
  await expect(memoTab).toHaveAttribute('aria-selected', 'false');
  expect(page.url()).toBe(initialUrl);
});

test('the final forward overflow action retains keyboard focus at the boundary', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(historyUrl);

  const rail = page.getByTestId('workflow-detail-command-rail');
  const viewport = page.getByTestId('workflow-detail-command-rail-viewport');
  const previous = page.getByTestId('workflow-detail-command-rail-previous');
  const next = page.getByTestId('workflow-detail-command-rail-next');
  const initialUrl = page.url();

  await expect(rail).toHaveAttribute('data-overflow-end', 'true');
  await viewport.evaluate((element) => {
    const maxScroll = element.scrollWidth - element.clientWidth;
    const remainingDistance = Math.min(64, Math.max(2, maxScroll / 2));
    element.scrollTo({
      left: Math.max(0, maxScroll - remainingDistance),
      behavior: 'auto',
    });
  });
  await expect(rail).toHaveAttribute('data-overflow-start', 'true');
  await expect(rail).toHaveAttribute('data-overflow-end', 'true');
  await expectScrollControlState(previous, true);
  await expectScrollControlState(next, true);

  await previous.focus();
  await page.keyboard.press('Tab');
  await expect(next).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(rail).toHaveAttribute('data-overflow-end', 'false');
  await expect(next).toBeFocused();
  await expectScrollControlState(previous, true);
  await expectScrollControlState(next, false, { focusVisible: true });
  expect(page.url()).toBe(initialUrl);
});

test('command rail scrolling is immediate when reduced motion is requested', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(historyUrl);

  const viewport = page.getByTestId('workflow-detail-command-rail-viewport');
  await expect(
    page.getByTestId('workflow-detail-command-rail-next'),
  ).toBeVisible();

  await viewport.evaluate((element) => {
    const originalScrollBy = element.scrollBy.bind(element);

    element.scrollBy = ((optionsOrX?: ScrollToOptions | number, y?: number) => {
      if (typeof optionsOrX === 'object' && optionsOrX !== null) {
        element.dataset.requestedScrollBehavior = optionsOrX.behavior ?? 'auto';
        originalScrollBy(optionsOrX);
      } else {
        originalScrollBy(optionsOrX ?? 0, y ?? 0);
      }
    }) as typeof element.scrollBy;
  });

  await page.getByTestId('workflow-detail-command-rail-next').click();

  await expect(viewport).toHaveAttribute(
    'data-requested-scroll-behavior',
    'auto',
  );
});
