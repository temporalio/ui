import { delay } from 'es-toolkit';

const MAX_RETRIES = 2;
const RETRYABLE_STATUSES = new Set([404, 408, 429, 500, 502, 503, 504]);

/** Retries selected GET failures with abortable backoff. */
export const retryableGet: typeof fetch = async (input, init) => {
  if (
    (init?.method && init.method.toUpperCase() !== 'GET') ||
    (input instanceof Request && input.method !== 'GET')
  ) {
    // if not a GET request we don't use automatic retry logic
    return fetch(input, init);
  }

  let retries = 0;

  while (true) {
    try {
      const response = await fetch(input, init);

      if (!RETRYABLE_STATUSES.has(response.status) || retries >= MAX_RETRIES) {
        return response;
      }
    } catch (error) {
      if (init?.signal?.aborted || retries >= MAX_RETRIES) {
        throw error;
      }
    }

    retries++;
    const retryDelayMs = 500 * 2 ** (retries - 1) + Math.random() * 250;
    await delay(retryDelayMs, { signal: init?.signal ?? undefined });
  }
};
