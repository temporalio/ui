import { expect, type Page, test } from '@playwright/test';

import type { WorkflowExecutionAPIResponse } from '$src/lib/types/workflows';
import { mockWorkflowApis } from '~/test-utilities/mock-apis';
import { mockWorkflow } from '~/test-utilities/mocks/workflow';
import { WORKFLOWS_API } from '~/test-utilities/mocks/workflows';
import { WORKFLOWS_COUNT_API } from '~/test-utilities/mocks/workflows-count';

const rootId = 'relationships-root';
const rootRunId = 'relationships-root-run';
const childAId =
  'relationshipschildawithanunbreakableworkflowid01234567890123456789';
const childARunId = 'relationships-child-a-run';
const grandchildId = 'relationships-grandchild-a1';
const grandchildRunId = 'relationships-grandchild-a1-run';
const childBId = 'relationships-child-b';
const childBRunId = 'relationships-child-b-run';
const childAName =
  'Child A with a workflow type name that wraps without shifting columns';
const grandchildName = 'Grandchild A1';
const childBName = 'Child B';

const relationshipWorkflow = ({
  workflowId,
  runId,
  name,
  parent,
}: {
  workflowId: string;
  runId: string;
  name: string;
  parent: { workflowId: string; runId: string } | null;
}) => ({
  ...mockWorkflow.workflowExecutionInfo,
  execution: { workflowId, runId },
  type: { name },
  startTime: '2022-04-28T05:50:48.264756929Z',
  closeTime: '2022-04-28T08:50:48.264756929Z',
  parentExecution: parent,
  rootExecution: { workflowId: rootId, runId: rootRunId },
});

const rootWorkflow = {
  ...mockWorkflow,
  workflowExecutionInfo: relationshipWorkflow({
    workflowId: rootId,
    runId: rootRunId,
    name: 'Root workflow',
    parent: null,
  }),
} satisfies WorkflowExecutionAPIResponse;

const relationshipWorkflows = [
  relationshipWorkflow({
    workflowId: childAId,
    runId: childARunId,
    name: childAName,
    parent: { workflowId: rootId, runId: rootRunId },
  }),
  relationshipWorkflow({
    workflowId: grandchildId,
    runId: grandchildRunId,
    name: grandchildName,
    parent: { workflowId: childAId, runId: childARunId },
  }),
  relationshipWorkflow({
    workflowId: childBId,
    runId: childBRunId,
    name: childBName,
    parent: { workflowId: rootId, runId: rootRunId },
  }),
];

const relationshipsUrl = `/namespaces/default/workflows/${rootId}/${rootRunId}/relationships`;

const expectAlignedColumns = async (page: Page) => {
  const ids = [rootId, childAId, grandchildId, childBId];
  const idPositions = await Promise.all(
    ids.map(async (id) => {
      const box = await page.getByRole('link', { name: id }).boundingBox();
      return box?.x;
    }),
  );
  const timestampPositions = await page
    .locator('.relationship-timestamps-column')
    .evaluateAll((elements) => {
      return elements.map((element) => element.getBoundingClientRect().x);
    });
  const positions = idPositions.filter(
    (position): position is number => typeof position === 'number',
  );

  expect(positions).toHaveLength(ids.length);
  expect(Math.max(...positions) - Math.min(...positions)).toBeLessThan(1);
  expect(timestampPositions).toHaveLength(ids.length);
  expect(
    Math.max(...timestampPositions) - Math.min(...timestampPositions),
  ).toBeLessThan(1);
};

