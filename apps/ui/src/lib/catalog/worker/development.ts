import type { CatalogWorkerBinding } from './registry.js';
import {
  type CatalogConnection,
  type CatalogRunnerEvent,
  type CatalogWorker,
  type CatalogWorkerOptions,
  startCatalogRunner,
} from './runner.js';

type CatalogSignals = {
  once: (signal: 'SIGINT' | 'SIGTERM', listener: () => void) => unknown;
  off: (signal: 'SIGINT' | 'SIGTERM', listener: () => void) => unknown;
};

type RunCatalogDevelopmentOptions<Connection extends CatalogConnection> = {
  bindings: readonly CatalogWorkerBinding[];
  workspaceId?: string;
  connectionFactory: () => Promise<Connection>;
  createWorker: (
    options: CatalogWorkerOptions<Connection>,
  ) => Promise<CatalogWorker>;
  events?: (event: CatalogRunnerEvent) => void;
  signals: CatalogSignals;
};

export const runCatalogDevelopment = async <
  Connection extends CatalogConnection,
>({
  bindings,
  workspaceId,
  connectionFactory,
  createWorker,
  events,
  signals,
}: RunCatalogDevelopmentOptions<Connection>) => {
  const selectedBindings = workspaceId
    ? bindings.filter((binding) => binding.workspace.id === workspaceId)
    : bindings;

  if (workspaceId && selectedBindings.length === 0) {
    throw new Error(
      `Catalog workspace "${workspaceId}" was not found; available workspaces: ${bindings
        .map((binding) => binding.workspace.id)
        .join(', ')}`,
    );
  }

  if (selectedBindings.length === 0) {
    throw new Error(
      'Catalog has no runnable workspaces; register an example before starting the development runner',
    );
  }

  const runner = await startCatalogRunner({
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
