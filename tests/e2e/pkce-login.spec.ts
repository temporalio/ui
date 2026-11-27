import { expect, type Page, type Response, test } from '@playwright/test';

import { AUTH_UI_SERVER_URL } from '../../utilities/auth-e2e-stack';

/**
 * End to end coverage for PKCE, against a real identity provider and a real
 * auth-enabled ui-server with `pkceEnabled: true` in
 * server/config/e2e-auth.yaml (see utilities/auth-e2e-stack.ts).
 *
 * The unit tests see the handler's response recorder. What they cannot see is
 * the browser: whether the challenge actually reaches the identity provider,
 * whether the verifier cookie is delivered on the cross-site redirect back,
 * and whether the clearing Set-Cookie on the callback response — which is
 * written just before the handler's own redirect — is honoured. This file
 * covers that gap.
 */

test.use({ storageState: { cookies: [], origins: [] } });

type RedirectRequest = {
  challengeMethod: string | null;
  challenge: string | null;
  hasVerifierParam: boolean;
};

const authorizesWithPKCE = (page: Page): Promise<RedirectRequest> =>
  page
    .waitForRequest((request) => {
      try {
        return new URL(request.url()).searchParams.has('code_challenge');
      } catch {
        return false;
      }
    })
    .then((request) => {
      const params = new URL(request.url()).searchParams;
      return {
        challengeMethod: params.get('code_challenge_method'),
        challenge: params.get('code_challenge'),
        hasVerifierParam: params.has('code_verifier'),
      };
    });

const setCookiesOf = async (response: Response): Promise<string[]> =>
  (await response.headersArray())
    .filter((header) => header.name.toLowerCase() === 'set-cookie')
    .map((header) => header.value);

const signIn = async (page: Page): Promise<void> => {
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

  await callback;
};

test('the authorize request carries an S256 challenge', async ({ page }) => {
  test.setTimeout(30_000);

  const pending = authorizesWithPKCE(page);
  const sso = page.waitForResponse(
    (response: Response) =>
      response.url().startsWith(`${AUTH_UI_SERVER_URL}/auth/sso`) &&
      !response.url().includes('/callback'),
  );

  await signIn(page);

  const { challengeMethod, challenge, hasVerifierParam } = await pending;
  expect(challengeMethod).toBe('S256');
  // A base64url SHA-256 hash is always 43 characters, whatever the verifier.
  expect(challenge).toHaveLength(43);

  // The verifier stays in its cookie and never travels in the URL.
  expect(hasVerifierParam).toBe(false);

  const ssoSetCookies = await setCookiesOf(await sso);
  expect(
    ssoSetCookies.some((cookie) => cookie.startsWith('code_verifier=')),
  ).toBe(true);
});

test('login succeeds and the browser is left without the verifier', async ({
  page,
}) => {
  test.setTimeout(30_000);

  await signIn(page);

  // The callback response carries both the user cookies and the clearing
  // Set-Cookie for code_verifier, and it does so before the handler's own
  // redirect is written. If the clear were deferred past that redirect the
  // browser would keep the verifier here.
  await expect
    .poll(
      async () => {
        const cookies = await page.context().cookies(AUTH_UI_SERVER_URL);
        return {
          signedIn: cookies.some((cookie) => cookie.name === 'user0'),
          verifier: cookies.some((cookie) => cookie.name === 'code_verifier'),
        };
      },
      { timeout: 5000 },
    )
    .toEqual({ signedIn: true, verifier: false });
});
