import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./handle-error', () => ({
  handleError: vi.fn(),
}));

vi.mock('./core-provider', () => ({
  runPreRequest: vi.fn(),
  runPostResponse: vi.fn(),
}));

import { runPostResponse, runPreRequest } from './core-provider';
import { handleError } from './handle-error';
import { requestFromAPI } from './request-from-api';

const mockRunPreRequest = vi.mocked(runPreRequest);
const mockRunPostResponse = vi.mocked(runPostResponse);

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

describe('requestFromAPI with hooks', () => {
  const endpoint = '/api/endpoint';

  beforeEach(() => {
    vi.clearAllMocks();
    mockRunPreRequest.mockImplementation(async (ctx) => ctx);
    mockRunPostResponse.mockImplementation(async (res) => res);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('preRequest hook', () => {
    it('should call runPreRequest before making the fetch', async () => {
      mockRunPreRequest.mockImplementation(async (ctx) => ({
        ...ctx,
        options: {
          ...ctx.options,
          headers: {
            ...(ctx.options.headers as Record<string, string>),
            Authorization: 'Bearer injected-token',
          },
        },
      }));

      const request = createMockFetch({
        status: 200,
        ok: true,
        body: { ok: true },
      });
      await requestFromAPI(endpoint, { request });

      expect(mockRunPreRequest).toHaveBeenCalledTimes(1);
      const fetchCallOptions = (request as ReturnType<typeof vi.fn>).mock
        .calls[0][1] as RequestInit;
      const headers = fetchCallOptions.headers as Record<string, string>;
      expect(headers['Authorization']).toBe('Bearer injected-token');
    });

    it('should not call runPreRequest when not in browser', async () => {
      const request = createMockFetch({ status: 200, ok: true, body: {} });
      await requestFromAPI(endpoint, { request, isBrowser: false });

      expect(mockRunPreRequest).not.toHaveBeenCalled();
    });

    it('should allow preRequest to modify the URL', async () => {
      mockRunPreRequest.mockImplementation(async (ctx) => ({
        ...ctx,
        url: ctx.url + '&injected=true',
      }));

      const request = createMockFetch({
        status: 200,
        ok: true,
        body: { ok: true },
      });
      await requestFromAPI(endpoint, { request });

      const fetchCallUrl = (request as ReturnType<typeof vi.fn>).mock
        .calls[0][0] as string;
      expect(fetchCallUrl).toContain('&injected=true');
    });
  });

  describe('postResponse hook', () => {
    it('should call runPostResponse after fetch', async () => {
      const request = createMockFetch({
        status: 200,
        ok: true,
        body: { data: 'test' },
      });
      await requestFromAPI(endpoint, { request });

      expect(mockRunPostResponse).toHaveBeenCalledTimes(1);
    });

    it('should pass retry callback that re-runs preRequest pipeline', async () => {
      let retryCallbackCaptured: (() => Promise<Response>) | undefined;

      mockRunPostResponse.mockImplementation(async (res, ctx) => {
        retryCallbackCaptured = ctx.retry;
        return res;
      });

      const request = createMockFetch({ status: 200, ok: true, body: {} });
      await requestFromAPI(endpoint, { request });

      expect(retryCallbackCaptured).toBeDefined();
      expect(mockRunPreRequest).toHaveBeenCalledTimes(1);

      await retryCallbackCaptured!();
      expect(mockRunPreRequest).toHaveBeenCalledTimes(2);
    });

    it('should use retried response when postResponse calls retry', async () => {
      const request = createMockFetch(
        { status: 401, ok: false, body: { message: 'unauthorized' } },
        { status: 200, ok: true, body: { data: 'refreshed' } },
      );

      mockRunPostResponse.mockImplementation(async (res, ctx) => {
        if (res.status === 401) {
          return ctx.retry();
        }
        return res;
      });

      const result = await requestFromAPI(endpoint, { request });

      expect(request).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ data: 'refreshed' });
    });

    it('should not call runPostResponse when not in browser', async () => {
      const request = createMockFetch({
        status: 401,
        ok: false,
        body: { message: 'unauthorized' },
      });

      await requestFromAPI(endpoint, { request, isBrowser: false });

      expect(mockRunPostResponse).not.toHaveBeenCalled();
    });

    it('should pass correct context to postResponse including url and options', async () => {
      const request = createMockFetch({
        status: 200,
        ok: true,
        body: {},
      });

      mockRunPreRequest.mockImplementation(async (ctx) => ({
        ...ctx,
        options: {
          ...ctx.options,
          headers: {
            ...(ctx.options.headers as Record<string, string>),
            Authorization: 'Bearer test',
          },
        },
      }));

      await requestFromAPI(endpoint, { request });

      const postResponseCall = mockRunPostResponse.mock.calls[0];
      const context = postResponseCall[1];
      expect(context.url).toContain(endpoint);
      const headers = context.options.headers as Record<string, string>;
      expect(headers['Authorization']).toBe('Bearer test');
    });
  });

  describe('retry builds fresh headers', () => {
    it('should rebuild options from init.options on retry, not reuse stale headers', async () => {
      let callCount = 0;
      mockRunPreRequest.mockImplementation(async (ctx) => {
        callCount++;
        const headers = (ctx.options.headers as Record<string, string>) ?? {};
        headers['Authorization'] = `Bearer token-${callCount}`;
        return {
          ...ctx,
          options: { ...ctx.options, headers },
        };
      });

      mockRunPostResponse.mockImplementation(async (res, ctx) => {
        if (res.status === 401) {
          return ctx.retry();
        }
        return res;
      });

      const request = createMockFetch(
        { status: 401, ok: false, body: { message: 'unauthorized' } },
        { status: 200, ok: true, body: { data: 'ok' } },
      );

      await requestFromAPI(endpoint, { request });

      const firstCallHeaders = (
        (request as ReturnType<typeof vi.fn>).mock.calls[0][1] as RequestInit
      ).headers as Record<string, string>;
      const retryCallHeaders = (
        (request as ReturnType<typeof vi.fn>).mock.calls[1][1] as RequestInit
      ).headers as Record<string, string>;

      expect(firstCallHeaders['Authorization']).toBe('Bearer token-1');
      expect(retryCallHeaders['Authorization']).toBe('Bearer token-2');
    });
  });

  describe('no infinite retry loop', () => {
    it('should not call postResponse on the retried response', async () => {
      const request = createMockFetch(
        { status: 401, ok: false, body: { message: 'unauthorized' } },
        { status: 401, ok: false, body: { message: 'still unauthorized' } },
      );

      mockRunPostResponse.mockImplementation(async (res, ctx) => {
        if (res.status === 401) {
          return ctx.retry();
        }
        return res;
      });

      await requestFromAPI(endpoint, { request });

      expect(mockRunPostResponse).toHaveBeenCalledTimes(1);
      expect(request).toHaveBeenCalledTimes(2);
    });
  });

  describe('error in hooks', () => {
    it('should propagate preRequest errors to handleError', async () => {
      mockRunPreRequest.mockRejectedValue(new Error('preRequest exploded'));

      const request = createMockFetch({ status: 200, ok: true, body: {} });
      await requestFromAPI(endpoint, { request });

      expect(handleError).toHaveBeenCalled();
      expect(request).not.toHaveBeenCalled();
    });

    it('should propagate postResponse errors to handleError', async () => {
      mockRunPostResponse.mockRejectedValue(new Error('postResponse exploded'));

      const request = createMockFetch({ status: 200, ok: true, body: {} });
      await requestFromAPI(endpoint, { request });

      expect(handleError).toHaveBeenCalled();
    });

    it('should throw preRequest error when notifyOnError is false', async () => {
      mockRunPreRequest.mockRejectedValue(new Error('preRequest exploded'));

      const request = createMockFetch({ status: 200, ok: true, body: {} });
      const error = await requestFromAPI(endpoint, {
        request,
        notifyOnError: false,
      }).catch((e) => e);

      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('preRequest exploded');
    });
  });

  describe('long query bypass', () => {
    it('should still call postResponse on synthetic 414 response', async () => {
      const longQuery = 'x'.repeat(20000);
      const request = createMockFetch({ status: 200, ok: true, body: {} });

      await requestFromAPI(endpoint, {
        request,
        params: { query: longQuery },
      });

      expect(request).not.toHaveBeenCalled();
      expect(mockRunPostResponse).toHaveBeenCalledTimes(1);

      const postResponseCall = mockRunPostResponse.mock.calls[0];
      const response = postResponseCall[0];
      expect(response.status).toBe(414);
    });
  });

  describe('settings endpoint', () => {
    it('should still run preRequest for settings endpoint', async () => {
      const settingsEndpoint = '/api/v1/settings';
      const request = createMockFetch({
        status: 200,
        ok: true,
        body: { Auth: { Enabled: true } },
      });

      await requestFromAPI(settingsEndpoint, { request });

      expect(mockRunPreRequest).toHaveBeenCalledTimes(1);
    });
  });

  describe('error handling unchanged', () => {
    it('should call onError when response is not ok', async () => {
      const onError = vi.fn();
      const errorBody = { message: 'forbidden' };
      const request = createMockFetch({
        status: 403,
        ok: false,
        statusText: 'Forbidden',
        body: errorBody,
      });

      await requestFromAPI(endpoint, { request, onError });

      expect(onError).toHaveBeenCalledWith({
        body: errorBody,
        status: 403,
        statusText: 'Forbidden',
      });
    });

    it('should call handleError when no onError provided', async () => {
      const request = createMockFetch({
        status: 500,
        ok: false,
        statusText: 'Internal Server Error',
        body: { message: 'error' },
      });

      await requestFromAPI(endpoint, { request });

      expect(handleError).toHaveBeenCalled();
    });
  });
});
