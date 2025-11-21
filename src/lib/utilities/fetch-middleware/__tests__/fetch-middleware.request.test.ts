import type { MockedFunction } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { composeFetchMiddleware } from '../composer.js';
import type { Interceptor } from '../types.js';

describe('Fetch Middleware - Request Modifications', () => {
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

  it('should handle URL parameter injection', async () => {
    const addApiKeyParam: Interceptor = (next) => async (req) => {
      const url = new URL(req.url);
      url.searchParams.set('api_key', 'secret123');
      const newRequest = new Request(url.toString(), {
        method: req.method,
        headers: req.headers,
        body: req.body,
      });
      return next(newRequest);
    };

    const composedFetch = composeFetchMiddleware([addApiKeyParam]);
    const request = new Request('https://api.example.com/users');

    await composedFetch(request);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://api.example.com/users?api_key=secret123',
      }),
    );
  });

  it('should handle method changing', async () => {
    const changeToPost: Interceptor = (next) => async (req) => {
      const newRequest = new Request(req.url, {
        method: 'POST',
        headers: req.headers,
        body: req.body,
      });
      return next(newRequest);
    };

    const composedFetch = composeFetchMiddleware([changeToPost]);
    const request = new Request('https://api.example.com', { method: 'GET' });

    await composedFetch(request);

    const mockedFetch = global.fetch as MockedFunction<typeof fetch>;
    const calledRequest = mockedFetch.mock.calls[0][0] as Request;
    expect(calledRequest.method).toBe('POST');
  });

  it('should handle body modification with JSON', async () => {
    const addTimestamp: Interceptor = (next) => async (req) => {
      if (req.body) {
        const originalBody = await req.json();
        const modifiedBody = { ...originalBody, timestamp: Date.now() };
        const newRequest = new Request(req.url, {
          method: req.method,
          headers: req.headers,
          body: JSON.stringify(modifiedBody),
        });
        return next(newRequest);
      }
      return next(req);
    };

    const composedFetch = composeFetchMiddleware([addTimestamp]);
    const originalBody = { user: 'john', action: 'login' };
    const request = new Request('https://api.example.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(originalBody),
    });

    await composedFetch(request);

    const mockedFetch = global.fetch as MockedFunction<typeof fetch>;
    const calledRequest = mockedFetch.mock.calls[0][0] as Request;
    const sentBody = JSON.parse(await calledRequest.text());
    expect(sentBody).toMatchObject(originalBody);
    expect(sentBody.timestamp).toBeDefined();
    expect(typeof sentBody.timestamp).toBe('number');
  });

  it('should handle FormData body modification', async () => {
    const addFormField: Interceptor = (next) => async (req) => {
      if (
        req.body instanceof FormData ||
        req.headers.get('Content-Type')?.includes('multipart/form-data')
      ) {
        req.headers.set('X-FormData-Processed', 'true');
        req.headers.set('X-CSRF-Token', 'abc123');
      }
      return next(req);
    };

    const composedFetch = composeFetchMiddleware([addFormField]);
    const formData = new FormData();
    formData.set('username', 'john');
    const request = new Request('https://api.example.com', {
      method: 'POST',
      body: formData,
    });

    await composedFetch(request);

    const mockedFetch = global.fetch as MockedFunction<typeof fetch>;
    const calledRequest = mockedFetch.mock.calls[0][0] as Request;
    expect(calledRequest.headers.get('X-FormData-Processed')).toBe('true');
    expect(calledRequest.headers.get('X-CSRF-Token')).toBe('abc123');
  });

  it('should handle multiple interceptors chaining request changes', async () => {
    const addBaseUrl: Interceptor = (next) => async (req) => {
      const url = new URL(req.url);
      if (url.pathname.startsWith('/api/')) {
        url.hostname = 'production.example.com';
      }
      const newRequest = new Request(url.toString(), {
        method: req.method,
        headers: req.headers,
        body: req.body,
      });
      return next(newRequest);
    };

    const addVersioning: Interceptor = (next) => async (req) => {
      const url = new URL(req.url);
      url.pathname = '/v2' + url.pathname;
      const newRequest = new Request(url.toString(), {
        method: req.method,
        headers: req.headers,
        body: req.body,
      });
      return next(newRequest);
    };

    const composedFetch = composeFetchMiddleware([addBaseUrl, addVersioning]);
    const request = new Request('https://localhost/api/users');

    await composedFetch(request);

    const mockedFetch = global.fetch as MockedFunction<typeof fetch>;
    const calledRequest = mockedFetch.mock.calls[0][0] as Request;
    expect(calledRequest.url).toBe(
      'https://production.example.com/v2/api/users',
    );
  });

  it('should preserve request properties when creating new requests', async () => {
    const modifyRequest: Interceptor = (next) => async (req) => {
      const newRequest = new Request(req.url + '?modified=true', {
        method: req.method,
        headers: req.headers,
        body: req.body,
        mode: req.mode,
        credentials: req.credentials,
        cache: req.cache,
        redirect: req.redirect,
        referrer: req.referrer,
        integrity: req.integrity,
      });
      return next(newRequest);
    };

    const composedFetch = composeFetchMiddleware([modifyRequest]);
    const request = new Request('https://api.example.com', {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      cache: 'no-cache',
      redirect: 'follow',
      referrer: 'https://example.com',
      integrity: 'sha256-abc123',
    });

    await composedFetch(request);

    const mockedFetch = global.fetch as MockedFunction<typeof fetch>;
    const calledRequest = mockedFetch.mock.calls[0][0] as Request;
    expect(calledRequest.url).toBe('https://api.example.com/?modified=true');
    expect(calledRequest.method).toBe('POST');
    expect(calledRequest.mode).toBe('cors');
    expect(calledRequest.credentials).toBe('include');
    expect(calledRequest.cache).toBe('no-cache');
    expect(calledRequest.redirect).toBe('follow');
    expect(calledRequest.referrer).toBe('https://example.com/');
    expect(calledRequest.integrity).toBe('sha256-abc123');
  });

  it('should handle binary data modification', async () => {
    const addBinaryHeader: Interceptor = (next) => async (req) => {
      if (req.body) {
        req.headers.set('Content-Type', 'application/octet-stream');
        req.headers.set('X-Binary-Length', '5'); // Known length from test data
      }
      return next(req);
    };

    const composedFetch = composeFetchMiddleware([addBinaryHeader]);
    const binaryData = new Uint8Array([1, 2, 3, 4, 5]);
    const request = new Request('https://api.example.com', {
      method: 'POST',
      body: binaryData,
    });

    await composedFetch(request);

    const mockedFetch = global.fetch as MockedFunction<typeof fetch>;
    const calledRequest = mockedFetch.mock.calls[0][0] as Request;
    expect(calledRequest.headers.get('Content-Type')).toBe(
      'application/octet-stream',
    );
    expect(calledRequest.headers.get('X-Binary-Length')).toBe('5');
  });
});
