import type { Plugin } from 'vite';
import type { ViteDevServer } from 'vite';
import { chalk } from 'zx';

import {
  createTemporalServer,
  type TemporalServer,
} from '../utilities/temporal-server';

const { cyan, magenta } = chalk;

let temporal: TemporalServer;

const shouldSkip = (server: ViteDevServer): boolean => {
  if (process.env.VERCEL) return true;
  if (process.env.HISTOIRE) return true;
  if (process.env.VITEST) return true;
  if (temporal) return true;
  if (process.platform === 'win32') return true;
  if (server.config.mode === 'docker' || server.config.mode.includes('test'))
    return true;

  return false;
};

const getPortFromApiEndpoint = (endpoint: string, fallback = 8233): number => {
  return validatePort(
    endpoint.slice(endpoint.lastIndexOf(':') + 1, endpoint.length),
    fallback,
  );
};

const isValidPort = (port: number): boolean => {
  if (typeof port !== 'number') return false;
  if (isNaN(port)) return false;
  if (port <= 1024) return false;
  if (port > 65536) return false;
  return true;
};

const validatePort = (port: number | string, fallback: number): number => {
  port = Number(port);

  if (isValidPort(port)) return port;

  console.error(`${port} is not a valid port. Falling back to ${fallback}.`);

  if (isValidPort(fallback)) return fallback;

  throw new Error(
    `Both the provided port, ${port}, and its fallback, ${fallback}, are invalid ports.`,
  );
};

export function temporalServer(): Plugin {
  return {
    name: 'vite-plugin-temporal-server',
    enforce: 'post',
    apply: 'serve',
    async configureServer(server) {
      if (shouldSkip(server)) return;

      const port = validatePort(server.config.env.VITE_TEMPORAL_PORT, 7233);
      const uiPort = getPortFromApiEndpoint(server.config.env.VITE_API);

      console.log(magenta(`Starting Temporal Server on Port ${port}…`));
      console.log(cyan(`Starting Temporal UI Server on Port ${uiPort}…`));

      temporal = await createTemporalServer({
        port,
        uiPort,
      });

      await temporal.ready();

      console.log(magenta(`Temporal Server is running on Port ${port}.`));
      console.log(cyan(`Temporal UI Server is running on Port ${uiPort}.`));
    },
    async closeBundle() {
      await temporal?.shutdown();
    },
  };
}

process.on('beforeExit', async () => {
  if (!temporal) return;
  await temporal?.shutdown();
});
