import { expect, type Page, test } from '@playwright/test';

import {
  mockSchedulesApis,
  mockWorkflowsApis,
} from '~/test-utilities/mock-apis';
import { mockDate } from '~/test-utilities/mock-date';

const workflowsUrl = '/namespaces/default/workflows';
const createScheduleUrl = '/namespaces/default/schedules/create';

const installDeterministicBrowserState = async (page: Page) => {
  await page.addInitScript(mockDate);
  await page.addInitScript(() => {
    window.Date.now = () => Date.parse('2012-09-19T18:00:00.000Z');
    window.localStorage.setItem('dark mode', 'false');
    window.localStorage.setItem('locale', 'en');
    window.localStorage.setItem('timeFormat', JSON.stringify('UTC'));
    window.localStorage.setItem('timeFormatType', JSON.stringify('absolute'));
    window.localStorage.setItem('visual version', 'v2');
  });
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

const expectNoHorizontalOverflow = async (page: Page) => {
  const overflow = await page.evaluate(() => {
    const contentWrapper =
      document.querySelector<HTMLElement>('#content-wrapper');

    return {
      document:
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
      body: document.body.scrollWidth - document.body.clientWidth,
      content: contentWrapper
        ? contentWrapper.scrollWidth - contentWrapper.clientWidth
        : null,
    };
  });

  expect(overflow.content, 'the content viewport should render').not.toBeNull();
  expect(
    overflow.document,
    'the document should not overflow',
  ).toBeLessThanOrEqual(1);
  expect(overflow.body, 'the body should not overflow').toBeLessThanOrEqual(1);
  expect(
    overflow.content,
    'the desktop content viewport should not overflow',
  ).toBeLessThanOrEqual(1);
};

test.beforeEach(async ({ page }) => {
  await installDeterministicBrowserState(page);
});

test('app shell, workflow table, and user menu stay within the viewport', async ({
  page,
}) => {
  await mockWorkflowsApis(page);
  await page.goto(workflowsUrl);

  const topNavigation = page.getByTestId('top-nav');
  const sideNavigation = page.getByTestId('navigation-header');
  const workflowTable = page.getByRole('table', { name: 'Workflows' });

  await expect(topNavigation).toBeVisible();
  await expect(sideNavigation).toBeVisible();
  await expect(workflowTable).toBeVisible();
  await expect(
    page.getByTestId('workflows-summary-configurable-table-row'),
  ).toHaveCount(3);
  await stabilizePage(page);
  await expectNoHorizontalOverflow(page);

  const firstRowHeight = await workflowTable
    .locator('tbody tr')
    .first()
    .evaluate((row) => row.getBoundingClientRect().height);
  expect(
    firstRowHeight,
    'workflow rows should retain dense sizing',
  ).toBeGreaterThanOrEqual(28);
  expect(
    firstRowHeight,
    'workflow rows should retain dense sizing',
  ).toBeLessThanOrEqual(44);

  const userMenuTrigger = page.getByTestId('user-menu-trigger');
  await userMenuTrigger.click();
  await expect(userMenuTrigger).toHaveAttribute('aria-expanded', 'true');

  const userMenu = page.locator('#user-menu');
  await expect(userMenu).toBeVisible();

  const menuBounds = await userMenu.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    return {
      bottom: bounds.bottom,
      height: bounds.height,
      left: bounds.left,
      right: bounds.right,
      top: bounds.top,
      width: bounds.width,
      viewportHeight: window.innerHeight,
      viewportWidth: window.innerWidth,
    };
  });

  expect(
    menuBounds.left,
    'the menu should not escape the left edge',
  ).toBeGreaterThanOrEqual(-1);
  expect(
    menuBounds.top,
    'the menu should not escape the top edge',
  ).toBeGreaterThanOrEqual(-1);
  expect(
    menuBounds.right,
    'the menu should not escape the right edge',
  ).toBeLessThanOrEqual(menuBounds.viewportWidth + 1);
  expect(
    menuBounds.bottom,
    'the menu should not escape the bottom edge',
  ).toBeLessThanOrEqual(menuBounds.viewportHeight + 1);
  expect(menuBounds.width).toBeLessThanOrEqual(menuBounds.viewportWidth);
  expect(menuBounds.height).toBeLessThanOrEqual(menuBounds.viewportHeight);
});

test('create schedule form keeps its desktop rail without page overflow', async ({
  page,
}) => {
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
  const scheduleName = page.getByTestId('schedule-name-input');
  const summaryHeading = page.getByRole('heading', {
    name: 'Schedule Summary',
  });
  await expect(scheduleName).toBeVisible();
  await expect(summaryHeading).toBeVisible();
  await stabilizePage(page);
  await expectNoHorizontalOverflow(page);

  const layout = await page.evaluate(() => {
    const form = document.querySelector<HTMLFormElement>('form');
    const nameInput = document.querySelector<HTMLElement>(
      '[data-testid="schedule-name-input"]',
    );
    const summaryHeading = Array.from(
      document.querySelectorAll<HTMLHeadingElement>('h2'),
    ).find((heading) => heading.textContent?.trim() === 'Schedule Summary');
    const summary = summaryHeading?.parentElement;
    const content = document.querySelector<HTMLElement>('#content');

    if (!form || !nameInput || !summary || !content) return null;

    const formBounds = form.getBoundingClientRect();
    const nameBounds = nameInput.getBoundingClientRect();
    const summaryBounds = summary.getBoundingClientRect();
    const contentBounds = content.getBoundingClientRect();

    return {
      contentLeft: contentBounds.left,
      contentRight: contentBounds.right,
      formLeft: formBounds.left,
      formRight: formBounds.right,
      nameRight: nameBounds.right,
      summaryLeft: summaryBounds.left,
      summaryRight: summaryBounds.right,
      summaryTop: summaryBounds.top,
      viewportWidth: window.innerWidth,
    };
  });

  expect(
    layout,
    'the schedule form and summary rail should render',
  ).not.toBeNull();
  const renderedLayout = layout!;

  expect(renderedLayout.formLeft).toBeGreaterThanOrEqual(
    renderedLayout.contentLeft - 1,
  );
  expect(renderedLayout.formRight).toBeLessThanOrEqual(
    renderedLayout.contentRight + 1,
  );
  expect(
    renderedLayout.summaryLeft,
    'the summary should remain in the desktop side rail',
  ).toBeGreaterThan(renderedLayout.nameRight);
  expect(renderedLayout.summaryRight).toBeLessThanOrEqual(
    renderedLayout.viewportWidth + 1,
  );
  expect(renderedLayout.summaryTop).toBeGreaterThanOrEqual(0);
});
