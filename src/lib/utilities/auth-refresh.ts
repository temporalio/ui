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
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${getApiOrigin()}/auth/refresh`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!res.ok) {
        console.warn(
          `[Auth] Token refresh failed with status ${res.status}: ${res.statusText}`,
        );
        return false;
      }

      const user = getAuthUserCookie(true);
      if (user?.accessToken) {
        setAuthUser(user);
        cleanAuthUserCookie(true);
        console.info('[Auth] Token refresh successful');
        return true;
      }

      console.warn('[Auth] Token refresh returned no access token');
      return false;
    } catch (error) {
      console.error('[Auth] Token refresh network error:', error);
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};
