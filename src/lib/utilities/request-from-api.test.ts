import { URLSearchParams } from 'url';

import { describe, expect, it, vi } from 'vitest';

import { handleError } from './handle-error';
import { isTemporalAPIError, requestFromAPI } from './request-from-api';

import listWorkflowResponse from '$fixtures/list-workflows.json';

type MockResponse<T = unknown> = {
  body: Promise<T>;
  ok: boolean;
  status: number;
  statusText: string;
};

type ErrorResponse = {
  response: Response;
  statusCode: number;
  statusText: string;
  message: string;
};

vi.mock('./handle-error', () => {
  return { handleError: vi.fn() };
});

const withCookie = async (cookie: string, fn: () => void) => {
  const currentCookie = document.cookie;

  Object.defineProperty(document, 'cookie', {
    writable: true,
    value: cookie,
  });

  fn();

  Object.defineProperty(document, 'cookie', {
    writable: true,
    value: currentCookie,
  });
};

describe('isTemporalAPIError', () => {
  it('should return false if undefined', () => {
    expect(isTemporalAPIError(undefined)).toBe(false);
  });

  it('should return false if it does not have a message property', () => {
    expect(isTemporalAPIError({})).toBe(false);
  });

  it('shpould return true if it has a message property', () => {
    expect(isTemporalAPIError({ message: 'Temporal API Error' })).toBe(true);
  });
});

describe('requestFromAPI', () => {
  const endpoint = '/api/endpoint';
  const responseBody = listWorkflowResponse;

  const options = {
    credentials: 'include',
    headers: {},
  };

  const fetchMock = <T = unknown>(
    body: T = responseBody,
    response: Partial<MockResponse> = {},
  ) =>
    vi.fn(async () => {
      return Promise.resolve({
        json: () => Promise.resolve(body),
        status: 200,
        statusText: 'OK',
        ok: true,
        ...response,
      });
    }) as unknown as typeof fetch;

  it('should fetch the endpoint', async () => {
    const request = fetchMock();
    await requestFromAPI(endpoint, { request });
    expect(request).toHaveBeenCalledWith(endpoint + '?', options);
  });

  it('should add credentials to options', async () => {
    const request = fetchMock();
    await requestFromAPI(endpoint, { request, options: {} });
    expect(request).toHaveBeenCalledWith(endpoint + '?', options);
  });

  it('should add csrf cookie to headers', async () => {
    const token = 'token';

    const request = fetchMock();
    await withCookie(`_csrf=${token}`, async () => {
      await requestFromAPI(endpoint, { request });
    });

    expect(request).toHaveBeenCalledWith(endpoint + '?', {
      ...options,
      headers: {
        'X-CSRF-TOKEN': token,
      },
    });
  });

  it('should not add csrf cookie to headers if not presdent', async () => {
    const token = 'token';

    const request = fetchMock();
    await withCookie(`_nope=${token}`, async () => {
      await requestFromAPI(endpoint, { request });
    });

    expect(request).toHaveBeenCalledWith(endpoint + '?', options);
  });

  it('should not add csrf cookie to headers if not running in the browser', async () => {
    const token = 'token';

    const request = fetchMock();
    await withCookie(`_csrf=${token}`, async () => {
      await requestFromAPI(endpoint, { request, isBrowser: false });
    });

    expect(request).toHaveBeenCalledWith(endpoint + '?', options);
  });

  it('should not add csrf cookie to headers it already exists', async () => {
    const token = 'token';
    const headers = {
      'X-CSRF-TOKEN': 'pre-existing',
    };
    const opts = { ...options, headers };

    const request = fetchMock();
    await withCookie(`_csrf=${token}`, async () => {
      await requestFromAPI(endpoint, { request, options: opts as RequestInit });
    });

    expect(request).toHaveBeenCalledWith(endpoint + '?', opts);
  });

  it('should create an empty array of headers if not provided', async () => {
    const request = fetchMock();
    await requestFromAPI(endpoint, { request, options: undefined });
    expect(request).toHaveBeenCalledWith(endpoint + '?', options);
  });

  it('should pass through search params', async () => {
    const params = { query: 'WorkflowId="Test"' };
    const encodedParams = new URLSearchParams(params).toString();
    const request = fetchMock();

    await requestFromAPI(endpoint, {
      request,
      params,
    });

    expect(request).toHaveBeenCalledWith(
      endpoint + '?' + encodedParams,
      options,
    );
  });

  it('should add the next page token', async () => {
    const params = { query: 'WorkflowId="Test"' };
    const encodedParams = new URLSearchParams({
      ...params,
      next_page_token: 'nextPage',
    }).toString();
    const request = fetchMock();

    await requestFromAPI(endpoint, {
      request,
      params,
      token: 'nextPage',
    });

    expect(request).toHaveBeenCalledWith(
      endpoint + '?' + encodedParams,
      options,
    );
  });

  it('should return the response', async () => {
    const request = fetchMock();
    const result = await requestFromAPI(endpoint, {
      request,
    });

    expect(result).toEqual(responseBody);
  });

  it('should call on onError if the response is not ok', async () => {
    const onError = vi.fn();
    const status = 403;
    const statusText = 'Unauthorized';
    const body = { error: statusText };
    const ok = false;

    const request = fetchMock(body, { status, ok, statusText });

    await requestFromAPI(endpoint, { request, onError });

    expect(onError).toHaveBeenCalledWith({
      body,
      status,
      statusText,
    });
  });

  it('should throw if the response is not ok, no onError handler was provided, and notifyOnError is false', async () => {
    const status = 403;
    const statusText = 'Unauthorized';
    const body = { error: statusText };
    const ok = false;

    const request = fetchMock(body, { status, ok, statusText });
    const error = await requestFromAPI(endpoint, {
      request,
      notifyOnError: false,
    }).catch((error) => error);

    expect((error as unknown as ErrorResponse).statusCode).toBe(status);
  });

  it('should call handleError if onError is not provided', async () => {
    const status = 403;
    const statusText = 'Unauthorized';
    const body = { error: statusText };
    const ok = false;

    const request = fetchMock(body, { status, ok, statusText });
    await requestFromAPI(endpoint, {
      request,
    });

    expect(handleError).toHaveBeenCalled();
  });
});
