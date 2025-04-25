import type { Plugin } from 'vite';
import type { ViteDevServer } from 'vite';

import {
  createUIServer,
  type UIServer,
  type ValidEnv,
} from '../utilities/ui-server';

let uiServer: UIServer;

const shouldSkip = (server: ViteDevServer): boolean => {
  if (process.env.VERCEL) return true;
  if (process.env.VITEST) return true;
  if (process.env.CI) return true;
  if (['ui-server', 'local-temporal', 'with-auth'].includes(server.config.mode))
    return false;

  return true;
};

function serverEnv(server: ViteDevServer): ValidEnv {
  if (server.config.mode === 'with-auth') return 'with-auth';
  if (server.config.mode === 'e2e') return 'e2e';
  return 'development';
}

export function uiServerPlugin(): Plugin {
  return {
    name: 'vite-plugin-ui-server',
    enforce: 'post',
    apply: 'serve',
    async configureServer(server) {
      if (shouldSkip(server)) return;
      uiServer = await createUIServer(serverEnv(server));
      await uiServer.ready();
    },
    async closeBundle() {
      await uiServer?.shutdown();
    },
  };
}

process.on('beforeExit', async () => {
  if (!uiServer) return;
  await uiServer?.shutdown();
});
