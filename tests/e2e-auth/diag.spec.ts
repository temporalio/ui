import { test } from '@playwright/test';

test('diagnose full login flow', async ({ page }) => {
  page.on('response', (res) => {
    if (res.status() >= 300 && res.status() < 400) {
      console.log(
        `REDIRECT ${res.status()}: ${res.url()} -> ${res.headers()['location']}`,
      );
    }
  });

  await page.goto('/');
  await page.waitForURL(/\/login/, { timeout: 15000 });
  console.log('At login page:', page.url());

  await page.locator('[data-testid="login-button"]').click();
  console.log('Clicked login button, current URL:', page.url());

  await page.waitForTimeout(3000);
  console.log('URL after 3s:', page.url());

  await page.waitForTimeout(3000);
  console.log('URL after 6s:', page.url());

  // try to fill form if we're on the OIDC login page
  const loginInput = page.locator('input[name="login"]');
  if (await loginInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await loginInput.fill('user@example.com');
    await page.locator('input[name="password"]').fill('password');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(3000);
    console.log('URL after form submit:', page.url());
  } else {
    console.log('Login form not visible');
  }
});
