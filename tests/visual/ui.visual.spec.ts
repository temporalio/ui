import {
  expect,
  type Locator,
  type Page,
  test,
  type TestInfo,
} from '@playwright/test';

import {
  mockClusterApi,
  mockGlobalApis,
  mockNamespaceWithNexusOperations,
  mockSchedulesApis,
  mockSearchAttributesApi,
  mockWorkflowApis,
  mockWorkflowsApis,
  WORKFLOWS_API,
} from '~/test-utilities/mock-apis';
import { mockDate } from '~/test-utilities/mock-date';
import { mockWorkflow } from '~/test-utilities/mocks/workflow';

const workflowsUrl = '/namespaces/default/workflows';
const createScheduleUrl = '/namespaces/default/schedules/create';
const startNexusOperationUrl =
  '/namespaces/default/nexus-operations/start?endpoint=payments&service=BillingService&operation=ReconcileInvoice';
const workflowHistoryUrl = `/namespaces/default/workflows/${mockWorkflow.workflowExecutionInfo.execution.workflowId}/${mockWorkflow.workflowExecutionInfo.execution.runId}/history`;
const workflowMemoUrl = `/namespaces/default/workflows/${mockWorkflow.workflowExecutionInfo.execution.workflowId}/${mockWorkflow.workflowExecutionInfo.execution.runId}/memo`;

const fixedWorkflows = [
  {
    ...mockWorkflow.workflowExecutionInfo,
    execution: {
      workflowId: 'invoice-reconciliation-2025-04-28',
      runId: '4284ef9a-947f-4db2-bf15-dbc377e71fa6',
    },
    type: { name: 'InvoiceReconciliationWorkflow' },
    taskQueue: 'finance-reconciliation',
  },
  {
    ...mockWorkflow.workflowExecutionInfo,
    execution: {
      workflowId: 'shipment-tracking-eu-central',
      runId: 'b50f42fb-13dc-47c4-903a-d633d16e0c11',
    },
    type: { name: 'ShipmentTrackingWorkflow' },
    taskQueue: 'fulfillment-events',
  },
  {
    ...mockWorkflow.workflowExecutionInfo,
    execution: {
      workflowId: 'customer-profile-indexer',
      runId: 'a90dd2c0-45e2-4abc-b506-56301dc6eb8f',
    },
    type: { name: 'CustomerProfileIndexWorkflow' },
    taskQueue: 'search-indexing',
  },
];

const themeFor = (testInfo: TestInfo): 'light' | 'dark' => {
  const theme = testInfo.project.metadata.theme;
  if (theme !== 'light' && theme !== 'dark') {
    throw new Error(
      `Visual project is missing a valid theme: ${String(theme)}`,
    );
  }
  return theme;
};

const installDeterministicBrowserState = async (
  page: Page,
  testInfo: TestInfo,
) => {
  const theme = themeFor(testInfo);

  await page.addInitScript(mockDate);
  await page.addInitScript(() => {
    window.Date.now = () => Date.parse('2012-09-19T18:00:00.000Z');
  });
  await page.addInitScript((selectedTheme) => {
    window.localStorage.setItem(
      'dark mode',
      selectedTheme === 'dark' ? 'true' : 'false',
    );
    window.localStorage.setItem('locale', 'en');
    window.localStorage.setItem('timeFormat', JSON.stringify('UTC'));
    window.localStorage.setItem('timeFormatType', JSON.stringify('absolute'));
    window.localStorage.setItem('visual version', 'v2');
  }, theme);
};

