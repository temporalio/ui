import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('$lib/utilities/core-provider', () => ({
  getAccessToken: vi.fn().mockResolvedValue(''),
  getIdToken: vi.fn().mockResolvedValue(undefined),
}));

import { getAccessToken, getIdToken } from '$lib/utilities/core-provider';

import { codeServerRequest } from './data-encoder';

const mockGetAccessToken = vi.mocked(getAccessToken);
const mockGetIdToken = vi.mocked(getIdToken);

const settings = {
  codec: {
    endpoint: 'http://localcodecserver.com',
    passAccessToken: false,
    includeCredentials: false,
  },
};

describe('Codec Server Requests for Decode and Encode', () => {
  const payloads = { payloads: [{}] };
  const namespace = 'test-namespace';

  it('should send a request and return decoded payloads', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(payloads),
      } as Response),
    );

    const namespace = 'test-namespace';
    const response = await codeServerRequest({
      type: 'decode',
      payloads,
      namespace,
      settings,
    });
    expect(response).toEqual(payloads);
  });

  it('should return original payloads for decode on failure', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response),
    );
    const response = await codeServerRequest({
      type: 'decode',
      payloads,
      namespace,
      settings,
    });
    expect(response).toEqual(payloads);
  });

  it('should send a request and return encoded payloads', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(payloads),
      } as Response),
    );

    const response = await codeServerRequest({
      type: 'encode',
      payloads,
      namespace,
      settings,
    });
    expect(response).toEqual(payloads);
  });

  it('should throw an error for encode on failure', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response),
    );
    await expect(
      codeServerRequest({ type: 'encode', payloads, namespace, settings }),
    ).rejects.toThrow();
  });

  it('should throw an error for encode if response is not ok', async () => {
    const response = new Response(JSON.stringify(payloads), {
      status: 500,
      statusText: 'Internal Server Error',
    });
    global.fetch = vi.fn(() => Promise.resolve(response));

    await expect(
      codeServerRequest({ type: 'encode', payloads, namespace, settings }),
    ).rejects.toThrow();
  });
});

describe('codecPassAccessToken', () => {
  const payloads = { payloads: [{}] };
  const namespace = 'test-namespace';

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should attach Authorization and Authorization-Extras headers when passAccessToken is true and endpoint is HTTPS', async () => {
    mockGetAccessToken.mockResolvedValue('test-access-token');
    mockGetIdToken.mockResolvedValue('test-id-token');

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(payloads),
      } as Response),
    );

    const httpsSettings = {
      codec: {
        endpoint: 'https://codecserver.com',
        passAccessToken: true,
        includeCredentials: false,
      },
    };

    await codeServerRequest({
      type: 'decode',
      payloads,
      namespace,
      settings: httpsSettings,
    });

    expect(mockGetAccessToken).toHaveBeenCalled();
    expect(mockGetIdToken).toHaveBeenCalled();

    const fetchCall = vi.mocked(global.fetch).mock.calls[0];
    const requestOptions = fetchCall[1] as RequestInit;
    const headers = requestOptions.headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer test-access-token');
    expect(headers['Authorization-Extras']).toBe('test-id-token');
  });

  it('should not attach Authorization header when accessToken is empty', async () => {
    mockGetAccessToken.mockResolvedValue('');
    mockGetIdToken.mockResolvedValue(undefined);

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(payloads),
      } as Response),
    );

    const httpsSettings = {
      codec: {
        endpoint: 'https://codecserver.com',
        passAccessToken: true,
        includeCredentials: false,
      },
    };

    await codeServerRequest({
      type: 'decode',
      payloads,
      namespace,
      settings: httpsSettings,
    });

    const fetchCall = vi.mocked(global.fetch).mock.calls[0];
    const requestOptions = fetchCall[1] as RequestInit;
    const headers = requestOptions.headers as Record<string, string>;
    expect(headers['Authorization']).toBeUndefined();
    expect(headers['Authorization-Extras']).toBeUndefined();
  });

  it('should not make request and return original payloads when passAccessToken is true but endpoint is HTTP', async () => {
    global.fetch = vi.fn();

    const httpSettings = {
      codec: {
        endpoint: 'http://codecserver.com',
        passAccessToken: true,
        includeCredentials: false,
      },
    };

    const result = await codeServerRequest({
      type: 'decode',
      payloads,
      namespace,
      settings: httpSettings,
    });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(result).toEqual(payloads);
  });

  it('should not call getAccessToken when passAccessToken is false', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(payloads),
      } as Response),
    );

    await codeServerRequest({
      type: 'decode',
      payloads,
      namespace,
      settings,
    });

    expect(mockGetAccessToken).not.toHaveBeenCalled();
    expect(mockGetIdToken).not.toHaveBeenCalled();
  });
});

describe('codecIncludeCredentials', () => {
  const payloads = { payloads: [{}] };
  const namespace = 'test-namespace';

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should include credentials in request when includeCredentials is true', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(payloads),
      } as Response),
    );

    const credSettings = {
      codec: {
        endpoint: 'http://localcodecserver.com',
        passAccessToken: false,
        includeCredentials: true,
      },
    };

    await codeServerRequest({
      type: 'decode',
      payloads,
      namespace,
      settings: credSettings,
    });

    const fetchCall = vi.mocked(global.fetch).mock.calls[0];
    const requestOptions = fetchCall[1] as RequestInit;
    expect(requestOptions.credentials).toBe('include');
  });

  it('should not include credentials when includeCredentials is false', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(payloads),
      } as Response),
    );

    await codeServerRequest({
      type: 'decode',
      payloads,
      namespace,
      settings,
    });

    const fetchCall = vi.mocked(global.fetch).mock.calls[0];
    const requestOptions = fetchCall[1] as RequestInit;
    expect(requestOptions.credentials).toBeUndefined();
  });
});
