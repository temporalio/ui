import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import type { ServiceHandler } from 'nexus-rpc';

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
  | { type: 'target-creating'; targetId: string }
  | { type: 'target-created'; targetId: string }
  | { type: 'target-running'; targetId: string }
  | { type: 'target-stopped'; targetId: string }
  | {
      type: 'target-failed';
      targetId: string;
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
    throw new Error('Catalog has no runnable targets');
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
    targetId: string;
    worker: CatalogWorker;
  }[] = [];
  try {
    for (const binding of bindings) {
      emit({ type: 'target-creating', targetId: binding.target.id });
      try {
        const packagedWorkflowsPath = fileURLToPath(
          new URL(binding.target.workflowsPath, import.meta.url),
        );
        const sourceWorkflowsPath = packagedWorkflowsPath.replace(
          /\.js$/,
          '.ts',
        );
        const worker = await createWorker({
          connection,
          namespace: binding.target.namespace,
          taskQueue: binding.target.taskQueue,
          workflowsPath:
            binding.target.workflowsPath === './workflows.js' &&
            !existsSync(packagedWorkflowsPath) &&
            existsSync(sourceWorkflowsPath)
              ? sourceWorkflowsPath
              : packagedWorkflowsPath,
          activities: binding.activities,
          nexusServices: binding.nexusServices,
        });
        workers.push({ targetId: binding.target.id, worker });
        emit({ type: 'target-created', targetId: binding.target.id });
      } catch (error) {
        emit({
          type: 'target-failed',
          targetId: binding.target.id,
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
    for (const { targetId, worker } of startedWorkers) {
      try {
        worker.shutdown();
      } catch (cleanupError) {
        void cleanupError;
      }
      emit({ type: 'target-stopped', targetId });
    }
  };

  try {
    for (const worker of workers) {
      startedWorkers.push(worker);
      emit({ type: 'target-running', targetId: worker.targetId });
      try {
        runs.push(
          worker.worker.run().catch((error: unknown) => {
            emit({
              type: 'target-failed',
              targetId: worker.targetId,
              phase: 'run',
            });
            throw error;
          }),
        );
      } catch (error) {
        emit({
          type: 'target-failed',
          targetId: worker.targetId,
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
