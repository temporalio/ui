import { get } from 'svelte/store';

import { persistStore } from '$lib/stores/persist-store';
import type { User } from '$lib/types/global';

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
    await fetch('/auth/logout', {
      method: 'GET',
      credentials: 'include',
    });

    console.info('[Auth] Logout successful, cookies cleared');
  } catch (error) {
    console.error('[Auth] Logout request failed:', error);
  }

  clearAuthUser();
  window.location.href = '/';
}
