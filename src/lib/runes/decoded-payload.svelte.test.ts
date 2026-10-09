import { flushSync } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Payloads } from '$lib/types';
import { decodePayloadResult } from '$lib/utilities/decode-payload-result';

import { createDecodedPayload } from './decoded-payload.svelte';

vi.mock('$lib/utilities/decode-payload-result', () => ({
  decodePayloadResult: vi.fn(),
}));

const mockDecode = vi.mocked(decodePayloadResult);

const payloads = (data: string): Payloads => ({
  payloads: [{ metadata: {}, data: new TextEncoder().encode(data) }],
});
const results = (data: string) => [
  { decodedValue: { metadata: {}, data }, originalValue: { data } },
];

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function setup(initial: Payloads | null) {
  let value = $state<Payloads | null>(initial);
  let decoded!: ReturnType<typeof createDecodedPayload>;
  const observed: string[] = [];
  const cleanup = $effect.root(() => {
    decoded = createDecodedPayload(() => value);
    $effect.pre(() => {
      if (value) observed.push(decoded.current.status);
    });
  });
  flushSync();
  return {
    decoded,
    observed,
    cleanup,
    setValue: (next: Payloads | null) => {
      value = next;
      flushSync();
    },
  };
}

describe('createDecodedPayload', () => {
  let cleanup: () => void = () => {};

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('is idle without a value and does not decode', () => {
    const setupResult = setup(null);
    cleanup = setupResult.cleanup;
    expect(setupResult.decoded.current).toEqual({ status: 'idle' });
    expect(mockDecode).not.toHaveBeenCalled();
  });

  it('decodes once and exposes the results', async () => {
    mockDecode.mockResolvedValue(results('a'));
    const setupResult = setup(payloads('a'));
    cleanup = setupResult.cleanup;
    expect(setupResult.decoded.current).toEqual({ status: 'loading' });
    await vi.waitFor(() =>
      expect(setupResult.decoded.current).toEqual({
        status: 'success',
        results: results('a'),
      }),
    );
    setupResult.setValue(structuredClone(payloads('a')));
    expect(mockDecode).toHaveBeenCalledTimes(1);
  });

  it('reports loading as soon as a value arrives', () => {
    mockDecode.mockReturnValue(new Promise(() => {}));
    const setupResult = setup(null);
    cleanup = setupResult.cleanup;
    setupResult.observed.length = 0;
    setupResult.setValue(payloads('a'));
    expect(new Set(setupResult.observed)).toEqual(new Set(['loading']));
    expect(setupResult.decoded.current).toEqual({ status: 'loading' });
  });

  it('does not show the previous results for a new value', async () => {
    mockDecode
      .mockResolvedValueOnce(results('a'))
      .mockReturnValueOnce(new Promise(() => {}));
    const setupResult = setup(payloads('a'));
    cleanup = setupResult.cleanup;
    await vi.waitFor(() =>
      expect(setupResult.decoded.current.status).toBe('success'),
    );
    setupResult.observed.length = 0;
    setupResult.setValue(payloads('b'));
    expect(new Set(setupResult.observed)).toEqual(new Set(['loading']));
  });

  it('ignores a pending decode after teardown', async () => {
    const pending = deferred<ReturnType<typeof results>>();
    mockDecode.mockReturnValueOnce(pending.promise);
    const setupResult = setup(payloads('a'));
    setupResult.cleanup();
    pending.resolve(results('a'));
    await pending.promise;
    expect(setupResult.decoded.current).toEqual({ status: 'loading' });
  });

  it('ignores a stale decode after the value is cleared', async () => {
    const pending = deferred<ReturnType<typeof results>>();
    mockDecode.mockReturnValueOnce(pending.promise);
    const setupResult = setup(payloads('a'));
    cleanup = setupResult.cleanup;
    setupResult.setValue(null);
    pending.resolve(results('a'));
    await pending.promise;
    expect(setupResult.decoded.current).toEqual({ status: 'idle' });
  });

  it('ignores a stale decode after the value changes', async () => {
    const stale = deferred<ReturnType<typeof results>>();
    mockDecode
      .mockReturnValueOnce(stale.promise)
      .mockResolvedValueOnce(results('b'));
    const setupResult = setup(payloads('a'));
    cleanup = setupResult.cleanup;
    setupResult.setValue(payloads('b'));
    await vi.waitFor(() =>
      expect(setupResult.decoded.current).toEqual({
        status: 'success',
        results: results('b'),
      }),
    );
    stale.resolve(results('a'));
    await stale.promise;
    expect(setupResult.decoded.current).toEqual({
      status: 'success',
      results: results('b'),
    });
  });

  it('exposes the error and retries the shared decode', async () => {
    const error = new Error('codec unavailable');
    mockDecode.mockRejectedValueOnce(error).mockResolvedValueOnce(results('a'));
    const setupResult = setup(payloads('a'));
    cleanup = setupResult.cleanup;
    await vi.waitFor(() =>
      expect(setupResult.decoded.current).toMatchObject({
        status: 'error',
        error,
      }),
    );
    const state = setupResult.decoded.current;
    if (state.status === 'error') state.retry();
    await vi.waitFor(() =>
      expect(setupResult.decoded.current).toEqual({
        status: 'success',
        results: results('a'),
      }),
    );
    expect(mockDecode).toHaveBeenCalledTimes(2);
  });
});