test.describe('Relationships nested tree', () => {
  test.beforeEach(async ({ page }) => {
    await mockWorkflowApis(page, rootWorkflow);
    await page.route(WORKFLOWS_COUNT_API, (route) => {
      return route.fulfill({ json: { count: '4' } });
    });
    await page.route(WORKFLOWS_API, (route) => {
      const url = new URL(route.request().url());
      if (url.pathname.endsWith('/workflows')) {
        return route.fulfill({
          json: { executions: relationshipWorkflows, nextPageToken: null },
        });
      }
      return route.fallback();
    });
    await page.goto(relationshipsUrl);
  });

  test('keeps nested rows aligned and their tree affordances visible', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1100, height: 900 });
    await expect(page.locator('body')).toHaveAttribute('data-theme', 'light');
    await expect(page.getByText(childBName)).toBeVisible();

    const expandAll = page.getByRole('switch', { name: 'Expand All' });
    await expect(expandAll).not.toBeChecked();
    await expect(page.getByText(grandchildName)).toBeHidden();
    await expandAll.focus();
    await page.keyboard.press('Space');
    await expect(expandAll).toBeChecked();
    await expect(page.getByText(grandchildName)).toBeVisible();
    await page.keyboard.press('Space');
    await expect(expandAll).not.toBeChecked();
    await expect(page.getByText(grandchildName)).toBeHidden();

    const childARow = page
      .getByText(childAName)
      .locator('xpath=ancestor::button');
    await childARow.click();
    await expect(childARow).toHaveClass(/bg-interactive-primary/);
    await expect(page.getByText(grandchildName)).toBeVisible();

    const childAContainer = childARow.locator('..');
    await expect(childAContainer.locator(':scope > div').last()).toBeVisible();
    await expect(childARow.locator(':scope > div').first()).not.toHaveClass(
      /border-l|rounded-bl/,
    );

    const grandchildRow = page
      .getByText(grandchildName)
      .locator('xpath=ancestor::button');
    await expect(grandchildRow.locator(':scope > div').first()).toHaveClass(
      /rounded-bl/,
    );

    const childBRow = page
      .getByText(childBName)
      .locator('xpath=ancestor::button');
    await expect(childBRow.locator(':scope > div').first()).toHaveClass(
      /border-l/,
    );
    await expect(childBRow.locator(':scope > div').first()).toHaveClass(
      /rounded-bl/,
    );

    const [childIdBox, childCountBox] = await Promise.all([
      childARow.getByRole('link', { name: childAId }).boundingBox(),
      childARow.locator('.relationship-id-column + div').boundingBox(),
    ]);
    expect(childIdBox).not.toBeNull();
    expect(childCountBox).not.toBeNull();
    expect(childIdBox!.x + childIdBox!.width).toBeLessThanOrEqual(
      childCountBox!.x,
    );
    await expectAlignedColumns(page);

    const zoomIn = page.getByRole('button', { name: 'Zoom in' });
    const graphHeader = zoomIn.locator(
      'xpath=ancestor::div[contains(@class, "lg:sticky")]',
    );
    await expect(graphHeader).toHaveCSS('position', 'sticky');

    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.getByText(grandchildName)).toBeVisible();
    await expectAlignedColumns(page);

    await zoomIn.focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    const tooltip = page.getByRole('tooltip', { name: 'Zoom in' });
    await expect(tooltip).toBeVisible();
    const [tooltipBox, zoomInBox] = await Promise.all([
      tooltip.boundingBox(),
      zoomIn.boundingBox(),
    ]);
    expect(tooltipBox).not.toBeNull();
    expect(zoomInBox).not.toBeNull();
    expect(tooltipBox!.y + tooltipBox!.height).toBeLessThanOrEqual(
      zoomInBox!.y,
    );
  });

  test.describe('dark mode', () => {
    test.use({ colorScheme: 'dark' });

    test('uses dark relationship tree tokens', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await expect(page.locator('body')).toHaveAttribute('data-theme', 'dark');
      await expect(
        page.locator('html:has(body[data-theme="dark"])'),
      ).toHaveCount(1);

      const childARow = page
        .getByText(childAName)
        .locator('xpath=ancestor::button');
      await childARow.click();
      const activeTreeLine = childARow.locator(':scope > div').first();
      const darkBorderToken = await activeTreeLine.evaluate((line) =>
        getComputedStyle(line)
          .getPropertyValue('--color-border-secondary')
          .trim(),
      );
      await expectAlignedColumns(page);

      await page.emulateMedia({ colorScheme: 'light' });
      await page.reload();
      await expect(page.locator('body')).toHaveAttribute('data-theme', 'light');
      const lightChildARow = page
        .getByText(childAName)
        .locator('xpath=ancestor::button');
      await lightChildARow.click();
      const lightBorderToken = await lightChildARow
        .locator(':scope > div')
        .first()
        .evaluate((line) =>
          getComputedStyle(line)
            .getPropertyValue('--color-border-secondary')
            .trim(),
        );
      expect(darkBorderToken).not.toBe(lightBorderToken);
    });
  });
});
