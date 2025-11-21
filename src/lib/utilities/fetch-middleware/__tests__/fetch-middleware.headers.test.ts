import type { MockedFunction } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { composeFetchMiddleware } from '../composer.js';
import type { Interceptor } from '../types.js';

describe('Fetch Middleware - Header Modifications', () => {
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

  it('should sequentially modify the same header with multiple interceptors', async () => {
    const addSuffix1: Interceptor = (next) => async (req) => {
      req.headers.set('X-Test', (req.headers.get('X-Test') || '') + '1');
      return next(req);
    };

    const addSuffix2: Interceptor = (next) => async (req) => {
      req.headers.set('X-Test', (req.headers.get('X-Test') || '') + '2');
      return next(req);
    };

    const composedFetch = composeFetchMiddleware([addSuffix1, addSuffix2]);
    const request = new Request('https://api.example.com');

    await composedFetch(request);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          get: expect.any(Function),
        }),
      }),
    );

    const mockedFetch = global.fetch as MockedFunction<typeof fetch>;
    const calledRequest = mockedFetch.mock.calls[0][0] as Request;
    expect(calledRequest.headers.get('X-Test')).toBe('12');
  });

  it('should handle multiple interceptors modifying different headers', async () => {
    const addAuthHeader: Interceptor = (next) => async (req) => {
      req.headers.set('Authorization', 'Bearer token123');
      return next(req);
    };

    const addContentType: Interceptor = (next) => async (req) => {
      req.headers.set('Content-Type', 'application/json');
      return next(req);
    };

    const addCustomHeader: Interceptor = (next) => async (req) => {
      req.headers.set('X-Custom', 'custom-value');
      return next(req);
    };

    const composedFetch = composeFetchMiddleware([
      addAuthHeader,
      addContentType,
      addCustomHeader,
    ]);
    const request = new Request('https://api.example.com');

    await composedFetch(request);

    const mockedFetch = global.fetch as MockedFunction<typeof fetch>;
    const calledRequest = mockedFetch.mock.calls[0][0] as Request;
    expect(calledRequest.headers.get('Authorization')).toBe('Bearer token123');
    expect(calledRequest.headers.get('Content-Type')).toBe('application/json');
    expect(calledRequest.headers.get('X-Custom')).toBe('custom-value');
  });

  it('should handle header removal and replacement', async () => {
    const removeAndReplaceHeader: Interceptor = (next) => async (req) => {
      req.headers.delete('X-Remove-Me');
      req.headers.set('X-Replace-Me', 'new-value');
      return next(req);
    };

    const composedFetch = composeFetchMiddleware([removeAndReplaceHeader]);
    const request = new Request('https://api.example.com', {
      headers: {
        'X-Remove-Me': 'should-be-removed',
        'X-Replace-Me': 'old-value',
      },
    });

    await composedFetch(request);

    const mockedFetch = global.fetch as MockedFunction<typeof fetch>;
    const calledRequest = mockedFetch.mock.calls[0][0] as Request;
    expect(calledRequest.headers.get('X-Remove-Me')).toBeNull();
    expect(calledRequest.headers.get('X-Replace-Me')).toBe('new-value');
  });

  it('should handle header case sensitivity correctly', async () => {
    const caseInsensitiveHeader: Interceptor = (next) => async (req) => {
      const contentType = req.headers.get('content-type');
      req.headers.set('CONTENT-TYPE', contentType + '; charset=utf-8');
      return next(req);
    };

    const composedFetch = composeFetchMiddleware([caseInsensitiveHeader]);
    const request = new Request('https://api.example.com', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    await composedFetch(request);

    const mockedFetch = global.fetch as MockedFunction<typeof fetch>;
    const calledRequest = mockedFetch.mock.calls[0][0] as Request;
    expect(calledRequest.headers.get('content-type')).toBe(
      'application/json; charset=utf-8',
    );
    expect(calledRequest.headers.get('Content-Type')).toBe(
      'application/json; charset=utf-8',
    );
    expect(calledRequest.headers.get('CONTENT-TYPE')).toBe(
      'application/json; charset=utf-8',
    );
  });

  it('should handle header appending correctly', async () => {
    const appendHeader: Interceptor = (next) => async (req) => {
      req.headers.append('X-Multiple', 'value2');
      return next(req);
    };

    const composedFetch = composeFetchMiddleware([appendHeader]);
    const request = new Request('https://api.example.com', {
      headers: {
        'X-Multiple': 'value1',
      },
    });

    await composedFetch(request);

    const mockedFetch = global.fetch as MockedFunction<typeof fetch>;
    const calledRequest = mockedFetch.mock.calls[0][0] as Request;
    expect(calledRequest.headers.get('X-Multiple')).toBe('value1, value2');
  });

  it('should handle header has() method correctly', async () => {
    const checkHeader: Interceptor = (next) => async (req) => {
      if (req.headers.has('Authorization')) {
        req.headers.set('X-Auth-Present', 'true');
      } else {
        req.headers.set('X-Auth-Present', 'false');
      }
      return next(req);
    };

    const composedFetch = composeFetchMiddleware([checkHeader]);
    const request = new Request('https://api.example.com', {
      headers: {
        Authorization: 'Bearer token',
      },
    });

    await composedFetch(request);

    const mockedFetch = global.fetch as MockedFunction<typeof fetch>;
    const calledRequest = mockedFetch.mock.calls[0][0] as Request;
    expect(calledRequest.headers.get('X-Auth-Present')).toBe('true');
  });

  it('should handle header iteration correctly', async () => {
    const iterateHeaders: Interceptor = (next) => async (req) => {
      const headerNames: string[] = [];
      req.headers.forEach((value, key) => {
        headerNames.push(key);
      });
      req.headers.set('X-Header-Count', headerNames.length.toString());
      return next(req);
    };

    const composedFetch = composeFetchMiddleware([iterateHeaders]);
    const request = new Request('https://api.example.com', {
      headers: {
        Authorization: 'Bearer token',
        'Content-Type': 'application/json',
      },
    });

    await composedFetch(request);

    const mockedFetch = global.fetch as MockedFunction<typeof fetch>;
    const calledRequest = mockedFetch.mock.calls[0][0] as Request;
    expect(calledRequest.headers.get('X-Header-Count')).toBe('2');
  });
});
