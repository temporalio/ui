import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { base } from '$app/paths';

import { clearAuthUser, getAuthUser, logout, setAuthUser } from './auth-user';

const realLocation = window.location;
const fakeLocation = {
  origin: 'https://temporal.io',
  assign: vi.fn(),
};

describe('auth-user logout', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', { value: fakeLocation });
    setAuthUser({ accessToken: 'token' });
  });

  afterEach(() => {
    clearAuthUser();
    Object.defineProperty(window, 'location', { value: realLocation });
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('should clear local auth state and navigate to the backend logout endpoint', async () => {
    await logout();

    expect(getAuthUser()).toEqual({});
    expect(window.location.assign).toHaveBeenCalledWith(
      `http://localhost:8233${base}/auth/logout`,
    );
  });
});
