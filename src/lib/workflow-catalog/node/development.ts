import type { WorkflowCatalogNodeBinding } from './registry';
import {
  startWorkflowCatalogRunner,
  type WorkflowCatalogConnection,
  type WorkflowCatalogRunnerEvent,
  type WorkflowCatalogWorker,
  type WorkflowCatalogWorkerOptions,
} from './runner';

type WorkflowCatalogSignals = {
  once: (signal: 'SIGINT' | 'SIGTERM', listener: () => void) => unknown;
  off: (signal: 'SIGINT' | 'SIGTERM', listener: () => void) => unknown;
};

type RunWorkflowCatalogDevelopmentOptions<
  Connection extends WorkflowCatalogConnection,
> = {
  bindings: readonly WorkflowCatalogNodeBinding[];
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
  connectionFactory,
  createWorker,
  events,
  signals,
}: RunWorkflowCatalogDevelopmentOptions<Connection>) => {
  if (bindings.length === 0) {
    throw new Error(
      'Workflow catalog has no runnable targets; register an example before starting the development runner',
    );
  }

  const runner = await startWorkflowCatalogRunner({
    bindings,
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
