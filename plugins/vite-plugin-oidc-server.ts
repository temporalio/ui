import type { Plugin } from 'vite';
import type { ViteDevServer } from 'vite';
import waitForPort from 'wait-port';

import { getConfig } from '../utilities/oidc-server/config';
import routes from '../utilities/oidc-server/routes/express';
import OIDCServer from '../utilities/oidc-server/server';
import Account from '../utilities/oidc-server/support/account';
import providerConfiguration from '../utilities/oidc-server/support/configuration';

let oidcServer: OIDCServer;

/**
 * Determine whether to skip starting the OIDC server.
 */
const shouldSkip = (server: ViteDevServer): boolean => {
  if (process.env.VERCEL) return true;
  if (process.env.VITEST) return true;
  if (process.env.CI) return true;
  // only run in oidc-server mode
  if (server.config.mode !== 'with-auth') return true;
  return false;
};

/**
 * Vite plugin to manage the lifecycle of the OIDC server during dev.
 */
export function oidcServerPlugin(): Plugin {
  const { PORT, ISSUER, VIEWS_PATH } = getConfig();

  return {
    name: 'vite-plugin-oidc-server',
    enforce: 'post',
    apply: 'serve',
    async configureServer(server) {
      if (shouldSkip(server)) return;

      console.log(server.config.env);

      console.log(`Starting OIDC Server on port ${PORT}…`);
      oidcServer = new OIDCServer({
        issuer: ISSUER,
        port: PORT,
        viewsPath: VIEWS_PATH,
        providerConfiguration,
        accountModel: Account,
        routes,
      });
      // start and wait for readiness
      await oidcServer.start();
      await waitForPort({ port: PORT, output: 'silent' });
      console.log(`OIDC Server is running on port ${PORT}.`);
    },
    async closeBundle() {
      if (oidcServer) {
        oidcServer.stop();
        console.log('🔪 killed OIDC Server');
      }
    },
  };
}

// ensure shutdown on process exit
process.on('beforeExit', () => {
  if (oidcServer) oidcServer.stop();
});
