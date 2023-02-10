import { TestWorkflowEnvironment } from '@temporalio/testing';
import type { Plugin } from 'vite';

export function temporalServer(): Plugin {
  return {
    name: 'vite-plugin-temporal-server',
    configureServer(server) {
      let temporalServer: TestWorkflowEnvironment;
      const port = +server.config.env.VITE_TEMPORAL_PORT;
      const api = server.config.env.VITE_UI_SERVER_PORT;
      const extraArgs = [`--ui-port=${api}`];

      console.log({ port, api, extraArgs });

      server.httpServer?.on('listening', async () => {
        temporalServer = await TestWorkflowEnvironment.createLocal({
          server: { port, ui: true, extraArgs, namespace: 'default' }, // TODO remove `namespace: 'default'` once SDKs switch to Temporal CLI
        });
      });

      server.httpServer?.on('close', () => {
        temporalServer.teardown();
      });
    },
  };
}
