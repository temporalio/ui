import { Buffer } from 'node:buffer';
import path from 'node:path';
import { TextEncoder as NodeTextEncoder } from 'node:util';

import type { ViteDevServer } from 'vite';

type ClientRunner = typeof import('./deployment-client-test-runner-entry');

let viteServer: ViteDevServer | undefined;
let runner: ClientRunner | undefined;
let textEncoder: typeof TextEncoder | undefined;
let uint8Array: typeof Uint8Array | undefined;

export async function getDeploymentClientTestRunner(): Promise<ClientRunner> {
  if (runner) return runner;

  const projectRoot = process.cwd();
  try {
    // Vitest's JSDOM realm supplies a Uint8Array that differs from Node's
    // TextEncoder result. esbuild validates that pair while Vite starts.
    textEncoder = globalThis.TextEncoder;
    uint8Array = globalThis.Uint8Array;
    globalThis.TextEncoder = NodeTextEncoder;
    globalThis.Uint8Array = Object.getPrototypeOf(Buffer) as typeof Uint8Array;
    const [{ svelte }, { createRunnableDevEnvironment, createServer }] =
      await Promise.all([
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
    runner = (await viteServer.environments.client.runner.import(
      '/src/lib/components/deployments/deployment-client-test-runner-entry.ts',
    )) as ClientRunner;
    await runner.initialize();
    return runner;
  } catch (error) {
    await closeDeploymentClientTestRunner();
    throw error;
  }
}

export async function closeDeploymentClientTestRunner() {
  runner = undefined;
  const server = viteServer;
  viteServer = undefined;
  await server?.close();
  if (textEncoder) globalThis.TextEncoder = textEncoder;
  if (uint8Array) globalThis.Uint8Array = uint8Array;
  textEncoder = undefined;
  uint8Array = undefined;
}
