import { test, expect, Page } from "@playwright/test";

const address = process.env.E2E_UI_ADDRESS ?? "";

test.beforeEach(async ({ page }) => {
  await page.goto(address);
});

test.describe("Workflows list", () => {
  test("should render decoded Payloads", async ({ page }) => {
    await page.locator("text=codecserver_workflowID").first().click();
    await page.locator("text=Input and Results").first().click();

    await expect(page.locator("text=Plain text input").first()).toBeVisible();
  });
});
