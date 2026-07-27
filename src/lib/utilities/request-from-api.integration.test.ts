import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./handle-error', () => ({
  handleError: vi.fn(),
}));

vi.mock('$lib/stores/auth-user', () => ({
  getAuthUser: vi.fn(),
}));

vi.mock('./auth-refresh', () => ({
  refreshTokens: vi.fn(),
}));

import { getAuthUser } from '$lib/stores/auth-user';

import { refreshTokens } from './auth-refresh';
import { initCoreProvider } from './core-provider';
import { requestFromAPI } from './request-from-api';

import { ossPostResponse, ossPreRequest } from './oss-provider.svelte';

const mockGetAuthUser = vi.mocked(getAuthUser);
const mockRefreshTokens = vi.mocked(refreshTokens);

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

describe('request-from-api integration with OSS provider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuthUser.mockReturnValue({
      accessToken: 'test-access-token',
      idToken: 'test-id-token',
    });

    initCoreProvider({
      getAccessToken: async () => mockGetAuthUser().accessToken ?? '',
      getIdToken: async () => mockGetAuthUser().idToken,
      api: {
        preRequest: ossPreRequest,
        postResponse: ossPostResponse,
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should attach auth headers and credentials on a successful request', async () => {
    const request = createMockFetch({
      status: 200,
      ok: true,
      body: { workflows: [] },
    });

    const result = await requestFromAPI('/api/v1/workflows', { request });

    expect(result).toEqual({ workflows: [] });

    const fetchOptions = (request as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as RequestInit;
    const headers = fetchOptions.headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer test-access-token');
    expect(headers['Authorization-Extras']).toBe('test-id-token');
    expect(headers['Caller-Type']).toBe('operator');
    expect(fetchOptions.credentials).toBe('include');
  });

  it('should refresh tokens and retry on 401', async () => {
    mockGetAuthUser.mockReturnValue({ accessToken: 'stale-token' });

    mockRefreshTokens.mockImplementation(async () => {
      mockGetAuthUser.mockReturnValue({ accessToken: 'fresh-token' });
      return true;
    });

    const request = createMockFetch(
      { status: 401, ok: false, body: { message: 'unauthorized' } },
      { status: 200, ok: true, body: { data: 'success' } },
    );

    const result = await requestFromAPI('/api/v1/workflows', { request });

    expect(result).toEqual({ data: 'success' });
    expect(request).toHaveBeenCalledTimes(2);
    expect(mockRefreshTokens).toHaveBeenCalledTimes(1);

    const retryHeaders = (
      (request as ReturnType<typeof vi.fn>).mock.calls[1][1] as RequestInit
    ).headers as Record<string, string>;
    expect(retryHeaders['Authorization']).toBe('Bearer fresh-token');
  });

  it('should not retry when refresh fails', async () => {
    mockRefreshTokens.mockResolvedValue(false);

    const request = createMockFetch({
      status: 401,
      ok: false,
      body: { message: 'unauthorized' },
    });

    const onError = vi.fn();
    await requestFromAPI('/api/v1/workflows', { request, onError });

    expect(request).toHaveBeenCalledTimes(1);
    expect(mockRefreshTokens).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ status: 401 }),
    );
  });

  it('should not add auth headers when user has no tokens', async () => {
    mockGetAuthUser.mockReturnValue({});

    const request = createMockFetch({
      status: 200,
      ok: true,
      body: {},
    });

    await requestFromAPI('/api/v1/workflows', { request });

    const headers = (
      (request as ReturnType<typeof vi.fn>).mock.calls[0][1] as RequestInit
    ).headers as Record<string, string>;
    expect(headers['Authorization']).toBeUndefined();
    expect(headers['Authorization-Extras']).toBeUndefined();
    expect(headers['Caller-Type']).toBe('operator');
  });

  it('should handle concurrent requests independently', async () => {
    let callCount = 0;
    const request = vi.fn(async () => {
      callCount++;
      return {
        json: () => Promise.resolve({ call: callCount }),
        status: 200,
        statusText: 'OK',
        ok: true,
      };
    }) as unknown as typeof fetch;

    const [result1, result2] = await Promise.all([
      requestFromAPI('/api/v1/endpoint-a', { request }),
      requestFromAPI('/api/v1/endpoint-b', { request }),
    ]);

    expect(request).toHaveBeenCalledTimes(2);
    expect(result1).toBeDefined();
    expect(result2).toBeDefined();
  });
});
