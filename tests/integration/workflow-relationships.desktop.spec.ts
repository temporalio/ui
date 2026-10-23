import { expect, test } from '@playwright/test';

import type { WorkflowExecutionAPIResponse } from '$src/lib/types/workflows';
import { mockWorkflowApis } from '~/test-utilities/mock-apis';
import { mockWorkflow } from '~/test-utilities/mocks/workflow';
import { WORKFLOWS_API } from '~/test-utilities/mocks/workflows';
import { WORKFLOWS_COUNT_API } from '~/test-utilities/mocks/workflows-count';

const rootId = 'relationships-root';
const rootRunId = 'relationships-root-run';
const childAId = 'relationships-child-a';
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

    const grandchildRow = page
      .getByText(grandchildName)
      .locator('xpath=ancestor::button');
    await expect(grandchildRow.locator(':scope > div').first()).toHaveClass(
      /rounded-bl/,
    );

    const ids = [rootId, childAId, grandchildId, childBId];
    const idPositions = await Promise.all(
      ids.map(async (id) => {
        const box = await page.getByRole('link', { name: id }).boundingBox();
        return box?.x;
      }),
    );
    const positions = idPositions.filter(
      (position): position is number => typeof position === 'number',
    );
    expect(positions).toHaveLength(ids.length);
    expect(Math.max(...positions) - Math.min(...positions)).toBeLessThan(1);

    const zoomIn = page.getByRole('button', { name: 'Zoom in' });
    const graphHeader = zoomIn.locator(
      'xpath=ancestor::div[contains(@class, "lg:sticky")]',
    );
    await expect(graphHeader).toHaveCSS('position', 'sticky');

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page.getByText(grandchildName)).toBeVisible();

    await zoomIn.focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(page.getByRole('tooltip', { name: 'Zoom in' })).toBeVisible();
  });
});
