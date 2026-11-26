// @vitest-environment node
import { describe, expect, it } from 'vitest';

import OIDCServer from './server';
import Account from './support/account';
import providerConfiguration from './support/configuration';

describe('OIDCServer', () => {
  it('starts and stops without errors', async () => {
    const server = new OIDCServer({
      issuer: 'http://localhost',
      port: 0,
      viewsPath: './views',
      providerConfiguration,
      accountModel: Account,
      routes: () => {},
    });
    // starting on port 0 should pick an available port
    await expect(server.start()).resolves.toBeUndefined();
    // Express app should be initialized
    expect(server.app).toBeDefined();
    // stop should not throw
    expect(() => server.stop()).not.toThrow();
  });
});
