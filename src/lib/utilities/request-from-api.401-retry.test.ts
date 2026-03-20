import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./handle-error', () => ({
  handleError: vi.fn(),
}));

vi.mock('./auth-refresh', () => ({
  refreshTokens: vi.fn(),
}));

vi.mock('./token-provider', () => ({
  getAccessToken: vi.fn(),
  getIdToken: vi.fn(),
  isCloudAuthProvider: vi.fn(),
}));

import { refreshTokens } from './auth-refresh';
import { handleError } from './handle-error';
import { requestFromAPI } from './request-from-api';
import {
  getAccessToken,
  getIdToken,
  isCloudAuthProvider,
} from './token-provider';

const mockRefreshTokens = vi.mocked(refreshTokens);
const mockGetAccessToken = vi.mocked(getAccessToken);
const mockGetIdToken = vi.mocked(getIdToken);
const mockIsCloudAuthProvider = vi.mocked(isCloudAuthProvider);

type MockResponseConfig = {
  body?: unknown;
  ok?: boolean;
  status?: number;
  statusText?: string;
};

const createMockFetch = (...responses: MockResponseConfig[]) => {
  let callIndex = 0;
  return vi.fn(async () => {
    const config = responses[Math.min(callIndex++, responses.length - 1)];
    return {
      json: () => Promise.resolve(config.body ?? {}),
      status: config.status ?? 200,
      statusText: config.statusText ?? 'OK',
      ok: config.ok ?? true,
    };
  }) as unknown as typeof fetch;
};

