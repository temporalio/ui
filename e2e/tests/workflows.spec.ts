import { test, expect, Page } from "@playwright/test";

const address = process.env.E2E_UI_ADDRESS ?? "";

test.beforeEach(async ({ page }) => {
  await page.goto(address);
});

test.describe("Workflows list", () => {
  test("should render Workflow Executions page", async ({ page }) => {
    await expect(page.locator("text=Recent Workflows")).toBeVisible();
  });

  test("should render Workflow Execution details", async ({ page }) => {
    await page.locator('a.workflow-summary-row').first().click();

    await expect(page.locator("text=Workflow Type").first()).toBeVisible();
    await expect(page.locator("text=Task Queue").first()).toBeVisible();
  });

  test("should render Workflow Execution Events", async ({ page }) => {
    await page.locator("a.workflow-summary-row").first().click();

    await expect(page.locator('[data-cy="event-summary-row"]').first()).toBeVisible();
  });
});
