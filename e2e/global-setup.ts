// global-setup.ts
import { chromium, FullConfig } from "@playwright/test";

const address = process.env.E2E_UI_ADDRESS ?? "";
const username = process.env.E2E_USERNAME ?? "";
const password = process.env.E2E_PASSWORD ?? "";

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ ignoreHTTPSErrors: true });

  await page.goto(address);
  await page.locator("[data-cy=login-button]").click();
  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="username"]').press("Enter");
  await page.locator('input[name="password"]').fill(password);
  await page.locator('input[name="password"]').press("Enter");

  // Save signed-in state to 'storageState.json'
  await page.waitForNavigation();
  await page.context().storageState({ path: "storageState.json" });
  await browser.close();
}

export default globalSetup;
