import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$lib/stores/auth-user', () => ({
  getAuthUser: vi.fn(),
}));

vi.mock('./auth-refresh', () => ({
  refreshTokens: vi.fn(),
}));

import { getAuthUser } from '$lib/stores/auth-user';

import { refreshTokens } from './auth-refresh';

import {
  getCsrfToken,
  ossPostResponse,
  ossPreRequest,
} from './oss-provider.svelte';

const mockGetAuthUser = vi.mocked(getAuthUser);
const mockRefreshTokens = vi.mocked(refreshTokens);

const withCookie = async (cookie: string, fn: () => void | Promise<void>) => {
  const currentCookie = document.cookie;

  Object.defineProperty(document, 'cookie', {
    writable: true,
    value: cookie,
  });

  await fn();

  Object.defineProperty(document, 'cookie', {
    writable: true,
    value: currentCookie,
  });
};

describe('ossPreRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuthUser.mockReturnValue({});
  });

  it('should add credentials include to request', async () => {
    const result = await ossPreRequest({ url: '/api/test', options: {} });

    expect(result.options.credentials).toBe('include');
  });

  it('should add Authorization header when user has accessToken', async () => {
    mockGetAuthUser.mockReturnValue({ accessToken: 'my-token' });

    const result = await ossPreRequest({ url: '/api/test', options: {} });

    const headers = result.options.headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer my-token');
  });

  it('should not add Authorization header when user has no accessToken', async () => {
    mockGetAuthUser.mockReturnValue({});

    const result = await ossPreRequest({ url: '/api/test', options: {} });

    const headers = result.options.headers as Record<string, string>;
    expect(headers['Authorization']).toBeUndefined();
  });

  it('should add Authorization-Extras header when user has idToken', async () => {
    mockGetAuthUser.mockReturnValue({
      accessToken: 'token',
      idToken: 'id-token',
    });

    const result = await ossPreRequest({ url: '/api/test', options: {} });

    const headers = result.options.headers as Record<string, string>;
    expect(headers['Authorization-Extras']).toBe('id-token');
  });

  it('should add csrf cookie to headers', async () => {
    await withCookie('_csrf=csrf-token-value', async () => {
      const result = await ossPreRequest({ url: '/api/test', options: {} });

      const headers = result.options.headers as Record<string, string>;
      expect(headers['X-CSRF-TOKEN']).toBe('csrf-token-value');
    });
  });

  it('should not add csrf cookie to headers if not present', async () => {
    await withCookie('_nope=token', async () => {
      const result = await ossPreRequest({ url: '/api/test', options: {} });

      const headers = result.options.headers as Record<string, string>;
      expect(headers['X-CSRF-TOKEN']).toBeUndefined();
    });
  });

  it('should not overwrite existing X-CSRF-TOKEN header', async () => {
    await withCookie('_csrf=new-token', async () => {
      const result = await ossPreRequest({
        url: '/api/test',
        options: {
          headers: { 'X-CSRF-TOKEN': 'pre-existing' } as Record<string, string>,
        },
      });

      const headers = result.options.headers as Record<string, string>;
      expect(headers['X-CSRF-TOKEN']).toBe('pre-existing');
    });
  });

  it('should preserve existing options while adding credentials', async () => {
    const result = await ossPreRequest({
      url: '/api/test',
      options: { method: 'POST', body: '{}' },
    });

    expect(result.options.method).toBe('POST');
    expect(result.options.body).toBe('{}');
    expect(result.options.credentials).toBe('include');
  });
});

describe('getCsrfToken', () => {
  it('should return csrf token from cookie', async () => {
    await withCookie('_csrf=my-csrf', async () => {
      expect(getCsrfToken()).toBe('my-csrf');
    });
  });

  it('should return undefined when no csrf cookie exists', async () => {
    await withCookie('other=value', async () => {
      expect(getCsrfToken()).toBeUndefined();
    });
  });
});

describe('ossPostResponse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should pass through non-401 responses', async () => {
    const response = new Response('ok', { status: 200 });
    const retry = vi.fn();

    const result = await ossPostResponse(response, {
      url: '/api/test',
      options: {},
      retry,
    });

    expect(result).toBe(response);
    expect(mockRefreshTokens).not.toHaveBeenCalled();
    expect(retry).not.toHaveBeenCalled();
  });

  it('should call refreshTokens and retry on 401', async () => {
    mockRefreshTokens.mockResolvedValue(true);
    const retryResponse = new Response('retried', { status: 200 });
    const retry = vi.fn().mockResolvedValue(retryResponse);

    const response = new Response('unauthorized', { status: 401 });
    const result = await ossPostResponse(response, {
      url: '/api/test',
      options: {},
      retry,
    });

    expect(mockRefreshTokens).toHaveBeenCalledTimes(1);
    expect(retry).toHaveBeenCalledTimes(1);
    expect(result).toBe(retryResponse);
  });

  it('should not retry when refreshTokens returns false', async () => {
    mockRefreshTokens.mockResolvedValue(false);
    const retry = vi.fn();

    const response = new Response('unauthorized', { status: 401 });
    const result = await ossPostResponse(response, {
      url: '/api/test',
      options: {},
      retry,
    });

    expect(mockRefreshTokens).toHaveBeenCalledTimes(1);
    expect(retry).not.toHaveBeenCalled();
    expect(result).toBe(response);
  });
});
