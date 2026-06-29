import { get } from 'svelte/store';

import { resolve } from '$app/paths';

import { persistStore } from '$lib/stores/persist-store';
import type { User } from '$lib/types/global';
import { getApiOrigin } from '$lib/utilities/get-api-origin';

export const authUser = persistStore<User>('AuthUser', {});

export const getAuthUser = (): User => get(authUser);

export const setAuthUser = (user: User) => {
  const { accessToken, idToken, name, email, picture } = user;

  if (!accessToken) {
    throw new Error('No access token');
  }

  authUser.set({
    accessToken,
    idToken,
    name,
    email,
    picture,
  });
};

export const clearAuthUser = () => {
  authUser.set({});
};

/**
 * Logs out the user by calling the backend logout endpoint
 * and clearing local auth state.
 */
export async function logout(): Promise<void> {
  try {
    const logoutUrl = new URL(
      resolve('/auth/logout', {}),
      getApiOrigin() ?? window.location.origin,
    ).toString();

    await fetch(logoutUrl, {
      method: 'GET',
      credentials: 'include',
      redirect: 'manual',
    });

    console.info('[Auth] Logout successful, cookies cleared');
  } catch (error) {
    console.error('[Auth] Logout request failed:', error);
  }

  clearAuthUser();
  window.location.assign(resolve('/', {}));
}
