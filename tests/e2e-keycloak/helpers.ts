import type { BrowserContext, Page } from '@playwright/test';

const TEST_EMAIL = 'user@example.com';
const TEST_PASSWORD = 'password';

/**
 * Performs a full OIDC login flow against the local Keycloak server.
 *
 * Keycloak's login page uses `#username` and `#password` fields with an
 * `#kc-login` submit button — different from the mock OIDC server's form.
 * No consent page is shown since the temporal realm does not require it.
 */
export async function loginViaKeycloak(page: Page): Promise<void> {
  await page.goto('/');

  await page.waitForURL(/\/login|\/auth\/sso|realms\/temporal/);

  if (page.url().includes('/login')) {
    await page.locator('[data-testid="login-button"]').click();
    await page.waitForURL(/\/auth\/sso|realms\/temporal/);
  }

  if (page.url().includes('/auth/sso') && !page.url().includes('/callback')) {
    await page.waitForURL(/realms\/temporal/);
  }

  // Keycloak login form
  await page.locator('input[name="username"]').fill(TEST_EMAIL);
  await page.locator('input[name="password"]').fill(TEST_PASSWORD);
  await page.locator('input[type="submit"], #kc-login').click();

  // Wait until the callback completes and the app is loaded
  await page.waitForURL(
    (url) =>
      !url.pathname.includes('/auth/sso/callback') &&
      !url.hostname.includes('keycloak') &&
      url.hostname === 'localhost',
  );

  await page.waitForLoadState('load');
}

/**
 * Returns the remaining MaxAge of a named cookie in seconds by comparing its
 * expiry timestamp (from the browser context cookie store) to the current time.
 *
 * Returns `null` if the cookie is not found or has no expiry (session cookie).
 */
export async function getCookieMaxAge(
  context: BrowserContext,
  name: string,
): Promise<number | null> {
  const cookies = await context.cookies();
  const cookie = cookies.find((c) => c.name === name);
  if (!cookie || cookie.expires === -1) return null;
  const nowSeconds = Date.now() / 1000;
  return Math.round(cookie.expires - nowSeconds);
}

/**
 * Parses the MaxAge value (in seconds) from a raw Set-Cookie header string.
 *
 * Returns `null` if the header does not contain a Max-Age directive or if the
 * named cookie is not present.
 */
export function parseSetCookieMaxAge(
  header: string,
  name: string,
): number | null {
  const namePart = header.split(';')[0].trim();
  const [cookieName] = namePart.split('=');
  if (cookieName.trim() !== name) return null;

  const maxAgeMatch = header.match(/[Mm]ax-[Aa]ge=(\d+)/);
  if (!maxAgeMatch) return null;
  return parseInt(maxAgeMatch[1], 10);
}
