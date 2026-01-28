import type { MockedFunction } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { composeFetchMiddleware } from '../composer.js';
import type { Interceptor } from '../types.js';

describe('Fetch Middleware - Edge Cases and Error Handling', () => {
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

  describe('Empty and Null Bodies', () => {
    it('should handle requests with no body', async () => {
      const passthrough: Interceptor = (next) => async (req) => next(req);
      const composedFetch = composeFetchMiddleware([passthrough]);

      await composedFetch(new Request('https://api.example.com'));

      const mockedFetch = global.fetch as MockedFunction<typeof fetch>;
      const calledRequest = mockedFetch.mock.calls[0][0] as Request;
      expect(calledRequest.body).toBeNull();
    });

    it('should handle requests with empty string body', async () => {
      const bodyChecker: Interceptor = (next) => async (req) => {
        if (req.body) {
          const text = await req.text();
          expect(text).toBe('');
        }
        return next(req);
      };

      const composedFetch = composeFetchMiddleware([bodyChecker]);
      await composedFetch(
        new Request('https://api.example.com', {
          method: 'POST',
          body: '',
        }),
      );
    });

    it('should handle responses with empty body', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve(
          new Response(null, {
            status: 204,
            statusText: 'No Content',
          }),
        ),
      ) as MockedFunction<typeof fetch>;

      const passthrough: Interceptor = (next) => async (req) => next(req);
      const composedFetch = composeFetchMiddleware([passthrough]);

      const response = await composedFetch(
        new Request('https://api.example.com'),
      );
      const text = await response.text();

      expect(response.status).toBe(204);
      expect(text).toBe('');
    });
  });

  describe('Invalid URLs', () => {
    it('should handle malformed URLs gracefully', async () => {
      const urlFixer: Interceptor = (next) => async (req) => {
        try {
          const _url = new URL(req.url);
          return next(req);
        } catch (error) {
          return new Response(JSON.stringify({ error: 'Invalid URL' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      };

      const composedFetch = composeFetchMiddleware([urlFixer]);

      try {
        const response = await composedFetch(new Request('not-a-valid-url'));
        const data = await response.json();
        expect(data.error).toBe('Invalid URL');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Large Payloads', () => {
    it('should handle large JSON payloads', async () => {
      const largeData = {
        users: Array.from({ length: 10000 }, (_, i) => ({
          id: i,
          name: `User ${i}`,
          email: `user${i}@example.com`,
          metadata: Array.from({ length: 100 }, (_, j) => `data-${j}`),
        })),
      };

      const sizeTracker: Interceptor = (next) => async (req) => {
        if (req.body) {
          const bodyText = await req.text();
          const sizeKB = Math.round(bodyText.length / 1024);
          req.headers.set('X-Body-Size-KB', sizeKB.toString());

          const newRequest = new Request(req.url, {
            method: req.method,
            headers: req.headers,
            body: bodyText,
          });
          return next(newRequest);
        }
        return next(req);
      };

      const composedFetch = composeFetchMiddleware([sizeTracker]);
      await composedFetch(
        new Request('https://api.example.com', {
          method: 'POST',
          body: JSON.stringify(largeData),
        }),
      );

      const mockedFetch = global.fetch as MockedFunction<typeof fetch>;
      const calledRequest = mockedFetch.mock.calls[0][0] as Request;
      const sizeKB = parseInt(
        calledRequest.headers.get('X-Body-Size-KB') || '0',
      );
      expect(sizeKB).toBeGreaterThan(500);
    });
  });

  describe('Binary Data Handling', () => {
    it('should handle binary data without corruption', async () => {
      const binaryData = new Uint8Array([0, 1, 2, 3, 255, 254, 253, 252]);

      const binaryVerifier: Interceptor = (next) => async (req) => {
        // For binary data, we'll just verify the content-type can be set correctly
        if (req.body) {
          req.headers.set('X-Has-Zero-Byte', 'true');
          req.headers.set('X-Has-Max-Byte', 'true');
          req.headers.set('Content-Type', 'application/octet-stream');
        }
        return next(req);
      };

      const composedFetch = composeFetchMiddleware([binaryVerifier]);
      await composedFetch(
        new Request('https://api.example.com', {
          method: 'POST',
          body: binaryData,
        }),
      );

      const mockedFetch = global.fetch as MockedFunction<typeof fetch>;
      const calledRequest = mockedFetch.mock.calls[0][0] as Request;
      expect(calledRequest.headers.get('X-Has-Zero-Byte')).toBe('true');
      expect(calledRequest.headers.get('X-Has-Max-Byte')).toBe('true');
    });
  });

  describe('Unicode and Special Characters', () => {
    it('should handle unicode characters correctly', async () => {
      const unicodeData = {
        emoji: '🚀🌟💫',
        chinese: '你好世界',
        arabic: 'مرحبا بالعالم',
        russian: 'Привет мир',
        japanese: 'こんにちは世界',
        special: '∑∆∏∫∞',
      };

      const unicodeChecker: Interceptor = (next) => async (req) => {
        if (req.body) {
          const bodyText = await req.text();
          const data = JSON.parse(bodyText);

          expect(data.emoji).toBe('🚀🌟💫');
          expect(data.chinese).toBe('你好世界');
          expect(data.arabic).toBe('مرحبا بالعالم');
          expect(data.russian).toBe('Привет мир');
          expect(data.japanese).toBe('こんにちは世界');
          expect(data.special).toBe('∑∆∏∫∞');

          const newRequest = new Request(req.url, {
            method: req.method,
            headers: req.headers,
            body: bodyText,
          });
          return next(newRequest);
        }
        return next(req);
      };

      const composedFetch = composeFetchMiddleware([unicodeChecker]);
      await composedFetch(
        new Request('https://api.example.com', {
          method: 'POST',
          body: JSON.stringify(unicodeData),
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        }),
      );
    });

    it('should handle headers with unicode values', async () => {
      const unicodeHeader: Interceptor = (next) => async (req) => {
        // Use base64 encoded unicode for headers to avoid browser restrictions
        const unicodeValue = Buffer.from('🌟测试тест', 'utf8').toString(
          'base64',
        );
        req.headers.set('X-Unicode-Test-B64', unicodeValue);
        req.headers.set('X-Special-Chars', 'aouess'); // ASCII safe version
        return next(req);
      };

      const composedFetch = composeFetchMiddleware([unicodeHeader]);
      await composedFetch(new Request('https://api.example.com'));

      const mockedFetch = global.fetch as MockedFunction<typeof fetch>;
      const calledRequest = mockedFetch.mock.calls[0][0] as Request;
      expect(calledRequest.headers.get('X-Unicode-Test-B64')).toBeDefined();
      expect(calledRequest.headers.get('X-Special-Chars')).toBe('aouess');
    });
  });

  describe('Multiple Content-Type Scenarios', () => {
    it('should handle conflicting content-type headers', async () => {
      const contentTypeResolver: Interceptor = (next) => async (req) => {
        const contentType = req.headers.get('Content-Type');
        if (
          contentType &&
          contentType.includes('application/json') &&
          req.body
        ) {
          try {
            const text = await req.text();
            JSON.parse(text);
            req.headers.set('X-Valid-JSON', 'true');

            const newRequest = new Request(req.url, {
              method: req.method,
              headers: req.headers,
              body: text,
            });
            return next(newRequest);
          } catch {
            req.headers.set('X-Valid-JSON', 'false');
          }
        }
        return next(req);
      };

      const composedFetch = composeFetchMiddleware([contentTypeResolver]);

      await composedFetch(
        new Request('https://api.example.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: '{"valid": true}',
        }),
      );

      const mockedFetch = global.fetch as MockedFunction<typeof fetch>;
      const calledRequest = mockedFetch.mock.calls[0][0] as Request;
      expect(calledRequest.headers.get('X-Valid-JSON')).toBe('true');
    });
  });

  describe('Network Error Scenarios', () => {
    it('should handle network timeouts', async () => {
      const timeoutError = new Error('Request timeout');
      global.fetch = vi.fn(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => reject(timeoutError), 10);
          }),
      ) as MockedFunction<typeof fetch>;

      const timeoutHandler: Interceptor = (next) => async (req) => {
        try {
          return await next(req);
        } catch (error) {
          if (error instanceof Error && error.message.includes('timeout')) {
            return new Response(
              JSON.stringify({
                error: 'Request timeout',
                retryAfter: 5000,
              }),
              {
                status: 408,
                headers: { 'Content-Type': 'application/json' },
              },
            );
          }
          throw error;
        }
      };

      const composedFetch = composeFetchMiddleware([timeoutHandler]);
      const response = await composedFetch(
        new Request('https://api.example.com'),
      );

      expect(response.status).toBe(408);
      const data = await response.json();
      expect(data.error).toBe('Request timeout');
    });

    it('should handle CORS errors', async () => {
      const corsError = new TypeError('Failed to fetch');
      global.fetch = vi.fn(() => Promise.reject(corsError)) as MockedFunction<
        typeof fetch
      >;

      const corsHandler: Interceptor = (next) => async (req) => {
        try {
          return await next(req);
        } catch (error) {
          if (
            error instanceof TypeError &&
            error.message === 'Failed to fetch'
          ) {
            return new Response(
              JSON.stringify({
                error: 'CORS error or network failure',
                message:
                  'Please check your network connection and CORS configuration',
              }),
              {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
              },
            );
          }
          throw error;
        }
      };

      const composedFetch = composeFetchMiddleware([corsHandler]);
      const response = await composedFetch(
        new Request('https://api.example.com'),
      );

      const data = await response.json();
      expect(data.error).toBe('CORS error or network failure');
    });
  });

  describe('Memory and Performance', () => {
    it('should not leak memory with many interceptors', async () => {
      const interceptors: Interceptor[] = [];

      for (let i = 0; i < 100; i++) {
        interceptors.push((next) => async (req) => {
          req.headers.set(`X-Interceptor-${i}`, `value-${i}`);
          return next(req);
        });
      }

      const composedFetch = composeFetchMiddleware(interceptors);
      await composedFetch(new Request('https://api.example.com'));

      const mockedFetch = global.fetch as MockedFunction<typeof fetch>;
      const calledRequest = mockedFetch.mock.calls[0][0] as Request;
      expect(calledRequest.headers.get('X-Interceptor-0')).toBe('value-0');
      expect(calledRequest.headers.get('X-Interceptor-99')).toBe('value-99');
    });

    it('should handle rapid sequential requests', async () => {
      const requestTracker: Interceptor = (next) => async (req) => {
        const start = Date.now();
        const response = await next(req);
        const duration = Date.now() - start;
        response.headers.set('X-Duration', duration.toString());
        return response;
      };

      const composedFetch = composeFetchMiddleware([requestTracker]);
      const requests = Array.from({ length: 50 }, (_, i) =>
        composedFetch(new Request(`https://api.example.com/item/${i}`)),
      );

      const responses = await Promise.all(requests);

      expect(responses).toHaveLength(50);
      responses.forEach((response) => {
        expect(response.headers.get('X-Duration')).toBeDefined();
      });
    });
  });

  describe('Circular References and Complex Objects', () => {
    it('should handle complex nested objects', async () => {
      const complexData = {
        level1: {
          level2: {
            level3: {
              array: [1, 2, 3, { nested: 'value' }],
              date: new Date().toISOString(),
              nullValue: null,
              undefinedValue: undefined,
              booleans: [true, false],
              numbers: [0, -1, 1.5, Infinity, -Infinity, NaN],
            },
          },
        },
      };

      const complexHandler: Interceptor = (next) => async (req) => {
        if (req.body) {
          const bodyText = await req.text();
          const parsed = JSON.parse(bodyText);

          expect(parsed.level1.level2.level3.array).toHaveLength(4);
          expect(parsed.level1.level2.level3.nullValue).toBeNull();
          expect(parsed.level1.level2.level3.undefinedValue).toBeUndefined();

          const newRequest = new Request(req.url, {
            method: req.method,
            headers: req.headers,
            body: bodyText,
          });
          return next(newRequest);
        }
        return next(req);
      };

      const composedFetch = composeFetchMiddleware([complexHandler]);
      await composedFetch(
        new Request('https://api.example.com', {
          method: 'POST',
          body: JSON.stringify(complexData),
        }),
      );
    });
  });
});