const stabilizePage = async (page: Page) => {
  await expect(page.locator('#content')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute(
    'data-visual-version',
    'v2',
  );
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
};

const expectLayoutContract = async (page: Page) => {
  const metrics = await page.evaluate(() => {
    const content = document.querySelector<HTMLElement>('#content');
    const contentFrame = content?.firstElementChild;
    const visibleNavigation = Array.from(
      document.querySelectorAll<HTMLElement>('[data-testid="top-nav"]'),
    ).find((element) => element.getClientRects().length > 0);

    if (!content || !contentFrame || !visibleNavigation) {
      return null;
    }

    const contentRect = content.getBoundingClientRect();
    const navigationRect = visibleNavigation.getBoundingClientRect();
    const frameStyle = window.getComputedStyle(contentFrame);

    return {
      contentWidth: contentRect.width,
      documentOverflow:
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
      framePaddingInlineStart: Number.parseFloat(frameStyle.paddingInlineStart),
      navigationBottom: navigationRect.bottom,
      navigationHeight: navigationRect.height,
      navigationTop: navigationRect.top,
      viewportHeight: window.innerHeight,
      viewportWidth: window.innerWidth,
    };
  });

  expect(
    metrics,
    'the app shell and content frame should render',
  ).not.toBeNull();
  if (!metrics) return;

  expect(
    metrics.documentOverflow,
    'the document should not overflow',
  ).toBeLessThanOrEqual(1);
  expect(
    metrics.contentWidth,
    'the main content should have usable width',
  ).toBeGreaterThan(240);
  expect(
    metrics.framePaddingInlineStart,
    'page gutters should stay within the compact redesign scale',
  ).toBeGreaterThanOrEqual(12);
  expect(
    metrics.framePaddingInlineStart,
    'page gutters should stay within the compact redesign scale',
  ).toBeLessThanOrEqual(24);
  expect(
    metrics.navigationHeight,
    'navigation should remain compact',
  ).toBeGreaterThanOrEqual(40);
  expect(
    metrics.navigationHeight,
    'navigation should remain compact',
  ).toBeLessThanOrEqual(64);

  if (metrics.viewportWidth >= 768) {
    expect(
      metrics.navigationTop,
      'desktop navigation should pin to the top',
    ).toBeCloseTo(0, 0);
  } else {
    expect(
      metrics.navigationBottom,
      'mobile navigation should pin to the bottom',
    ).toBeCloseTo(metrics.viewportHeight, 0);
  }

  if (metrics.viewportWidth <= 768) {
    const undersizedButtons = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll<HTMLElement>(
          '[data-track-name="button"]:not([disabled])',
        ),
      )
        .filter((element) => element.getClientRects().length > 0)
        .map((element) => {
          const bounds = element.getBoundingClientRect();
          return {
            label:
              element.getAttribute('aria-label') ??
              element.textContent?.trim() ??
              element.tagName,
            height: bounds.height,
            width: bounds.width,
          };
        })
        .filter(({ height, width }) => height < 44 || width < 44),
    );

    expect(
      undersizedButtons,
      'coarse-pointer button targets should remain at least 44px square',
    ).toEqual([]);
  }
};

const expectInsideViewport = async (locator: Locator) => {
  const bounds = await locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
      top: rect.top,
      viewportHeight: window.innerHeight,
      viewportWidth: window.innerWidth,
    };
  });

  expect(bounds.left).toBeGreaterThanOrEqual(-1);
  expect(bounds.top).toBeGreaterThanOrEqual(-1);
  expect(bounds.right).toBeLessThanOrEqual(bounds.viewportWidth + 1);
  expect(bounds.bottom).toBeLessThanOrEqual(bounds.viewportHeight + 1);
};

test.beforeEach(async ({ page }, testInfo) => {
  await installDeterministicBrowserState(page, testInfo);
});

test('workflow list shell and dense table', async ({ page }) => {
  await mockWorkflowsApis(page);
  await page.route(WORKFLOWS_API, (route) => {
    if (!new URL(route.request().url()).pathname.endsWith('/workflows')) {
      return route.fallback();
    }
    return route.fulfill({
      json: { executions: fixedWorkflows, nextPageToken: null },
    });
  });

  await page.goto(workflowsUrl);

  const table = page.getByRole('table', { name: 'Workflows' });
  await expect(table).toBeVisible();
  await expect(
    page.getByTestId('workflows-summary-configurable-table-row'),
  ).toHaveCount(fixedWorkflows.length);
  await stabilizePage(page);
  await expectLayoutContract(page);

  const firstRowHeight = await table
    .locator('tbody tr')
    .first()
    .evaluate((row) => row.getBoundingClientRect().height);
  expect(
    firstRowHeight,
    'dense workflow rows should remain scannable',
  ).toBeGreaterThanOrEqual(28);
  expect(
    firstRowHeight,
    'dense workflow rows should not regress to oversized rows',
  ).toBeLessThanOrEqual(
    Number(test.info().project.metadata.viewportWidth) <= 768 ? 48 : 44,
  );

  await page.getByTestId('add-filter-button').click();
  const filterMenu = page.getByRole('menu').first();
  await expect(filterMenu).toBeVisible();
  await expectInsideViewport(filterMenu);
  await page.keyboard.press('Escape');
  await expect(filterMenu).toBeHidden();

  await expect(page).toHaveScreenshot('workflows.png');
});

