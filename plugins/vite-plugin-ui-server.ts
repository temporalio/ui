import { chalk } from 'zx';
import type { Plugin } from 'vite';
import { createUIServer, UIServer } from '../utilities/ui-server';
import type { ViteDevServer } from 'vite';

const { cyan } = chalk;

let uiServer: UIServer;

const shouldSkip = (server: ViteDevServer): boolean => {
  if (process.env.VERCEL) return true;
  if (process.env.HISTOIRE) return true;
  if (process.env.VITEST) return true;
  if (process.env.CI) return true;
  if (server.config.mode !== 'ui-server') return true;

  return false;
};

export function uiServerPlugin(): Plugin {
  return {
    name: 'vite-plugin-ui-server',
    enforce: 'post',
    apply: 'serve',
    async configureServer(server) {
      if (shouldSkip(server)) return;

      if (server.config.mode === 'ui-server') {
        uiServer = await createUIServer();
        await uiServer.ready();
      }
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
