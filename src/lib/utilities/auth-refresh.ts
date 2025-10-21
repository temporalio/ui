import { BROWSER } from 'esm-env';

import { setAuthUser } from '$lib/stores/auth-user';
import {
  cleanAuthUserCookie,
  getAuthUserCookie,
} from '$lib/utilities/auth-user-cookie';
import { getApiOrigin } from '$lib/utilities/get-api-origin';

export const refreshTokens = async (): Promise<boolean> => {
  if (!BROWSER) return false;
  try {
    const res = await fetch(`${getApiOrigin()}/auth/refresh`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!res.ok) return false;

    // Tokens are set in short-lived 'user*' cookies. Read them and update the store.
    const user = getAuthUserCookie(true);
    if (user?.accessToken) {
      setAuthUser(user);
      cleanAuthUserCookie(true);
      return true;
    }
    return false;
  } catch (_) {
    return false;
  }
};
