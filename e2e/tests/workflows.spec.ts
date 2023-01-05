import { test, expect, Locator } from "@playwright/test";

const address = process.env.E2E_UI_ADDRESS ?? "";

test.beforeEach(async ({ page }) => {
  await page.goto(address);
});

test.describe("Workflows list", () => {
  test("should render decoded Payloads", async ({ page }) => {
    await page.getByText("e2e-workflow-1").first().click();

    var region: Locator
    var toggle: Locator

    region = page.getByTestId('inputs-results')

    toggle = region.getByRole('heading', { name: "Input and Results" });
    await toggle.click();
    await expect(region.getByText('"Plain text input 1"')).toBeVisible();
    await toggle.click();

    region = page.locator('.expanded-cell')

    toggle = page.getByRole('cell', { name: "WorkflowExecutionStarted" });
    await toggle.click();
    await expect(region.getByText('"Plain text input 1"')).toBeVisible();
    await toggle.click();

    toggle = page.getByRole('cell', { name: "MarkerRecorded" });
    await toggle.click();
    await expect(region.getByText('"Side effect for Plain text input 1"')).toBeVisible();
    await toggle.click();

    toggle = page.getByRole('cell', { name: "LocalActivity" }).first();
    await toggle.click();
    await expect(region.getByText('"Received Plain text input 1"')).toBeVisible();
    await toggle.click();

    toggle = page.getByRole('cell', { name: "ActivityTaskScheduled" });
    await toggle.click();
    await expect(region.getByText('"Plain text input 1"')).toBeVisible();
    await toggle.click();

    toggle = page.getByRole('cell', { name: "ActivityTaskCompleted" });
    await toggle.click();
    await expect(region.getByText('"Received Plain text input 1"')).toBeVisible();
    await toggle.click();

    toggle = page.getByRole('cell', { name: "WorkflowExecutionCompleted" });
    await toggle.click();
    await expect(region.getByText('"Received Plain text input 1"')).toBeVisible();
    await toggle.click();
  });
});
