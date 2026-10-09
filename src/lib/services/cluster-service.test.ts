import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Settings } from '$lib/types/global';
import { handleError } from '$lib/utilities/handle-error';

import { fetchCluster, fetchSystemInfo } from './cluster-service';

vi.mock('$lib/utilities/handle-error', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('$lib/utilities/handle-error')>();
  return { ...actual, handleError: vi.fn() };
});

const settings = { runtimeEnvironment: { isCloud: false } } as Settings;

const respondWith = (status: number, body: unknown = {}) =>
  vi.fn(
    async () =>
      new Response(JSON.stringify(body), {
        status,
        statusText: status === 403 ? 'Forbidden' : 'Error',
      }),
  ) as unknown as typeof fetch;

describe('cluster-service', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ['fetchCluster', fetchCluster],
    ['fetchSystemInfo', fetchSystemInfo],
  ])(
    '%s returns an empty response without handling the error on 403',
    async (_, fetcher) => {
      const result = await fetcher(
        settings,
        respondWith(403, { message: 'Request unauthorized.' }),
      );

      expect(result).toEqual({});
      expect(handleError).not.toHaveBeenCalled();
    },
  );

  it.each([
    ['fetchCluster', fetchCluster],
    ['fetchSystemInfo', fetchSystemInfo],
  ])('%s handles other errors', async (_, fetcher) => {
    await fetcher(settings, respondWith(500, { message: 'boom' }));

    expect(handleError).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 500 }),
    );
  });
});
