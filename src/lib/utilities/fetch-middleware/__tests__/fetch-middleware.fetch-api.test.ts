import type { MockedFunction } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { composeFetchMiddleware } from '../composer.js';
import type { Interceptor } from '../types.js';

describe('Fetch Middleware - Fetch API Compatibility', () => {
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

  describe('Request Construction', () => {
    it('should handle URL string construction', async () => {
      const passthrough: Interceptor = (next) => async (req) => next(req);
      const composedFetch = composeFetchMiddleware([passthrough]);

      await composedFetch(new Request('https://api.example.com/users'));

      expect(global.fetch).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://api.example.com/users',
        }),
      );
    });

    it('should handle URL object construction', async () => {
      const passthrough: Interceptor = (next) => async (req) => next(req);
      const composedFetch = composeFetchMiddleware([passthrough]);
      const url = new URL('https://api.example.com/users');

      await composedFetch(new Request(url));

      expect(global.fetch).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://api.example.com/users',
        }),
      );
    });

    it('should handle Request object construction', async () => {
      const passthrough: Interceptor = (next) => async (req) => next(req);
      const composedFetch = composeFetchMiddleware([passthrough]);
      const originalRequest = new Request('https://api.example.com/users', {
        method: 'POST',
      });

      await composedFetch(new Request(originalRequest));

      expect(global.fetch).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://api.example.com/users',
          method: 'POST',
        }),
      );
    });
  });

  describe('Request Methods', () => {
    const methods = [
      'GET',
      'POST',
      'PUT',
      'DELETE',
      'PATCH',
      'HEAD',
      'OPTIONS',
    ];

    methods.forEach((method) => {
      it(`should handle ${method} requests`, async () => {
        const passthrough: Interceptor = (next) => async (req) => next(req);
        const composedFetch = composeFetchMiddleware([passthrough]);

        await composedFetch(new Request('https://api.example.com', { method }));

        const mockedFetch = global.fetch as MockedFunction<typeof fetch>;
        const calledRequest = mockedFetch.mock.calls[0][0] as Request;
        expect(calledRequest.method).toBe(method);
      });
    });
  });

  describe('Request Bodies', () => {
    it('should handle JSON bodies', async () => {
      const passthrough: Interceptor = (next) => async (req) => next(req);
      const composedFetch = composeFetchMiddleware([passthrough]);
      const jsonData = { name: 'John', age: 30 };

      await composedFetch(
        new Request('https://api.example.com', {
          method: 'POST',
          body: JSON.stringify(jsonData),
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const mockedFetch = global.fetch as MockedFunction<typeof fetch>;
      const calledRequest = mockedFetch.mock.calls[0][0] as Request;
      const bodyText = await calledRequest.text();
      expect(JSON.parse(bodyText)).toEqual(jsonData);
    });

    it('should handle FormData bodies', async () => {
      const passthrough: Interceptor = (next) => async (req) => next(req);
      const composedFetch = composeFetchMiddleware([passthrough]);
      const formData = new FormData();
      formData.append('username', 'john');
      formData.append('email', 'john@example.com');

      await composedFetch(
        new Request('https://api.example.com', {
          method: 'POST',
          body: formData,
        }),
      );

      const mockedFetch = global.fetch as MockedFunction<typeof fetch>;
      const calledRequest = mockedFetch.mock.calls[0][0] as Request;
      const sentFormData = await calledRequest.formData();
      expect(sentFormData.get('username')).toBe('john');
      expect(sentFormData.get('email')).toBe('john@example.com');
    });

    it('should handle URLSearchParams bodies', async () => {
      const passthrough: Interceptor = (next) => async (req) => next(req);
      const composedFetch = composeFetchMiddleware([passthrough]);
      const params = new URLSearchParams();
      params.append('key1', 'value1');
      params.append('key2', 'value2');

      await composedFetch(
        new Request('https://api.example.com', {
          method: 'POST',
          body: params,
        }),
      );

      const mockedFetch = global.fetch as MockedFunction<typeof fetch>;
      const calledRequest = mockedFetch.mock.calls[0][0] as Request;
      const bodyText = await calledRequest.text();
      expect(bodyText).toBe('key1=value1&key2=value2');
    });

    it('should handle Blob bodies', async () => {
      const passthrough: Interceptor = (next) => async (req) => next(req);
      const composedFetch = composeFetchMiddleware([passthrough]);
      const blob = new Blob(['Hello, World!'], { type: 'text/plain' });

      await composedFetch(
        new Request('https://api.example.com', {
          method: 'POST',
          body: blob,
        }),
      );

      const mockedFetch = global.fetch as MockedFunction<typeof fetch>;
      const calledRequest = mockedFetch.mock.calls[0][0] as Request;
      expect(calledRequest.body).toBeDefined();
    });

    it('should handle ArrayBuffer bodies', async () => {
      const passthrough: Interceptor = (next) => async (req) => next(req);
      const composedFetch = composeFetchMiddleware([passthrough]);
      const buffer = new ArrayBuffer(8);
      const view = new Uint8Array(buffer);
      view.set([1, 2, 3, 4, 5, 6, 7, 8]);

      await composedFetch(
        new Request('https://api.example.com', {
          method: 'POST',
          body: buffer,
        }),
      );

      const mockedFetch = global.fetch as MockedFunction<typeof fetch>;
      const calledRequest = mockedFetch.mock.calls[0][0] as Request;
      const sentBuffer = await calledRequest.arrayBuffer();
      const sentView = new Uint8Array(sentBuffer);
      expect(Array.from(sentView)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it('should handle string bodies', async () => {
      const passthrough: Interceptor = (next) => async (req) => next(req);
      const composedFetch = composeFetchMiddleware([passthrough]);
      const textBody = 'Hello, World!';

      await composedFetch(
        new Request('https://api.example.com', {
          method: 'POST',
          body: textBody,
        }),
      );

      const mockedFetch = global.fetch as MockedFunction<typeof fetch>;
      const calledRequest = mockedFetch.mock.calls[0][0] as Request;
      const bodyText = await calledRequest.text();
      expect(bodyText).toBe('Hello, World!');
    });
  });

  describe('Request Options', () => {
    it('should handle all request options', async () => {
      const passthrough: Interceptor = (next) => async (req) => next(req);
      const composedFetch = composeFetchMiddleware([passthrough]);

      await composedFetch(
        new Request('https://api.example.com', {
          method: 'POST',
          headers: { Authorization: 'Bearer token' },
          body: '{}',
          mode: 'cors',
          credentials: 'include',
          cache: 'no-cache',
          redirect: 'follow',
          referrer: 'https://example.com',
          integrity: 'sha256-abc123',
        }),
      );

      const mockedFetch = global.fetch as MockedFunction<typeof fetch>;
      const calledRequest = mockedFetch.mock.calls[0][0] as Request;
      expect(calledRequest.method).toBe('POST');
      expect(calledRequest.headers.get('Authorization')).toBe('Bearer token');
      expect(calledRequest.mode).toBe('cors');
      expect(calledRequest.credentials).toBe('include');
      expect(calledRequest.cache).toBe('no-cache');
      expect(calledRequest.redirect).toBe('follow');
      expect(calledRequest.referrer).toBe('https://example.com/');
      expect(calledRequest.integrity).toBe('sha256-abc123');
    });
  });

  describe('Response Types', () => {
    it('should handle json() responses', async () => {
      const jsonData = { message: 'success', data: [1, 2, 3] };
      global.fetch = vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify(jsonData), {
            headers: { 'Content-Type': 'application/json' },
          }),
        ),
      ) as MockedFunction<typeof fetch>;

      const passthrough: Interceptor = (next) => async (req) => next(req);
      const composedFetch = composeFetchMiddleware([passthrough]);

      const response = await composedFetch(
        new Request('https://api.example.com'),
      );
      const data = await response.json();

      expect(data).toEqual(jsonData);
    });

    it('should handle text() responses', async () => {
      const textData = 'Hello, World!';
      global.fetch = vi.fn(() =>
        Promise.resolve(
          new Response(textData, {
            headers: { 'Content-Type': 'text/plain' },
          }),
        ),
      ) as MockedFunction<typeof fetch>;

      const passthrough: Interceptor = (next) => async (req) => next(req);
      const composedFetch = composeFetchMiddleware([passthrough]);

      const response = await composedFetch(
        new Request('https://api.example.com'),
      );
      const text = await response.text();

      expect(text).toBe(textData);
    });

    it('should handle blob() responses', async () => {
      const blobData = new Blob(['binary data'], {
        type: 'application/octet-stream',
      });
      global.fetch = vi.fn(() =>
        Promise.resolve(new Response(blobData)),
      ) as MockedFunction<typeof fetch>;

      const passthrough: Interceptor = (next) => async (req) => next(req);
      const composedFetch = composeFetchMiddleware([passthrough]);

      const response = await composedFetch(
        new Request('https://api.example.com'),
      );
      const blob = await response.blob();

      expect(blob.constructor.name).toBe('Blob');
      expect(blob.size).toBeGreaterThan(0);
    });

    it('should handle arrayBuffer() responses', async () => {
      const buffer = new ArrayBuffer(8);
      const view = new Uint8Array(buffer);
      view.set([1, 2, 3, 4, 5, 6, 7, 8]);
      global.fetch = vi.fn(() =>
        Promise.resolve(new Response(buffer)),
      ) as MockedFunction<typeof fetch>;

      const passthrough: Interceptor = (next) => async (req) => next(req);
      const composedFetch = composeFetchMiddleware([passthrough]);

      const response = await composedFetch(
        new Request('https://api.example.com'),
      );
      const arrayBuffer = await response.arrayBuffer();

      expect(new Uint8Array(arrayBuffer)).toEqual(view);
    });

    it('should handle formData() responses', async () => {
      const formData = new FormData();
      formData.append('key1', 'value1');
      formData.append('key2', 'value2');
      global.fetch = vi.fn(() =>
        Promise.resolve(new Response(formData)),
      ) as MockedFunction<typeof fetch>;

      const passthrough: Interceptor = (next) => async (req) => next(req);
      const composedFetch = composeFetchMiddleware([passthrough]);

      const response = await composedFetch(
        new Request('https://api.example.com'),
      );
      const responseFormData = await response.formData();

      expect(responseFormData.get('key1')).toBe('value1');
      expect(responseFormData.get('key2')).toBe('value2');
    });

    it('should handle response cloning', async () => {
      const jsonData = { test: 'data' };
      global.fetch = vi.fn(() =>
        Promise.resolve(new Response(JSON.stringify(jsonData))),
      ) as MockedFunction<typeof fetch>;

      const passthrough: Interceptor = (next) => async (req) => next(req);
      const composedFetch = composeFetchMiddleware([passthrough]);

      const response = await composedFetch(
        new Request('https://api.example.com'),
      );
      const clonedResponse = response.clone();

      const data1 = await response.json();
      const data2 = await clonedResponse.json();

      expect(data1).toEqual(jsonData);
      expect(data2).toEqual(jsonData);
    });
  });

  describe('Response Properties', () => {
    it('should preserve response properties', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve(
          new Response('OK', {
            status: 201,
            statusText: 'Created',
            headers: { Location: '/users/123' },
          }),
        ),
      ) as MockedFunction<typeof fetch>;

      const passthrough: Interceptor = (next) => async (req) => next(req);
      const composedFetch = composeFetchMiddleware([passthrough]);

      const response = await composedFetch(
        new Request('https://api.example.com'),
      );

      expect(response.status).toBe(201);
      expect(response.statusText).toBe('Created');
      expect(response.ok).toBe(true);
      expect(response.headers.get('Location')).toBe('/users/123');
      expect(typeof response.url).toBe('string');
      expect(typeof response.redirected).toBe('boolean');
      expect(typeof response.type).toBe('string');
    });
  });

  describe('Headers API', () => {
    it('should support all Headers methods', async () => {
      const headerTester: Interceptor = (next) => async (req) => {
        req.headers.set('X-Test', 'value');
        req.headers.append('X-Multi', 'value1');
        req.headers.append('X-Multi', 'value2');

        expect(req.headers.get('X-Test')).toBe('value');
        expect(req.headers.get('X-Multi')).toBe('value1, value2');
        expect(req.headers.has('X-Test')).toBe(true);
        expect(req.headers.has('X-Missing')).toBe(false);

        req.headers.delete('X-Test');
        expect(req.headers.get('X-Test')).toBeNull();

        const headerNames: string[] = [];
        const headerValues: string[] = [];
        req.headers.forEach((value, name) => {
          headerNames.push(name);
          headerValues.push(value);
        });

        expect(headerNames).toContain('x-multi');
        expect(headerValues).toContain('value1, value2');

        req.headers.forEach((value, name) => {
          expect(typeof name).toBe('string');
          expect(typeof value).toBe('string');
        });

        const headerNamesList: string[] = [];
        req.headers.forEach((_, name) => headerNamesList.push(name));
        for (const name of headerNamesList) {
          expect(typeof name).toBe('string');
        }

        const headerValuesList: string[] = [];
        req.headers.forEach((value, _) => headerValuesList.push(value));
        for (const value of headerValuesList) {
          expect(typeof value).toBe('string');
        }

        return next(req);
      };

      const composedFetch = composeFetchMiddleware([headerTester]);
      await composedFetch(new Request('https://api.example.com'));
    });
  });

  describe('AbortController', () => {
    it('should handle AbortController signal', async () => {
      const controller = new AbortController();

      global.fetch = vi.fn(() => {
        return new Promise((resolve, reject) => {
          controller.signal.addEventListener('abort', () => {
            reject(
              new DOMException('The operation was aborted.', 'AbortError'),
            );
          });
          setTimeout(() => resolve(new Response('OK')), 100);
        });
      }) as MockedFunction<typeof fetch>;

      const passthrough: Interceptor = (next) => async (req) => next(req);
      const composedFetch = composeFetchMiddleware([passthrough]);

      const fetchPromise = composedFetch(
        new Request('https://api.example.com', {
          signal: controller.signal,
        }),
      );

      controller.abort();

      await expect(fetchPromise).rejects.toThrow('The operation was aborted.');
    });
  });
});
