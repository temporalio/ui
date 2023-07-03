import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchNamespaces } from './namespaces-service';
import { namespaces } from '../stores/namespaces';
import { toaster } from '../stores/toaster';

vi.mock('../stores/toaster', () => ({ toaster: { push: vi.fn() } }));
vi.mock('../stores/namespaces', () => ({ namespaces: { set: vi.fn() } }));

const createSuccessfulRequest = () =>
  vi.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          namespaces: [
            { namespaceInfo: { name: 'temporal-system' } },
            { namespaceInfo: { name: 'default' } },
          ],
        }),
    }),
  ) as unknown as typeof fetch;

const createUnsuccessfulRequest = () =>
  vi.fn(() =>
    Promise.resolve({
      ok: false,
      status: 500,
      statusText: 'error',
      json: () => Promise.resolve({}),
    }),
  ) as unknown as typeof fetch;

describe('fetchNamespaces', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call fetch with the correct route', async () => {
    const request = createSuccessfulRequest();

    await fetchNamespaces({ runtimeEnvironment: { isCloud: false } }, request);
    expect(request).toHaveBeenCalledWith(
      'http://localhost:8233/api/v1/namespaces?',
      {
        credentials: 'include',
        headers: {},
      },
    );
  });

  it('should return an empty array if the runtime environment is cloud', async () => {
    const request = createSuccessfulRequest();

    await fetchNamespaces({ runtimeEnvironment: { isCloud: true } }, request);

    expect(request).not.toHaveBeenCalled();
    expect(namespaces.set).toHaveBeenCalledWith([]);
  });

  it('should return an empty array if the request fails', async () => {
    const request = createUnsuccessfulRequest();

    await fetchNamespaces({ runtimeEnvironment: { isCloud: false } }, request);

    expect(request).toHaveBeenCalled();
    expect(namespaces.set).toHaveBeenCalledWith([]);
  });

  it('should display a toast message if the request fails', async () => {
    const request = createUnsuccessfulRequest();

    await fetchNamespaces({ runtimeEnvironment: { isCloud: false } }, request);

    expect(request).toHaveBeenCalled();
    expect(toaster.push).toHaveBeenCalledWith({
      message: 'Unable to fetch namespaces',
      variant: 'error',
    });
  });

  it('should not include "temporal-system" if showTemporalSystemNamespace is false', async () => {
    const request = createSuccessfulRequest();

    await fetchNamespaces(
      {
        runtimeEnvironment: { isCloud: false },
        showTemporalSystemNamespace: false,
      },
      request,
    );

    expect(namespaces.set).toHaveBeenCalledWith([
      { namespaceInfo: { name: 'default' } },
    ]);
  });

  it('should include "temporal-system" if showTemporalSystemNamespace is true', async () => {
    const request = createSuccessfulRequest();

    await fetchNamespaces(
      {
        runtimeEnvironment: { isCloud: false },
        showTemporalSystemNamespace: true,
      },
      request,
    );

    expect(namespaces.set).toHaveBeenCalledWith([
      { namespaceInfo: { name: 'temporal-system' } },
      { namespaceInfo: { name: 'default' } },
    ]);
  });
});
