import type {
  CatalogRoutingInput,
  CatalogSourceContentOverrides,
} from './catalog-artifacts';
import {
  loadCatalogWorkerBindings,
  renderCatalogArtifacts,
  verifyCatalogProjectBoundaries,
} from './catalog-artifacts';
import { catalogRegistrationSource as localFallback } from '../../src/lib/catalog/worker/local-registration-fallback';
import type { CatalogRegistrationSource } from '../../src/lib/catalog/worker/registration-source';
import { catalogRegistrationSource as sharedSource } from '../../src/lib/catalog/worker/shared-registrations';
import { getProjectRoot } from '../get-project-root';

const projectOptions = {
  rootDirectory: getProjectRoot(),
  sharedSource,
  sharedArtifactPath: 'src/lib/catalog/browser/catalog.generated.json',
  sharedTypeScriptArtifactPath: 'src/lib/catalog/browser/catalog.generated.ts',
  localModulePath: 'catalog.local/registration.ts',
  localFallback,
  localArtifactPath: 'catalog.local/catalog.generated.json',
};

const projectBoundaryOptions = {
  rootDirectory: projectOptions.rootDirectory,
  browserFiles: [
    'src/lib/catalog/browser/catalog-detail.svelte',
    'src/lib/catalog/browser/catalog-list.svelte',
    'src/lib/catalog/browser/routing.ts',
    'src/lib/catalog/browser/readiness-loader.ts',
    'src/lib/catalog/browser/session-presentation.ts',
    'src/lib/catalog/browser/start-example.ts',
    'src/lib/catalog/browser/types.ts',
    'src/lib/catalog/browser/workbench-host.ts',
    'src/lib/catalog/browser/execution-log.ts',
    'src/lib/catalog/browser/catalog.ts',
    'src/lib/catalog/browser/catalog.generated.json',
    'src/lib/catalog/browser/catalog.generated.ts',
    'src/lib/catalog/host/workbench-host.ts',
  ],
  packageJsonPath: 'package.json',
  localPaths: [
    projectOptions.localModulePath,
    projectOptions.localArtifactPath,
  ],
};

export type ProjectCatalogArtifactsOptions = {
  rootDirectory?: string;
  sharedSource?: CatalogRegistrationSource;
  localSource?: CatalogRegistrationSource | null;
  sourceContentOverrides?: CatalogSourceContentOverrides;
};

export type ProjectCatalogBoundaryOptions = Pick<
  ProjectCatalogArtifactsOptions,
  'localSource' | 'rootDirectory' | 'sharedSource'
>;

export const renderProjectCatalogArtifacts = async (
  options: ProjectCatalogArtifactsOptions = {},
) =>
  renderCatalogArtifacts({
    ...projectOptions,
    rootDirectory: options.rootDirectory ?? projectOptions.rootDirectory,
    sharedSource: options.sharedSource ?? sharedSource,
    sourceContentOverrides: options.sourceContentOverrides,
    ...(Object.hasOwn(options, 'localSource')
      ? { localSource: options.localSource }
      : {}),
  });

export const loadProjectCatalogWorkerBindings = (
  routing: CatalogRoutingInput = {},
) => loadCatalogWorkerBindings(projectOptions, routing);

export const verifyProjectCatalogBoundaries = (
  options: ProjectCatalogBoundaryOptions = {},
) =>
  verifyCatalogProjectBoundaries({
    ...projectBoundaryOptions,
    rootDirectory: options.rootDirectory ?? projectOptions.rootDirectory,
    declaredSourceFiles: [
      ...new Set([
        ...(options.sharedSource ?? sharedSource).sourceFiles,
        ...localFallback.sourceFiles,
        ...(options.localSource?.sourceFiles ?? []),
      ]),
    ],
  });
