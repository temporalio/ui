import type { WorkflowCatalogNodeBinding } from './registry.js';
import {
  startWorkflowCatalogRunner,
  type WorkflowCatalogConnection,
  type WorkflowCatalogRunnerEvent,
  type WorkflowCatalogWorker,
  type WorkflowCatalogWorkerOptions,
} from './runner.js';

type WorkflowCatalogSignals = {
  once: (signal: 'SIGINT' | 'SIGTERM', listener: () => void) => unknown;
  off: (signal: 'SIGINT' | 'SIGTERM', listener: () => void) => unknown;
};

type RunWorkflowCatalogDevelopmentOptions<
  Connection extends WorkflowCatalogConnection,
> = {
  bindings: readonly WorkflowCatalogNodeBinding[];
  targetId?: string;
  connectionFactory: () => Promise<Connection>;
  createWorker: (
    options: WorkflowCatalogWorkerOptions<Connection>,
  ) => Promise<WorkflowCatalogWorker>;
  events?: (event: WorkflowCatalogRunnerEvent) => void;
  signals: WorkflowCatalogSignals;
};

export const runWorkflowCatalogDevelopment = async <
  Connection extends WorkflowCatalogConnection,
>({
  bindings,
  targetId,
  connectionFactory,
  createWorker,
  events,
  signals,
}: RunWorkflowCatalogDevelopmentOptions<Connection>) => {
  const selectedBindings = targetId
    ? bindings.filter((binding) => binding.target.id === targetId)
    : bindings;

  if (targetId && selectedBindings.length === 0) {
    throw new Error(
      `Workflow catalog target "${targetId}" was not found; available targets: ${bindings
        .map((binding) => binding.target.id)
        .join(', ')}`,
    );
  }

  if (selectedBindings.length === 0) {
    throw new Error(
      'Workflow catalog has no runnable targets; register an example before starting the development runner',
    );
  }

  const runner = await startWorkflowCatalogRunner({
    bindings: selectedBindings,
    connectionFactory,
    createWorker,
    events,
  });
  let shutdown: Promise<void> | undefined;
  const handleSignal = () => {
    shutdown ??= runner.shutdown();
  };
  signals.once('SIGINT', handleSignal);
  signals.once('SIGTERM', handleSignal);

  try {
    await runner.completion;
  } finally {
    await runner.shutdown();
    signals.off('SIGINT', handleSignal);
    signals.off('SIGTERM', handleSignal);
  }
};