test('workflow history detail surface', async ({ page }) => {
  await mockWorkflowApis(page);
  await page.goto(workflowHistoryUrl);

  await expect(page.getByTestId('workflow-id-heading')).toContainText(
    mockWorkflow.workflowExecutionInfo.execution.workflowId,
  );
  await expect(page.getByTestId('event-summary-table')).toBeVisible();
  await stabilizePage(page);
  await expectLayoutContract(page);

  await expect(page).toHaveScreenshot('workflow-history.png');

  await page.goto(workflowMemoUrl);
  const activeTab = page.getByRole('tab', { name: 'Memo' });
  await expect(activeTab).toHaveAttribute('aria-selected', 'true');

  const visibility = await activeTab.evaluate((element) => {
    const tabBounds = element.getBoundingClientRect();
    const tabListBounds = element
      .closest('[role="tablist"]')
      ?.getBoundingClientRect();

    return {
      endIsVisible: Boolean(
        tabListBounds && tabBounds.right <= tabListBounds.right + 1,
      ),
      hasTabList: Boolean(tabListBounds),
      startIsVisible: Boolean(
        tabListBounds && tabBounds.left >= tabListBounds.left - 1,
      ),
    };
  });

  expect(
    visibility,
    'the active late-route tab should scroll into view',
  ).toEqual({
    endIsVisible: true,
    hasTabList: true,
    startIsVisible: true,
  });
});

test('create schedule form surface', async ({ page }) => {
  await mockSchedulesApis(page, true, false, {
    customAttributes: {
      AccountRegion: 'Keyword',
      BillingTier: 'Keyword',
    },
  });
  await page.goto(createScheduleUrl);

  await expect(
    page.getByRole('heading', { name: 'Create Schedule' }),
  ).toBeVisible();
  await expect(page.getByTestId('schedule-name-input')).toBeVisible();
  await stabilizePage(page);
  await expectLayoutContract(page);

  await expect(page).toHaveScreenshot('create-schedule.png', {
    fullPage: true,
  });
});

test('standalone Nexus form and responsive summary', async ({ page }) => {
  await mockGlobalApis(page);
  await mockNamespaceWithNexusOperations(page);
  await mockSearchAttributesApi(page);
  await mockClusterApi(page, { serverVersion: '1.31.0' });
  await page.goto(startNexusOperationUrl);

  const endpointInput = page.locator('#endpoint');
  const summaryHeading = page.getByRole('heading', {
    name: 'Operation Summary',
  });
  await expect(endpointInput).toHaveValue('payments');
  await expect(summaryHeading).toBeVisible();
  await stabilizePage(page);
  await expectLayoutContract(page);

  const layout = await page.evaluate(() => {
    const endpoint = document.querySelector<HTMLElement>('#endpoint');
    const summary = Array.from(document.querySelectorAll('h5')).find(
      (heading) => heading.textContent?.trim() === 'Operation Summary',
    )?.parentElement;

    if (!endpoint || !summary) return null;
    const endpointBounds = endpoint.getBoundingClientRect();
    const summaryBounds = summary.getBoundingClientRect();
    const isNarrow = window.innerWidth < 1280;
    const isStacked = summaryBounds.top > endpointBounds.bottom;
    const isSideRail = summaryBounds.left > endpointBounds.right;

    return {
      contractMatches: isNarrow ? isStacked : isSideRail,
      mode: isNarrow ? 'stacked' : 'side-rail',
    };
  });

  expect(layout, 'the operation form and summary should render').not.toBeNull();
  expect(
    layout?.contractMatches,
    `the summary should use its responsive ${layout?.mode ?? 'layout'}`,
  ).toBe(true);

  await expect(page).toHaveScreenshot('start-nexus.png', {
    fullPage: true,
  });
});
