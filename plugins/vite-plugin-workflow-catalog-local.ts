import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { Plugin, ResolvedConfig } from 'vite';

import type {
  BrowserWorkflowCatalogArtifact,
  BrowserWorkflowCatalogDescriptor,
} from '../src/lib/workflow-catalog/browser/types';

const publicModuleId = 'virtual:workflow-catalog-local';
const resolvedModuleId = `\0${publicModuleId}`;
const localArtifactPath = 'workflow-catalog.local/catalog.generated.json';
const localSourcePaths = [
  'workflow-catalog.local/registration.ts',
  'workflow-catalog.local/workflows.ts',
];

const isMissingFile = (error: unknown): error is NodeJS.ErrnoException =>
  error instanceof Error && 'code' in error && error.code === 'ENOENT';

const parseLocalArtifact = (
  content: string,
): BrowserWorkflowCatalogDescriptor[] => {
  const artifact = JSON.parse(content) as BrowserWorkflowCatalogArtifact;

  if (!Array.isArray(artifact.descriptors)) {
    throw new Error(
      `Workflow catalog artifact "${localArtifactPath}" must contain a descriptors array`,
    );
  }

  for (const descriptor of artifact.descriptors) {
    if (
      !descriptor ||
      typeof descriptor !== 'object' ||
      typeof descriptor.id !== 'string' ||
      typeof descriptor.source !== 'object' ||
      descriptor.source === null ||
      descriptor.source.id !== 'local' ||
      typeof descriptor.source.label !== 'string' ||
      descriptor.source.label.length === 0
    ) {
      throw new Error(
        `Workflow catalog artifact "${localArtifactPath}" contains an invalid local descriptor`,
      );
    }
  }

  return artifact.descriptors;
};

export const loadLocalWorkflowCatalogDescriptors = async (
  rootDirectory: string,
): Promise<BrowserWorkflowCatalogDescriptor[]> => {
  try {
    const content = await readFile(
      join(rootDirectory, localArtifactPath),
      'utf8',
    );
    return parseLocalArtifact(content);
  } catch (error) {
    if (isMissingFile(error)) return [];
    throw error;
  }
};

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
}: WorkflowCatalogLocalPluginOptions = {}): Plugin => {
  let rootDirectory = process.cwd();

  return {
    name: 'vite-plugin-workflow-catalog-local',
    configResolved(config: ResolvedConfig) {
      rootDirectory = config.root;
    },
    configureServer(server) {
      const artifactPath = join(rootDirectory, localArtifactPath);
      const sourcePaths = localSourcePaths.map((path) =>
        join(rootDirectory, path),
      );
      const watchedPaths = [artifactPath, ...sourcePaths];
      for (const path of watchedPaths) server.watcher.add(path);

      let regenerating = false;
      let regenerationQueued = false;
      const regenerateLocalCatalog = async () => {
        if (regenerating) {
          regenerationQueued = true;
          return;
        }

        regenerating = true;
        try {
          await regenerate(rootDirectory);
        } finally {
          regenerating = false;
          if (regenerationQueued) {
            regenerationQueued = false;
            void regenerateLocalCatalog();
          }
        }
      };

      const reloadLocalCatalog = (changedPath: string) => {
        if (sourcePaths.includes(changedPath)) {
          void regenerateLocalCatalog();
          return;
        }

        if (changedPath !== artifactPath) return;
        const module = server.moduleGraph.getModuleById(resolvedModuleId);
        if (module) server.moduleGraph.invalidateModule(module);
        server.ws.send({ type: 'full-reload' });
      };

      server.watcher.on('add', reloadLocalCatalog);
      server.watcher.on('change', reloadLocalCatalog);
      server.watcher.on('unlink', reloadLocalCatalog);
    },
    resolveId(id) {
      if (id === publicModuleId) return resolvedModuleId;
    },
    async load(id) {
      if (id !== resolvedModuleId) return;

      const descriptors =
        await loadLocalWorkflowCatalogDescriptors(rootDirectory);
      return `export const localWorkflowCatalog = ${JSON.stringify(descriptors)};`;
    },
  };
};
