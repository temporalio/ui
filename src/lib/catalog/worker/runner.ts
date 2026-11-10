import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import type { ServiceHandler } from 'nexus-rpc';

import { crashActivityName, createCrashActivity } from './crash.js';
import type { CatalogWorkerBinding } from './registry';

export type CatalogConnection = {
  close: () => Promise<void>;
};

export type CatalogWorker = {
  run: () => Promise<void>;
  shutdown: () => void;
};

export type CatalogRunnerEvent =
  | { type: 'connection-acquired'; mode: 'owned' | 'provided' }
  | { type: 'workspace-creating'; workspaceId: string }
  | { type: 'workspace-created'; workspaceId: string }
  | { type: 'workspace-running'; workspaceId: string }
  | { type: 'workspace-stopped'; workspaceId: string }
  | {
      type: 'workspace-failed';
      workspaceId: string;
      phase: 'creation' | 'run';
    };

export type CatalogWorkerOptions<
  Connection extends CatalogConnection = CatalogConnection,
> = {
  connection: Connection;
  namespace: string;
  taskQueue: string;
  workflowsPath: string;
  activities: object;
  nexusServices: ServiceHandler[];
  stickyQueueScheduleToStartTimeout?: string;
};

type CatalogRunnerConnectionOptions<Connection extends CatalogConnection> =
  | {
      connection: Connection;
      connectionFactory?: never;
      ownsConnection?: boolean;
    }
  | {
      connection?: never;
      connectionFactory: () => Promise<Connection>;
      ownsConnection?: never;
    };

type StartCatalogRunnerOptions<Connection extends CatalogConnection> =
  CatalogRunnerConnectionOptions<Connection> & {
    bindings: readonly CatalogWorkerBinding[];
    createWorker: (
      options: CatalogWorkerOptions<Connection>,
    ) => Promise<CatalogWorker>;
    events?: (event: CatalogRunnerEvent) => void;
    exit?: (code: number) => void;
  };

const workspaceActivities = (
  binding: CatalogWorkerBinding,
  crashEnabled: boolean,
  exit: (code: number) => void,
) => {
  if (Object.hasOwn(binding.activities, crashActivityName)) {
    throw new Error(
      `Catalog workspace "${binding.workspace.id}" registers the reserved activity "${crashActivityName}"`,
    );
  }

  return {
    ...binding.activities,
    ...createCrashActivity({ enabled: crashEnabled, exit }),
  };
};

export const startCatalogRunner = async <Connection extends CatalogConnection>(
  options: StartCatalogRunnerOptions<Connection>,
) => {
  const { bindings, createWorker, events } = options;
  const emit = (event: CatalogRunnerEvent) => {
    try {
      events?.(event);
    } catch (eventError) {
      void eventError;
    }
  };
  if (bindings.length === 0) {
    throw new Error('Catalog has no runnable workspaces');
  }

  let connection: Connection;
  let ownsConnection: boolean;
  if (options.connectionFactory) {
    connection = await options.connectionFactory();
    ownsConnection = true;
  } else {
    connection = options.connection;
    ownsConnection = options.ownsConnection ?? false;
  }
  emit({
    type: 'connection-acquired',
    mode: ownsConnection ? 'owned' : 'provided',
  });
  const closeOwnedConnection = async () => {
    if (!ownsConnection) return;

    try {
      await connection.close();
    } catch (cleanupError) {
      void cleanupError;
    }
  };
  const workers: {
    workspaceId: string;
    worker: CatalogWorker;
  }[] = [];
  try {
    for (const binding of bindings) {
      emit({ type: 'workspace-creating', workspaceId: binding.workspace.id });
      try {
        const crashEnabled =
          binding.workspace.controls?.includes('crash') ?? false;
        const packagedWorkflowsPath = fileURLToPath(
          new URL(binding.workspace.workflowsPath, import.meta.url),
        );
        const sourceWorkflowsPath = packagedWorkflowsPath.replace(
          /\.js$/,
          '.ts',
        );
        const worker = await createWorker({
          connection,
          namespace: binding.workspace.namespace,
          taskQueue: binding.workspace.taskQueue,
          workflowsPath:
            !existsSync(packagedWorkflowsPath) &&
            existsSync(sourceWorkflowsPath)
              ? sourceWorkflowsPath
              : packagedWorkflowsPath,
          activities: workspaceActivities(
            binding,
            crashEnabled,
            options.exit ?? ((code) => process.exit(code)),
          ),
          nexusServices: binding.nexusServices,
          ...(crashEnabled ? { stickyQueueScheduleToStartTimeout: '1s' } : {}),
        });
        workers.push({ workspaceId: binding.workspace.id, worker });
        emit({ type: 'workspace-created', workspaceId: binding.workspace.id });
      } catch (error) {
        emit({
          type: 'workspace-failed',
          workspaceId: binding.workspace.id,
          phase: 'creation',
        });
        throw error;
      }
    }
  } catch (error) {
    await closeOwnedConnection();
    throw error;
  }

  const startedWorkers: typeof workers = [];
  const runs: Promise<void>[] = [];
  const shutdownStartedWorkers = () => {
    for (const { workspaceId, worker } of startedWorkers) {
      try {
        worker.shutdown();
      } catch (cleanupError) {
        void cleanupError;
      }
      emit({ type: 'workspace-stopped', workspaceId });
    }
  };

  try {
    for (const worker of workers) {
      startedWorkers.push(worker);
      emit({ type: 'workspace-running', workspaceId: worker.workspaceId });
      try {
        runs.push(
          worker.worker.run().catch((error: unknown) => {
            emit({
              type: 'workspace-failed',
              workspaceId: worker.workspaceId,
              phase: 'run',
            });
            throw error;
          }),
        );
      } catch (error) {
        emit({
          type: 'workspace-failed',
          workspaceId: worker.workspaceId,
          phase: 'run',
        });
        throw error;
      }
    }
  } catch (error) {
    shutdownStartedWorkers();
    await Promise.allSettled(runs);
    await closeOwnedConnection();
    throw error;
  }

  let cleanupPromise: Promise<void> | undefined;
  const cleanup = () => {
    cleanupPromise ??= (async () => {
      shutdownStartedWorkers();
      await Promise.allSettled(runs);
      await closeOwnedConnection();
    })();

    return cleanupPromise;
  };
  const completion = Promise.all(runs).then(
    () => undefined,
    async (error: unknown) => {
      try {
        await cleanup();
      } catch (cleanupError) {
        void cleanupError;
      }
      throw error;
    },
  );

  return {
    completion,
    shutdown: cleanup,
  };
};
