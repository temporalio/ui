import { Buffer } from 'node:buffer';
import path from 'node:path';
import {
  TextDecoder as NodeTextDecoder,
  TextEncoder as NodeTextEncoder,
} from 'node:util';

import { startIsolatedViteServer } from '$lib/test-utilities/isolated-vite-server';

type ClientRunner = typeof import('./catalog-client-test-runner-entry');

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

export async function getCatalogClientTestRunner(): Promise<ClientRunner> {
  if (runner) return runner;

  const projectRoot = process.cwd();
  try {
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
          include: ['json-bigint'],
        },
        resolve: {
          dedupe: ['svelte'],
          alias: [
            {
              find: /^\.\/schema-validator$/,
              replacement: path.resolve(
                projectRoot,
                'src/lib/catalog/browser/schema-validator-client-test-double.ts',
              ),
            },
            {
              find: '/@vite/client',
              replacement: path.resolve(
                projectRoot,
                'src/lib/components/deployments/vite-client-test-double.ts',
              ),
            },
            // These two ship CommonJS, and pre-bundling them cost more setup
            // time than this harness's hook allows. Neither value is asserted.
            {
              find: /^date-fns-tz$/,
              replacement: path.resolve(
                projectRoot,
                'src/lib/catalog/browser/date-fns-tz-test-double.ts',
              ),
            },
            {
              find: /^tailwindcss\/colors$/,
              replacement: path.resolve(
                projectRoot,
                'src/lib/catalog/browser/tailwind-colors-test-double.ts',
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
        return (await clientEnvironment.runner.import(
          '/src/lib/catalog/browser/catalog-client-test-runner-entry.ts',
        )) as ClientRunner;
      },
    );
    closeViteServer = lifecycle.close;
    runner = lifecycle.value;
    return runner;
  } catch (error) {
    await closeCatalogClientTestRunner();
    throw error;
  }
}

export async function closeCatalogClientTestRunner() {
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
