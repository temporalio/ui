import type { Plugin } from 'vite';
import {
  type TemporalServer,
  createTemporalServer,
} from '../scripts/start-temporal-server';
import kleur from 'kleur';

const { cyan, magenta } = kleur;

let temporal: TemporalServer;

const shouldSkip = !!process.env.VERCEL;

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
  if (typeof port !== 'number') port = Number(port);
  if (isValidPort(port)) return port;
  console.error(`${port} is not a valid port. Falling back to ${fallback}`);
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
      if (shouldSkip) return;
      if (temporal) return;

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
      if (!shouldSkip) return;
      if (!temporal) return;

      await temporal?.shutdown();
    },
  };
}

process.on('beforeExit', async () => {
  await temporal.shutdown();
});
