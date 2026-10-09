import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$lib/utilities/core-provider', () => ({
  getAccessToken: vi.fn().mockResolvedValue(''),
  getIdToken: vi.fn().mockResolvedValue(undefined),
}));

import { page } from '$app/state';

import {
  codecEndpoint,
  includeCredentials,
  overrideRemoteCodecConfiguration,
  passAccessToken,
} from '$lib/stores/data-encoder-config';
import { getAccessToken, getIdToken } from '$lib/utilities/core-provider';

import {
  clearCodecDecodeCache,
  codeServerRequest,
  decodePayloadsWithCodec,
} from './data-encoder';

const mockGetAccessToken = vi.mocked(getAccessToken);
const mockGetIdToken = vi.mocked(getIdToken);

beforeEach(() => clearCodecDecodeCache());

describe('Codec Server Requests for Decode and Encode', () => {
  const payloads = { payloads: [{}] };

  beforeEach(() => {
    overrideRemoteCodecConfiguration.set(true);
  });

  afterEach(() => {
    codecEndpoint.set(null);
    passAccessToken.set(false);
    includeCredentials.set(false);
    overrideRemoteCodecConfiguration.set(false);
    vi.clearAllMocks();
  });

  it('should preserve a route prefix if the user has one configured', async () => {
    const mockFetch = vi.fn(async () => {
      return {
        json: () => Promise.resolve(payloads),
      };
    });
    vi.stubGlobal('fetch', mockFetch);

    codecEndpoint.set('http://localcodecserver.com/prefix');
    await codeServerRequest({
      type: 'decode',
      payloads,
    });
    expect(mockFetch).toBeCalledWith(
      'http://localcodecserver.com/prefix/decode?preserveStorageRefs=true',
      expect.any(Object),
    );
  });

  it('should send a request and return decoded payloads', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(payloads),
      } as Response),
    );

    codecEndpoint.set('http://localcodecserver.com');
    const response = await codeServerRequest({
      type: 'decode',
      payloads,
    });
    expect(response).toEqual(payloads);
  });

  it('should return original payloads for decode on server failure', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response),
    );

    codecEndpoint.set('http://localcodecserver.com');
    const result = await codeServerRequest({ type: 'decode', payloads });
    expect(result).toEqual(payloads);
  });

  it('should send a request and return encoded payloads', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(payloads),
      } as Response),
    );

    codecEndpoint.set('http://localcodecserver.com');
    const response = await codeServerRequest({
      type: 'encode',
      payloads,
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

    codecEndpoint.set('http://localcodecserver.com');
    await expect(
      codeServerRequest({ type: 'encode', payloads }),
    ).rejects.toThrow();
  });

  it('should throw an error for encode if response is not ok', async () => {
    const response = new Response(JSON.stringify(payloads), {
      status: 500,
      statusText: 'Internal Server Error',
    });
    global.fetch = vi.fn(() => Promise.resolve(response));

    codecEndpoint.set('http://localcodecserver.com');
    await expect(
      codeServerRequest({ type: 'encode', payloads }),
    ).rejects.toThrow();
  });
});

