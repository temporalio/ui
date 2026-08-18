import { spawn } from 'node:child_process';

import type { Plugin } from 'vite';

import {
  type CatalogLocalAuthoringBridgeOptions,
  createCatalogLocalAuthoringBridge,
} from './catalog-local-authoring-bridge';
import {
  createCatalogLocalArtifactVitePlugin,
  loadCatalogLocalArtifactDescriptors,
} from '../src/lib/catalog/authoring';
import type { BrowserCatalogDescriptor } from '../src/lib/catalog/browser/types';

const localArtifactPath = 'catalog.local/catalog.generated.json';
const localSourceRootPaths = ['catalog.local/examples'];
const resolvedLocalCatalogModuleId = '\0virtual:catalog-local';
const emptyLocalCatalogModule = 'export const localCatalog = [];';
export const catalogLocalRefreshEvent = 'catalog-local:refresh';

const isLocalDescriptor = (
  descriptor: unknown,
): descriptor is BrowserCatalogDescriptor =>
  Boolean(
    descriptor &&
    typeof descriptor === 'object' &&
    'id' in descriptor &&
    typeof descriptor.id === 'string' &&
    'source' in descriptor &&
    typeof descriptor.source === 'object' &&
    descriptor.source !== null &&
    'id' in descriptor.source &&
    descriptor.source.id === 'local' &&
    'label' in descriptor.source &&
    typeof descriptor.source.label === 'string' &&
    descriptor.source.label.length > 0,
  );

export const loadLocalCatalogDescriptors = async (
  rootDirectory: string,
): Promise<BrowserCatalogDescriptor[]> =>
  (await loadCatalogLocalArtifactDescriptors({
    artifactPath: localArtifactPath,
    rootDirectory,
    validateDescriptor: isLocalDescriptor,
  })) as BrowserCatalogDescriptor[];

type AuthoringCommandChild = {
  once(
    event: 'close',
    listener: (code: number | null, signal: NodeJS.Signals | null) => void,
  ): unknown;
  once(event: 'error', listener: (error: Error) => void): unknown;
};

type StartAuthoringCommand = (
  command: string,
  args: string[],
  options: { cwd: string; stdio: 'inherit' },
) => AuthoringCommandChild;

export const runAuthoringCommand = (
  rootDirectory: string,
  start: StartAuthoringCommand = spawn,
) =>
  new Promise<void>((resolve, reject) => {
    const child = start('pnpm', ['catalog', 'generate'], {
      cwd: rootDirectory,
      stdio: 'inherit',
    });
    child.once('error', reject);
    child.once('close', (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }
      if (signal) {
        reject(new Error(`Catalog generation terminated by signal ${signal}`));
        return;
      }
      reject(
        new Error(`Catalog generation exited with status ${code ?? 'unknown'}`),
      );
    });
  });

export type CatalogLocalPluginOptions = {
  authoring?: CatalogLocalAuthoringBridgeOptions['authoring'];
  loadDescriptors?: typeof loadLocalCatalogDescriptors;
  regenerate?: (rootDirectory: string) => Promise<void>;
};

export const catalogLocalPlugin = ({
  authoring,
  loadDescriptors = loadLocalCatalogDescriptors,
  regenerate = runAuthoringCommand,
}: CatalogLocalPluginOptions = {}): Plugin => {
  const localArtifactPlugin = createCatalogLocalArtifactVitePlugin({
    artifactPath: localArtifactPath,
    regenerate,
    sourceRootPaths: localSourceRootPaths,
    validateDescriptor: isLocalDescriptor,
  });
  let isDevelopment = false;
  let rootDirectory = process.cwd();
  let bridge: ReturnType<typeof createCatalogLocalAuthoringBridge> | undefined;
  let developmentServer:
    | {
        moduleGraph: {
          getModuleById: (id: string) => unknown;
          invalidateModule: (module: never) => void;
        };
        ws: {
          send: (payload: {
            data?: { descriptors: BrowserCatalogDescriptor[] };
            event?: typeof catalogLocalRefreshEvent;
            type: 'custom' | 'full-reload';
          }) => void;
        };
      }
    | undefined;
  const publishRefresh = async () => {
    if (!developmentServer) return;
    const descriptors = await loadDescriptors(rootDirectory);
    developmentServer.ws.send({
      data: { descriptors },
      event: catalogLocalRefreshEvent,
      type: 'custom',
    });
  };

  return {
    ...localArtifactPlugin,
    configResolved(config) {
      isDevelopment = config.command === 'serve';
      rootDirectory = config.root;
      localArtifactPlugin.configResolved(config);
    },
    configureServer(server) {
      if (!isDevelopment) return;
      developmentServer = server;
      bridge = createCatalogLocalAuthoringBridge({
        ...(authoring ? { authoring } : {}),
        loadAuthoring: async (directory) => {
          const authoringModule = (await server.ssrLoadModule(
            '/scripts/catalog/ui-authoring.ts',
          )) as typeof import('../scripts/catalog/ui-authoring');
          return authoringModule.createUiCatalogAuthoring(directory);
        },
        onMutationDelivered: (mutation) => {
          if (
            mutation.kind === 'scaffold' ||
            (mutation.kind === 'save' && mutation.terminal.reload === 'publish')
          ) {
            void publishRefresh().catch((error) => {
              console.error(
                `Catalog refresh failed: ${
                  error instanceof Error ? error.message : String(error)
                }`,
              );
            });
          }
        },
        rootDirectory,
      });
      server.middlewares?.use(bridge.middleware);
      localArtifactPlugin.configureServer({
        ...server,
        watcher: {
          add: (path: string) => server.watcher.add(path),
          on: (event: string, handler: (path: string) => void) =>
            server.watcher.on(event, (path) => {
              if (bridge?.shouldSuppressWatchEvent(path)) return;
              handler(path);
            }),
        },
      });
    },
    hotUpdate: {
      order: 'post',
      handler(options) {
        if (bridge?.shouldSuppressWatchEvent(options.file)) return [];
      },
    },
    async load(id) {
      if (!isDevelopment && id === resolvedLocalCatalogModuleId) {
        return emptyLocalCatalogModule;
      }
      return localArtifactPlugin.load(id);
    },
  } as Plugin;
};
