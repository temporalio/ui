import { describe, expect, it, vi } from 'vitest';

import { fetchCluster } from './cluster-service';
import { handleError } from '../utilities/handle-error';

vi.mock('../utilities/handle-error', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../utilities/handle-error')>()),
  handleError: vi.fn(),
}));

const settings = { runtimeEnvironment: { isCloud: false } };

const createRequest = (status: number, body: unknown = {}) =>
  vi.fn(() =>
    Promise.resolve({
      ok: status < 400,
      status,
      statusText: 'status',
      json: () => Promise.resolve(body),
    }),
  ) as unknown as typeof fetch;

describe('fetchCluster', () => {
  it('should return the cluster information', async () => {
    const request = createRequest(200, { serverVersion: '1.30.0' });

    expect(await fetchCluster(settings, request)).toEqual({
      serverVersion: '1.30.0',
    });
  });

  it('should return an empty object without redirecting if the request is forbidden', async () => {
    const request = createRequest(403);

    expect(await fetchCluster(settings, request)).toEqual({});
    expect(handleError).not.toHaveBeenCalled();
  });

  it('should handle other errors', async () => {
    const request = createRequest(500);

    expect(await fetchCluster(settings, request)).toEqual({});
    expect(handleError).toHaveBeenCalled();
  });
});
