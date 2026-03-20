import { describe, expect, it, vi } from 'vitest';

import {
  getAccessToken,
  getIdToken,
  initTokenProvider,
  runPostResponse,
  runPreRequest,
} from './token-provider';

describe('token-provider', () => {
  describe('getAccessToken', () => {
    it('should return token from provided getAccessToken function', async () => {
      initTokenProvider({
        getAccessToken: async () => 'my-token',
      });

      const token = await getAccessToken();
      expect(token).toBe('my-token');
    });
  });

  describe('getIdToken', () => {
    it('should return token from provided getIdToken function', async () => {
      initTokenProvider({
        getAccessToken: async () => 'access',
        getIdToken: async () => 'id-token',
      });

      const idToken = await getIdToken();
      expect(idToken).toBe('id-token');
    });

    it('should return undefined when getIdToken is not provided', async () => {
      initTokenProvider({
        getAccessToken: async () => 'access',
      });

      const idToken = await getIdToken();
      expect(idToken).toBeUndefined();
    });
  });

  describe('runPreRequest', () => {
    it('should call the provided preRequest hook', async () => {
      initTokenProvider({
        getAccessToken: async () => 'token',
        preRequest: async (ctx) => ({
          ...ctx,
          options: {
            ...ctx.options,
            headers: { Authorization: 'Bearer injected' },
          },
        }),
      });

      const result = await runPreRequest({
        url: '/api/test',
        options: {},
      });

      expect(
        (result.options.headers as Record<string, string>)['Authorization'],
      ).toBe('Bearer injected');
    });

    it('should pass through when no preRequest hook is provided', async () => {
      initTokenProvider({
        getAccessToken: async () => 'token',
      });

      const context = { url: '/api/test', options: { method: 'GET' } };
      const result = await runPreRequest(context);

      expect(result).toEqual(context);
    });
  });

  describe('runPostResponse', () => {
    it('should call the provided postResponse hook', async () => {
      const retryResponse = new Response('retried', { status: 200 });
      const retry = vi.fn().mockResolvedValue(retryResponse);

      initTokenProvider({
        getAccessToken: async () => 'token',
        postResponse: async (response, context) => {
          if (response.status === 401) {
            return context.retry();
          }
          return response;
        },
      });

      const unauthorizedResponse = new Response('unauthorized', {
        status: 401,
      });
      const result = await runPostResponse(unauthorizedResponse, {
        url: '/api/test',
        options: {},
        retry,
      });

      expect(retry).toHaveBeenCalled();
      expect(result.status).toBe(200);
    });

    it('should pass through when no postResponse hook is provided', async () => {
      initTokenProvider({
        getAccessToken: async () => 'token',
      });

      const response = new Response('ok', { status: 200 });
      const result = await runPostResponse(response, {
        url: '/api/test',
        options: {},
        retry: vi.fn(),
      });

      expect(result).toBe(response);
    });

    it('should not retry on non-401 responses when hook checks status', async () => {
      const retry = vi.fn();

      initTokenProvider({
        getAccessToken: async () => 'token',
        postResponse: async (response, context) => {
          if (response.status === 401) return context.retry();
          return response;
        },
      });

      const response = new Response('forbidden', { status: 403 });
      const result = await runPostResponse(response, {
        url: '/api/test',
        options: {},
        retry,
      });

      expect(retry).not.toHaveBeenCalled();
      expect(result.status).toBe(403);
    });
  });

  describe('dependency injection', () => {
    it('should allow swapping providers at runtime', async () => {
      initTokenProvider({
        getAccessToken: async () => 'first',
      });
      expect(await getAccessToken()).toBe('first');

      initTokenProvider({
        getAccessToken: async () => 'second',
      });
      expect(await getAccessToken()).toBe('second');
    });
  });
});
