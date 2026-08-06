import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import * as nodeUtil from 'node:util';

import type { Plugin, ResolvedConfig } from 'vite';

import type {
  BrowserWorkflowCatalogArtifact,
  BrowserWorkflowCatalogDescriptor,
} from '../src/lib/workflow-catalog/browser/types';
import { workflowCatalogRoutingFromEnvironment } from '../src/lib/workflow-catalog/node/routing-config';

const publicModuleId = 'virtual:workflow-catalog-local';
const resolvedModuleId = `\0${publicModuleId}`;
const localArtifactPath = '.workflow-catalog/local.generated.json';
const localEnvironmentPath = '.env.workflow-catalog.local';
const parseEnvironmentFile = Reflect.get(nodeUtil, 'parseEnv') as (
  content: string,
) => Record<string, string>;

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
      descriptor.source !== 'local'
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

export const loadLocalWorkflowCatalogRouting = async (
  rootDirectory: string,
  environment: Record<string, string | undefined> = process.env,
) => {
  let fileEnvironment: Record<string, string> = {};

  try {
    fileEnvironment = parseEnvironmentFile(
      await readFile(join(rootDirectory, localEnvironmentPath), 'utf8'),
    );
  } catch (error) {
    if (!isMissingFile(error)) throw error;
  }

  return workflowCatalogRoutingFromEnvironment({
    ...fileEnvironment,
    ...environment,
  });
};

export const workflowCatalogLocalPlugin = (
  environment: Record<string, string | undefined> = process.env,
): Plugin => {
  let rootDirectory = process.cwd();

  return {
    name: 'vite-plugin-workflow-catalog-local',
    configResolved(config: ResolvedConfig) {
      rootDirectory = config.root;
    },
    configureServer(server) {
      const watchedPaths = [
        join(rootDirectory, localArtifactPath),
        join(rootDirectory, localEnvironmentPath),
      ];
      for (const path of watchedPaths) server.watcher.add(path);

      const reloadLocalCatalog = (changedPath: string) => {
        if (!watchedPaths.includes(changedPath)) return;
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

      const [descriptors, routing] = await Promise.all([
        loadLocalWorkflowCatalogDescriptors(rootDirectory),
        loadLocalWorkflowCatalogRouting(rootDirectory, environment),
      ]);
      return [
        `export const localWorkflowCatalog = ${JSON.stringify(descriptors)};`,
        `export const workflowCatalogRouting = ${JSON.stringify(routing)};`,
      ].join('\n');
    },
  };
};
