import { spawn } from 'node:child_process';

import type { Plugin } from 'vite';

import {
  createWorkflowCatalogLocalArtifactVitePlugin,
  loadWorkflowCatalogLocalArtifactDescriptors,
} from '../src/lib/workflow-catalog/authoring';
import type { BrowserWorkflowCatalogDescriptor } from '../src/lib/workflow-catalog/browser/types';

const localArtifactPath = 'workflow-catalog.local/catalog.generated.json';
const localSourcePaths = [
  'workflow-catalog.local/registration.ts',
  'workflow-catalog.local/workflows.ts',
];
const localSourceRootPaths = ['workflow-catalog.local/examples'];

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

const spawnLocalCatalogGeneration = (rootDirectory: string) =>
  new Promise<void>((settle) => {
    const child = spawn('pnpm', ['workflow-catalog:generate'], {
      cwd: rootDirectory,
      stdio: 'inherit',
    });
    child.on('close', () => settle());
    child.on('error', (error) => {
      console.error(
        `Workflow catalog generation failed to start: ${error.message}`,
      );
      settle();
    });
  });

export type WorkflowCatalogLocalPluginOptions = {
  regenerate?: (rootDirectory: string) => Promise<void>;
};

export const workflowCatalogLocalPlugin = ({
  regenerate = spawnLocalCatalogGeneration,
}: WorkflowCatalogLocalPluginOptions = {}): Plugin =>
  createWorkflowCatalogLocalArtifactVitePlugin({
    artifactPath: localArtifactPath,
    regenerate,
    sourcePaths: localSourcePaths,
    sourceRootPaths: localSourceRootPaths,
    validateDescriptor: isLocalDescriptor,
  }) as Plugin;
