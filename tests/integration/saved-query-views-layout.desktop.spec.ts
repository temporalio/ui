import { expect, type Locator, type Page, test } from '@playwright/test';

import {
  mockActivitiesApis,
  mockClusterApi,
  mockNexusOperationsApis,
  mockSchedulesApis,
  mockWorkersPageApis,
  mockWorkflowsApis,
} from '~/test-utilities/mock-apis';

type SavedViewsPage = {
  id: 'activity' | 'nexus' | 'schedule' | 'worker' | 'workflow';
  name: string;
  path: string;
  tableName: string;
  mockApis: (page: Page) => Promise<unknown>;
};

type Box = NonNullable<Awaited<ReturnType<Locator['boundingBox']>>>;

const advancedVisibility = {
  serverVersion: '1.32.0',
  visibilityStore: 'elasticsearch',
  persistenceStore: 'postgres,elasticsearch',
} as const;

const savedViewsPages: SavedViewsPage[] = [
  {
    id: 'workflow',
    name: 'workflows',
    path: '/namespaces/default/workflows',
    tableName: 'Workflows',
    mockApis: async (page) => {
      await mockWorkflowsApis(page);
      await mockClusterApi(page, advancedVisibility);
    },
  },
  {
    id: 'activity',
    name: 'activities',
    path: '/namespaces/default/activities',
    tableName: 'Standalone Activities',
    mockApis: async (page) => {
      await mockActivitiesApis(page);
      await mockClusterApi(page, advancedVisibility);
    },
  },
  {
    id: 'nexus',
    name: 'Nexus operations',
    path: '/namespaces/default/nexus-operations',
    tableName: 'Standalone Nexus Operations Table',
    mockApis: async (page) => {
      await mockNexusOperationsApis(page);
      await mockClusterApi(page, advancedVisibility);
    },
  },
  {
    id: 'schedule',
    name: 'schedules',
    path: '/namespaces/default/schedules',
    tableName: 'Schedules',
    mockApis: async (page) => {
      await mockSchedulesApis(page);
      await mockClusterApi(page, advancedVisibility);
    },
  },
  {
    id: 'worker',
    name: 'workers',
    path: '/namespaces/default/workers',
    tableName: 'Workers',
    mockApis: async (page) => {
      await mockWorkersPageApis(page);
      await mockClusterApi(page, advancedVisibility);
    },
  },
];

const getBox = async (locator: Locator, description: string): Promise<Box> => {
  const box = await locator.boundingBox();
  if (!box) throw new Error(`${description} does not have a layout box`);
  return box;
};

const expectNoPageOverflow = async (page: Page) => {
  const overflow = await page.evaluate(() => ({
    body: document.body.scrollWidth - document.body.clientWidth,
    document:
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  }));

  expect(overflow.body).toBeLessThanOrEqual(1);
  expect(overflow.document).toBeLessThanOrEqual(1);
};

const openSavedViewsPage = async (
  page: Page,
  savedViewsPage: SavedViewsPage,
) => {
  await savedViewsPage.mockApis(page);
  await page.goto(savedViewsPage.path);

  await expect(
    page.getByTestId(`${savedViewsPage.id}-filter-view-stack`),
  ).toBeVisible();
  await expect(
    page.getByTestId(`${savedViewsPage.id}-saved-views`),
  ).toBeVisible();
  await expect(
    page.getByTestId(`${savedViewsPage.id}-saved-views-rail`),
  ).toBeVisible();
  await expect(
    page.getByRole('table', { name: savedViewsPage.tableName }),
  ).toBeVisible();

  await page.evaluate(() => document.fonts.ready);
};

