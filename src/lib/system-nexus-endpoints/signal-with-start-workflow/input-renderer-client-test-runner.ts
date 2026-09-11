import { Buffer } from 'node:buffer';
import path from 'node:path';
import {
  TextDecoder as NodeTextDecoder,
  TextEncoder as NodeTextEncoder,
} from 'node:util';

import type { ViteDevServer } from 'vite';

type ClientRunner = typeof import('./input-renderer-client-test-runner-entry');

let viteServer: ViteDevServer | undefined;
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

export async function getInputRendererClientTestRunner(): Promise<ClientRunner> {
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
    viteServer = await createServer({
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
            find: '$lib/components/payload/payload-code-block.svelte',
            replacement: path.resolve(
              projectRoot,
              'src/lib/system-nexus-endpoints/signal-with-start-workflow/input-renderer-payload-code-block-test-double.svelte',
            ),
          },
          {
            find: '/@vite/client',
            replacement: path.resolve(
              projectRoot,
              'src/lib/components/deployments/vite-client-test-double.ts',
            ),
          },
          { find: '$lib', replacement: path.resolve(projectRoot, 'src/lib') },
          {
            find: '$types',
            replacement: path.resolve(projectRoot, 'src/types'),
          },
          {
            find: '$app',
            replacement: path.resolve(projectRoot, 'src/lib/svelte-mocks/app'),
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
    });
    const clientEnvironment = viteServer.environments.client;
    if (!isRunnableDevEnvironment(clientEnvironment)) {
      throw new Error('The Vite client test environment is not runnable');
    }
    runner = (await clientEnvironment.runner.import(
      '/src/lib/system-nexus-endpoints/signal-with-start-workflow/input-renderer-client-test-runner-entry.ts',
    )) as ClientRunner;
    return runner;
  } catch (error) {
    await closeInputRendererClientTestRunner();
    throw error;
  }
}

export async function closeInputRendererClientTestRunner() {
  runner = undefined;
  const server = viteServer;
  viteServer = undefined;
  await server?.close();
  if (textEncoder)
    Object.defineProperty(globalThis, 'TextEncoder', textEncoder);
  if (textDecoder)
    Object.defineProperty(globalThis, 'TextDecoder', textDecoder);
  if (uint8Array) globalThis.Uint8Array = uint8Array;
  textEncoder = undefined;
  textDecoder = undefined;
  uint8Array = undefined;
}
