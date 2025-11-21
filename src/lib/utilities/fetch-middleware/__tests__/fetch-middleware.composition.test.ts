import type { MockedFunction } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { composeFetchMiddleware } from '../composer.js';
import type { Interceptor } from '../types.js';

describe('Fetch Middleware - Composition and Async Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    global.fetch = vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify({ success: true }), {
          headers: { 'content-type': 'application/json' },
        }),
      ),
    ) as MockedFunction<typeof fetch>;
  });

  it('should execute interceptors in correct order (first to last)', async () => {
    const executionOrder: string[] = [];

    const firstInterceptor: Interceptor = (next) => async (req) => {
      executionOrder.push('first-start');
      const response = await next(req);
      executionOrder.push('first-end');
      return response;
    };

    const secondInterceptor: Interceptor = (next) => async (req) => {
      executionOrder.push('second-start');
      const response = await next(req);
      executionOrder.push('second-end');
      return response;
    };

    const thirdInterceptor: Interceptor = (next) => async (req) => {
      executionOrder.push('third-start');
      const response = await next(req);
      executionOrder.push('third-end');
      return response;
    };

    const composedFetch = composeFetchMiddleware([
      firstInterceptor,
      secondInterceptor,
      thirdInterceptor,
    ]);
    const request = new Request('https://api.example.com');

    await composedFetch(request);

    expect(executionOrder).toEqual([
      'first-start',
      'second-start',
      'third-start',
      'third-end',
      'second-end',
      'first-end',
    ]);
  });

  it('should handle async interceptors correctly', async () => {
    const delays: number[] = [];
    const startTimes: number[] = [];

    const asyncInterceptor1: Interceptor = (next) => async (req) => {
      const start = Date.now();
      startTimes.push(start);
      await new Promise((resolve) => setTimeout(resolve, 10));
      const response = await next(req);
      delays.push(Date.now() - start);
      return response;
    };

    const asyncInterceptor2: Interceptor = (next) => async (req) => {
      const start = Date.now();
      startTimes.push(start);
      await new Promise((resolve) => setTimeout(resolve, 20));
      const response = await next(req);
      delays.push(Date.now() - start);
      return response;
    };

    const composedFetch = composeFetchMiddleware([
      asyncInterceptor1,
      asyncInterceptor2,
    ]);
    const request = new Request('https://api.example.com');

    const start = Date.now();
    await composedFetch(request);
    const totalTime = Date.now() - start;

    expect(delays).toHaveLength(2);
    expect(delays[0]).toBeGreaterThanOrEqual(10);
    expect(delays[1]).toBeGreaterThanOrEqual(20);
    expect(totalTime).toBeGreaterThanOrEqual(30);
  });

  it('should handle error propagation through middleware chain', async () => {
    const networkError = new Error('Network failure');
    global.fetch = vi.fn(() => Promise.reject(networkError)) as MockedFunction<
      typeof fetch
    >;

    const errorHandlingInterceptor: Interceptor = (next) => async (req) => {
      try {
        return await next(req);
      } catch (error) {
        expect(error).toBe(networkError);
        return new Response(JSON.stringify({ error: 'Fallback response' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    };

    const loggingInterceptor: Interceptor = (next) => async (req) => {
      req.headers.set('X-Attempt', '1');
      const response = await next(req);
      expect(response.status).toBe(500);
      return response;
    };

    const composedFetch = composeFetchMiddleware([
      loggingInterceptor,
      errorHandlingInterceptor,
    ]);
    const request = new Request('https://api.example.com');

    const response = await composedFetch(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Fallback response');
  });

  it('should handle early termination scenarios', async () => {
    let fetchWasCalled = false;
    global.fetch = vi.fn(() => {
      fetchWasCalled = true;
      return Promise.resolve(new Response('Should not reach here'));
    }) as MockedFunction<typeof fetch>;

    const earlyReturn: Interceptor = (next) => async (req) => {
      if (req.headers.get('X-Skip') === 'true') {
        return new Response(JSON.stringify({ skipped: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return next(req);
    };

    const shouldNotExecute: Interceptor = (next) => async (req) => {
      req.headers.set('X-Should-Not-Set', 'true');
      return next(req);
    };

    const composedFetch = composeFetchMiddleware([
      earlyReturn,
      shouldNotExecute,
    ]);
    const request = new Request('https://api.example.com', {
      headers: { 'X-Skip': 'true' },
    });

    const response = await composedFetch(request);
    const data = await response.json();

    expect(fetchWasCalled).toBe(false);
    expect(data.skipped).toBe(true);
    expect(response.status).toBe(200);
  });

  it('should handle empty interceptor array', async () => {
    const composedFetch = composeFetchMiddleware([]);
    const request = new Request('https://api.example.com');

    const response = await composedFetch(request);

    expect(global.fetch).toHaveBeenCalledWith(request);
    expect(response).toBeDefined();
  });

  it("should handle interceptors that don't call next", async () => {
    let fetchWasCalled = false;
    global.fetch = vi.fn(() => {
      fetchWasCalled = true;
      return Promise.resolve(new Response('Should not reach'));
    }) as MockedFunction<typeof fetch>;

    const blockingInterceptor: Interceptor = (_next) => async (_req) => {
      return new Response(JSON.stringify({ blocked: true }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    const afterBlocker: Interceptor = (next) => async (req) => {
      req.headers.set('X-After-Blocker', 'true');
      return next(req);
    };

    const composedFetch = composeFetchMiddleware([
      afterBlocker,
      blockingInterceptor,
    ]);
    const request = new Request('https://api.example.com');

    const response = await composedFetch(request);
    const data = await response.json();

    expect(fetchWasCalled).toBe(false);
    expect(data.blocked).toBe(true);
    expect(response.status).toBe(403);
  });

  it('should handle promise rejections in interceptors', async () => {
    const interceptorError = new Error('Interceptor failed');

    const failingInterceptor: Interceptor = (_next) => async (_req) => {
      throw interceptorError;
    };

    const composedFetch = composeFetchMiddleware([failingInterceptor]);
    const request = new Request('https://api.example.com');

    await expect(composedFetch(request)).rejects.toThrow('Interceptor failed');
  });

  it('should handle complex async operations with multiple promises', async () => {
    let dbCheckComplete = false;
    let cacheCheckComplete = false;

    const databaseCheck: Interceptor = (next) => async (req) => {
      await new Promise((resolve) => setTimeout(resolve, 15));
      dbCheckComplete = true;
      req.headers.set('X-DB-Check', 'passed');
      return next(req);
    };

    const cacheCheck: Interceptor = (next) => async (req) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      cacheCheckComplete = true;
      req.headers.set('X-Cache-Check', 'passed');
      return next(req);
    };

    const composedFetch = composeFetchMiddleware([databaseCheck, cacheCheck]);
    const request = new Request('https://api.example.com');

    const response = await composedFetch(request);

    expect(dbCheckComplete).toBe(true);
    expect(cacheCheckComplete).toBe(true);
    expect(response).toBeDefined();

    const mockedFetch = global.fetch as MockedFunction<typeof fetch>;
    const calledRequest = mockedFetch.mock.calls[0][0] as Request;
    expect(calledRequest.headers.get('X-DB-Check')).toBe('passed');
    expect(calledRequest.headers.get('X-Cache-Check')).toBe('passed');
  });

  it('should preserve request context through async operations', async () => {
    const contextData = { userId: '123', sessionId: 'abc' };

    const contextSetter: Interceptor = (next) => async (req) => {
      req.headers.set('X-Context', JSON.stringify(contextData));
      req.headers.set('X-User-ID', contextData.userId);
      return next(req);
    };

    const contextReader: Interceptor = (next) => async (req) => {
      await new Promise((resolve) => setTimeout(resolve, 5));
      const storedContext = JSON.parse(req.headers.get('X-Context') || '{}');
      expect(storedContext).toEqual(contextData);
      expect(req.headers.get('X-User-ID')).toBe('123');
      return next(req);
    };

    const composedFetch = composeFetchMiddleware([
      contextSetter,
      contextReader,
    ]);
    const request = new Request('https://api.example.com');

    await composedFetch(request);

    const mockedFetch = global.fetch as MockedFunction<typeof fetch>;
    const calledRequest = mockedFetch.mock.calls[0][0] as Request;
    expect(calledRequest.headers.get('X-User-ID')).toBe('123');
  });
});
