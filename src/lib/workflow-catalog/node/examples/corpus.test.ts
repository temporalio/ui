import { describe, expect, it } from 'vitest';

import { sharedWorkflowCorpusInventory } from './inventory';
import validateJsonSchema from '../../browser/schema-validator';
import {
  createWorkflowCatalogRegistry,
  generateWorkflowCatalog,
} from '../registry';
import { workflowCatalogRegistrationSource } from '../shared-registrations';

const exampleIds = [
  'hello',
  'parallel-activities',
  'sequential-activities',
  'long-activity',
  'activity-timeout',
  'activity-retry',
  'signal-handlers',
  'activity-heartbeat',
  'timer-driven-repetition',
  'high-event-count',
  'child-workflows',
  'local-activity',
  'workflow-patching',
  'signal-collector',
] as const;

const workflowTypes = [
  'hello',
  'parallelActivities',
  'sequentialActivities',
  'longActivity',
  'timeoutWorkflow',
  'retryWorkflow',
  'signalWorkflow',
  'heartbeatWorkflow',
  'scheduleWorkflow',
  'highEventCountWorkflow',
  'childWorkflowTest',
  'localActivityWorkflow',
  'patchWorkflow',
  'signalCollector',
] as const;

describe('shared workflow corpus', () => {
  it('registers one shared-workflows target with committed default routing', () => {
    const registry = createWorkflowCatalogRegistry();

    workflowCatalogRegistrationSource.register(registry);

    expect(registry.targets).toMatchObject([
      {
        id: 'shared-workflows',
        namespace: 'default',
        taskQueue: 'ui-workflow-catalog',
        workflowsPath: './workflows.js',
      },
    ]);
  });

  it('exposes the approved canary workflows as executable examples with positional input documents', () => {
    const registry = createWorkflowCatalogRegistry();

    workflowCatalogRegistrationSource.register(registry);
    const generated = generateWorkflowCatalog(registry);

    expect(generated.browserDescriptors.map(({ id }) => id)).toEqual(
      exampleIds,
    );
    expect(
      generated.browserDescriptors.map(({ execution }) =>
        execution.kind === 'workflow' ? execution.workflowType : execution.kind,
      ),
    ).toEqual(workflowTypes);
    expect(
      generated.browserDescriptors.every(
        ({ capabilityTags, expectedEvidence, input, startOptions }) =>
          capabilityTags.length > 0 &&
          expectedEvidence.length > 0 &&
          Array.isArray(input.defaultValue) &&
          input.schema !== true &&
          input.schema !== false &&
          input.schema.type === 'array' &&
          !Array.isArray(startOptions.defaultValue) &&
          startOptions.defaultValue !== null,
      ),
    ).toBe(true);
    expect(
      generated.browserDescriptors.find(
        ({ id }) => id === 'timer-driven-repetition',
      )?.title,
    ).toBe('Timer-driven repeated activities');

    const target = registry.targets[0];
    expect(Object.keys(target?.workflowExports ?? {})).toEqual(workflowTypes);
    for (const example of registry.examples) {
      expect(example.execution.kind).toBe('workflow');
      if (example.execution.kind !== 'workflow' || !target) continue;
      expect(target.workflowExports[example.execution.workflowType]).toBe(
        example.execution.workflow,
      );
    }
  });

  it('leaves workflow IDs unset so Quick Run can create a new execution each time', () => {
    const registry = createWorkflowCatalogRegistry();

    workflowCatalogRegistrationSource.register(registry);
    const generated = generateWorkflowCatalog(registry);

    expect(
      generated.browserDescriptors.map(
        ({ startOptions }) => startOptions.defaultValue,
      ),
    ).toEqual(exampleIds.map(() => ({})));
  });

  it('generates a valid zero-argument schema for child workflows', async () => {
    const registry = createWorkflowCatalogRegistry();

    workflowCatalogRegistrationSource.register(registry);
    const childWorkflow = generateWorkflowCatalog(
      registry,
    ).browserDescriptors.find(({ id }) => id === 'child-workflows');

    expect(childWorkflow?.input.schema).toEqual({
      type: 'array',
      items: false,
      maxItems: 0,
    });
    await expect(
      validateJsonSchema(childWorkflow!.input.schema, []),
    ).resolves.toBe(true);
    await expect(
      validateJsonSchema(childWorkflow!.input.schema, ['unexpected']),
    ).resolves.toBe(false);
  });

  it('limits shared activity inputs to durations that fit their timeout budget', () => {
    const registry = createWorkflowCatalogRegistry();

    workflowCatalogRegistrationSource.register(registry);
    const generated = generateWorkflowCatalog(registry).browserDescriptors;
    const inputSchema = (id: string) =>
      generated.find((descriptor) => descriptor.id === id)?.input.schema;

    expect(inputSchema('long-activity')).toMatchObject({
      prefixItems: [{ maximum: 25_000 }],
    });
    expect(inputSchema('high-event-count')).toMatchObject({
      prefixItems: [{}, { maximum: 25_000 }],
    });
    expect(inputSchema('activity-heartbeat')).toMatchObject({
      prefixItems: [{ maximum: 25 }, { maximum: 1_000 }],
    });
    expect(
      generated.find((descriptor) => descriptor.id === 'long-activity')?.input
        .defaultValue,
    ).toEqual([5_000]);
    expect(
      generated.find((descriptor) => descriptor.id === 'high-event-count')
        ?.input.defaultValue,
    ).toEqual([7, 2_000]);
    expect(
      generated.find((descriptor) => descriptor.id === 'activity-heartbeat')
        ?.input.defaultValue,
    ).toEqual([5, 1_000]);
  });

  it('accounts for every ordinary source workflow without importing hello-app or Nexus code', () => {
    expect(sharedWorkflowCorpusInventory).toHaveLength(22);
    expect(
      sharedWorkflowCorpusInventory.map(({ workflowName }) => workflowName),
    ).toEqual([
      'hello',
      'updateWorkflowSearchAttributes',
      'parallelActivities',
      'sequentialActivities',
      'longActivity',
      'timeoutWorkflow',
      'retryWorkflow',
      'signalWorkflow',
      'heartbeatWorkflow',
      'scheduleWorkflow',
      'highEventCountWorkflow',
      'childWorkflowTest',
      'resetWorkflow',
      'resetBaseWorkflow',
      'sanityWorkflow',
      'localActivityWorkflow',
      'patchWorkflow',
      'signalCollector',
      'getToolStatus',
      'developerDay',
      'sprintDay',
      'crunchTimeDay',
    ]);
    expect(
      sharedWorkflowCorpusInventory.filter(
        ({ disposition }) => disposition === 'keep',
      ),
    ).toHaveLength(14);
    expect(
      Object.fromEntries(
        sharedWorkflowCorpusInventory
          .filter(({ disposition }) => disposition !== 'keep')
          .map(({ disposition, workflowName }) => [workflowName, disposition]),
      ),
    ).toEqual({
      updateWorkflowSearchAttributes: 'defer',
      resetWorkflow: 'defer',
      resetBaseWorkflow: 'defer',
      sanityWorkflow: 'dedupe',
      getToolStatus: 'omit',
      developerDay: 'omit',
      sprintDay: 'omit',
      crunchTimeDay: 'omit',
    });
    expect(
      sharedWorkflowCorpusInventory.every(
        ({ sourcePath }) => !sourcePath.includes('@'),
      ),
    ).toBe(true);
  });

  it('declares every catalog-owned corpus source so generated artifact verification catches drift', () => {
    expect(workflowCatalogRegistrationSource.sourceFiles).toEqual([
      'src/lib/workflow-catalog/node/shared-registrations.ts',
      'src/lib/workflow-catalog/node/workflows.ts',
      'src/lib/workflow-catalog/node/examples/index.ts',
      'src/lib/workflow-catalog/node/examples/activities.ts',
      'src/lib/workflow-catalog/node/examples/inventory.ts',
      'src/lib/workflow-catalog/node/examples/registrations.ts',
      'src/lib/workflow-catalog/node/examples/schemas.ts',
      'src/lib/workflow-catalog/node/examples/workflows.ts',
    ]);
  });
});
