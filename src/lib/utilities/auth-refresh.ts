import { BROWSER } from 'esm-env';

import { consumeAuthCookies } from '$lib/utilities/auth-user-cookie';
import { getApiOrigin } from '$lib/utilities/get-api-origin';

let refreshPromise: Promise<boolean> | null = null;

/**
 * Calls the Go server's `/auth/refresh` endpoint, which uses the HttpOnly
 * `refresh` cookie to obtain new tokens from the OIDC provider.
 *
 * The server responds by setting fresh `user*` transport cookies, which
 * are then consumed into the auth store via `consumeAuthCookies()`.
 *
 * Concurrent calls are deduplicated — only one HTTP request is in flight
 * at a time, and all callers share the same promise.
 */
export const refreshTokens = async (): Promise<boolean> => {
  if (!BROWSER) return false;

  if (refreshPromise) {
    console.debug('[Auth] Reusing existing token refresh promise');
    return refreshPromise;
  }

  const startTime = performance.now();
  console.info('[Auth] Initiating token refresh...');

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${getApiOrigin()}/auth/refresh`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!res.ok) {
        const duration = performance.now() - startTime;
        console.warn(
          `[Auth] Token refresh failed with status ${res.status}: ${res.statusText} (duration: ${duration.toFixed(2)}ms)`,
        );
        return false;
      }

      const consumed = consumeAuthCookies(true);
      if (consumed) {
        const duration = performance.now() - startTime;
        console.info(
          `[Auth] Token refresh successful (duration: ${duration.toFixed(2)}ms)`,
        );
        return true;
      }

      const duration = performance.now() - startTime;
      console.warn(
        `[Auth] Token refresh returned no access token (duration: ${duration.toFixed(2)}ms)`,
      );
      return false;
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(
        `[Auth] Token refresh network error (duration: ${duration.toFixed(2)}ms):`,
        error,
      );
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};
