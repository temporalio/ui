import type {
  CatalogExampleDefinition,
  CatalogRegistry,
  CatalogWorkspaceDefinition,
  WorkflowImplementation,
} from './registry';
import type { BrowserCatalogSource } from '../browser/types';

export type CatalogRegistrationSource = {
  source: BrowserCatalogSource;
  sourceFiles: string[];
  register: (registry: CatalogRegistry) => void;
};

export type CatalogWorkspaceGrouping = 'shared' | 'per-folder';

export type CatalogSourceWorkspace = {
  id: string;
  grouping: CatalogWorkspaceGrouping;
  namespace: string;
  taskQueue: string;
  workflowsPath: string;
  metadata?: CatalogWorkspaceDefinition;
};

export type CatalogSourceFolder = {
  id: string;
  example: CatalogExampleDefinition;
  workflows?: Readonly<Record<string, unknown>>;
  workflowsPath?: string;
  metadata?: CatalogWorkspaceDefinition;
};

export const perFolderWorkspaceId = (workspaceId: string, folderId: string) =>
  `${workspaceId}-${folderId}`;

export const perFolderTaskQueue = (taskQueue: string, folderId: string) =>
  `${taskQueue}-${folderId}`;

const collectWorkflowExports = (
  workspaceId: string,
  folders: readonly CatalogSourceFolder[],
) => {
  const workflowExports: Record<string, WorkflowImplementation> = {};

  for (const folder of folders) {
    for (const [name, value] of Object.entries(folder.workflows ?? {})) {
      if (typeof value !== 'function') continue;

      const existing = workflowExports[name];
      if (existing && existing !== value) {
        throw new Error(
          `Catalog workflow export "${name}" is defined by more than one folder in workspace "${workspaceId}"`,
        );
      }

      workflowExports[name] = value as WorkflowImplementation;
    }
  }

  return workflowExports;
};

const registerSharedWorkspace = (
  registry: CatalogRegistry,
  workspace: CatalogSourceWorkspace,
  folders: readonly CatalogSourceFolder[],
) => {
  const folderWithMetadata = folders.find(({ metadata }) => metadata);
  if (folderWithMetadata) {
    throw new Error(
      `Catalog folder "${folderWithMetadata.id}" describes a workspace, but workspace "${workspace.id}" is shared`,
    );
  }

  registry.registerWorkspace({
    ...workspace.metadata,
    id: workspace.id,
    namespace: workspace.namespace,
    taskQueue: workspace.taskQueue,
    workflowsPath: workspace.workflowsPath,
    workflowExports: collectWorkflowExports(workspace.id, folders),
  });

  for (const { example } of folders) {
    registry.registerExample({ ...example, workspaceId: workspace.id });
  }
};

const registerPerFolderWorkspaces = (
  registry: CatalogRegistry,
  workspace: CatalogSourceWorkspace,
  folders: readonly CatalogSourceFolder[],
) => {
  if (workspace.metadata) {
    throw new Error(
      `Catalog workspace "${workspace.id}" groups per folder, so each folder describes its own workspace`,
    );
  }

  for (const folder of folders) {
    const workspaceId = perFolderWorkspaceId(workspace.id, folder.id);

    registry.registerWorkspace({
      ...folder.metadata,
      id: workspaceId,
      namespace: workspace.namespace,
      taskQueue: perFolderTaskQueue(workspace.taskQueue, folder.id),
      workflowsPath: folder.workflowsPath ?? workspace.workflowsPath,
      workflowExports: collectWorkflowExports(workspaceId, [folder]),
    });
    registry.registerExample({ ...folder.example, workspaceId });
  }
};

export const registerCatalogSource = (
  registry: CatalogRegistry,
  workspace: CatalogSourceWorkspace,
  folders: readonly CatalogSourceFolder[],
) =>
  workspace.grouping === 'per-folder'
    ? registerPerFolderWorkspaces(registry, workspace, folders)
    : registerSharedWorkspace(registry, workspace, folders);
