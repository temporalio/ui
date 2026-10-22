import { startServer } from './server';
import { startTunnel } from './tunnel';
import { startUi } from './ui';
import { startCatalogWorker } from './worker';
import type { DemoStage } from '../../../src/lib/demo/stage';

/**
 * This repository's stages, in the order a run needs them: a server to dial, a
 * worker to poll it, a tunnel so something outside this machine can dial back,
 * then the UI a reviewer looks at.
 *
 * Each one adapts a start function to the registry's contract. The adapting is
 * the point: the start functions know about this repository's layout, and the
 * core must not.
 */
export const uiDemoStages: DemoStage[] = [
  {
    name: 'server',
    enabled: (definition) => definition.server.enabled,
    idle: ({ address }) => [`Expecting a server on ${address}`],
    run: async ({ definition, log, runName }) => {
      const provisioned = await startServer(definition.server, log, runName);

      return {
        address: provisioned.address,
        bundledUiUrl: provisioned.bundledUiUrl,
        processes: provisioned.process ? [provisioned.process] : [],
        ownedPorts: provisioned.process
          ? [
              definition.server.port,
              definition.server.uiPort,
              definition.server.httpPort ?? definition.server.port + 1,
            ]
          : [],
        details: [
          `Listening on ${provisioned.address}, namespace "${provisioned.namespace}"`,
          ...(provisioned.reusedExisting
            ? []
            : [
                `Temporal CLI ${provisioned.cliVersion}, Server ${provisioned.serverVersion}`,
                ...provisioned.provenance,
                ...Object.entries(definition.server.dynamicConfig).map(
                  ([key, value]) =>
                    `Dynamic config: ${key}=${JSON.stringify(value)}`,
                ),
              ]),
          `Bundled Web UI: ${provisioned.bundledUiUrl}`,
        ],
      };
    },
  },
  {
    name: 'worker',
    enabled: (definition) => definition.worker.enabled,
    run: async ({ address, definition, log, runName }) => {
      const running = await startCatalogWorker(
        definition.worker,
        address,
        definition.server.namespace,
        log,
        runName,
      );

      return {
        processes: running.process ? [running.process] : [],
        details: [
          `The catalog worker is polling for: ${running.targets.join(', ')}`,
          'Started with "pnpm catalog worker", so the demo runs the same code the catalog page runs.',
        ],
      };
    },
  },
  {
    name: 'tunnel',
    enabled: (definition) => definition.tunnel.enabled,
    run: async ({ definition, log, runName }) => {
      const running = await startTunnel(
        definition.tunnel,
        definition.server.port,
        log,
        runName,
      );

      return {
        publicAddress: running.publicAddress,
        processes: running.process ? [running.process] : [],
        details: [
          `Frontend reachable from outside this machine at ${running.publicAddress}`,
          'A server-scaled Worker dials the frontend back, which localhost cannot offer.',
          'The hostname changes per run, so anything holding it must be updated each time.',
        ],
      };
    },
  },
  {
    name: 'ui',
    enabled: (definition) => definition.ui.enabled,
    run: async ({ address, definition, log, runName }) => {
      const running = await startUi(definition.ui, address, log, runName);

      const ownedPorts = running.processes.flatMap((child) => {
        if (child.label === 'ui-server') return [definition.ui.apiPort];
        if (child.label === 'ui') return [definition.ui.webPort];
        return [];
      });

      return {
        webUrl: running.webUrl,
        processes: running.processes,
        ownedPorts,
        details: [
          ...(running.apiUrl ? [`ui-server API: ${running.apiUrl}`] : []),
          ...(running.webUrl ? [`UI: ${running.webUrl}`] : []),
        ],
      };
    },
  },
];
