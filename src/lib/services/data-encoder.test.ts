import { describe, expect, it, vi } from 'vitest';

import { codeServerRequest } from './data-encoder';

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
