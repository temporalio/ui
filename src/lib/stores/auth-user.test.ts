import { get } from 'svelte/store';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { authUser, logout, setAuthUser } from './auth-user';

describe('auth-user store: logout', () => {
  beforeEach(() => {
    authUser.set({});
    vi.restoreAllMocks();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 200 })),
    );
    vi.stubGlobal('location', { href: '' } as Location);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('calls the /auth/logout endpoint with credentials so cookies are cleared', async () => {
    await logout();

    expect(fetch).toHaveBeenCalledWith('/auth/logout', {
      method: 'GET',
      credentials: 'include',
    });
  });

  test('clears the local auth user', async () => {
    setAuthUser({ accessToken: 'token', name: 'Test User' });
    expect(get(authUser).accessToken).toBe('token');

    await logout();

    expect(get(authUser)).toEqual({});
  });

  test('redirects to the root after logging out', async () => {
    await logout();

    expect(window.location.href).toBe('/');
  });

  test('still clears auth state and redirects when the logout request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('network error')),
    );
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    setAuthUser({ accessToken: 'token', name: 'Test User' });

    await logout();

    expect(get(authUser)).toEqual({});
    expect(window.location.href).toBe('/');
  });
});
