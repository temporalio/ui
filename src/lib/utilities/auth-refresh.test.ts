import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$lib/utilities/auth-user-cookie', () => ({
  consumeAuthCookies: vi.fn(),
}));

vi.mock('$lib/utilities/get-api-origin', () => ({
  getApiOrigin: vi.fn().mockReturnValue('http://localhost:8080'),
}));

import { consumeAuthCookies } from '$lib/utilities/auth-user-cookie';

import { refreshTokens } from './auth-refresh';

const mockConsumeAuthCookies = vi.mocked(consumeAuthCookies);

describe('refreshTokens', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should call GET /auth/refresh with credentials include', async () => {
    fetchSpy.mockResolvedValue({ ok: true });
    mockConsumeAuthCookies.mockReturnValue(false);

    await refreshTokens();

    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:8080/auth/refresh',
      {
        method: 'GET',
        credentials: 'include',
      },
    );
  });

  it('should consume cookies and return true on successful refresh', async () => {
    fetchSpy.mockResolvedValue({ ok: true });
    mockConsumeAuthCookies.mockReturnValue(true);

    const result = await refreshTokens();

    expect(result).toBe(true);
    expect(mockConsumeAuthCookies).toHaveBeenCalledWith(true);
  });

  it('should return false when refresh endpoint returns non-ok', async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    });

    const result = await refreshTokens();

    expect(result).toBe(false);
    expect(mockConsumeAuthCookies).not.toHaveBeenCalled();
  });

  it('should return false when cookies have no access token after refresh', async () => {
    fetchSpy.mockResolvedValue({ ok: true });
    mockConsumeAuthCookies.mockReturnValue(false);

    const result = await refreshTokens();

    expect(result).toBe(false);
  });

  it('should return false on network error', async () => {
    fetchSpy.mockRejectedValue(new Error('Network error'));

    const result = await refreshTokens();

    expect(result).toBe(false);
    expect(mockConsumeAuthCookies).not.toHaveBeenCalled();
  });

  it('should deduplicate concurrent refresh calls', async () => {
    let resolveRefresh: (value: Response) => void;
    fetchSpy.mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          resolveRefresh = resolve;
        }),
    );
    mockConsumeAuthCookies.mockReturnValue(true);

    const promise1 = refreshTokens();
    const promise2 = refreshTokens();

    resolveRefresh!({ ok: true } as Response);

    const [result1, result2] = await Promise.all([promise1, promise2]);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(result1).toBe(true);
    expect(result2).toBe(true);
  });

  it('should allow new refresh after previous one completes', async () => {
    fetchSpy.mockResolvedValue({ ok: true });
    mockConsumeAuthCookies.mockReturnValue(true);

    await refreshTokens();
    await refreshTokens();

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
