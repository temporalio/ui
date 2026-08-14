import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { base } from '$app/paths';

import { clearAuthUser, getAuthUser, logout, setAuthUser } from './auth-user';

const realLocation = window.location;
const fakeLocation = {
  origin: 'https://temporal.io',
  assign: vi.fn(),
};

describe('auth-user logout', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchSpy);
    Object.defineProperty(window, 'location', { value: fakeLocation });
    setAuthUser({ accessToken: 'token' });
  });

  afterEach(() => {
    clearAuthUser();
    Object.defineProperty(window, 'location', { value: realLocation });
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('should call the backend logout endpoint and clear local auth state', async () => {
    await logout();

    expect(fetchSpy).toHaveBeenCalledWith(
      `http://localhost:8233${base}/auth/logout`,
      {
        method: 'GET',
        credentials: 'include',
        redirect: 'manual',
      },
    );
    expect(getAuthUser()).toEqual({});
    expect(window.location.assign).toHaveBeenCalledWith(`${base}/`);
  });

  it('should clear local auth state even when the logout request fails', async () => {
    fetchSpy.mockRejectedValue(new Error('logout failed'));

    await logout();

    expect(getAuthUser()).toEqual({});
    expect(window.location.assign).toHaveBeenCalledWith(`${base}/`);
  });
});
