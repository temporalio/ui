import { BROWSER } from 'esm-env';

import { setAuthUser } from '$lib/stores/auth-user';
import {
  cleanAuthUserCookie,
  getAuthUserCookie,
} from '$lib/utilities/auth-user-cookie';
import { getApiOrigin } from '$lib/utilities/get-api-origin';

let refreshPromise: Promise<boolean> | null = null;

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

      const user = getAuthUserCookie(true);
      if (user?.accessToken) {
        setAuthUser(user);
        cleanAuthUserCookie(true);
        const duration = performance.now() - startTime;
        const expiryTime = user.expiresAt
          ? new Date(user.expiresAt).toISOString()
          : 'unknown';
        console.info(
          `[Auth] Token refresh successful (duration: ${duration.toFixed(2)}ms, expires: ${expiryTime})`,
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
