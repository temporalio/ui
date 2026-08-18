import { describe, expect, it } from 'vitest';

import { ensureDeclaredNexusEndpoints } from './endpoint-provisioning';
import type { CatalogWorkerBinding } from './registry';

const binding = (
  targetId: string,
  namespace: string,
  taskQueue: string,
  executions: CatalogWorkerBinding['examples'][number]['execution'][],
): CatalogWorkerBinding => ({
  target: {
    id: targetId,
    namespace,
    taskQueue,
    workflowsPath: './workflows',
    workflowExports: {},
  },
  examples: executions.map((execution, index) => ({
    id: `${targetId}-example-${index}`,
    execution,
  })),
  activities: {},
  nexusServices: [],
});

const nexusExecution = (
  endpoint: string,
): CatalogWorkerBinding['examples'][number]['execution'] => ({
  kind: 'standalone-nexus-operation',
  endpoint,
  service: 'service',
  operation: 'operation',
  handler: {
    definition: { name: 'service', operations: { operation: {} } },
  } as never,
  policies: {},
});

const workflowExecution =
  (): CatalogWorkerBinding['examples'][number]['execution'] => ({
    kind: 'workflow',
    workflowType: 'someWorkflow',
    workflow: () => undefined,
    activities: {},
  });

describe('ensureDeclaredNexusEndpoints', () => {
  it('creates each missing declared endpoint against its target', async () => {
    const created: unknown[] = [];
    const events: string[] = [];

    await ensureDeclaredNexusEndpoints({
      bindings: [
        binding('shared', 'default', 'catalog-queue', [
          workflowExecution(),
          nexusExecution('catalog-endpoint'),
        ]),
      ],
      listEndpointNames: async () => [],
      createEndpoint: async (endpoint) => {
        created.push(endpoint);
      },
      onEndpoint: (event) => events.push(`${event.state}:${event.endpoint}`),
    });

    expect(created).toEqual([
      {
        name: 'catalog-endpoint',
        namespace: 'default',
        taskQueue: 'catalog-queue',
      },
    ]);
    expect(events).toEqual(['created:catalog-endpoint']);
  });

  it('leaves existing endpoints alone and dedupes declarations', async () => {
    const created: unknown[] = [];
    const events: string[] = [];

    await ensureDeclaredNexusEndpoints({
      bindings: [
        binding('shared', 'default', 'catalog-queue', [
          nexusExecution('existing-endpoint'),
          nexusExecution('existing-endpoint'),
        ]),
      ],
      listEndpointNames: async () => ['existing-endpoint'],
      createEndpoint: async (endpoint) => {
        created.push(endpoint);
      },
      onEndpoint: (event) => events.push(`${event.state}:${event.endpoint}`),
    });

    expect(created).toEqual([]);
    expect(events).toEqual(['exists:existing-endpoint']);
  });

  it('reports blocked endpoints without failing the worker', async () => {
    const events: string[] = [];

    await expect(
      ensureDeclaredNexusEndpoints({
        bindings: [
          binding('shared', 'default', 'catalog-queue', [
            nexusExecution('forbidden-endpoint'),
          ]),
        ],
        listEndpointNames: async () => [],
        createEndpoint: async () => {
          throw new Error('PERMISSION_DENIED: not allowed');
        },
        onEndpoint: (event) => events.push(`${event.state}:${event.endpoint}`),
      }),
    ).resolves.toBeUndefined();

    expect(events).toEqual(['blocked:forbidden-endpoint']);
  });

  it('does nothing when no example declares a Nexus endpoint', async () => {
    let listed = false;

    await ensureDeclaredNexusEndpoints({
      bindings: [
        binding('shared', 'default', 'catalog-queue', [workflowExecution()]),
      ],
      listEndpointNames: async () => {
        listed = true;
        return [];
      },
      createEndpoint: async () => undefined,
      onEndpoint: () => undefined,
    });

    expect(listed).toBe(false);
  });
});
