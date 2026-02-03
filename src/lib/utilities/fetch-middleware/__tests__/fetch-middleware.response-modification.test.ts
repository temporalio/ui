import { beforeEach, describe, expect, it, vi } from 'vitest';

import { composeFetchMiddleware } from '../composer.js';
import type { Interceptor } from '../types.js';

describe('Fetch Middleware - Response Modifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should modify response body by multiplying result by 2', async () => {
    const originalData = { value: 10, name: 'test' };
    const mockResponse = new Response(JSON.stringify(originalData), {
      headers: { 'Content-Type': 'application/json' },
    });

    global.fetch = vi.fn(() => Promise.resolve(mockResponse));

    const multiplyResult: Interceptor = (next) => async (req) => {
      const response = await next(req);
      const data = await response.json();

      return new Response(JSON.stringify({ ...data, value: data.value * 2 }), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    };

    const composedFetch = composeFetchMiddleware([multiplyResult]);
    const request = new Request('https://api.example.com/number');

    const response = await composedFetch(request);
    const finalData = await response.json();

    expect(finalData.value).toBe(20);
    expect(finalData.name).toBe('test');
  });

  it('should modify response headers', async () => {
    const mockResponse = new Response(JSON.stringify({ data: 'test' }), {
      headers: {
        'Content-Type': 'application/json',
        'X-Original': 'original-value',
      },
    });

    global.fetch = vi.fn(() => Promise.resolve(mockResponse));

    const modifyHeaders: Interceptor = (next) => async (req) => {
      const response = await next(req);
      const data = await response.json();

      const newHeaders = new Headers(response.headers);
      newHeaders.set('X-Modified', 'true');
      newHeaders.set('X-Timestamp', Date.now().toString());
      newHeaders.delete('X-Original');

      return new Response(JSON.stringify(data), {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    };

    const composedFetch = composeFetchMiddleware([modifyHeaders]);
    const request = new Request('https://api.example.com');

    const response = await composedFetch(request);

    expect(response.headers.get('X-Modified')).toBe('true');
    expect(response.headers.get('X-Timestamp')).toBeDefined();
    expect(response.headers.get('X-Original')).toBeNull();
    expect(response.headers.get('Content-Type')).toBe('application/json');
  });

  it('should modify response status code', async () => {
    const mockResponse = new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      statusText: 'Not Found',
      headers: { 'Content-Type': 'application/json' },
    });

    global.fetch = vi.fn(() => Promise.resolve(mockResponse));

    const changeStatus: Interceptor = (next) => async (req) => {
      const response = await next(req);

      if (response.status === 404) {
        const data = await response.json();
        return new Response(
          JSON.stringify({ error: 'Service Unavailable', originalError: data }),
          {
            status: 503,
            statusText: 'Service Unavailable',
            headers: response.headers,
          },
        );
      }

      return response;
    };

    const composedFetch = composeFetchMiddleware([changeStatus]);
    const request = new Request('https://api.example.com/missing');

    const response = await composedFetch(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(response.statusText).toBe('Service Unavailable');
    expect(response.ok).toBe(false);
    expect(data.error).toBe('Service Unavailable');
    expect(data.originalError.error).toBe('Not Found');
  });

  it('should handle response type transformations', async () => {
    const originalText = 'Hello World';
    const mockResponse = new Response(originalText, {
      headers: { 'Content-Type': 'text/plain' },
    });

    global.fetch = vi.fn(() => Promise.resolve(mockResponse));

    const textToJson: Interceptor = (next) => async (req) => {
      const response = await next(req);
      const text = await response.text();

      return new Response(
        JSON.stringify({ message: text.toUpperCase(), length: text.length }),
        {
          status: response.status,
          statusText: response.statusText,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    };

    const composedFetch = composeFetchMiddleware([textToJson]);
    const request = new Request('https://api.example.com/text');

    const response = await composedFetch(request);
    const data = await response.json();

    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(data.message).toBe('HELLO WORLD');
    expect(data.length).toBe(11);
  });

  it('should handle binary data transformation', async () => {
    const originalData = new Uint8Array([1, 2, 3, 4, 5]);
    const mockResponse = new Response(originalData, {
      headers: { 'Content-Type': 'application/octet-stream' },
    });

    global.fetch = vi.fn(() => Promise.resolve(mockResponse));

    const transformBinary: Interceptor = (next) => async (req) => {
      const response = await next(req);
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const doubled = uint8Array.map((byte) => byte * 2);

      return new Response(doubled, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    };

    const composedFetch = composeFetchMiddleware([transformBinary]);
    const request = new Request('https://api.example.com/binary');

    const response = await composedFetch(request);
    const resultBuffer = await response.arrayBuffer();
    const resultArray = new Uint8Array(resultBuffer);

    expect(Array.from(resultArray)).toEqual([2, 4, 6, 8, 10]);
  });

  it('should handle multiple response modifications in sequence', async () => {
    const originalData = { value: 5, multiplier: 1 };
    const mockResponse = new Response(JSON.stringify(originalData), {
      headers: { 'Content-Type': 'application/json' },
    });

    global.fetch = vi.fn(() => Promise.resolve(mockResponse));

    const doubleValue: Interceptor = (next) => async (req) => {
      const response = await next(req);
      const data = await response.json();

      return new Response(JSON.stringify({ ...data, value: data.value * 2 }), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    };

    const incrementMultiplier: Interceptor = (next) => async (req) => {
      const response = await next(req);
      const data = await response.json();

      return new Response(
        JSON.stringify({ ...data, multiplier: data.multiplier + 1 }),
        {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        },
      );
    };

    const addTimestamp: Interceptor = (next) => async (req) => {
      const response = await next(req);
      const data = await response.json();

      const newHeaders = new Headers(response.headers);
      newHeaders.set('X-Modified-At', new Date().toISOString());

      return new Response(JSON.stringify({ ...data, timestamp: Date.now() }), {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    };

    const composedFetch = composeFetchMiddleware([
      doubleValue,
      incrementMultiplier,
      addTimestamp,
    ]);
    const request = new Request('https://api.example.com/calculate');

    const response = await composedFetch(request);
    const finalData = await response.json();

    expect(finalData.value).toBe(10); // 5 * 2
    expect(finalData.multiplier).toBe(2); // 1 + 1
    expect(finalData.timestamp).toBeDefined();
    expect(response.headers.get('X-Modified-At')).toBeDefined();
  });

  it('should handle response modification with error scenarios', async () => {
    const mockResponse = new Response(
      JSON.stringify({ error: 'Validation failed' }),
      {
        status: 400,
        statusText: 'Bad Request',
        headers: { 'Content-Type': 'application/json' },
      },
    );

    global.fetch = vi.fn(() => Promise.resolve(mockResponse));

    const enhanceError: Interceptor = (next) => async (req) => {
      const response = await next(req);

      if (!response.ok) {
        const errorData = await response.json();
        const enhancedError = {
          ...errorData,
          requestId: 'req-123',
          timestamp: new Date().toISOString(),
          suggestion: 'Please check your input parameters',
        };

        return new Response(JSON.stringify(enhancedError), {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      }

      return response;
    };

    const composedFetch = composeFetchMiddleware([enhanceError]);
    const request = new Request('https://api.example.com/validate');

    const response = await composedFetch(request);
    const errorData = await response.json();

    expect(response.status).toBe(400);
    expect(response.ok).toBe(false);
    expect(errorData.error).toBe('Validation failed');
    expect(errorData.requestId).toBe('req-123');
    expect(errorData.timestamp).toBeDefined();
    expect(errorData.suggestion).toBeDefined();
  });
});
