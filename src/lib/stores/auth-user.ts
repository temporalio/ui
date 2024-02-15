import { get } from 'svelte/store';

import { persistStore } from '$lib/stores/persist-store';
import type { User } from '$lib/types/global';
import { OIDCFlow } from '$lib/types/global';

export const authUser = persistStore<User>('AuthUser', {});

export const getAuthUser = (): User => get(authUser);

export const setAuthUser = (user: User, oidcFlow: OIDCFlow) => {
  const { accessToken, idToken, name, email, picture } = user;

  switch (oidcFlow) {
    case OIDCFlow.AuthorizationCode:
    default:
      if (!accessToken) {
        throw new Error('No access token');
      }
      break;
    case OIDCFlow.Implicit:
      if (!idToken) {
        throw new Error('No id token');
      }
      break;
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
