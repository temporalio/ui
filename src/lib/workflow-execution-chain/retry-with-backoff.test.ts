import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { backoffDelay, retryWithBackoff } from './retry-with-backoff';

const networkError = (statusCode: number) => ({
  statusCode,
  statusText: String(statusCode),
  response: {} as Response,
});

describe('retryWithBackoff', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('returns the first successful result without waiting', async () => {
    const request = vi.fn().mockResolvedValue('ok');

    await expect(retryWithBackoff(request)).resolves.toBe('ok');
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('makes 4 attempts in total before giving up', async () => {
    const error = networkError(503);
    const request = vi.fn().mockRejectedValue(error);

    const result = retryWithBackoff(request);
    const assertion = expect(result).rejects.toBe(error);
    await vi.runAllTimersAsync();

    await assertion;
    expect(request).toHaveBeenCalledTimes(4);
  });

  it('retries network errors and succeeds', async () => {
    const request = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValue('ok');

    const result = retryWithBackoff(request);
    await vi.runAllTimersAsync();

    await expect(result).resolves.toBe('ok');
    expect(request).toHaveBeenCalledTimes(2);
  });

  it.each([400, 403, 404, 429])('never retries a %i', async (statusCode) => {
    const error = networkError(statusCode);
    const request = vi.fn().mockRejectedValue(error);

    await expect(retryWithBackoff(request)).rejects.toBe(error);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('waits with full jitter capped by exponential backoff', async () => {
    const random = vi.spyOn(Math, 'random');

    random.mockReturnValue(0);
    expect([1, 2, 3].map(backoffDelay)).toEqual([0, 0, 0]);

    random.mockReturnValue(0.999999);
    expect([1, 2, 3].map(backoffDelay)).toEqual([999, 1999, 3999]);
    expect(backoffDelay(5)).toBe(7999);
  });

  it('waits the jittered delay before each retry', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const request = vi.fn().mockRejectedValue(networkError(500));

    const result = retryWithBackoff(request).catch(() => {});
    await vi.advanceTimersByTimeAsync(0);
    expect(request).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(499);
    expect(request).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(request).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(1000);
    expect(request).toHaveBeenCalledTimes(3);

    await vi.advanceTimersByTimeAsync(2000);
    expect(request).toHaveBeenCalledTimes(4);
    await result;
  });

  it('aborts during the delay without another attempt', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const controller = new AbortController();
    const request = vi.fn().mockRejectedValue(networkError(500));

    const result = retryWithBackoff(request, controller.signal);
    const assertion = expect(result).rejects.toBeDefined();
    await vi.advanceTimersByTimeAsync(0);
    controller.abort();
    await vi.runAllTimersAsync();

    await assertion;
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('makes no attempt when already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    const request = vi.fn().mockResolvedValue('ok');

    await expect(
      retryWithBackoff(request, controller.signal),
    ).rejects.toBeDefined();
    expect(request).not.toHaveBeenCalled();
  });

  it('passes the signal to the request', async () => {
    const controller = new AbortController();
    const request = vi.fn().mockResolvedValue('ok');

    await retryWithBackoff(request, controller.signal);

    expect(request).toHaveBeenCalledWith(controller.signal);
  });
});
