import type { Plugin } from 'vite';
import {
  type TemporalServer,
  createTemporalServer,
} from '../scripts/start-temporal-server';

let temporal: TemporalServer;

export function temporalServer(): Plugin {
  return {
    name: 'vite-plugin-temporal-server',
    enforce: 'post',
    apply: 'serve',
    async configureServer(server) {
      if (temporal) return;

      const port = +server.config.env.VITE_TEMPORAL_PORT;

      temporal = createTemporalServer({ port });

      await temporal.ready();
    },
    async closeBundle() {
      await temporal.shutdown();
    },
  };
}

process.on('beforeExit', async () => {
  await temporal.shutdown();
});
