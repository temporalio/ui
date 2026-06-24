import { expect, test } from '@playwright/test';

import { loginViaKeycloak, parseSetCookieMaxAge } from './helpers';

// Keycloak realm-temporal.json settings:
//   accessTokenLifespan:  5s
//   ssoSessionMaxLifespan: 30s  → refresh token exp
//   maxSessionDuration:   25s  → UI session boundary

test.describe('Keycloak login cookie properties', () => {
  test('refresh cookie MaxAge is derived from Keycloak JWT refresh token exp (~30s)', async ({
    page,
  }) => {
    const setCookieHeaders: string[] = [];

    page.on('response', async (response) => {
      const url = response.url();
      if (
        url.includes('/auth/sso/callback') ||
        url.includes('/auth/sso_callback')
      ) {
        const headers = await response.headersArray();
        for (const h of headers) {
          if (h.name.toLowerCase() === 'set-cookie') {
            setCookieHeaders.push(h.value);
          }
        }
      }
    });

    await loginViaKeycloak(page);
    await page.waitForTimeout(500);

    const refreshHeader = setCookieHeaders.find((h) =>
      h.startsWith('refresh='),
    );
    expect(
      refreshHeader,
      'refresh cookie should be set on login',
    ).toBeDefined();

    // Keycloak's JWT refresh token exp = ssoSessionMaxLifespan (30s).
    // No refreshTokenDuration is configured, so this purely tests the jwtExp() path.
    const maxAge = parseSetCookieMaxAge(refreshHeader!, 'refresh');
    expect(
      maxAge,
      'refresh cookie should carry a Max-Age directive',
    ).not.toBeNull();
    expect(
      maxAge,
      'refresh MaxAge should reflect JWT exp (~30s), not access token lifetime (5s)',
    ).toBeGreaterThanOrEqual(27);
    expect(maxAge).toBeLessThanOrEqual(30);
  });

  test('user* cookie MaxAge is capped to maxSessionDuration (25s) on login', async ({
    page,
  }) => {
    const setCookieHeaders: string[] = [];

    page.on('response', async (response) => {
      const url = response.url();
      if (
        url.includes('/auth/sso/callback') ||
        url.includes('/auth/sso_callback')
      ) {
        const headers = await response.headersArray();
        for (const h of headers) {
          if (h.name.toLowerCase() === 'set-cookie') {
            setCookieHeaders.push(h.value);
          }
        }
      }
    });

    await loginViaKeycloak(page);
    await page.waitForTimeout(500);

    const userCookieHeaders = setCookieHeaders.filter((h) =>
      h.match(/^user\d+=/),
    );
    expect(
      userCookieHeaders.length,
      'at least one user* cookie should be set',
    ).toBeGreaterThan(0);

    for (const header of userCookieHeaders) {
      const maxAge = parseSetCookieMaxAge(header, header.split('=')[0]);
      expect(
        maxAge,
        'user* cookie should carry a Max-Age directive',
      ).not.toBeNull();
      expect(
        maxAge,
        'user* MaxAge must be capped to maxSessionDuration (25s)',
      ).toBeGreaterThanOrEqual(22);
      expect(maxAge).toBeLessThanOrEqual(25);
    }
  });

  test('session_start cookie MaxAge equals maxSessionDuration (25s)', async ({
    page,
  }) => {
    const setCookieHeaders: string[] = [];

    page.on('response', async (response) => {
      const url = response.url();
      if (
        url.includes('/auth/sso/callback') ||
        url.includes('/auth/sso_callback')
      ) {
        const headers = await response.headersArray();
        for (const h of headers) {
          if (h.name.toLowerCase() === 'set-cookie') {
            setCookieHeaders.push(h.value);
          }
        }
      }
    });

    await loginViaKeycloak(page);
    await page.waitForTimeout(500);

    const sessionHeader = setCookieHeaders.find((h) =>
      h.startsWith('session_start='),
    );
    expect(
      sessionHeader,
      'session_start cookie should be set on login',
    ).toBeDefined();

    const maxAge = parseSetCookieMaxAge(sessionHeader!, 'session_start');
    expect(
      maxAge,
      'session_start should carry a Max-Age directive',
    ).not.toBeNull();
    expect(maxAge).toBeGreaterThanOrEqual(22);
    expect(maxAge).toBeLessThanOrEqual(25);
  });

  test('refresh cookie is HttpOnly', async ({ page }) => {
    const setCookieHeaders: string[] = [];

    page.on('response', async (response) => {
      const url = response.url();
      if (
        url.includes('/auth/sso/callback') ||
        url.includes('/auth/sso_callback')
      ) {
        const headers = await response.headersArray();
        for (const h of headers) {
          if (h.name.toLowerCase() === 'set-cookie') {
            setCookieHeaders.push(h.value);
          }
        }
      }
    });

    await loginViaKeycloak(page);
    await page.waitForTimeout(500);

    const refreshHeader = setCookieHeaders.find((h) =>
      h.startsWith('refresh='),
    );
    expect(refreshHeader, 'refresh cookie should be set').toBeDefined();
    expect(
      refreshHeader!.toLowerCase(),
      'refresh cookie must be HttpOnly',
    ).toContain('httponly');
  });

  test('user* cookies are not HttpOnly', async ({ page }) => {
    const setCookieHeaders: string[] = [];

    page.on('response', async (response) => {
      const url = response.url();
      if (
        url.includes('/auth/sso/callback') ||
        url.includes('/auth/sso_callback')
      ) {
        const headers = await response.headersArray();
        for (const h of headers) {
          if (h.name.toLowerCase() === 'set-cookie') {
            setCookieHeaders.push(h.value);
          }
        }
      }
    });

    await loginViaKeycloak(page);
    await page.waitForTimeout(500);

    const userCookieHeaders = setCookieHeaders.filter((h) =>
      h.match(/^user\d+=/),
    );
    expect(userCookieHeaders.length).toBeGreaterThan(0);

    for (const header of userCookieHeaders) {
      expect(
        header.toLowerCase(),
        'user* cookie must NOT be HttpOnly (UI reads it via JS)',
      ).not.toContain('httponly');
    }
  });
});