describe('requestFromAPI 401 retry', () => {
  const endpoint = '/api/endpoint';

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAccessToken.mockResolvedValue('initial-token');
    mockGetIdToken.mockResolvedValue(undefined);
    mockIsCloudAuthProvider.mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('self-hosted path (non-cloud)', () => {
    it('should call refreshTokens on 401 and retry the request', async () => {
      mockRefreshTokens.mockResolvedValue(true);
      mockGetAccessToken
        .mockResolvedValueOnce('stale-token')
        .mockResolvedValueOnce('fresh-token');

      const successBody = { workflows: [] };
      const request = createMockFetch(
        {
          status: 401,
          ok: false,
          statusText: 'Unauthorized',
          body: { message: 'unauthorized' },
        },
        { status: 200, ok: true, body: successBody },
      );

      const result = await requestFromAPI(endpoint, { request });

      expect(mockRefreshTokens).toHaveBeenCalledTimes(1);
      expect(request).toHaveBeenCalledTimes(2);
      expect(result).toEqual(successBody);
    });

    it('should not retry when refreshTokens returns false', async () => {
      mockRefreshTokens.mockResolvedValue(false);

      const errorBody = { message: 'unauthorized' };
      const request = createMockFetch({
        status: 401,
        ok: false,
        statusText: 'Unauthorized',
        body: errorBody,
      });

      await requestFromAPI(endpoint, { request });

      expect(mockRefreshTokens).toHaveBeenCalledTimes(1);
      expect(request).toHaveBeenCalledTimes(1);
      expect(handleError).toHaveBeenCalled();
    });

    it('should use fresh token in Authorization header after refresh', async () => {
      mockRefreshTokens.mockResolvedValue(true);
      mockGetAccessToken
        .mockResolvedValueOnce('stale-token')
        .mockResolvedValueOnce('fresh-token');

      const request = createMockFetch(
        {
          status: 401,
          ok: false,
          statusText: 'Unauthorized',
          body: { message: 'unauthorized' },
        },
        { status: 200, ok: true, body: { data: 'success' } },
      );

      await requestFromAPI(endpoint, { request });

      const secondCallOptions = (request as ReturnType<typeof vi.fn>).mock
        .calls[1][1] as RequestInit;
      const headers = secondCallOptions.headers as Record<string, string>;
      expect(headers['Authorization']).toBe('Bearer fresh-token');
    });

    it('should not attempt refresh for non-401 errors', async () => {
      const request = createMockFetch({
        status: 403,
        ok: false,
        statusText: 'Forbidden',
        body: { message: 'forbidden' },
      });

      await requestFromAPI(endpoint, { request });

      expect(mockRefreshTokens).not.toHaveBeenCalled();
      expect(request).toHaveBeenCalledTimes(1);
    });

    it('should not attempt refresh for 500 errors', async () => {
      const request = createMockFetch({
        status: 500,
        ok: false,
        statusText: 'Internal Server Error',
        body: { message: 'server error' },
      });

      await requestFromAPI(endpoint, { request });

      expect(mockRefreshTokens).not.toHaveBeenCalled();
      expect(request).toHaveBeenCalledTimes(1);
    });
  });

  describe('cloud path', () => {
    beforeEach(() => {
      mockIsCloudAuthProvider.mockReturnValue(true);
    });

    it('should re-call getAccessToken (not refreshTokens) on 401', async () => {
      mockGetAccessToken
        .mockResolvedValueOnce('stale-cloud-token')
        .mockResolvedValueOnce('fresh-cloud-token');

      const successBody = { workflows: [] };
      const request = createMockFetch(
        {
          status: 401,
          ok: false,
          statusText: 'Unauthorized',
          body: { message: 'unauthorized' },
        },
        { status: 200, ok: true, body: successBody },
      );

      const result = await requestFromAPI(endpoint, { request });

      expect(mockRefreshTokens).not.toHaveBeenCalled();
      expect(request).toHaveBeenCalledTimes(2);
      expect(result).toEqual(successBody);
    });

    it('should use fresh cloud token in retry Authorization header', async () => {
      mockGetAccessToken
        .mockResolvedValueOnce('stale-cloud-token')
        .mockResolvedValueOnce('fresh-cloud-token');

      const request = createMockFetch(
        {
          status: 401,
          ok: false,
          statusText: 'Unauthorized',
          body: { message: 'unauthorized' },
        },
        { status: 200, ok: true, body: {} },
      );

      await requestFromAPI(endpoint, { request });

      const secondCallOptions = (request as ReturnType<typeof vi.fn>).mock
        .calls[1][1] as RequestInit;
      const headers = secondCallOptions.headers as Record<string, string>;
      expect(headers['Authorization']).toBe('Bearer fresh-cloud-token');
    });
  });

  describe('settings endpoint', () => {
    it('should skip withAuth for settings endpoint on retry', async () => {
      mockRefreshTokens.mockResolvedValue(true);

      const settingsEndpoint = '/api/v1/settings';
      const request = createMockFetch(
        {
          status: 401,
          ok: false,
          statusText: 'Unauthorized',
          body: { message: 'unauthorized' },
        },
        { status: 200, ok: true, body: { Auth: { Enabled: true } } },
      );

      await requestFromAPI(settingsEndpoint, { request });

      const secondCallOptions = (request as ReturnType<typeof vi.fn>).mock
        .calls[1]?.[1] as RequestInit | undefined;
      const headers = (secondCallOptions?.headers ?? {}) as Record<
        string,
        string
      >;
      expect(headers['Authorization']).toBeUndefined();
    });
  });

  describe('SSR (non-browser)', () => {
    it('should not attempt 401 retry when not in browser', async () => {
      const request = createMockFetch({
        status: 401,
        ok: false,
        statusText: 'Unauthorized',
        body: { message: 'unauthorized' },
      });

      await requestFromAPI(endpoint, { request, isBrowser: false });

      expect(mockRefreshTokens).not.toHaveBeenCalled();
      expect(request).toHaveBeenCalledTimes(1);
    });
  });

  describe('error propagation after failed retry', () => {
    it('should call onError after 401 retry still fails', async () => {
      mockRefreshTokens.mockResolvedValue(true);
      mockGetAccessToken.mockResolvedValue('token');

      const onError = vi.fn();
      const errorBody = { message: 'still unauthorized' };
      const request = createMockFetch(
        { status: 401, ok: false, statusText: 'Unauthorized', body: errorBody },
        { status: 401, ok: false, statusText: 'Unauthorized', body: errorBody },
      );

      await requestFromAPI(endpoint, { request, onError });

      expect(request).toHaveBeenCalledTimes(2);
      expect(onError).toHaveBeenCalledWith({
        body: errorBody,
        status: 401,
        statusText: 'Unauthorized',
      });
    });

    it('should throw via handleError when retry fails and no onError', async () => {
      mockRefreshTokens.mockResolvedValue(true);
      mockGetAccessToken.mockResolvedValue('token');

      const errorBody = { message: 'still unauthorized' };
      const request = createMockFetch(
        { status: 401, ok: false, statusText: 'Unauthorized', body: errorBody },
        { status: 403, ok: false, statusText: 'Forbidden', body: errorBody },
      );

      await requestFromAPI(endpoint, { request });

      expect(handleError).toHaveBeenCalled();
    });
  });
});
