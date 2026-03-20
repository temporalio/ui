import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$lib/stores/auth-user', () => ({
  getAuthUser: vi.fn(),
}));

import { getAuthUser } from '$lib/stores/auth-user';

import {
  getAccessToken,
  getIdToken,
  initTokenProvider,
  isCloudAuthProvider,
} from './token-provider';

const mockGetAuthUser = vi.mocked(getAuthUser);

describe('token-provider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (globalThis as Record<string, unknown>).AccessToken;
    initTokenProvider();
  });

  afterEach(() => {
    delete (globalThis as Record<string, unknown>).AccessToken;
  });

  describe('isCloudAuthProvider', () => {
    it('should return false when globalThis.AccessToken is not set', () => {
      expect(isCloudAuthProvider()).toBe(false);
    });

    it('should return true when globalThis.AccessToken is set', () => {
      (globalThis as Record<string, unknown>).AccessToken = vi.fn();
      expect(isCloudAuthProvider()).toBe(true);
    });
  });

  describe('self-hosted path', () => {
    it('should return accessToken from auth store', async () => {
      mockGetAuthUser.mockReturnValue({
        accessToken: 'store-token',
        idToken: 'store-id-token',
      });
      initTokenProvider();

      const token = await getAccessToken();
      expect(token).toBe('store-token');
    });

    it('should return empty string when store has no accessToken', async () => {
      mockGetAuthUser.mockReturnValue({});
      initTokenProvider();

      const token = await getAccessToken();
      expect(token).toBe('');
    });

    it('should return idToken from auth store', async () => {
      mockGetAuthUser.mockReturnValue({
        accessToken: 'store-token',
        idToken: 'store-id-token',
      });
      initTokenProvider();

      const idToken = await getIdToken();
      expect(idToken).toBe('store-id-token');
    });

    it('should return undefined idToken when store has none', async () => {
      mockGetAuthUser.mockReturnValue({});
      initTokenProvider();

      const idToken = await getIdToken();
      expect(idToken).toBeUndefined();
    });
  });

  describe('cloud path', () => {
    it('should call globalThis.AccessToken for access token', async () => {
      const mockAccessToken = vi.fn().mockResolvedValue('cloud-token');
      (globalThis as Record<string, unknown>).AccessToken = mockAccessToken;
      initTokenProvider();

      const token = await getAccessToken();
      expect(token).toBe('cloud-token');
      expect(mockAccessToken).toHaveBeenCalled();
    });

    it('should return undefined for idToken on cloud path', async () => {
      (globalThis as Record<string, unknown>).AccessToken = vi
        .fn()
        .mockResolvedValue('cloud-token');
      initTokenProvider();

      const idToken = await getIdToken();
      expect(idToken).toBeUndefined();
    });

    it('should not read from auth store on cloud path', async () => {
      (globalThis as Record<string, unknown>).AccessToken = vi
        .fn()
        .mockResolvedValue('cloud-token');
      initTokenProvider();

      await getAccessToken();
      expect(mockGetAuthUser).not.toHaveBeenCalled();
    });
  });

  describe('lazy initialization', () => {
    it('should auto-init provider on first getAccessToken call', async () => {
      mockGetAuthUser.mockReturnValue({ accessToken: 'lazy-token' });

      const token = await getAccessToken();
      expect(token).toBe('lazy-token');
    });
  });
});
