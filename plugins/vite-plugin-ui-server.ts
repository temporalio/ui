import { chalk } from 'zx';
import type { Plugin } from 'vite';
import { createUIServer, UIServer } from '../utilities/ui-server';
import { ViteDevServer } from 'vite';

const { cyan } = chalk;

let uiServer: UIServer;
const PORT = 8081;

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
        console.log(cyan(`Starting local UI Server on Port ${PORT}...`));
        uiServer = await createUIServer(PORT);
        await uiServer.ready();
        console.log(cyan(`UI Server is running on Port ${PORT}`));
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