describe('codecPassAccessToken', () => {
  const payloads = { payloads: [{}] };

  beforeEach(() => {
    overrideRemoteCodecConfiguration.set(true);
  });

  afterEach(() => {
    codecEndpoint.set(null);
    passAccessToken.set(false);
    includeCredentials.set(false);
    overrideRemoteCodecConfiguration.set(false);
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

    codecEndpoint.set('https://codecserver.com');
    passAccessToken.set(true);

    await codeServerRequest({
      type: 'decode',
      payloads,
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

    codecEndpoint.set('https://codecserver.com');
    passAccessToken.set(true);

    await codeServerRequest({
      type: 'decode',
      payloads,
    });

    const fetchCall = vi.mocked(global.fetch).mock.calls[0];
    const requestOptions = fetchCall[1] as RequestInit;
    const headers = requestOptions.headers as Record<string, string>;
    expect(headers['Authorization']).toBeUndefined();
    expect(headers['Authorization-Extras']).toBeUndefined();
  });

  it('should not make request and return original payloads when passAccessToken is true but endpoint is HTTP', async () => {
    global.fetch = vi.fn();

    codecEndpoint.set('http://codecserver.com');
    passAccessToken.set(true);

    const result = await codeServerRequest({
      type: 'decode',
      payloads,
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

    codecEndpoint.set('http://localcodecserver.com');

    await codeServerRequest({
      type: 'decode',
      payloads,
    });

    expect(mockGetAccessToken).not.toHaveBeenCalled();
    expect(mockGetIdToken).not.toHaveBeenCalled();
  });
});

describe('codecIncludeCredentials', () => {
  const payloads = { payloads: [{}] };

  beforeEach(() => {
    overrideRemoteCodecConfiguration.set(true);
  });

  afterEach(() => {
    codecEndpoint.set(null);
    passAccessToken.set(false);
    includeCredentials.set(false);
    overrideRemoteCodecConfiguration.set(false);
    vi.clearAllMocks();
  });

  it('should include credentials in request when includeCredentials is true', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(payloads),
      } as Response),
    );

    codecEndpoint.set('http://localcodecserver.com');
    includeCredentials.set(true);

    await codeServerRequest({
      type: 'decode',
      payloads,
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

    codecEndpoint.set('http://localcodecserver.com');

    await codeServerRequest({
      type: 'decode',
      payloads,
    });

    const fetchCall = vi.mocked(global.fetch).mock.calls[0];
    const requestOptions = fetchCall[1] as RequestInit;
    expect(requestOptions.credentials).toBeUndefined();
  });
});

describe('download with namespace-level codec endpoint', () => {
  // Regression test: the download button in payload-code-block.svelte was
  // disabled when the browser-level $codecEndpoint store was empty, even
  // though codeServerRequest correctly falls back to settings.codec.endpoint.
  // These tests document the expected service-layer behaviour so a regression
  // in data-encoder.ts would be caught immediately.
  const payloads = { payloads: [{}] };
  const namespaceEndpoint = 'http://namespace-codec.example.com';

  beforeEach(() => {
    // Browser store intentionally left empty — only namespace settings set.
    codecEndpoint.set(null);
    passAccessToken.set(false);
    includeCredentials.set(false);
    (page.data.settings as { codec: { endpoint: string } }).codec.endpoint =
      namespaceEndpoint;
  });

  afterEach(() => {
    (page.data.settings as { codec: { endpoint: string } }).codec.endpoint = '';
    vi.clearAllMocks();
  });

  it('should use the namespace endpoint for download when browser store is not configured', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(payloads),
      } as Response),
    );

    await codeServerRequest({ type: 'download', payloads });

    expect(vi.mocked(global.fetch)).toHaveBeenCalledWith(
      `${namespaceEndpoint}/download?preserveStorageRefs=true`,
      expect.any(Object),
    );
  });

  it('should use the namespace endpoint for decode when browser store is not configured', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(payloads),
      } as Response),
    );

    await codeServerRequest({ type: 'decode', payloads });

    expect(vi.mocked(global.fetch)).toHaveBeenCalledWith(
      `${namespaceEndpoint}/decode?preserveStorageRefs=true`,
      expect.any(Object),
    );
  });
});

