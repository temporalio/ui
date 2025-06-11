import type { Plugin } from 'vite';
import type { ViteDevServer } from 'vite';
import waitForPort from 'wait-port';
import { chalk } from 'zx';

import {
  Account,
  getConfig,
  OIDCServer,
  providerConfiguration,
  routes,
} from '../utilities/oidc-server';

const { blue } = chalk;

let oidcServer: OIDCServer;

function log(...message: string[]): void {
  const [first, ...rest] = message;
  console.log(blue(first), ...rest);
}

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

      log(`Starting OIDC Server on port ${PORT}…`);

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

      log(`OIDC Server is running on port ${PORT}.`);
    },
    async closeBundle() {
      if (oidcServer) {
        oidcServer.stop();
        log('🔪 killed OIDC Server');
      }
    },
  };
}

// ensure shutdown on process exit
process.on('beforeExit', () => {
  if (oidcServer) oidcServer.stop();
});
