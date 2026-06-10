import { get } from 'svelte/store';

import { persistStore } from '$lib/stores/persist-store';
import {
  dismissSessionWarning,
  sessionWarningState,
} from '$lib/stores/session-warning';
import type { User } from '$lib/types/global';

export const authUser = persistStore<User>('AuthUser', {});

export const getAuthUser = (): User => get(authUser);

const SESSION_WARNING_LEAD_SECS = 60;
let warningTimer: ReturnType<typeof setTimeout> | null = null;

function decodeJwtExp(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

function scheduleSessionWarning(exp: number) {
  if (warningTimer) clearTimeout(warningTimer);
  const now = Math.floor(Date.now() / 1000);
  const delay = (exp - now - SESSION_WARNING_LEAD_SECS) * 1000;
  if (delay <= 0) return;
  warningTimer = setTimeout(() => {
    sessionWarningState.set('warning');
  }, delay);
}

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

  dismissSessionWarning();
  const exp = decodeJwtExp(accessToken);
  if (exp) scheduleSessionWarning(exp);
};

export const clearAuthUser = () => {
  if (warningTimer) {
    clearTimeout(warningTimer);
    warningTimer = null;
  }
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
