import type { CatalogWorkerBinding } from './registry';

export type DeclaredNexusEndpoint = {
  name: string;
  namespace: string;
  taskQueue: string;
};

export type NexusEndpointEvent = {
  state: 'blocked' | 'created' | 'exists';
  endpoint: string;
  namespace: string;
  taskQueue: string;
  error?: unknown;
};

export const declaredNexusEndpoints = (
  bindings: readonly CatalogWorkerBinding[],
): DeclaredNexusEndpoint[] => {
  const byName = new Map<string, DeclaredNexusEndpoint>();

  for (const { target, examples } of bindings) {
    for (const { execution } of examples) {
      const endpoints =
        execution.kind === 'standalone-nexus-operation'
          ? [execution.endpoint]
          : execution.kind === 'workflow'
            ? (execution.nexusEndpoints ?? [])
            : [];

      for (const endpoint of endpoints) {
        if (byName.has(endpoint)) continue;

        byName.set(endpoint, {
          name: endpoint,
          namespace: target.namespace,
          taskQueue: target.taskQueue,
        });
      }
    }
  }

  return [...byName.values()];
};

export const ensureDeclaredNexusEndpoints = async ({
  bindings,
  listEndpointNames,
  createEndpoint,
  onEndpoint,
}: {
  bindings: readonly CatalogWorkerBinding[];
  listEndpointNames: () => Promise<readonly string[]>;
  createEndpoint: (endpoint: DeclaredNexusEndpoint) => Promise<void>;
  onEndpoint: (event: NexusEndpointEvent) => void;
}): Promise<void> => {
  const declared = declaredNexusEndpoints(bindings);

  if (declared.length === 0) return;

  let existing: readonly string[];

  try {
    existing = await listEndpointNames();
  } catch (error) {
    for (const { name, namespace, taskQueue } of declared) {
      onEndpoint({
        state: 'blocked',
        endpoint: name,
        namespace,
        taskQueue,
        error,
      });
    }
    return;
  }

  for (const endpoint of declared) {
    const { name, namespace, taskQueue } = endpoint;

    if (existing.includes(name)) {
      onEndpoint({ state: 'exists', endpoint: name, namespace, taskQueue });
      continue;
    }

    try {
      await createEndpoint(endpoint);
      onEndpoint({ state: 'created', endpoint: name, namespace, taskQueue });
    } catch (error) {
      onEndpoint({
        state: 'blocked',
        endpoint: name,
        namespace,
        taskQueue,
        error,
      });
    }
  }
};
