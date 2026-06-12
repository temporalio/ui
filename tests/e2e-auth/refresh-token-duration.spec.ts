import { expect, test } from '@playwright/test';

import { loginViaOIDC, parseSetCookieMaxAge } from './helpers';

test.describe('refresh cookie MaxAge priority: JWT exp over refreshTokenDuration config', () => {
  test('refresh cookie MaxAge reflects JWT exp (~30s) not the refreshTokenDuration config value', async ({
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
      'refresh cookie should be set after login',
    ).toBeDefined();

    const maxAge = parseSetCookieMaxAge(refreshHeader!, 'refresh');
    expect(maxAge, 'refresh cookie should carry a Max-Age').not.toBeNull();

    expect(
      maxAge!,
      'MaxAge should be ~30s (from OIDC JWT exp), within ±3s tolerance',
    ).toBeGreaterThanOrEqual(27);
    expect(
      maxAge!,
      'MaxAge should not exceed the 30s JWT exp (JWT exp takes priority over refreshTokenDuration config)',
    ).toBeLessThanOrEqual(30);
  });
});
