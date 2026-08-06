import { fileURLToPath } from 'node:url';

import type { ServiceHandler } from 'nexus-rpc';

import type { WorkflowCatalogNodeBinding } from './registry';

export type WorkflowCatalogConnection = {
  close: () => Promise<void>;
};

export type WorkflowCatalogWorker = {
  run: () => Promise<void>;
  shutdown: () => void;
};

export type WorkflowCatalogRunnerEvent =
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

export type WorkflowCatalogWorkerOptions<
  Connection extends WorkflowCatalogConnection = WorkflowCatalogConnection,
> = {
  connection: Connection;
  namespace: string;
  taskQueue: string;
  workflowsPath: string;
  activities: object;
  nexusServices: ServiceHandler[];
};

type WorkflowCatalogRunnerConnectionOptions<
  Connection extends WorkflowCatalogConnection,
> =
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

type StartWorkflowCatalogRunnerOptions<
  Connection extends WorkflowCatalogConnection,
> = WorkflowCatalogRunnerConnectionOptions<Connection> & {
  bindings: readonly WorkflowCatalogNodeBinding[];
  createWorker: (
    options: WorkflowCatalogWorkerOptions<Connection>,
  ) => Promise<WorkflowCatalogWorker>;
  events?: (event: WorkflowCatalogRunnerEvent) => void;
};

export const startWorkflowCatalogRunner = async <
  Connection extends WorkflowCatalogConnection,
>(
  options: StartWorkflowCatalogRunnerOptions<Connection>,
) => {
  const { bindings, createWorker, events } = options;
  const emit = (event: WorkflowCatalogRunnerEvent) => {
    try {
      events?.(event);
    } catch (eventError) {
      void eventError;
    }
  };
  if (bindings.length === 0) {
    throw new Error('Workflow catalog has no runnable targets');
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
    worker: WorkflowCatalogWorker;
  }[] = [];
  try {
    for (const binding of bindings) {
      emit({ type: 'target-creating', targetId: binding.target.id });
      try {
        const worker = await createWorker({
          connection,
          namespace: binding.target.namespace,
          taskQueue: binding.target.taskQueue,
          workflowsPath: fileURLToPath(
            new URL(binding.target.workflowsPath, import.meta.url),
          ),
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
