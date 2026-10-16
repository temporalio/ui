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
 * Logs out the user by clearing local auth state and navigating to the backend
 * logout endpoint.
 *
 * A full-page navigation (rather than a fetch) is used so the browser follows the
 * redirect the server issues. When OIDC RP-initiated logout is enabled the server
 * redirects to the provider's end_session_endpoint to terminate the identity
 * provider session before returning to the app; otherwise it redirects back to the
 * app root. Following the redirect in-page is required for the cross-origin hop to
 * the identity provider to happen.
 */
export async function logout(): Promise<void> {
  clearAuthUser();

  const logoutUrl = new URL(
    resolve('/auth/logout', {}),
    getApiOrigin() ?? window.location.origin,
  ).toString();

  window.location.assign(logoutUrl);
}
