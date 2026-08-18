import { describe, expect, it, vi } from 'vitest';

vi.mock('esm-env', () => ({ DEV: true }));

import * as layoutModule from './+layout';
import { load } from './+layout';
import { isCatalogRouteAvailable } from './availability';

const loadWith = (isLocal: boolean) =>
  load({
    parent: async () => ({ settings: { runtimeEnvironment: { isLocal } } }),
  } as never);

describe('/namespaces/[namespace]/catalog layout', () => {
  it('keeps availability helpers out of the SvelteKit route module exports', () => {
    expect(
      Object.keys(layoutModule).filter(
        (exportName) => !exportName.startsWith('_'),
      ),
    ).toEqual(['load']);
  });

  it('is unavailable in production when the host runtime policy permits local catalogs', () => {
    expect(
      isCatalogRouteAvailable({
        isDevelopment: false,
        runtimePolicyAllowsLocalCatalog: true,
      }),
    ).toBe(false);
  });

  it('responds with a 404 outside local development', async () => {
    await expect(loadWith(false)).rejects.toMatchObject({ status: 404 });
  });

  it('responds with a 404 when the runtime environment is unknown', async () => {
    await expect(
      load({ parent: async () => ({ settings: undefined }) } as never),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('loads the catalog during local development', async () => {
    await expect(loadWith(true)).resolves.toBeUndefined();
  });

  it('is available during development when the host runtime policy permits local catalogs', () => {
    expect(
      isCatalogRouteAvailable({
        isDevelopment: true,
        runtimePolicyAllowsLocalCatalog: true,
      }),
    ).toBe(true);
  });
});
