import { spawn } from 'node:child_process';

import type { Plugin } from 'vite';

import {
  createWorkflowCatalogLocalArtifactVitePlugin,
  loadWorkflowCatalogLocalArtifactDescriptors,
} from '../src/lib/workflow-catalog/authoring';
import type { BrowserWorkflowCatalogDescriptor } from '../src/lib/workflow-catalog/browser/types';

const localArtifactPath = 'workflow-catalog.local/catalog.generated.json';
const localSourceRootPaths = ['workflow-catalog.local/examples'];
const resolvedLocalCatalogModuleId = '\0virtual:workflow-catalog-local';
const emptyLocalCatalogModule = 'export const localWorkflowCatalog = [];';

const isLocalDescriptor = (
  descriptor: unknown,
): descriptor is BrowserWorkflowCatalogDescriptor =>
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

export const loadLocalWorkflowCatalogDescriptors = async (
  rootDirectory: string,
): Promise<BrowserWorkflowCatalogDescriptor[]> =>
  (await loadWorkflowCatalogLocalArtifactDescriptors({
    artifactPath: localArtifactPath,
    rootDirectory,
    validateDescriptor: isLocalDescriptor,
  })) as BrowserWorkflowCatalogDescriptor[];

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
    const child = start('pnpm', ['workflow-catalog', 'generate'], {
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
        reject(
          new Error(
            `Workflow catalog generation terminated by signal ${signal}`,
          ),
        );
        return;
      }
      reject(
        new Error(
          `Workflow catalog generation exited with status ${code ?? 'unknown'}`,
        ),
      );
    });
  });

export type WorkflowCatalogLocalPluginOptions = {
  regenerate?: (rootDirectory: string) => Promise<void>;
};

export const workflowCatalogLocalPlugin = ({
  regenerate = runAuthoringCommand,
}: WorkflowCatalogLocalPluginOptions = {}): Plugin => {
  const localArtifactPlugin = createWorkflowCatalogLocalArtifactVitePlugin({
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
