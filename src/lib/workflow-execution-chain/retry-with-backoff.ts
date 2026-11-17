import { delay, randomInt } from 'es-toolkit';

import { isNetworkError } from '$lib/utilities/is-network-error';

const ATTEMPTS = 4;
const BASE_DELAY_MS = 500;
const MAX_DELAY_MS = 8000;

const isClientError = (error: unknown): boolean =>
  isNetworkError(error) && error.statusCode >= 400 && error.statusCode < 500;

export const backoffDelay = (retry: number): number =>
  randomInt(Math.min(MAX_DELAY_MS, BASE_DELAY_MS * 2 ** retry));

export async function retryWithBackoff<T>(
  request: (signal?: AbortSignal) => Promise<T>,
  signal?: AbortSignal,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    if (attempt > 0) {
      await delay(backoffDelay(attempt), { signal });
    }
    if (signal?.aborted) {
      throw signal.reason;
    }

    try {
      return await request(signal);
    } catch (error: unknown) {
      if (signal?.aborted || isClientError(error)) {
        throw error;
      }
      lastError = error;
    }
  }

  throw lastError;
}
