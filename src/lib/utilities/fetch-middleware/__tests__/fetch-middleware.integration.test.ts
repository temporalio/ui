import type { MockedFunction } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { composeFetchMiddleware } from '../composer.js';
import type { Interceptor } from '../types.js';

describe('Fetch Middleware - Integration Tests', () => {
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

  describe('Real-world Scenarios', () => {
    it('should handle authentication + logging + error handling pipeline', async () => {
      const logs: string[] = [];

      const authenticator: Interceptor = (next) => async (req) => {
        const accessToken = 'mock-access-token';
        req.headers.set('Authorization', `Bearer ${accessToken}`);
        logs.push('Authentication added');

        const response = await next(req);
        logs.push('Authentication completed');

        return response;
      };

      const logger: Interceptor = (next) => async (req) => {
        const startTime = Date.now();
        logs.push(`Request started: ${req.method} ${req.url}`);

        try {
          const response = await next(req);
          const duration = Date.now() - startTime;
          logs.push(`Request completed: ${response.status} in ${duration}ms`);
          return response;
        } catch (error) {
          const duration = Date.now() - startTime;
          logs.push(`Request failed: ${error} after ${duration}ms`);
          throw error;
        }
      };

      const errorHandler: Interceptor = (next) => async (req) => {
        try {
          const response = await next(req);

          if (!response.ok) {
            logs.push(`Error response: ${response.status}`);
            const errorData = await response.clone().json();

            const enhancedResponse = new Response(
              JSON.stringify({
                ...errorData,
                timestamp: new Date().toISOString(),
                requestId: Math.random().toString(36),
              }),
              {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
              },
            );

            return enhancedResponse;
          }

          return response;
        } catch (error) {
          logs.push(`Network error caught: ${error}`);
          return new Response(
            JSON.stringify({
              error: 'Network failure',
              fallback: true,
              timestamp: new Date().toISOString(),
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            },
          );
        }
      };

      const composedFetch = composeFetchMiddleware([
        authenticator,
        logger,
        errorHandler,
      ]);
      const request = new Request('https://api.example.com/users');

      const response = await composedFetch(request);

      expect(response.status).toBe(200);
      expect(logs).toContain('Authentication added');
      expect(logs).toContain(
        'Request started: GET https://api.example.com/users',
      );
      expect(logs).toContain('Authentication completed');
      expect(logs.some((log) => log.includes('Request completed: 200'))).toBe(
        true,
      );

      const mockedFetch = global.fetch as MockedFunction<typeof fetch>;
      const calledRequest = mockedFetch.mock.calls[0][0] as Request;
      expect(calledRequest.headers.get('Authorization')).toBe(
        'Bearer mock-access-token',
      );
    });

    it('should handle data transformation pipeline', async () => {
      const originalData = { temperature: 25, unit: 'celsius' };
      global.fetch = vi.fn(() =>
        Promise.resolve(new Response(JSON.stringify(originalData))),
      ) as MockedFunction<typeof fetch>;

      const addMetadata: Interceptor = (next) => async (req) => {
        req.headers.set('X-Client', 'web-app');
        req.headers.set('X-Version', '1.0.0');
        req.headers.set('X-Timestamp', Date.now().toString());
        return next(req);
      };

      const transformResponse: Interceptor = (next) => async (req) => {
        const response = await next(req);
        const data = await response.json();

        if (data.temperature && data.unit === 'celsius') {
          const fahrenheit = (data.temperature * 9) / 5 + 32;
          const transformedData = {
            ...data,
            fahrenheit,
            conversions: {
              kelvin: data.temperature + 273.15,
              fahrenheit,
            },
            metadata: {
              converted: true,
              convertedAt: new Date().toISOString(),
            },
          };

          return new Response(JSON.stringify(transformedData), {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          });
        }

        return response;
      };

      const composedFetch = composeFetchMiddleware([
        addMetadata,
        transformResponse,
      ]);
      const response = await composedFetch(
        new Request('https://api.weather.com/current'),
      );
      const finalData = await response.json();

      expect(finalData.temperature).toBe(25);
      expect(finalData.fahrenheit).toBe(77);
      expect(finalData.conversions.kelvin).toBe(298.15);
      expect(finalData.metadata.converted).toBe(true);

      const mockedFetch = global.fetch as MockedFunction<typeof fetch>;
      const calledRequest = mockedFetch.mock.calls[0][0] as Request;
      expect(calledRequest.headers.get('X-Client')).toBe('web-app');
      expect(calledRequest.headers.get('X-Version')).toBe('1.0.0');
    });

    it('should handle retry logic with backoff', async () => {
      let attemptCount = 0;
      const maxRetries = 3;

      global.fetch = vi.fn(() => {
        attemptCount++;
        if (attemptCount < 3) {
          return Promise.resolve(new Response('Server Error', { status: 500 }));
        }
        return Promise.resolve(new Response(JSON.stringify({ success: true })));
      }) as MockedFunction<typeof fetch>;

      const retryWithBackoff: Interceptor = (next) => async (req) => {
        let attempts = 0;

        while (attempts <= maxRetries) {
          try {
            const response = await next(req);

            if (response.ok || attempts === maxRetries) {
              if (attempts > 0) {
                const newHeaders = new Headers(response.headers);
                newHeaders.set('X-Retry-Count', attempts.toString());

                return new Response(response.body, {
                  status: response.status,
                  statusText: response.statusText,
                  headers: newHeaders,
                });
              }
              return response;
            }

            attempts++;
            const backoffTime = Math.pow(2, attempts) * 100; // Exponential backoff
            await new Promise((resolve) => setTimeout(resolve, backoffTime));
          } catch (error) {
            if (attempts === maxRetries) throw error;
            attempts++;
            const backoffTime = Math.pow(2, attempts) * 100;
            await new Promise((resolve) => setTimeout(resolve, backoffTime));
          }
        }

        throw new Error('Max retries exceeded');
      };

      const composedFetch = composeFetchMiddleware([retryWithBackoff]);
      const response = await composedFetch(
        new Request('https://api.example.com/flaky'),
      );

      expect(response.ok).toBe(true);
      expect(response.headers.get('X-Retry-Count')).toBe('2');
      expect(attemptCount).toBe(3);
    });
  });

  describe('Context Integration', () => {
    it('should work with middleware composition directly', () => {
      const testInterceptors: Interceptor[] = [
        (next) => async (req) => {
          req.headers.set('X-Context-Test', 'true');
          return next(req);
        },
      ];

      const composedFetch = composeFetchMiddleware(testInterceptors);
      expect(composedFetch).toBeDefined();
      expect(typeof composedFetch).toBe('function');
    });

    it('should handle empty interceptor arrays', () => {
      const composedFetch = composeFetchMiddleware([]);
      expect(composedFetch).toBeDefined();
      expect(typeof composedFetch).toBe('function');
    });
  });

  describe('Complex Middleware Combinations', () => {
    it('should handle caching + compression + authentication', async () => {
      const cache = new Map<string, Response>();

      const cacheMiddleware: Interceptor = (next) => async (req) => {
        const cacheKey = `${req.method}:${req.url}`;

        if (req.method === 'GET' && cache.has(cacheKey)) {
          const cachedResponse = cache.get(cacheKey)!;
          const clonedResponse = cachedResponse.clone();
          clonedResponse.headers.set('X-Cache', 'HIT');
          return clonedResponse;
        }

        const response = await next(req);

        if (req.method === 'GET' && response.ok) {
          cache.set(cacheKey, response.clone());
        }

        response.headers.set('X-Cache', 'MISS');
        return response;
      };

      const compressionMiddleware: Interceptor = (next) => async (req) => {
        req.headers.set('Accept-Encoding', 'gzip, deflate, br');
        const response = await next(req);

        if (response.headers.get('Content-Encoding')) {
          response.headers.set('X-Compressed', 'true');
        }

        return response;
      };

      const authMiddleware: Interceptor = (next) => async (req) => {
        req.headers.set('Authorization', 'Bearer complex-token');
        return next(req);
      };

      const composedFetch = composeFetchMiddleware([
        cacheMiddleware,
        compressionMiddleware,
        authMiddleware,
      ]);

      // First request - cache miss
      const response1 = await composedFetch(
        new Request('https://api.example.com/data'),
      );
      expect(response1.headers.get('X-Cache')).toBe('MISS');

      // Second request - cache hit
      const response2 = await composedFetch(
        new Request('https://api.example.com/data'),
      );
      expect(response2.headers.get('X-Cache')).toBe('HIT');

      // Verify auth was applied
      const mockedFetch = global.fetch as MockedFunction<typeof fetch>;
      const calledRequest = mockedFetch.mock.calls[0][0] as Request;
      expect(calledRequest.headers.get('Authorization')).toBe(
        'Bearer complex-token',
      );
      expect(calledRequest.headers.get('Accept-Encoding')).toBe(
        'gzip, deflate, br',
      );
    });

    it('should handle request/response transformation chain', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify({ items: [1, 2, 3, 4, 5] })),
        ),
      ) as MockedFunction<typeof fetch>;

      const addPagination: Interceptor = (next) => async (req) => {
        const url = new URL(req.url);
        if (!url.searchParams.has('page')) {
          url.searchParams.set('page', '1');
        }
        if (!url.searchParams.has('limit')) {
          url.searchParams.set('limit', '10');
        }

        const newRequest = new Request(url.toString(), {
          method: req.method,
          headers: req.headers,
          body: req.body,
        });

        return next(newRequest);
      };

      const addRequestId: Interceptor = (next) => async (req) => {
        req.headers.set('X-Request-ID', Math.random().toString(36));
        return next(req);
      };

      const enhanceResponse: Interceptor = (next) => async (req) => {
        const response = await next(req);
        const data = await response.json();

        const enhancedData = {
          ...data,
          metadata: {
            requestId: req.headers.get('X-Request-ID'),
            timestamp: new Date().toISOString(),
            totalItems: data.items?.length || 0,
          },
        };

        return new Response(JSON.stringify(enhancedData), {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      };

      const composedFetch = composeFetchMiddleware([
        addPagination,
        addRequestId,
        enhanceResponse,
      ]);

      const response = await composedFetch(
        new Request('https://api.example.com/items'),
      );
      const data = await response.json();

      expect(data.items).toEqual([1, 2, 3, 4, 5]);
      expect(data.metadata.totalItems).toBe(5);
      expect(data.metadata.requestId).toBeDefined();
      expect(data.metadata.timestamp).toBeDefined();

      const mockedFetch = global.fetch as MockedFunction<typeof fetch>;
      const calledRequest = mockedFetch.mock.calls[0][0] as Request;
      expect(new URL(calledRequest.url).searchParams.get('page')).toBe('1');
      expect(new URL(calledRequest.url).searchParams.get('limit')).toBe('10');
    });
  });

  describe('Error Recovery Scenarios', () => {
    it('should handle cascading failures with fallbacks', async () => {
      let primaryFailed = false;
      let _secondaryFailed = false;

      const fallbackMiddleware: Interceptor = (next) => async (req) => {
        try {
          return await next(req);
        } catch (error) {
          primaryFailed = true;

          // Try secondary endpoint
          try {
            const fallbackUrl = req.url.replace(
              'api.example.com',
              'backup.example.com',
            );
            const fallbackRequest = new Request(fallbackUrl, {
              method: req.method,
              headers: req.headers,
              body: req.body,
            });

            global.fetch = vi.fn(() =>
              Promise.resolve(new Response(JSON.stringify({ fallback: true }))),
            ) as MockedFunction<typeof fetch>;

            return await fetch(fallbackRequest);
          } catch (secondaryError) {
            _secondaryFailed = true;

            // Final fallback - return cached or default response
            return new Response(
              JSON.stringify({
                error: 'All endpoints failed',
                fallback: 'default',
                timestamp: new Date().toISOString(),
              }),
              {
                status: 503,
                headers: { 'Content-Type': 'application/json' },
              },
            );
          }
        }
      };

      // Simulate primary endpoint failure
      global.fetch = vi.fn(() =>
        Promise.reject(new Error('Primary endpoint down')),
      ) as MockedFunction<typeof fetch>;

      const composedFetch = composeFetchMiddleware([fallbackMiddleware]);
      const response = await composedFetch(
        new Request('https://api.example.com/data'),
      );
      const data = await response.json();

      expect(primaryFailed).toBe(true);
      expect(data.fallback).toBe(true);
    });
  });

  describe('Memory and Cleanup', () => {
    it('should properly cleanup resources after requests', async () => {
      const resources: { id: number; cleaned: boolean }[] = [];

      const resourceManager: Interceptor = (next) => async (req) => {
        const resource = { id: Math.random(), cleaned: false };
        resources.push(resource);

        try {
          const response = await next(req);

          // Cleanup after successful request
          resource.cleaned = true;

          return response;
        } catch (error) {
          // Cleanup after error
          resource.cleaned = true;
          throw error;
        }
      };

      const composedFetch = composeFetchMiddleware([resourceManager]);

      // Make multiple requests
      const requests = Array.from({ length: 10 }, (_, i) =>
        composedFetch(new Request(`https://api.example.com/item/${i}`)),
      );

      await Promise.all(requests);

      // Verify all resources were cleaned up
      expect(resources).toHaveLength(10);
      expect(resources.every((r) => r.cleaned)).toBe(true);
    });
  });
});
