import { spawn } from 'node:child_process';

import type { Plugin } from 'vite';

import {
  createCatalogLocalArtifactVitePlugin,
  loadCatalogLocalArtifactDescriptors,
} from '../src/lib/catalog/authoring';
import type { BrowserCatalogDescriptor } from '../src/lib/catalog/browser/types';

const localArtifactPath = 'catalog.local/catalog.generated.json';
const localSourceRootPaths = ['catalog.local/examples'];
const resolvedLocalCatalogModuleId = '\0virtual:catalog-local';
const emptyLocalCatalogModule = 'export const localCatalog = [];';

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
  regenerate?: (rootDirectory: string) => Promise<void>;
};

export const catalogLocalPlugin = ({
  regenerate = runAuthoringCommand,
}: CatalogLocalPluginOptions = {}): Plugin => {
  const localArtifactPlugin = createCatalogLocalArtifactVitePlugin({
    artifactPath: localArtifactPath,
    regenerate,
    sourceRootPaths: localSourceRootPaths,
    validateDescriptor: isLocalDescriptor,
  });
  let isDevelopment = false;

  return {
    ...localArtifactPlugin,
    configResolved(config) {
      isDevelopment = config.command === 'serve';
      localArtifactPlugin.configResolved(config);
    },
    configureServer(server) {
      if (!isDevelopment) return;
      localArtifactPlugin.configureServer(server);
    },
    async load(id) {
      if (!isDevelopment && id === resolvedLocalCatalogModuleId) {
        return emptyLocalCatalogModule;
      }
      return localArtifactPlugin.load(id);
    },
  } as Plugin;
};
