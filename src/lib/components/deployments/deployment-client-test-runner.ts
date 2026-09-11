import { Buffer } from 'node:buffer';
import path from 'node:path';
import {
  TextDecoder as NodeTextDecoder,
  TextEncoder as NodeTextEncoder,
} from 'node:util';

import { startIsolatedViteServer } from '$lib/test-utilities/isolated-vite-server';

type ClientRunner = typeof import('./deployment-client-test-runner-entry');

export const VITE_SERVER_BOOT_TIMEOUT_MS = 60_000;

let closeViteServer: (() => Promise<void>) | undefined;
let runner: ClientRunner | undefined;
let textEncoder: PropertyDescriptor | undefined;
let textDecoder: PropertyDescriptor | undefined;
let uint8Array: typeof Uint8Array | undefined;

function defineGlobal(name: string, value: unknown) {
  Object.defineProperty(globalThis, name, {
    configurable: true,
    writable: true,
    value,
  });
}

export async function getDeploymentClientTestRunner(): Promise<ClientRunner> {
  if (runner) return runner;

  const projectRoot = process.cwd();
  try {
    // Vitest's JSDOM realm supplies a Uint8Array that differs from Node's
    // TextEncoder result. esbuild validates that pair while Vite starts.
    textEncoder = Object.getOwnPropertyDescriptor(globalThis, 'TextEncoder');
    textDecoder = Object.getOwnPropertyDescriptor(globalThis, 'TextDecoder');
    uint8Array = globalThis.Uint8Array;
    defineGlobal('TextEncoder', NodeTextEncoder);
    defineGlobal('TextDecoder', NodeTextDecoder);
    globalThis.Uint8Array = Object.getPrototypeOf(Buffer) as typeof Uint8Array;
    const [
      { svelte },
      { createRunnableDevEnvironment, createServer, isRunnableDevEnvironment },
    ] = await Promise.all([
      import('@sveltejs/vite-plugin-svelte'),
      import('vite'),
    ]);
    const lifecycle = await startIsolatedViteServer(
      createServer,
      {
        root: projectRoot,
        configFile: false,
        appType: 'custom',
        plugins: [svelte({ hot: false, prebundleSvelteLibraries: false })],
        optimizeDeps: {
          noDiscovery: true,
          exclude: ['svelte'],
          include: ['@temporalio/common', 'json-bigint'],
        },
        resolve: {
          dedupe: ['svelte'],
          alias: [
            {
              find: '/@vite/client',
              replacement: path.resolve(
                projectRoot,
                'src/lib/components/deployments/vite-client-test-double.ts',
              ),
            },
            {
              find: '$lib/services/deployments-service',
              replacement: path.resolve(
                projectRoot,
                'src/lib/components/deployments/deployments-service-client-test-double.ts',
              ),
            },
            {
              find: '$lib/components/timestamp.svelte',
              replacement: path.resolve(
                projectRoot,
                'src/lib/components/deployments/timestamp-client-test-double.svelte',
              ),
            },
            {
              find: '$lib',
              replacement: path.resolve(projectRoot, 'src/lib'),
            },
            {
              find: '$types',
              replacement: path.resolve(projectRoot, 'src/types'),
            },
            {
              find: '$app',
              replacement: path.resolve(
                projectRoot,
                'src/lib/svelte-mocks/app',
              ),
            },
          ],
        },
        server: { middlewareMode: true, hmr: false },
        environments: {
          client: {
            consumer: 'client',
            dev: {
              createEnvironment: (name, config, context) =>
                createRunnableDevEnvironment(name, config, {
                  ...context,
                  hot: false,
                  runnerOptions: { hmr: false },
                }),
              moduleRunnerTransform: true,
            },
          },
        },
      },
      async (server) => {
        const clientEnvironment = server.environments.client;
        if (!isRunnableDevEnvironment(clientEnvironment)) {
          throw new Error('The Vite client test environment is not runnable');
        }
        const clientRunner = (await clientEnvironment.runner.import(
          '/src/lib/components/deployments/deployment-client-test-runner-entry.ts',
        )) as ClientRunner;
        await clientRunner.initialize();
        return clientRunner;
      },
    );
    closeViteServer = lifecycle.close;
    runner = lifecycle.value;
    return runner;
  } catch (error) {
    await closeDeploymentClientTestRunner();
    throw error;
  }
}

export async function closeDeploymentClientTestRunner() {
  runner = undefined;
  const closeServer = closeViteServer;
  closeViteServer = undefined;
  await closeServer?.();
  if (textEncoder)
    Object.defineProperty(globalThis, 'TextEncoder', textEncoder);
  if (textDecoder)
    Object.defineProperty(globalThis, 'TextDecoder', textDecoder);
  if (uint8Array) globalThis.Uint8Array = uint8Array;
  textEncoder = undefined;
  textDecoder = undefined;
  uint8Array = undefined;
}
