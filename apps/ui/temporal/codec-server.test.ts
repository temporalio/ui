// @vitest-environment node

import { describe, expect, it } from 'vitest';

import { createCodecServer } from './codec-server';

describe('createCodecServer', () => {
  it('can be stopped before it has been started', async () => {
    const codecServer = await createCodecServer({ port: 0 });

    await expect(codecServer.stop()).resolves.toBeUndefined();
  });

  it('can be stopped more than once', async () => {
    const codecServer = await createCodecServer({ port: 0 });

    await codecServer.start();
    await codecServer.stop();

    await expect(codecServer.stop()).resolves.toBeUndefined();
  });
});
