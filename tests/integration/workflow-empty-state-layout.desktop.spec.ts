import { expect, test } from '@playwright/test';

import { mockWorkflowsApis, WORKFLOWS_API } from '~/test-utilities/mock-apis';

test.beforeEach(async ({ page }) => {
  await mockWorkflowsApis(page);
  await page.route(WORKFLOWS_API, (route) =>
    route.fulfill({
      json: { executions: [], nextPageToken: null },
    }),
  );
});

test('workflow empty-state artwork fills its desktop rail', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/namespaces/default/workflows');

  await expect(
    page.getByRole('heading', {
      name: 'No Workflows running in this Namespace',
    }),
  ).toBeVisible();

  const artwork = page.getByTestId('table-empty-state-artwork');
  await expect(artwork).toBeVisible();

  const layout = await artwork.evaluate((container) => {
    const image = container.querySelector('img');
    if (!image) return null;

    const containerBounds = container.getBoundingClientRect();
    const imageBounds = image.getBoundingClientRect();

    return {
      bottomGap: Math.abs(containerBounds.bottom - imageBounds.bottom),
      containerHeight: containerBounds.height,
      heightGap: Math.abs(containerBounds.height - imageBounds.height),
      leftGap: Math.abs(containerBounds.left - imageBounds.left),
      objectFit: getComputedStyle(image).objectFit,
      objectPosition: getComputedStyle(image).objectPosition,
      rightGap: Math.abs(containerBounds.right - imageBounds.right),
      topGap: Math.abs(containerBounds.top - imageBounds.top),
      widthGap: Math.abs(containerBounds.width - imageBounds.width),
    };
  });

  expect(layout, 'the artwork rail should contain its image').not.toBeNull();
  expect(layout?.containerHeight).toBeGreaterThan(300);
  expect(layout?.objectFit).toBe('cover');
  expect(layout?.objectPosition).toBe('74% 50%');
  expect(layout?.topGap).toBeLessThanOrEqual(1);
  expect(layout?.rightGap).toBeLessThanOrEqual(1);
  expect(layout?.bottomGap).toBeLessThanOrEqual(1);
  expect(layout?.leftGap).toBeLessThanOrEqual(1);
  expect(layout?.heightGap).toBeLessThanOrEqual(1);
  expect(layout?.widthGap).toBeLessThanOrEqual(1);
});
