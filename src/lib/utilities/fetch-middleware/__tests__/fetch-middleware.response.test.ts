import {
  beforeEach,
  describe,
  expect,
  it,
  type MockedFunction,
  vi,
} from 'vitest';

import { composeFetchMiddleware } from '../composer.js';
import type { Interceptor } from '../types.js';

describe('Fetch Middleware - Response Reading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow interceptors to read response headers', async () => {
    const mockResponse = new Response(JSON.stringify({ data: 'test' }), {
      headers: {
        'Content-Type': 'application/json',
        'X-Custom-Header': 'custom-value',
        'X-Rate-Limit': '100',
      },
    });

    global.fetch = vi.fn(() => Promise.resolve(mockResponse));

    const headerReader: Interceptor = (next) => async (req) => {
      const response = await next(req);

      const contentType = response.headers.get('Content-Type');
      const customHeader = response.headers.get('X-Custom-Header');
      const rateLimit = response.headers.get('X-Rate-Limit');

      expect(contentType).toBe('application/json');
      expect(customHeader).toBe('custom-value');
      expect(rateLimit).toBe('100');

      req.headers.set('X-Response-Content-Type', contentType || '');

      return response;
    };

    const composedFetch = composeFetchMiddleware([headerReader]);
    const request = new Request('https://api.example.com');

    const response = await composedFetch(request);

    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(response.headers.get('X-Custom-Header')).toBe('custom-value');
    expect(response.headers.get('X-Rate-Limit')).toBe('100');
  });

  it('should allow interceptors to read response status and metadata', async () => {
    const mockResponse = new Response('Not Found', {
      status: 404,
      statusText: 'Not Found',
      headers: { 'X-Error-Code': 'USER_NOT_FOUND' },
    });

    global.fetch = vi.fn(() => Promise.resolve(mockResponse));

    const statusReader: Interceptor = (next) => async (req) => {
      const response = await next(req);

      expect(response.status).toBe(404);
      expect(response.statusText).toBe('Not Found');
      expect(response.ok).toBe(false);
      expect(response.redirected).toBe(false);
      expect(typeof response.url).toBe('string');
      expect(response.type).toBeDefined();

      return response;
    };

    const composedFetch = composeFetchMiddleware([statusReader]);
    const request = new Request('https://api.example.com/users/999');

    const response = await composedFetch(request);

    expect(response.status).toBe(404);
    expect(response.statusText).toBe('Not Found');
    expect(response.ok).toBe(false);
  });

  it('should allow interceptors to read response body without consumption', async () => {
    const mockData = {
      users: [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
      ],
    };
    const mockResponse = new Response(JSON.stringify(mockData), {
      headers: { 'Content-Type': 'application/json' },
    });

    global.fetch = vi.fn(() => Promise.resolve(mockResponse));

    const bodyReader: Interceptor = (next) => async (req) => {
      const response = await next(req);

      const clonedResponse = response.clone();
      const data = await clonedResponse.json();

      expect(data).toEqual(mockData);
      expect(data.users).toHaveLength(2);
      expect(data.users[0].name).toBe('John');

      req.headers.set('X-User-Count', data.users.length.toString());

      return response;
    };

    const composedFetch = composeFetchMiddleware([bodyReader]);
    const request = new Request('https://api.example.com/users');

    const response = await composedFetch(request);
    const finalData = await response.json();

    expect(finalData).toEqual(mockData);

    const mockedFetch = global.fetch as MockedFunction<typeof fetch>;
    const calledRequest = mockedFetch.mock.calls[0][0] as Request;
    expect(calledRequest.headers.get('X-User-Count')).toBe('2');
  });

  it('should handle multiple interceptors reading same response data', async () => {
    const mockData = { temperature: 25, humidity: 60, pressure: 1013 };
    const mockResponse = new Response(JSON.stringify(mockData), {
      headers: { 'Content-Type': 'application/json' },
    });

    global.fetch = vi.fn(() => Promise.resolve(mockResponse));

    const temperatureReader: Interceptor = (next) => async (req) => {
      const response = await next(req);

      const clonedResponse = response.clone();
      const data = await clonedResponse.json();
      req.headers.set('X-Temperature', data.temperature.toString());

      return response;
    };

    const humidityReader: Interceptor = (next) => async (req) => {
      const response = await next(req);

      const clonedResponse = response.clone();
      const data = await clonedResponse.json();
      req.headers.set('X-Humidity', data.humidity.toString());

      return response;
    };

    const pressureReader: Interceptor = (next) => async (req) => {
      const response = await next(req);

      const clonedResponse = response.clone();
      const data = await clonedResponse.json();
      req.headers.set('X-Pressure', data.pressure.toString());

      return response;
    };

    const composedFetch = composeFetchMiddleware([
      temperatureReader,
      humidityReader,
      pressureReader,
    ]);
    const request = new Request('https://api.weather.com/current');

    const response = await composedFetch(request);
    const finalData = await response.json();

    expect(finalData).toEqual(mockData);

    const mockedFetch = global.fetch as MockedFunction<typeof fetch>;
    const calledRequest = mockedFetch.mock.calls[0][0] as Request;
    expect(calledRequest.headers.get('X-Temperature')).toBe('25');
    expect(calledRequest.headers.get('X-Humidity')).toBe('60');
    expect(calledRequest.headers.get('X-Pressure')).toBe('1013');
  });

  it('should handle different response body types', async () => {
    const testCases = [
      {
        name: 'text response',
        response: new Response('Plain text response'),
        reader: async (res: Response) => await res.clone().text(),
      },
      {
        name: 'blob response',
        response: new Response(
          new Blob(['binary data'], { type: 'application/octet-stream' }),
        ),
        reader: async (res: Response) => await res.clone().blob(),
      },
      {
        name: 'arrayBuffer response',
        response: new Response(new ArrayBuffer(8)),
        reader: async (res: Response) => await res.clone().arrayBuffer(),
      },
      {
        name: 'formData response',
        response: (() => {
          const fd = new FormData();
          fd.set('key', 'value');
          return new Response(fd);
        })(),
        reader: async (res: Response) => await res.clone().formData(),
      },
    ];

    for (const testCase of testCases) {
      global.fetch = vi.fn(() => Promise.resolve(testCase.response));

      const bodyTypeReader: Interceptor = (next) => async (req) => {
        const response = await next(req);

        const data = await testCase.reader(response);
        expect(data).toBeDefined();

        return response;
      };

      const composedFetch = composeFetchMiddleware([bodyTypeReader]);
      const request = new Request('https://api.example.com/data');

      await composedFetch(request);
    }
  });

  it('should handle response header iteration', async () => {
    const mockResponse = new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
        'X-Custom-1': 'value1',
        'X-Custom-2': 'value2',
        'Cache-Control': 'no-cache',
      },
    });

    global.fetch = vi.fn(() => Promise.resolve(mockResponse));

    const headerIterator: Interceptor = (next) => async (req) => {
      const response = await next(req);

      const headerNames: string[] = [];
      const headerValues: string[] = [];

      response.headers.forEach((value, name) => {
        headerNames.push(name);
        headerValues.push(value);
      });

      expect(headerNames).toContain('content-type');
      expect(headerNames).toContain('x-custom-1');
      expect(headerValues).toContain('application/json');
      expect(headerValues).toContain('value1');

      req.headers.set('X-Response-Header-Count', headerNames.length.toString());

      return response;
    };

    const composedFetch = composeFetchMiddleware([headerIterator]);
    const request = new Request('https://api.example.com');

    await composedFetch(request);

    const mockedFetch = global.fetch as MockedFunction<typeof fetch>;
    const calledRequest = mockedFetch.mock.calls[0][0] as Request;
    expect(calledRequest.headers.get('X-Response-Header-Count')).toBe('4');
  });
});
