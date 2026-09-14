import { describe, expect, it } from 'vitest';

import { sharedWorkflowCorpusInventory } from './inventory.js';
import { priorityFairnessWorkflow } from './priority-fairness/workflow.js';
import { greet } from './shared-activities.js';
import validateJsonSchema from '../../browser/schema-validator.js';
import { createCatalogRegistry, generateCatalog } from '../registry.js';
import { catalogRegistrationSource } from '../shared-registrations.js';

const migratedExampleIds = [
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

const migratedWorkflowTypes = [
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

const proofExampleIds = [
  'priority-fairness',
  'standalone-activity',
  'nexus-greeting',
] as const;

describe('shared workflow corpus', () => {
  it('registers one shared-workflows target with committed default routing', () => {
    const registry = createCatalogRegistry();

    catalogRegistrationSource.register(registry);

    expect(registry.targets).toMatchObject([
      {
        id: 'shared-workflows',
        namespace: 'default',
        taskQueue: 'ui-catalog',
        workflowsPath: './workflows.js',
      },
    ]);
  });

  it('distinguishes migrated workflows from net-new proof examples', () => {
    const registry = createCatalogRegistry();

    catalogRegistrationSource.register(registry);
    const generated = generateCatalog(registry);

    const migratedDescriptors = migratedExampleIds.map((id) =>
      generated.browserDescriptors.find((descriptor) => descriptor.id === id),
    );
    const proofDescriptors = proofExampleIds.map((id) =>
      generated.browserDescriptors.find((descriptor) => descriptor.id === id),
    );

    expect(migratedDescriptors.map((descriptor) => descriptor?.id)).toEqual(
      migratedExampleIds,
    );
    expect(proofDescriptors.map((descriptor) => descriptor?.id)).toEqual(
      proofExampleIds,
    );
    expect(
      migratedDescriptors.map((descriptor) =>
        descriptor?.execution.kind === 'workflow'
          ? descriptor.execution.workflowType
          : undefined,
      ),
    ).toEqual(migratedWorkflowTypes);
    expect(
      migratedDescriptors.every(
        (descriptor) =>
          descriptor &&
          descriptor.capabilityTags.length > 0 &&
          descriptor.expectedEvidence.length > 0 &&
          Array.isArray(descriptor.input.defaultValue) &&
          descriptor.input.schema !== true &&
          descriptor.input.schema !== false &&
          descriptor.input.schema.type === 'array' &&
          !Array.isArray(descriptor.startOptions.defaultValue) &&
          descriptor.startOptions.defaultValue !== null,
      ),
    ).toBe(true);
    expect(
      generated.browserDescriptors.find(
        ({ id }) => id === 'timer-driven-repetition',
      )?.title,
    ).toBe('Timer-driven repeated activities');

    const target = registry.targets[0];
    expect(Object.keys(target?.workflowExports ?? {}).sort()).toEqual(
      [
        ...migratedWorkflowTypes,
        'priorityFairnessWorkflow',
        'nexusGreeting',
      ].sort(),
    );
    for (const example of registry.examples) {
      if (example.execution.kind !== 'workflow' || !target) continue;
      expect(target.workflowExports[example.execution.workflowType]).toBe(
        example.execution.workflow,
      );
    }
  });

  it('exposes priority and fairness settings that the greeting activity inherits', async () => {
    const registry = createCatalogRegistry();

    catalogRegistrationSource.register(registry);
    const generated = generateCatalog(registry);
    const example = generated.browserDescriptors.find(
      ({ id }) => id === 'priority-fairness',
    );
    const target = registry.targets[0];
    const binding = generated.workerBindings[0];

    expect(example).toMatchObject({
      id: 'priority-fairness',
      title: 'Priority and fairness',
      capabilityTags: ['priority-fairness', 'activities'],
      expectedEvidence: [
        'Workflow details show priority and fairness fields; the scheduled activity attributes show inherited priority.',
      ],
      input: {
        defaultValue: [],
        schema: { type: 'array', items: false, maxItems: 0 },
      },
      startOptions: {
        defaultValue: {
          priority: {
            priorityKey: 1,
            fairnessKey: 'catalog',
            fairnessWeight: 2,
          },
        },
        schema: {
          type: 'object',
          properties: {
            workflowId: { type: 'string', minLength: 1 },
            priority: {
              type: 'object',
              properties: {
                priorityKey: { type: 'integer', minimum: 1 },
                fairnessKey: { type: 'string', minLength: 1 },
                fairnessWeight: {
                  type: 'number',
                  minimum: 0.001,
                  maximum: 1000,
                },
              },
              required: ['priorityKey', 'fairnessKey', 'fairnessWeight'],
              additionalProperties: false,
            },
          },
          required: ['priority'],
        },
      },
      execution: {
        kind: 'workflow',
        workflowType: 'priorityFairnessWorkflow',
      },
    });
    await expect(
      validateJsonSchema(example!.input.schema, example!.input.defaultValue),
    ).resolves.toBe(true);
    await expect(
      validateJsonSchema(
        example!.startOptions.schema,
        example!.startOptions.defaultValue,
      ),
    ).resolves.toBe(true);
    await expect(
      validateJsonSchema(example!.startOptions.schema, {
        priority: {
          priorityKey: 1,
          fairnessKey: 'catalog',
          fairnessWeight: 2,
        },
        workflowId: 'generated-workflow-id',
      }),
    ).resolves.toBe(true);
    await expect(
      validateJsonSchema(example!.startOptions.schema, {
        priority: {
          priorityKey: 6,
          fairnessKey: 'catalog',
          fairnessWeight: 0.001,
        },
      }),
    ).resolves.toBe(true);
    await expect(
      validateJsonSchema(example!.startOptions.schema, {
        priority: {
          priorityKey: 6,
          fairnessKey: 'catalog',
          fairnessWeight: 1000,
        },
      }),
    ).resolves.toBe(true);
    await expect(
      validateJsonSchema(example!.startOptions.schema, {
        priority: {
          priorityKey: 6,
          fairnessKey: 'catalog',
          fairnessWeight: 0.0009,
        },
      }),
    ).resolves.toBe(false);
    await expect(
      validateJsonSchema(example!.startOptions.schema, {
        priority: {
          priorityKey: 6,
          fairnessKey: 'catalog',
          fairnessWeight: 1000.1,
        },
      }),
    ).resolves.toBe(false);
    await expect(
      validateJsonSchema(example!.startOptions.schema, {
        priority: {
          priorityKey: 1,
          fairnessKey: 'catalog',
          fairnessWeight: 2,
        },
        memo: { fields: {} },
      }),
    ).resolves.toBe(true);
    expect(target?.workflowExports.priorityFairnessWorkflow).toBe(
      priorityFairnessWorkflow,
    );
    expect(binding?.activities.greet).toBe(greet);
  });

  it('exposes a directly executable standalone activity without a workflow execution', async () => {
    const registry = createCatalogRegistry();

    catalogRegistrationSource.register(registry);
    const generated = generateCatalog(registry);
    const example = generated.browserDescriptors.find(
      ({ id }) => id === 'standalone-activity',
    );
    const registration = registry.examples.find(
      ({ id }) => id === 'standalone-activity',
    );
    const binding = generated.workerBindings[0];

    expect(example).toMatchObject({
      id: 'standalone-activity',
      title: 'Standalone activity',
      expectedEvidence: [
        'Standalone Activity details and result are available without a Workflow execution.',
      ],
      input: {
        defaultValue: { name: 'Temporal' },
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1 },
          },
          required: ['name'],
          additionalProperties: false,
        },
      },
      startOptions: {
        defaultValue: {},
        schema: {
          type: 'object',
          properties: {},
        },
      },
      execution: {
        kind: 'standalone-activity',
        activityType: 'standalone-activity',
        timeouts: {
          scheduleToCloseTimeout: '60s',
          startToCloseTimeout: '30s',
        },
        policies: { retryPolicy: { maximumAttempts: 3 } },
      },
    });
    await expect(
      validateJsonSchema(example!.input.schema, example!.input.defaultValue),
    ).resolves.toBe(true);
    await expect(
      validateJsonSchema(example!.input.schema, { name: '' }),
    ).resolves.toBe(false);
    await expect(
      validateJsonSchema(example!.input.schema, {
        name: 'Temporal',
        unexpected: true,
      }),
    ).resolves.toBe(false);
    await expect(
      validateJsonSchema(
        example!.startOptions.schema,
        example!.startOptions.defaultValue,
      ),
    ).resolves.toBe(true);
    await expect(
      validateJsonSchema(example!.startOptions.schema, {
        priority: { priorityKey: 1 },
        summary: 'standalone catalog activity',
      }),
    ).resolves.toBe(true);
    expect(registration?.execution.kind).toBe('standalone-activity');
    if (registration?.execution.kind !== 'standalone-activity') return;
    await expect(
      registration.execution.activity({ name: 'Temporal' } as never),
    ).resolves.toBe('Guten tag Temporal!');
    expect(
      binding?.examples.find(({ id }) => id === 'standalone-activity')
        ?.execution,
    ).toBe(registration.execution);
    expect(binding?.activities['standalone-activity']).toBe(
      registration.execution.activity,
    );
  });

  it('leaves migrated workflow IDs unset so Quick Run can create a new execution each time', () => {
    const registry = createCatalogRegistry();

    catalogRegistrationSource.register(registry);
    const generated = generateCatalog(registry);

    expect(
      migratedExampleIds.map(
        (id) =>
          generated.browserDescriptors.find(
            (descriptor) => descriptor.id === id,
          )?.startOptions.defaultValue,
      ),
    ).toEqual(migratedExampleIds.map(() => ({})));
  });

  it('generates a valid zero-argument schema for child workflows', async () => {
    const registry = createCatalogRegistry();

    catalogRegistrationSource.register(registry);
    const childWorkflow = generateCatalog(registry).browserDescriptors.find(
      ({ id }) => id === 'child-workflows',
    );

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
    const registry = createCatalogRegistry();

    catalogRegistrationSource.register(registry);
    const generated = generateCatalog(registry).browserDescriptors;
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
    expect([...catalogRegistrationSource.sourceFiles].sort()).toEqual(
      [
        'src/lib/catalog/worker/shared-registrations.ts',
        'src/lib/catalog/worker/workflows.ts',
        'src/lib/catalog/worker/examples/inventory.ts',
        'src/lib/catalog/worker/examples/index.ts',
        'src/lib/catalog/worker/examples/shared-activities.ts',
        'src/lib/catalog/worker/examples/hello/example.ts',
        'src/lib/catalog/worker/examples/hello/workflow.ts',
        'src/lib/catalog/worker/examples/parallel-activities/example.ts',
        'src/lib/catalog/worker/examples/parallel-activities/workflow.ts',
        'src/lib/catalog/worker/examples/sequential-activities/example.ts',
        'src/lib/catalog/worker/examples/sequential-activities/workflow.ts',
        'src/lib/catalog/worker/examples/long-activity/example.ts',
        'src/lib/catalog/worker/examples/long-activity/workflow.ts',
        'src/lib/catalog/worker/examples/long-activity/activity.ts',
        'src/lib/catalog/worker/examples/activity-timeout/example.ts',
        'src/lib/catalog/worker/examples/activity-timeout/workflow.ts',
        'src/lib/catalog/worker/examples/activity-timeout/activity.ts',
        'src/lib/catalog/worker/examples/activity-retry/example.ts',
        'src/lib/catalog/worker/examples/activity-retry/workflow.ts',
        'src/lib/catalog/worker/examples/activity-retry/activity.ts',
        'src/lib/catalog/worker/examples/signal-handlers/example.ts',
        'src/lib/catalog/worker/examples/signal-handlers/workflow.ts',
        'src/lib/catalog/worker/examples/signal-handlers/activity.ts',
        'src/lib/catalog/worker/examples/activity-heartbeat/example.ts',
        'src/lib/catalog/worker/examples/activity-heartbeat/workflow.ts',
        'src/lib/catalog/worker/examples/activity-heartbeat/activity.ts',
        'src/lib/catalog/worker/examples/timer-driven-repetition/example.ts',
        'src/lib/catalog/worker/examples/timer-driven-repetition/workflow.ts',
        'src/lib/catalog/worker/examples/high-event-count/example.ts',
        'src/lib/catalog/worker/examples/high-event-count/workflow.ts',
        'src/lib/catalog/worker/examples/child-workflows/example.ts',
        'src/lib/catalog/worker/examples/child-workflows/workflow.ts',
        'src/lib/catalog/worker/examples/local-activity/example.ts',
        'src/lib/catalog/worker/examples/local-activity/workflow.ts',
        'src/lib/catalog/worker/examples/workflow-patching/example.ts',
        'src/lib/catalog/worker/examples/workflow-patching/workflow.ts',
        'src/lib/catalog/worker/examples/signal-collector/example.ts',
        'src/lib/catalog/worker/examples/signal-collector/workflow.ts',
        'src/lib/catalog/worker/examples/signal-collector/activity.ts',
        'src/lib/catalog/worker/examples/priority-fairness/example.ts',
        'src/lib/catalog/worker/examples/priority-fairness/workflow.ts',
        'src/lib/catalog/worker/examples/standalone-activity/example.ts',
        'src/lib/catalog/worker/examples/standalone-activity/activity.ts',
        'src/lib/catalog/worker/examples/nexus-greeting/example.ts',
        'src/lib/catalog/worker/examples/nexus-greeting/workflow.ts',
        'src/lib/catalog/worker/examples/nexus-greeting/service.ts',
        'src/lib/catalog/worker/examples/nexus-greeting/handler.ts',
      ].sort(),
    );
  });
});
