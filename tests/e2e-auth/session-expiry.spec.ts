import { expect, test } from '@playwright/test';

import { getCookieMaxAge, loginViaOIDC } from './helpers';

test.describe('token refresh and session expiry', () => {
  test('token refresh succeeds at 6s (after access token expires at 5s, session still valid at 15s)', async ({
    page,
    context,
  }) => {
    await loginViaOIDC(page);

    const userMaxAgeBefore = await getCookieMaxAge(context, 'user0');
    expect(
      userMaxAgeBefore,
      'user0 cookie must exist after login',
    ).not.toBeNull();

    await page.waitForTimeout(6000);

    const refreshResponse = await page.request.get('/auth/refresh');
    expect(
      refreshResponse.status(),
      'token refresh should succeed at 6s (session is still valid)',
    ).toBe(200);
  });

  test('user* cookie MaxAge decreases after 6s (reflects remaining session time)', async ({
    page,
    context,
  }) => {
    await loginViaOIDC(page);

    await page.waitForTimeout(6000);

    const refreshResponse = await page.request.get('/auth/refresh');
    expect(refreshResponse.status()).toBe(200);

    const userMaxAgeAfter = await getCookieMaxAge(context, 'user0');
    expect(
      userMaxAgeAfter,
      'user0 cookie should still exist after refresh',
    ).not.toBeNull();

    expect(
      userMaxAgeAfter!,
      'user* MaxAge should be less than 15 after 6s have elapsed',
    ).toBeLessThan(15);

    expect(
      userMaxAgeAfter!,
      'user* MaxAge should be at least 6 seconds remaining (±3s tolerance)',
    ).toBeGreaterThanOrEqual(6);
  });

  test('token refresh fails at 16s (session expired at 15s)', async ({
    page,
  }) => {
    test.setTimeout(50000);

    await loginViaOIDC(page);

    await page.waitForTimeout(16000);

    const refreshResponse = await page.request.get('/auth/refresh');
    expect(
      refreshResponse.status(),
      'token refresh should be rejected once session expires',
    ).toBe(401);
  });
});