const expectHorizontalSavedViewsLayout = async (
  page: Page,
  savedViewsPage: SavedViewsPage,
) => {
  const stack = page.getByTestId(`${savedViewsPage.id}-filter-view-stack`);
  const savedViews = page.getByTestId(`${savedViewsPage.id}-saved-views`);
  const filterBar = savedViews.locator('xpath=preceding-sibling::*[1]');
  const table = page.getByRole('table', { name: savedViewsPage.tableName });
  const tableSurface = table.locator('..');

  const [stackBox, filterBox, savedViewsBox, tableSurfaceBox] =
    await Promise.all([
      getBox(stack, `${savedViewsPage.name} filter/view stack`),
      getBox(filterBar, `${savedViewsPage.name} filter bar`),
      getBox(savedViews, `${savedViewsPage.name} saved views`),
      getBox(tableSurface, `${savedViewsPage.name} table surface`),
    ]);

  // The two controls form one continuous surface rather than separate cards.
  expect(
    Math.abs(filterBox.y + filterBox.height - savedViewsBox.y),
  ).toBeLessThanOrEqual(1);

  // Saved Views occupies the same content column as the table, never a sidebar.
  expect(savedViewsBox.y + savedViewsBox.height).toBeLessThan(
    tableSurfaceBox.y,
  );
  expect(Math.abs(savedViewsBox.x - tableSurfaceBox.x)).toBeLessThanOrEqual(1);
  expect(
    Math.abs(savedViewsBox.width - tableSurfaceBox.width),
  ).toBeLessThanOrEqual(1);
  expect(Math.abs(savedViewsBox.x - stackBox.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(savedViewsBox.width - stackBox.width)).toBeLessThanOrEqual(1);
};

const expectWorkflowControlAlignment = async (page: Page) => {
  const [addFilterBox, allWorkflowsBox] = await Promise.all([
    getBox(page.getByTestId('add-filter-button'), 'Add Filter button'),
    getBox(page.getByTestId('all'), 'All Workflows button'),
  ]);

  expect(Math.abs(addFilterBox.x - allWorkflowsBox.x)).toBeLessThanOrEqual(1);
};

test.describe('Saved Query Views horizontal layout', () => {
  for (const savedViewsPage of savedViewsPages) {
    test(`${savedViewsPage.name} integrates Saved Views below its filter bar`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await openSavedViewsPage(page, savedViewsPage);

      await expect(
        page.getByTestId(`${savedViewsPage.id}-saved-views`),
      ).toBeVisible();
      await expectHorizontalSavedViewsLayout(page, savedViewsPage);
      await expectNoPageOverflow(page);
    });
  }

  for (const width of [375, 1440]) {
    test(`workflows keeps the filter, Saved Views, and table aligned at ${width}px`, async ({
      page,
    }) => {
      const workflowsPage = savedViewsPages[0];

      await page.setViewportSize({ width, height: 900 });
      await openSavedViewsPage(page, workflowsPage);

      await expect(page.getByTestId('workflow-saved-views')).toBeVisible();
      await expectHorizontalSavedViewsLayout(page, workflowsPage);
      await expectWorkflowControlAlignment(page);
      await expectNoPageOverflow(page);
    });
  }

  test('overflow controls scroll and reveal a focused saved workflow view', async ({
    page,
  }) => {
    const savedQueries = Array.from({ length: 24 }, (_, index) => ({
      id: `saved-view-${index + 1}`,
      name: `Operations View ${String(index + 1).padStart(2, '0')}`,
      query: `\`WorkflowId\`="seed-${index + 1}"`,
      type: 'user',
    }));

    await page.addInitScript((queries) => {
      localStorage.setItem(
        'saved-workflow-queries',
        JSON.stringify({ default: queries }),
      );
    }, savedQueries);
    await page.setViewportSize({ width: 375, height: 900 });
    await openSavedViewsPage(page, savedViewsPages[0]);

    const savedViews = page.getByTestId('workflow-saved-views');
    await expect(
      savedViews.getByText('Saved Views', { exact: true }),
    ).toHaveCount(0);

    const systemViews = [
      { id: 'all', name: 'All Workflows' },
      { id: 'running', name: 'Running' },
      { id: 'child-workflows', name: 'Parent Workflows' },
      { id: 'today', name: 'Today' },
      { id: 'last-hour', name: 'Last Hour' },
    ];

    for (const { id, name } of systemViews) {
      const systemView = savedViews.getByTestId(id);
      await expect(systemView).toHaveAccessibleName(name);
      await expect(systemView).toHaveText('');
    }

    const systemViewSizing = await savedViews
      .locator('[data-track-name="system-query-button"]')
      .evaluateAll((buttons) =>
        buttons.map((button) => {
          const styles = getComputedStyle(button);
          return {
            height: button.getBoundingClientRect().height,
            minWidth: Number.parseFloat(styles.minWidth),
            paddingLeft: Number.parseFloat(styles.paddingLeft),
            paddingRight: Number.parseFloat(styles.paddingRight),
          };
        }),
      );

    expect(new Set(systemViewSizing.map(({ minWidth }) => minWidth)).size).toBe(
      1,
    );
    expect(
      new Set(
        systemViewSizing.map(
          ({ paddingLeft, paddingRight }) => `${paddingLeft}:${paddingRight}`,
        ),
      ).size,
    ).toBe(1);
    for (const {
      height,
      minWidth,
      paddingLeft,
      paddingRight,
    } of systemViewSizing) {
      expect(minWidth).toBeGreaterThanOrEqual(height - 1);
      expect(paddingLeft).toBeGreaterThan(0);
      expect(paddingLeft).toBe(paddingRight);
    }

    const allWorkflows = savedViews.getByTestId('all');
    await allWorkflows.hover();
    const allWorkflowsTooltip = page
      .getByRole('tooltip')
      .filter({ hasText: 'All Workflows' });
    await expect(allWorkflowsTooltip).toBeVisible();

    const [allWorkflowsBox, tooltipBox] = await Promise.all([
      getBox(allWorkflows, 'All Workflows button'),
      getBox(allWorkflowsTooltip, 'All Workflows tooltip'),
    ]);
    expect(tooltipBox.y).toBeGreaterThanOrEqual(
      allWorkflowsBox.y + allWorkflowsBox.height,
    );

    await allWorkflows.click();
    await expect(allWorkflows).toBeFocused();
    await page.getByTestId('add-filter-button').hover();
    await expect(allWorkflowsTooltip).toBeHidden();

    const rail = page.getByTestId('workflow-saved-views-rail');
    const viewport = page.getByTestId('workflow-saved-views-rail-viewport');
    const next = page.getByTestId('workflow-saved-views-rail-next');
    const previous = page.getByTestId('workflow-saved-views-rail-previous');

    await expect(rail).toHaveAttribute('data-overflow', 'true');
    await expect(next).toHaveAttribute('aria-disabled', 'false');
    await next.click();
    await expect
      .poll(() => viewport.evaluate((element) => element.scrollLeft))
      .toBeGreaterThan(0);
    await expect(previous).toHaveAttribute('aria-disabled', 'false');

    const lastSavedView = page.getByTestId('operations-view-24');
    await lastSavedView.focus();
    await expect
      .poll(async () => {
        const viewportBox = await getBox(viewport, 'saved views rail viewport');
        const viewBox = await getBox(lastSavedView, 'last saved view');
        return (
          viewBox.x >= viewportBox.x - 1 &&
          viewBox.x + viewBox.width <= viewportBox.x + viewportBox.width + 1
        );
      })
      .toBe(true);

    await lastSavedView.click();
    await expect
      .poll(() => new URL(page.url()).searchParams.get('query'))
      .toBe('`WorkflowId`="seed-24"');
    await expect(page.getByTestId('edit-view-button')).toBeVisible();
    await expectNoPageOverflow(page);
  });
});
