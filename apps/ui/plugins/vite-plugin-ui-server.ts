import type { Plugin } from 'vite';
import type { ViteDevServer } from 'vite';

import { createUIServer, type UIServer } from '../utilities/ui-server';

let uiServer: UIServer;

const shouldSkip = (server: ViteDevServer): boolean => {
  if (process.env.VERCEL) return true;
  if (process.env.VITEST) return true;
  if (process.env.CI) return true;
  if (['ui-server', 'local-temporal'].includes(server.config.mode))
    return false;

  return true;
};

export function uiServerPlugin(): Plugin {
  return {
    name: 'vite-plugin-ui-server',
    enforce: 'post',
    apply: 'serve',
    async configureServer(server) {
      if (shouldSkip(server)) return;
      uiServer = await createUIServer();
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
