import { expect, type Page, type Response, test } from '@playwright/test';

import {
  AUTH_UI_SERVER_URL,
  E2E_AUTH_TTL,
} from '../../utilities/auth-e2e-stack';

/**
 * End to end coverage for the auth cookie lifetimes, against a real identity
 * provider and a real auth-enabled ui-server (see utilities/auth-e2e-stack.ts).
 *
 * These lifetimes are decided by the Go server and reach the browser only as
 * Set-Cookie headers, so a test that mocks the auth endpoints — as
 * tests/integration/oauth-flow.spec.ts does — cannot observe them. That gap is
 * what this file covers.
 *
 * Regression tests for:
 *   #3210 — the refresh cookie was given the access token's lifetime, so it was
 *           gone at the moment a refresh needed it, and the refresh 401'd.
 *   #3223 — the user* cookies were issued for a flat 60s, so they outlived a
 *           shorter session, leaving a signed-in UI whose API calls all 401'd.
 */

/** maxSessionDuration in server/config/e2e-auth.yaml, in seconds. */
const MAX_SESSION_DURATION = 45;
/** refreshTokenDuration in server/config/e2e-auth.yaml, in seconds. */
const REFRESH_TOKEN_DURATION = 60 * 60 * 24;
/** The lifetime SetUser gives user* cookies when the session has room to spare. */
const DEFAULT_USER_COOKIE_MAX_AGE = 60;

// This suite drives a real login, so it must not inherit the signed-in state
// the rest of the E2E suite shares.
test.use({ storageState: { cookies: [], origins: [] } });

type CookieMaxAges = Record<string, number>;

/** Reads the Max-Age the server sent, rather than a value derived in the browser. */
const parseSetCookieMaxAges = (setCookieHeader: string): CookieMaxAges => {
  const maxAges: CookieMaxAges = {};

  for (const line of setCookieHeader.split('\n')) {
    const name = line.split('=')[0]?.trim();
    const maxAge = /max-age=(-?\d+)/i.exec(line)?.[1];
    if (name && maxAge) maxAges[name] = Number(maxAge);
  }

  return maxAges;
};

/**
 * Signs in through the identity provider and returns the Max-Age of each cookie
 * the ui-server set on the callback.
 */
const signIn = async (page: Page): Promise<CookieMaxAges> => {
  const callback = page.waitForResponse(
    (response: Response) =>
      response.url().includes('/auth/sso/callback') && response.status() < 400,
  );

  await page.goto(`${AUTH_UI_SERVER_URL}/auth/sso`);

  await page.locator('input[name="login"]').fill('e2e@temporal.io');
  await page.locator('input[name="password"]').fill('any-password');
  await page.locator('form[action$="/login"] button[type="submit"]').click();

  // The provider asks for consent the first time a client is authorized.
  const consent = page.locator(
    'form[action$="/confirm"] button[type="submit"]',
  );
  await consent.click({ timeout: 5000 }).catch(() => {
    // Already authorized, so it redirected straight back.
  });

  const response = await callback;
  const setCookie = (await response.headersArray())
    .filter((header) => header.name.toLowerCase() === 'set-cookie')
    .map((header) => header.value)
    .join('\n');

  return parseSetCookieMaxAges(setCookie);
};

/** Asks the ui-server to refresh, from a page on its own origin so the cookies ride along. */
const refresh = (page: Page): Promise<number> =>
  page.evaluate(async () => {
    const response = await fetch('/auth/refresh', { credentials: 'include' });
    return response.status;
  });

test('refresh cookie outlives the access token', async ({ page }) => {
  test.setTimeout(30_000);

  const maxAges = await signIn(page);

  // The bug: this was the access token's lifetime, so the cookie expired at the
  // very moment the refresh it exists for came due.
  expect(maxAges.refresh).toBeGreaterThan(E2E_AUTH_TTL.ACCESS_TOKEN);

  // The mock provider issues opaque refresh tokens, so the configured
  // refreshTokenDuration is the value that should apply.
  expect(maxAges.refresh).toBe(REFRESH_TOKEN_DURATION);
});

test('user cookies do not outlive the session', async ({ page }) => {
  test.setTimeout(30_000);

  const maxAges = await signIn(page);

  // The bug: a flat 60s, which outlives this 45s session and leaves the browser
  // holding credentials the server has already stopped honouring.
  expect(maxAges.user0).toBeLessThanOrEqual(MAX_SESSION_DURATION);
  expect(maxAges.user0).toBeLessThan(DEFAULT_USER_COOKIE_MAX_AGE);
  expect(maxAges.user0).toBeGreaterThan(0);
});

test('token refresh succeeds after the access token has expired', async ({
  page,
}) => {
  test.setTimeout(40_000);

  await signIn(page);

  // Outlive the access token. This is the moment the refresh cookie has to
  // still be in the browser, and only real elapsed time gets us there.
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout((E2E_AUTH_TTL.ACCESS_TOKEN + 2) * 1000);

  // The bug: 401, because the refresh cookie had already expired and so the
  // browser sent nothing.
  expect(await refresh(page)).toBe(200);
});

test('refresh is refused once the session has expired', async ({ page }) => {
  test.setTimeout(90_000);

  await signIn(page);

  // As above, the session boundary is a wall clock deadline on the server.
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout((MAX_SESSION_DURATION + 2) * 1000);

  // Lengthening the cookies must not turn maxSessionDuration into a limit that
  // no longer ends a session.
  expect(await refresh(page)).toBe(401);
});
