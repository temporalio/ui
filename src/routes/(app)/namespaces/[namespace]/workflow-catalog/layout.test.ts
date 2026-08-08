import { describe, expect, it } from 'vitest';

import { load } from './+layout';

const loadWith = (isLocal: boolean) =>
  load({
    parent: async () => ({ settings: { runtimeEnvironment: { isLocal } } }),
  } as never);

describe('/namespaces/[namespace]/workflow-catalog layout', () => {
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
});
