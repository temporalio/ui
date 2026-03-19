import { expect, test } from '@playwright/test';

import { loginViaOIDC, parseSetCookieMaxAge } from './helpers';

test.describe('login cookie properties', () => {
  test('user* cookie MaxAge is capped to maxSessionDuration (15s) on login', async ({
    page,
    context,
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

    await loginViaOIDC(page);
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
        'user cookie MaxAge should be within [12, 15]',
      ).not.toBeNull();
      expect(maxAge).toBeGreaterThanOrEqual(12);
      expect(maxAge).toBeLessThanOrEqual(15);
    }
  });

  test('refresh cookie MaxAge matches OIDC JWT exp (~30s)', async ({
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

    await loginViaOIDC(page);
    await page.waitForTimeout(500);

    const refreshHeader = setCookieHeaders.find((h) =>
      h.startsWith('refresh='),
    );
    expect(
      refreshHeader,
      'refresh cookie should be set on login',
    ).toBeDefined();

    const maxAge = parseSetCookieMaxAge(refreshHeader!, 'refresh');
    expect(
      maxAge,
      'refresh cookie should have a Max-Age directive',
    ).not.toBeNull();
    expect(maxAge).toBeGreaterThanOrEqual(27);
    expect(maxAge).toBeLessThanOrEqual(30);
  });

  test('session_start cookie MaxAge equals maxSessionDuration (15s)', async ({
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

    await loginViaOIDC(page);
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
      'session_start should have a Max-Age directive',
    ).not.toBeNull();
    expect(maxAge).toBeGreaterThanOrEqual(12);
    expect(maxAge).toBeLessThanOrEqual(15);
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

    await loginViaOIDC(page);
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

    await loginViaOIDC(page);
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
});