describe('decoded payload cache', () => {
  const payloads = {
    payloads: [{ metadata: { encoding: 'encrypted' }, data: 'encoded' }],
  };
  const decoded = {
    payloads: [{ metadata: { encoding: 'json/plain' }, data: 'decoded' }],
  };
  const decode = (value = payloads) =>
    decodePayloadsWithCodec({ payloads: value, cache: true });

  beforeEach(() => {
    page.params.workflow = 'workflow-id';
    page.params.run = 'run-id';
    overrideRemoteCodecConfiguration.set(true);
    codecEndpoint.set('https://codec.example.com');
    mockGetAccessToken.mockResolvedValue('');
    mockGetIdToken.mockResolvedValue(undefined);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async () => ({
        ok: true,
        json: async () => structuredClone(decoded),
      })),
    );
  });

  afterEach(() => {
    clearCodecDecodeCache();
    codecEndpoint.set(null);
    passAccessToken.set(false);
    includeCredentials.set(false);
    overrideRemoteCodecConfiguration.set(false);
    page.params.namespace = 'default';
    delete page.params.workflow;
    delete page.params.run;
    vi.clearAllMocks();
  });

  it('does not read or populate the cache unless explicitly enabled', async () => {
    await decodePayloadsWithCodec({ payloads });
    await decodePayloadsWithCodec({ payloads });
    expect(fetch).toHaveBeenCalledTimes(2);

    await decode();
    expect(fetch).toHaveBeenCalledTimes(3);
    await decodePayloadsWithCodec({ payloads });
    expect(fetch).toHaveBeenCalledTimes(4);
    await decode();
    expect(fetch).toHaveBeenCalledTimes(4);
  });

  it('does not share an opted-in pending request with other payload views', async () => {
    let resolveResponse: (response: Response) => void;
    vi.mocked(fetch).mockImplementationOnce(
      () => new Promise((resolve) => (resolveResponse = resolve)),
    );
    const pending = decode();
    expect(await decodePayloadsWithCodec({ payloads })).toEqual(decoded);
    expect(fetch).toHaveBeenCalledTimes(2);
    resolveResponse({ ok: true, json: async () => decoded } as Response);
    await pending;
    expect(await decode()).toEqual(decoded);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('shares pending requests and reuses results for equivalent payload objects', async () => {
    let resolveResponse: (response: Response) => void;
    vi.mocked(fetch).mockImplementationOnce(
      () => new Promise((resolve) => (resolveResponse = resolve)),
    );

    const inline = decode();
    const tooltip = decode(structuredClone(payloads));
    expect(fetch).toHaveBeenCalledTimes(1);
    resolveResponse({ ok: true, json: async () => decoded } as Response);
    expect(await inline).toEqual(decoded);
    expect(await tooltip).toEqual(decoded);
    expect(await decode(structuredClone(payloads))).toEqual(decoded);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('keeps callers from mutating the cached response', async () => {
    const result = await decode();
    result.payloads[0].data = 'changed by a caller';
    expect(await decode()).toEqual(decoded);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('decodes new payload contents', async () => {
    await decode();
    await decode({
      payloads: [{ ...payloads.payloads[0], data: 'new input' }],
    });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it.each([
    ['namespace', () => (page.params.namespace = 'another-namespace')],
    ['workflow ID', () => (page.params.workflow = 'another-workflow')],
    ['run ID', () => (page.params.run = 'another-run')],
    ['endpoint', () => codecEndpoint.set('https://another-codec.example.com')],
    ['credentials', () => includeCredentials.set(true)],
    ['token forwarding', () => passAccessToken.set(true)],
  ] as const)('invalidates results when %s changes', async (_name, change) => {
    await decode();
    change();
    await decode();
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('invalidates results when forwarded authentication changes', async () => {
    passAccessToken.set(true);
    mockGetAccessToken.mockResolvedValue('first-session');
    await decode();
    mockGetAccessToken.mockResolvedValue('second-session');
    await decode();
    mockGetIdToken.mockResolvedValue('new-id-token');
    await decode();
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it.each(['namespace', 'workflow', 'run'] as const)(
    'does not reuse old entries after leaving and returning to a %s',
    async (param) => {
      const original = page.params[param];
      await decode();
      page.params[param] = 'another-value';
      await decode();
      page.params[param] = original;
      await decode();
      expect(fetch).toHaveBeenCalledTimes(3);
    },
  );

  it('does not cache failed decodes and retries on the next request', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
    } as Response);
    expect(await decode()).toEqual(payloads);
    expect(await decode()).toEqual(decoded);
    expect(await decode()).toEqual(decoded);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it.each(['namespace', 'workflow', 'run'] as const)(
    'does not let a stale request overwrite the current %s cache',
    async (param) => {
      let resolveResponse: (response: Response) => void;
      vi.mocked(fetch).mockImplementationOnce(
        () => new Promise((resolve) => (resolveResponse = resolve)),
      );
      const stale = decode();
      page.params[param] = 'another-value';
      await decode();
      resolveResponse({ ok: true, json: async () => payloads } as Response);
      await stale;
      expect(await decode()).toEqual(decoded);
      expect(fetch).toHaveBeenCalledTimes(2);
    },
  );

  it('evicts the least recently used entries', async () => {
    const withData = (data: string) => ({
      payloads: [{ ...payloads.payloads[0], data }],
    });
    for (let i = 0; i < 20; i++) await decode(withData(String(i)));
    await decode(withData('0'));
    await decode(withData('20'));
    await decode(withData('0'));
    expect(fetch).toHaveBeenCalledTimes(21);
    await decode(withData('1'));
    expect(fetch).toHaveBeenCalledTimes(22);
  });

  it('does not retain a response larger than the memory budget', async () => {
    const largeResult = {
      payloads: [{ data: 'x'.repeat(6 * 1024 * 1024) }],
    };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => largeResult,
    } as Response);
    await decode();
    expect(await decode()).toEqual(decoded);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('keeps abortable requests independent of shared requests', async () => {
    await decode();
    await codeServerRequest({
      type: 'decode',
      payloads,
      signal: new AbortController().signal,
      cache: true,
    });
    await decode();
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it.each(['encode', 'download'] as const)(
    'does not cache %s requests',
    async (type) => {
      await codeServerRequest({ type, payloads, cache: true });
      await codeServerRequest({ type, payloads, cache: true });
      expect(fetch).toHaveBeenCalledTimes(2);
    },
  );
});
