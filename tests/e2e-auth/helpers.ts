import type { BrowserContext, Page } from '@playwright/test';

const TEST_EMAIL = 'user@example.com';
const TEST_PASSWORD = 'password';

/**
 * Performs a full OIDC login flow against the local OIDC server.
 *
 * Navigates to the UI, follows the OIDC redirect, fills the login form,
 * and waits until the callback redirect completes and the UI is loaded.
 */
export async function loginViaOIDC(page: Page): Promise<void> {
  await page.goto('/');

  await page.waitForURL(/\/login|\/auth\/sso|\/interaction\//);

  if (page.url().includes('/login')) {
    await page.locator('[data-testid="login-button"]').click();
    await page.waitForURL(/\/auth\/sso|\/interaction\//);
  }

  if (page.url().includes('/auth/sso') && !page.url().includes('/callback')) {
    await page.waitForURL(/\/interaction\//);
  }

  await page.locator('input[name="login"]').fill(TEST_EMAIL);
  await page.locator('input[name="password"]').fill(TEST_PASSWORD);
  await page.locator('button[type="submit"]').click();

  // Handle optional consent page (second /interaction/ step)
  await page.waitForURL(
    (url) =>
      url.pathname.includes('/interaction/') ||
      url.pathname.includes('/auth/sso/callback') ||
      url.hostname === 'localhost',
  );
  if (page.url().includes('/interaction/')) {
    await page.locator('button[type="submit"]').click();
  }

  // Wait until fully past callback and app is loaded
  await page.waitForURL(
    (url) =>
      !url.pathname.includes('/auth/sso/callback') &&
      !url.pathname.includes('/interaction/') &&
      url.hostname === 'localhost',
  );

  await page.waitForLoadState('load');
}

/**
 * Returns the MaxAge of a named cookie in seconds by inspecting the browser
 * context's current cookie store.
 *
 * Note: Playwright's `context.cookies()` does not expose MaxAge directly.
 * This helper derives a lower-bound estimate by comparing the cookie's
 * `expires` timestamp (Unix epoch seconds) to the current wall-clock time.
 * The returned value will be slightly less than the server-set MaxAge due to
 * network round-trip and processing time — use a ±3s tolerance in assertions.
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
 * Returns `null` if the header string does not contain a Max-Age directive
 * or if the named cookie is not present in the header.
 *
 * @param header   - The raw value of a Set-Cookie response header.
 * @param name     - The cookie name to look for (case-sensitive).
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
