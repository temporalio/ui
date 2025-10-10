import { get } from 'svelte/store';

import { persistStore } from '$lib/stores/persist-store';
import type { User } from '$lib/types/global';
import { cleanAuthUserCookie } from '$lib/utilities/auth-user-cookie';

export const authUser = persistStore<User>('AuthUser', {});

export const getAuthUser = (): User => get(authUser);

export const setAuthUser = (user: User) => {
  const {
    accessToken,
    idToken,
    name,
    email,
    picture,
    temporal_namespaces,
    temporal_permissions,
    temporal_workflow_actions,
  } = user;

  if (!accessToken) {
    throw new Error('No access token');
  }

  authUser.set({
    accessToken,
    idToken,
    name,
    email,
    picture,
    temporal_namespaces,
    temporal_permissions,
    temporal_workflow_actions,
  });
};

export const clearAuthUser = () => {
  // Clear the auth user from the store
  authUser.set({});

  // Clean up auth cookies
  cleanAuthUserCookie();

  // Clear any additional cookies that might be set by the auth provider
  if (typeof document !== 'undefined') {
    // Clear common auth-related cookies
    const authCookies = [
      'user',
      'auth',
      'session',
      'token',
      'access_token',
      'id_token',
      'refresh_token',
      'temporal_auth',
      'temporal_session',
    ];

    authCookies.forEach((cookieName) => {
      // Clear cookie for current domain
      document.cookie = `${cookieName}=; max-age=-1; path=/`;
      // Clear cookie for parent domain (if applicable)
      document.cookie = `${cookieName}=; max-age=-1; path=/; domain=${window.location.hostname}`;
      // Clear cookie for all subdomains
      const domainParts = window.location.hostname.split('.');
      if (domainParts.length > 1) {
        const parentDomain = '.' + domainParts.slice(-2).join('.');
        document.cookie = `${cookieName}=; max-age=-1; path=/; domain=${parentDomain}`;
      }
    });
  }
};
