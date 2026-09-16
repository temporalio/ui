import { operation, service, serviceHandler } from 'nexus-rpc';
import { describe, expect, it } from 'vitest';

import { createCatalogRegistry, generateCatalog } from './registry';
import type { JsonSchema, JsonValue } from '../browser/types';

const createNexusHandler = (name: string) => {
  const definition = service(name, {
    farewell: operation<string, string>(),
    greet: operation<string, string>(),
  });

  return serviceHandler(definition, {
    farewell: async (_context, input) => input,
    greet: async (_context, input) => input,
  });
};

const generateWorkflowExampleWithInputSchema = (
  schema: JsonSchema,
  defaultValue: JsonValue,
  startOptionsSchema: JsonSchema = { type: 'object' },
  startOptionsDefaultValue: JsonValue = {},
) => {
  const workflow = () => undefined;
  const registry = createCatalogRegistry();

  registry.registerTarget({
    id: 'catalog',
    namespace: 'default',
    taskQueue: 'catalog',
    workflowsPath: './workflows',
    workflowExports: { workflow },
  });
  registry.registerExample({
    id: 'schema-example',
    title: 'Schema example',
    description: 'Exercises a JSON Schema registration.',
    targetId: 'catalog',
    capabilityTags: [],
    expectedEvidence: [],
    input: { defaultValue, schema },
    startOptions: {
      defaultValue: startOptionsDefaultValue,
      schema: startOptionsSchema,
    },
    execution: {
      kind: 'workflow',
      workflowType: 'workflow',
      workflow,
      activities: {},
    },
  });

  return generateCatalog(registry);
};

describe('generateCatalog', () => {
  it('generates an example whose input schema accepts every JSON value', () => {
    const generated = generateWorkflowExampleWithInputSchema(true, null);

    expect(generated.browserDescriptors[0]?.input).toEqual({
      defaultValue: null,
      schema: true,
    });
  });

  it('generates an example whose input schema rejects every JSON value', () => {
    const generated = generateWorkflowExampleWithInputSchema(false, null);

    expect(generated.browserDescriptors[0]?.input).toEqual({
      defaultValue: null,
      schema: false,
    });
  });

  it('generates an example whose start-options schema accepts every JSON value', () => {
    const generated = generateWorkflowExampleWithInputSchema(true, null, true, {
      custom: 'option',
    });

    expect(generated.browserDescriptors[0]?.startOptions).toEqual({
      defaultValue: { custom: 'option' },
      schema: true,
    });
  });

  it('generates an example whose start-options schema rejects every JSON value', () => {
    const generated = generateWorkflowExampleWithInputSchema(
      true,
      null,
      false,
      {},
    );

    expect(generated.browserDescriptors[0]?.startOptions).toEqual({
      defaultValue: {},
      schema: false,
    });
  });

  it('generates a workflow registration into browser-safe intent and a resolved worker binding', () => {
    const workflow = () => 'hello';
    const activity = () => 'world';
    const registry = createCatalogRegistry();

    registry.registerTarget({
      id: 'catalog',
      namespace: 'default',
      taskQueue: 'catalog',
      workflowsPath: './workflows',
      workflowExports: { greetingWorkflow: workflow },
    });
    registry.registerExample({
      id: 'greeting',
      title: 'Greeting',
      description: 'Returns a greeting.',
      targetId: 'catalog',
      capabilityTags: ['signals'],
      expectedEvidence: ['A completed greeting result'],
      input: {
        defaultValue: ['Temporal'],
        schema: { type: 'array', items: { type: 'string' } },
      },
      startOptions: {
        defaultValue: { workflowId: 'catalog-greeting' },
        schema: {
          type: 'object',
          properties: { workflowId: { type: 'string' } },
        },
      },
      execution: {
        kind: 'workflow',
        workflowType: 'greetingWorkflow',
        workflow,
        activities: { greetingActivity: activity },
      },
    });

    const generated = generateCatalog(registry);

    expect(generated.browserDescriptors).toEqual([
      {
        id: 'greeting',
        title: 'Greeting',
        description: 'Returns a greeting.',
        capabilityTags: ['signals'],
        expectedEvidence: ['A completed greeting result'],
        input: {
          defaultValue: ['Temporal'],
          schema: { type: 'array', items: { type: 'string' } },
        },
        startOptions: {
          defaultValue: { workflowId: 'catalog-greeting' },
          // Workflow examples inherit the shared start options; authors only
          // declare what is specific to their example.
          schema: {
            type: 'object',
            properties: {
              details: { type: 'string' },
              searchAttributes: { type: 'object' },
              summary: { type: 'string' },
              workflowStartDelay: { type: 'string' },
              workflowId: { type: 'string' },
            },
          },
        },
        execution: {
          kind: 'workflow',
          targetId: 'catalog',
          namespace: 'default',
          taskQueue: 'catalog',
          workflowType: 'greetingWorkflow',
        },
      },
    ]);
    expect(JSON.parse(JSON.stringify(generated.browserDescriptors))).toEqual(
      generated.browserDescriptors,
    );
    expect(generated.workerBindings).toEqual([
      {
        target: {
          id: 'catalog',
          namespace: 'default',
          taskQueue: 'catalog',
          workflowsPath: './workflows',
          workflowExports: { greetingWorkflow: workflow },
        },
        examples: [
          {
            id: 'greeting',
            execution: {
              kind: 'workflow',
              workflowType: 'greetingWorkflow',
              workflow,
              activities: { greetingActivity: activity },
            },
          },
        ],
        activities: { greetingActivity: activity },
        nexusServices: [],
      },
    ]);
  });

  it('generates a standalone activity with locked browser intent and an executable worker binding', () => {
    const activity = (name: string) => `hello ${name}`;
    const registry = createCatalogRegistry();

    registry.registerTarget({
      id: 'catalog',
      namespace: 'default',
      taskQueue: 'catalog',
      workflowsPath: './workflows',
      workflowExports: {},
    });
    registry.registerExample({
      id: 'standalone-greeting',
      title: 'Standalone greeting activity',
      description: 'Runs an activity without a workflow.',
      targetId: 'catalog',
      capabilityTags: ['terminal-outcome'],
      expectedEvidence: ['A completed activity result'],
      input: {
        defaultValue: { name: 'Temporal' },
        schema: {
          type: 'object',
          properties: { name: { type: 'string' } },
        },
      },
      startOptions: {
        defaultValue: { summary: 'Catalog greeting' },
        schema: {
          type: 'object',
          properties: { summary: { type: 'string' } },
        },
      },
      execution: {
        kind: 'standalone-activity',
        activityType: 'greetingActivity',
        activity,
        timeouts: { scheduleToClose: '1 minute' },
        policies: { retry: { maximumAttempts: 3 } },
      },
    });

    const generated = generateCatalog(registry);

    expect(generated.browserDescriptors[0]?.execution).toEqual({
      kind: 'standalone-activity',
      targetId: 'catalog',
      namespace: 'default',
      taskQueue: 'catalog',
      activityType: 'greetingActivity',
      timeouts: { scheduleToClose: '1 minute' },
      policies: { retry: { maximumAttempts: 3 } },
    });
    expect(JSON.parse(JSON.stringify(generated.browserDescriptors))).toEqual(
      generated.browserDescriptors,
    );
    expect(generated.workerBindings[0]?.examples).toEqual([
      {
        id: 'standalone-greeting',
        execution: {
          kind: 'standalone-activity',
          activityType: 'greetingActivity',
          activity,
          timeouts: { scheduleToClose: '1 minute' },
          policies: { retry: { maximumAttempts: 3 } },
        },
      },
    ]);
    expect(generated.workerBindings[0]?.activities).toEqual({
      greetingActivity: activity,
    });
  });

  it('generates a standalone Nexus operation with locked browser intent and an executable worker binding', () => {
    const handler = createNexusHandler('GreetingService');
    const registry = createCatalogRegistry();

    registry.registerTarget({
      id: 'nexus-handler',
      namespace: 'nexus-target',
      taskQueue: 'nexus-handler-queue',
      workflowsPath: './workflows',
      workflowExports: {},
    });
    registry.registerExample({
      id: 'nexus-greeting',
      title: 'Nexus greeting operation',
      description: 'Runs a standalone Nexus operation.',
      targetId: 'nexus-handler',
      capabilityTags: ['nexus-links'],
      expectedEvidence: ['A completed Nexus operation result'],
      input: {
        defaultValue: { name: 'Temporal' },
        schema: {
          type: 'object',
          properties: { name: { type: 'string' } },
        },
      },
      startOptions: {
        defaultValue: { operationId: 'catalog-nexus-greeting' },
        schema: {
          type: 'object',
          properties: { operationId: { type: 'string' } },
        },
      },
      execution: {
        kind: 'standalone-nexus-operation',
        endpoint: 'catalog-endpoint',
        service: 'GreetingService',
        operation: 'greet',
        handler,
        policies: { scheduleToClose: '1 minute' },
      },
    });

    const generated = generateCatalog(registry);

    expect(generated.browserDescriptors[0]?.execution).toEqual({
      kind: 'standalone-nexus-operation',
      targetId: 'nexus-handler',
      namespace: 'nexus-target',
      taskQueue: 'nexus-handler-queue',
      endpoint: 'catalog-endpoint',
      service: 'GreetingService',
      operation: 'greet',
      policies: { scheduleToClose: '1 minute' },
    });
    expect(JSON.parse(JSON.stringify(generated.browserDescriptors))).toEqual(
      generated.browserDescriptors,
    );
    expect(generated.workerBindings[0]?.examples).toEqual([
      {
        id: 'nexus-greeting',
        execution: {
          kind: 'standalone-nexus-operation',
          endpoint: 'catalog-endpoint',
          service: 'GreetingService',
          operation: 'greet',
          handler,
          policies: { scheduleToClose: '1 minute' },
        },
      },
    ]);
    expect(generated.workerBindings[0]?.activities).toEqual({});
    expect(generated.workerBindings[0]?.nexusServices).toEqual([handler]);
  });

  it('reuses an identical Nexus service handler across operations', () => {
    const handler = createNexusHandler('GreetingService');
    const registry = createCatalogRegistry();

    registry.registerTarget({
      id: 'nexus-handler',
      namespace: 'nexus-target',
      taskQueue: 'nexus-handler-queue',
      workflowsPath: './workflows',
      workflowExports: {},
    });

    for (const operation of ['greet', 'farewell']) {
      registry.registerExample({
        id: operation,
        title: `${operation} Nexus operation`,
        description: `Runs the ${operation} Nexus operation.`,
        targetId: 'nexus-handler',
        capabilityTags: [],
        expectedEvidence: [],
        input: { defaultValue: {}, schema: {} },
        startOptions: { defaultValue: {}, schema: {} },
        execution: {
          kind: 'standalone-nexus-operation',
          endpoint: 'catalog-endpoint',
          service: 'GreetingService',
          operation,
          handler,
          policies: {},
        },
      });
    }

    expect(generateCatalog(registry).workerBindings[0]?.nexusServices).toEqual([
      handler,
    ]);
  });

  it('rejects conflicting Nexus service handlers before worker creation', () => {
    const registry = createCatalogRegistry();

    registry.registerTarget({
      id: 'nexus-handler',
      namespace: 'nexus-target',
      taskQueue: 'nexus-handler-queue',
      workflowsPath: './workflows',
      workflowExports: {},
    });

    for (const id of ['first', 'second']) {
      registry.registerExample({
        id,
        title: `${id} Nexus operation`,
        description: `Runs the ${id} Nexus operation.`,
        targetId: 'nexus-handler',
        capabilityTags: [],
        expectedEvidence: [],
        input: { defaultValue: {}, schema: {} },
        startOptions: { defaultValue: {}, schema: {} },
        execution: {
          kind: 'standalone-nexus-operation',
          endpoint: 'catalog-endpoint',
          service: 'GreetingService',
          operation: 'greet',
          handler: createNexusHandler('GreetingService'),
          policies: {},
        },
      });
    }

    expect(() => generateCatalog(registry)).toThrowError(
      'Catalog Nexus service "GreetingService" has conflicting handlers on target "nexus-handler"',
    );
  });

  it('rejects a Nexus service name that differs from its handler definition', () => {
    const registry = createCatalogRegistry();

    registry.registerTarget({
      id: 'nexus-handler',
      namespace: 'nexus-target',
      taskQueue: 'nexus-handler-queue',
      workflowsPath: './workflows',
      workflowExports: {},
    });
    registry.registerExample({
      id: 'mismatched-service',
      title: 'Mismatched Nexus service',
      description: 'Declares the wrong Nexus service.',
      targetId: 'nexus-handler',
      capabilityTags: [],
      expectedEvidence: [],
      input: { defaultValue: {}, schema: {} },
      startOptions: { defaultValue: {}, schema: {} },
      execution: {
        kind: 'standalone-nexus-operation',
        endpoint: 'catalog-endpoint',
        service: 'OtherService',
        operation: 'greet',
        handler: createNexusHandler('GreetingService'),
        policies: {},
      },
    });

    expect(() => generateCatalog(registry)).toThrowError(
      'Catalog Nexus service "OtherService" for example "mismatched-service" does not match handler service "GreetingService"',
    );
  });

  it('rejects a Nexus operation missing from its handler definition', () => {
    const registry = createCatalogRegistry();

    registry.registerTarget({
      id: 'nexus-handler',
      namespace: 'nexus-target',
      taskQueue: 'nexus-handler-queue',
      workflowsPath: './workflows',
      workflowExports: {},
    });
    registry.registerExample({
      id: 'missing-operation',
      title: 'Missing Nexus operation',
      description: 'Declares an unknown Nexus operation.',
      targetId: 'nexus-handler',
      capabilityTags: [],
      expectedEvidence: [],
      input: { defaultValue: {}, schema: {} },
      startOptions: { defaultValue: {}, schema: {} },
      execution: {
        kind: 'standalone-nexus-operation',
        endpoint: 'catalog-endpoint',
        service: 'GreetingService',
        operation: 'missing',
        handler: createNexusHandler('GreetingService'),
        policies: {},
      },
    });

    expect(() => generateCatalog(registry)).toThrowError(
      'Catalog Nexus operation "missing" for example "missing-operation" is not defined by service "GreetingService"',
    );
  });

  it('fails when two registrations use the same example ID', () => {
    const workflow = () => 'hello';
    const registry = createCatalogRegistry();
    const registerGreeting = (title: string) =>
      registry.registerExample({
        id: 'greeting',
        title,
        description: 'Returns a greeting.',
        targetId: 'catalog',
        capabilityTags: [],
        expectedEvidence: ['A completed greeting result'],
        input: { defaultValue: [], schema: { type: 'array' } },
        startOptions: { defaultValue: {}, schema: { type: 'object' } },
        execution: {
          kind: 'workflow',
          workflowType: 'greetingWorkflow',
          workflow,
          activities: {},
        },
      });

    registry.registerTarget({
      id: 'catalog',
      namespace: 'default',
      taskQueue: 'catalog',
      workflowsPath: './workflows',
      workflowExports: { greetingWorkflow: workflow },
    });
    registerGreeting('First greeting');
    registerGreeting('Second greeting');

    expect(() => generateCatalog(registry)).toThrowError(
      'Duplicate catalog example id "greeting"',
    );
  });

  it('fails when an example references an unknown target ID', () => {
    const registry = createCatalogRegistry();

    registry.registerExample({
      id: 'orphaned-activity',
      title: 'Orphaned activity',
      description: 'References a target that is not registered.',
      targetId: 'missing-target',
      capabilityTags: [],
      expectedEvidence: ['A completed activity result'],
      input: { defaultValue: {}, schema: { type: 'object' } },
      startOptions: { defaultValue: {}, schema: { type: 'object' } },
      execution: {
        kind: 'standalone-activity',
        activityType: 'orphanedActivity',
        activity: () => 'orphaned',
        timeouts: {},
        policies: {},
      },
    });

    expect(() => generateCatalog(registry)).toThrowError(
      'Unknown catalog target id "missing-target" for example "orphaned-activity"',
    );
  });

  it("fails when a workflow type is absent from its target's static exports", () => {
    const registry = createCatalogRegistry();

    registry.registerTarget({
      id: 'catalog',
      namespace: 'default',
      taskQueue: 'catalog',
      workflowsPath: './workflows',
      workflowExports: {},
    });
    registry.registerExample({
      id: 'missing-workflow',
      title: 'Missing workflow',
      description: 'References a workflow type that is not exported.',
      targetId: 'catalog',
      capabilityTags: [],
      expectedEvidence: ['A completed workflow result'],
      input: { defaultValue: [], schema: { type: 'array' } },
      startOptions: { defaultValue: {}, schema: { type: 'object' } },
      execution: {
        kind: 'workflow',
        workflowType: 'missingWorkflow',
        workflow: () => 'missing',
        activities: {},
      },
    });

    expect(() => generateCatalog(registry)).toThrowError(
      'Workflow type "missingWorkflow" for example "missing-workflow" is not exported by target "catalog"',
    );
  });

  it('fails when one target receives conflicting same-name activity implementations', () => {
    const registry = createCatalogRegistry();
    const registerActivity = (id: string, activity: (name: string) => string) =>
      registry.registerExample({
        id,
        title: id,
        description: 'Runs a standalone greeting activity.',
        targetId: 'catalog',
        capabilityTags: [],
        expectedEvidence: ['A completed activity result'],
        input: { defaultValue: {}, schema: { type: 'object' } },
        startOptions: { defaultValue: {}, schema: { type: 'object' } },
        execution: {
          kind: 'standalone-activity',
          activityType: 'greetingActivity',
          activity,
          timeouts: {},
          policies: {},
        },
      });

    registry.registerTarget({
      id: 'catalog',
      namespace: 'default',
      taskQueue: 'catalog',
      workflowsPath: './workflows',
      workflowExports: {},
    });
    registerActivity('first-greeting', (name) => `hello ${name}`);
    registerActivity('second-greeting', (name) => `welcome ${name}`);

    expect(() => generateCatalog(registry)).toThrowError(
      'Activity "greetingActivity" has conflicting implementations on target "catalog"',
    );
  });

  it('fails when browser metadata cannot be serialized as JSON', () => {
    const cyclicInput: Record<string, unknown> = {};
    cyclicInput.self = cyclicInput;
    const registry = createCatalogRegistry();

    registry.registerTarget({
      id: 'catalog',
      namespace: 'default',
      taskQueue: 'catalog',
      workflowsPath: './workflows',
      workflowExports: {},
    });
    registry.registerExample({
      id: 'cyclic-input',
      title: 'Cyclic input',
      description: 'Contains browser metadata that cannot be serialized.',
      targetId: 'catalog',
      capabilityTags: [],
      expectedEvidence: ['A completed activity result'],
      input: {
        defaultValue: cyclicInput as never,
        schema: { type: 'object' },
      },
      startOptions: { defaultValue: {}, schema: { type: 'object' } },
      execution: {
        kind: 'standalone-activity',
        activityType: 'cyclicActivity',
        activity: () => 'cyclic',
        timeouts: {},
        policies: {},
      },
    });

    expect(() => generateCatalog(registry)).toThrowError(
      'Catalog descriptor "cyclic-input" is not JSON-serializable',
    );
  });

  it('fails when two targets use the same target ID', () => {
    const registry = createCatalogRegistry();

    registry.registerTarget({
      id: 'catalog',
      namespace: 'first-namespace',
      taskQueue: 'first-queue',
      workflowsPath: './workflows',
      workflowExports: {},
    });
    registry.registerTarget({
      id: 'catalog',
      namespace: 'second-namespace',
      taskQueue: 'second-queue',
      workflowsPath: './workflows',
      workflowExports: {},
    });
    registry.registerExample({
      id: 'greeting',
      title: 'Greeting activity',
      description: 'Runs a standalone greeting activity.',
      targetId: 'catalog',
      capabilityTags: [],
      expectedEvidence: ['A completed activity result'],
      input: { defaultValue: {}, schema: { type: 'object' } },
      startOptions: { defaultValue: {}, schema: { type: 'object' } },
      execution: {
        kind: 'standalone-activity',
        activityType: 'greetingActivity',
        activity: () => 'hello',
        timeouts: {},
        policies: {},
      },
    });

    expect(() => generateCatalog(registry)).toThrowError(
      'Duplicate catalog target id "catalog"',
    );
  });

  it('fails when browser metadata contains a non-finite JSON number', () => {
    const registry = createCatalogRegistry();

    registry.registerTarget({
      id: 'catalog',
      namespace: 'default',
      taskQueue: 'catalog',
      workflowsPath: './workflows',
      workflowExports: {},
    });
    registry.registerExample({
      id: 'non-finite-input',
      title: 'Non-finite input',
      description: 'Contains a number that JSON would change to null.',
      targetId: 'catalog',
      capabilityTags: [],
      expectedEvidence: ['A completed activity result'],
      input: {
        defaultValue: { maximumAttempts: Number.POSITIVE_INFINITY },
        schema: { type: 'object' },
      },
      startOptions: { defaultValue: {}, schema: { type: 'object' } },
      execution: {
        kind: 'standalone-activity',
        activityType: 'nonFiniteActivity',
        activity: () => 'non-finite',
        timeouts: {},
        policies: {},
      },
    });

    expect(() => generateCatalog(registry)).toThrowError(
      'Catalog descriptor "non-finite-input" is not JSON-serializable',
    );
  });

  it('fails when browser metadata contains a sparse JSON array', () => {
    const sparseInput: unknown[] = [];
    sparseInput.length = 1;
    const registry = createCatalogRegistry();

    registry.registerTarget({
      id: 'catalog',
      namespace: 'default',
      taskQueue: 'catalog',
      workflowsPath: './workflows',
      workflowExports: {},
    });
    registry.registerExample({
      id: 'sparse-input',
      title: 'Sparse input',
      description: 'Contains an array hole that JSON would change to null.',
      targetId: 'catalog',
      capabilityTags: [],
      expectedEvidence: ['A completed activity result'],
      input: {
        defaultValue: sparseInput as never,
        schema: { type: 'array' },
      },
      startOptions: { defaultValue: {}, schema: { type: 'object' } },
      execution: {
        kind: 'standalone-activity',
        activityType: 'sparseActivity',
        activity: () => 'sparse',
        timeouts: {},
        policies: {},
      },
    });

    expect(() => generateCatalog(registry)).toThrowError(
      'Catalog descriptor "sparse-input" is not JSON-serializable',
    );
  });

  it('fails when browser metadata contains an executable property accessor', () => {
    const getterInput = {};
    Object.defineProperty(getterInput, 'name', {
      enumerable: true,
      get: () => 'Temporal',
    });
    const registry = createCatalogRegistry();

    registry.registerTarget({
      id: 'catalog',
      namespace: 'default',
      taskQueue: 'catalog',
      workflowsPath: './workflows',
      workflowExports: {},
    });
    registry.registerExample({
      id: 'getter-input',
      title: 'Getter input',
      description: 'Contains executable browser metadata.',
      targetId: 'catalog',
      capabilityTags: [],
      expectedEvidence: ['A completed activity result'],
      input: {
        defaultValue: getterInput,
        schema: { type: 'object' },
      },
      startOptions: { defaultValue: {}, schema: { type: 'object' } },
      execution: {
        kind: 'standalone-activity',
        activityType: 'getterActivity',
        activity: () => 'getter',
        timeouts: {},
        policies: {},
      },
    });

    expect(() => generateCatalog(registry)).toThrowError(
      'Catalog descriptor "getter-input" is not JSON-serializable',
    );
  });

  it('fails without executing browser metadata proxy traps', () => {
    let trapCalls = 0;
    const proxyInput = new Proxy(
      { name: 'Temporal' },
      {
        get: (target, property, receiver) => {
          trapCalls += 1;
          return Reflect.get(target, property, receiver);
        },
      },
    );
    const registry = createCatalogRegistry();

    registry.registerTarget({
      id: 'catalog',
      namespace: 'default',
      taskQueue: 'catalog',
      workflowsPath: './workflows',
      workflowExports: {},
    });
    registry.registerExample({
      id: 'proxy-input',
      title: 'Proxy input',
      description: 'Contains executable proxy traps.',
      targetId: 'catalog',
      capabilityTags: [],
      expectedEvidence: ['A completed activity result'],
      input: {
        defaultValue: proxyInput,
        schema: { type: 'object' },
      },
      startOptions: { defaultValue: {}, schema: { type: 'object' } },
      execution: {
        kind: 'standalone-activity',
        activityType: 'proxyActivity',
        activity: () => 'proxy',
        timeouts: {},
        policies: {},
      },
    });

    expect(() => generateCatalog(registry)).toThrowError(
      'Catalog descriptor "proxy-input" is not JSON-serializable',
    );
    expect(trapCalls).toBe(0);
  });

  it('locks browser intent against later registration metadata changes', () => {
    const inputDefault = { name: 'Temporal' };
    const registry = createCatalogRegistry();

    registry.registerTarget({
      id: 'catalog',
      namespace: 'default',
      taskQueue: 'catalog',
      workflowsPath: './workflows',
      workflowExports: {},
    });
    registry.registerExample({
      id: 'locked-input',
      title: 'Locked input',
      description: 'Keeps generated browser intent stable.',
      targetId: 'catalog',
      capabilityTags: [],
      expectedEvidence: ['A completed activity result'],
      input: {
        defaultValue: inputDefault,
        schema: { type: 'object' },
      },
      startOptions: { defaultValue: {}, schema: { type: 'object' } },
      execution: {
        kind: 'standalone-activity',
        activityType: 'lockedActivity',
        activity: () => 'locked',
        timeouts: {},
        policies: {},
      },
    });

    const generated = generateCatalog(registry);
    inputDefault.name = 'Changed after generation';

    expect(generated.browserDescriptors[0]?.input.defaultValue).toEqual({
      name: 'Temporal',
    });
  });

  it('fails without executing top-level registration metadata accessors', () => {
    let accessorCalls = 0;
    const registry = createCatalogRegistry();
    const example = {
      id: 'getter-title',
      title: 'Getter title',
      description: 'Contains an executable title accessor.',
      targetId: 'catalog',
      capabilityTags: [],
      expectedEvidence: ['A completed activity result'],
      input: { defaultValue: {}, schema: { type: 'object' } },
      startOptions: { defaultValue: {}, schema: { type: 'object' } },
      execution: {
        kind: 'standalone-activity' as const,
        activityType: 'getterTitleActivity',
        activity: () => 'getter-title',
        timeouts: {},
        policies: {},
      },
    };

    Object.defineProperty(example, 'title', {
      enumerable: true,
      get: () => {
        accessorCalls += 1;
        return 'Getter title';
      },
    });
    registry.registerTarget({
      id: 'catalog',
      namespace: 'default',
      taskQueue: 'catalog',
      workflowsPath: './workflows',
      workflowExports: {},
    });
    registry.registerExample(example);

    expect(() => generateCatalog(registry)).toThrowError(
      'Catalog example registrations must use enumerable data properties',
    );
    expect(accessorCalls).toBe(0);
  });

  it('fails without executing nested execution accessors', () => {
    let accessorCalls = 0;
    const registry = createCatalogRegistry();
    const example = {
      id: 'getter-activity-type',
      title: 'Getter activity type',
      description: 'Contains an executable execution accessor.',
      targetId: 'catalog',
      capabilityTags: [],
      expectedEvidence: ['A completed activity result'],
      input: { defaultValue: {}, schema: { type: 'object' } },
      startOptions: { defaultValue: {}, schema: { type: 'object' } },
      execution: {
        kind: 'standalone-activity' as const,
        activityType: 'getterActivityType',
        activity: () => 'getter-activity-type',
        timeouts: {},
        policies: {},
      },
    };

    Object.defineProperty(example.execution, 'activityType', {
      enumerable: true,
      get: () => {
        accessorCalls += 1;
        return 'getterActivityType';
      },
    });
    registry.registerTarget({
      id: 'catalog',
      namespace: 'default',
      taskQueue: 'catalog',
      workflowsPath: './workflows',
      workflowExports: {},
    });
    registry.registerExample(example);

    expect(() => generateCatalog(registry)).toThrowError(
      'Catalog execution registrations must use enumerable data properties',
    );
    expect(accessorCalls).toBe(0);
  });

  it('rejects unknown top-level registration fields before browser projection', () => {
    const registry = createCatalogRegistry();
    const example = {
      id: 'unknown-metadata',
      title: 'Unknown metadata',
      description: 'Contains a field outside the registration contract.',
      targetId: 'catalog',
      capabilityTags: [],
      expectedEvidence: ['A completed activity result'],
      input: { defaultValue: {}, schema: { type: 'object' } },
      startOptions: { defaultValue: {}, schema: { type: 'object' } },
      execution: {
        kind: 'standalone-activity' as const,
        activityType: 'unknownMetadataActivity',
        activity: () => 'unknown-metadata',
        timeouts: {},
        policies: {},
      },
      internalNote: 'must not reach the browser',
    };

    registry.registerTarget({
      id: 'catalog',
      namespace: 'default',
      taskQueue: 'catalog',
      workflowsPath: './workflows',
      workflowExports: {},
    });
    registry.registerExample(example);

    expect(() => generateCatalog(registry)).toThrowError(
      'Catalog example "unknown-metadata" contains unknown fields',
    );
  });

  it('rejects cross-kind fields on workflow executions', () => {
    const workflow = () => 'hello';
    const registry = createCatalogRegistry();
    const example = {
      id: 'workflow-with-activity-id',
      title: 'Workflow with activity ID',
      description: 'Contains a standalone activity field.',
      targetId: 'catalog',
      capabilityTags: [],
      expectedEvidence: ['A completed workflow result'],
      input: { defaultValue: [], schema: { type: 'array' } },
      startOptions: { defaultValue: {}, schema: { type: 'object' } },
      execution: {
        kind: 'workflow' as const,
        workflowType: 'greetingWorkflow',
        workflow,
        activities: {},
        activityId: 'not-valid-for-workflows',
      },
    };

    registry.registerTarget({
      id: 'catalog',
      namespace: 'default',
      taskQueue: 'catalog',
      workflowsPath: './workflows',
      workflowExports: { greetingWorkflow: workflow },
    });
    registry.registerExample(example);

    expect(() => generateCatalog(registry)).toThrowError(
      'Catalog workflow execution for example "workflow-with-activity-id" contains unknown fields',
    );
  });

  it('rejects invalid workflow execution runtime field types', () => {
    const workflow = () => 'hello';
    const registry = createCatalogRegistry();

    registry.registerTarget({
      id: 'catalog',
      namespace: 'default',
      taskQueue: 'catalog',
      workflowsPath: './workflows',
      workflowExports: { greetingWorkflow: workflow },
    });
    registry.registerExample({
      id: 'workflow-with-numeric-type',
      title: 'Workflow with numeric type',
      description: 'Contains an invalid workflow type.',
      targetId: 'catalog',
      capabilityTags: [],
      expectedEvidence: ['A completed workflow result'],
      input: { defaultValue: [], schema: { type: 'array' } },
      startOptions: { defaultValue: {}, schema: { type: 'object' } },
      execution: {
        kind: 'workflow',
        workflowType: 42,
        workflow,
        activities: {},
      },
    } as never);

    expect(() => generateCatalog(registry)).toThrowError(
      'Catalog workflow execution for example "workflow-with-numeric-type" has invalid field types',
    );
  });

  it('rejects cross-kind fields on standalone activity executions', () => {
    const registry = createCatalogRegistry();
    const example = {
      id: 'activity-with-workflow-type',
      title: 'Activity with workflow type',
      description: 'Contains a workflow-only field.',
      targetId: 'catalog',
      capabilityTags: [],
      expectedEvidence: ['A completed activity result'],
      input: { defaultValue: {}, schema: { type: 'object' } },
      startOptions: { defaultValue: {}, schema: { type: 'object' } },
      execution: {
        kind: 'standalone-activity' as const,
        activityType: 'greetingActivity',
        activity: () => 'hello',
        timeouts: {},
        policies: {},
        workflowType: 'not-valid-for-activities',
      },
    };

    registry.registerTarget({
      id: 'catalog',
      namespace: 'default',
      taskQueue: 'catalog',
      workflowsPath: './workflows',
      workflowExports: {},
    });
    registry.registerExample(example);

    expect(() => generateCatalog(registry)).toThrowError(
      'Catalog standalone activity execution for example "activity-with-workflow-type" contains unknown fields',
    );
  });

  it('rejects invalid standalone activity execution runtime field types', () => {
    const registry = createCatalogRegistry();

    registry.registerTarget({
      id: 'catalog',
      namespace: 'default',
      taskQueue: 'catalog',
      workflowsPath: './workflows',
      workflowExports: {},
    });
    registry.registerExample({
      id: 'activity-with-string-implementation',
      title: 'Activity with string implementation',
      description: 'Contains an invalid activity implementation.',
      targetId: 'catalog',
      capabilityTags: [],
      expectedEvidence: ['A completed activity result'],
      input: { defaultValue: {}, schema: { type: 'object' } },
      startOptions: { defaultValue: {}, schema: { type: 'object' } },
      execution: {
        kind: 'standalone-activity',
        activityType: 'greetingActivity',
        activity: 'not-a-function',
        timeouts: {},
        policies: {},
      },
    } as never);

    expect(() => generateCatalog(registry)).toThrowError(
      'Catalog standalone activity execution for example "activity-with-string-implementation" has invalid field types',
    );
  });

  it('rejects boolean standalone activity timeouts', () => {
    const registry = createCatalogRegistry();

    registry.registerTarget({
      id: 'catalog',
      namespace: 'default',
      taskQueue: 'catalog',
      workflowsPath: './workflows',
      workflowExports: {},
    });
    registry.registerExample({
      id: 'activity-with-boolean-timeouts',
      title: 'Activity with boolean timeouts',
      description: 'Contains invalid activity timeouts.',
      targetId: 'catalog',
      capabilityTags: [],
      expectedEvidence: [],
      input: { defaultValue: {}, schema: true },
      startOptions: { defaultValue: {}, schema: true },
      execution: {
        kind: 'standalone-activity',
        activityType: 'greetingActivity',
        activity: () => 'hello',
        timeouts: true,
        policies: {},
      },
    } as never);

    expect(() => generateCatalog(registry)).toThrowError(
      'Catalog standalone activity execution for example "activity-with-boolean-timeouts" has invalid field types',
    );
  });

  it('rejects boolean standalone activity policies', () => {
    const registry = createCatalogRegistry();

    registry.registerTarget({
      id: 'catalog',
      namespace: 'default',
      taskQueue: 'catalog',
      workflowsPath: './workflows',
      workflowExports: {},
    });
    registry.registerExample({
      id: 'activity-with-boolean-policies',
      title: 'Activity with boolean policies',
      description: 'Contains invalid activity policies.',
      targetId: 'catalog',
      capabilityTags: [],
      expectedEvidence: [],
      input: { defaultValue: {}, schema: true },
      startOptions: { defaultValue: {}, schema: true },
      execution: {
        kind: 'standalone-activity',
        activityType: 'greetingActivity',
        activity: () => 'hello',
        timeouts: {},
        policies: true,
      },
    } as never);

    expect(() => generateCatalog(registry)).toThrowError(
      'Catalog standalone activity execution for example "activity-with-boolean-policies" has invalid field types',
    );
  });

  it('rejects cross-kind fields on standalone Nexus executions', () => {
    const registry = createCatalogRegistry();
    const example = {
      id: 'nexus-with-activity-id',
      title: 'Nexus operation with activity ID',
      description: 'Contains an activity-only field.',
      targetId: 'nexus-handler',
      capabilityTags: [],
      expectedEvidence: ['A completed Nexus operation result'],
      input: { defaultValue: {}, schema: { type: 'object' } },
      startOptions: { defaultValue: {}, schema: { type: 'object' } },
      execution: {
        kind: 'standalone-nexus-operation' as const,
        endpoint: 'catalog-endpoint',
        service: 'GreetingService',
        operation: 'greet',
        handler: createNexusHandler('GreetingService'),
        policies: {},
        activityId: 'not-valid-for-nexus',
      },
    };

    registry.registerTarget({
      id: 'nexus-handler',
      namespace: 'default',
      taskQueue: 'nexus-handler-queue',
      workflowsPath: './workflows',
      workflowExports: {},
    });
    registry.registerExample(example);

    expect(() => generateCatalog(registry)).toThrowError(
      'Catalog standalone Nexus execution for example "nexus-with-activity-id" contains unknown fields',
    );
  });

  it('rejects invalid standalone Nexus execution runtime field types', () => {
    const registry = createCatalogRegistry();

    registry.registerTarget({
      id: 'nexus-handler',
      namespace: 'default',
      taskQueue: 'nexus-handler-queue',
      workflowsPath: './workflows',
      workflowExports: {},
    });
    registry.registerExample({
      id: 'nexus-with-array-policies',
      title: 'Nexus operation with array policies',
      description: 'Contains invalid Nexus policies.',
      targetId: 'nexus-handler',
      capabilityTags: [],
      expectedEvidence: ['A completed Nexus operation result'],
      input: { defaultValue: {}, schema: { type: 'object' } },
      startOptions: { defaultValue: {}, schema: { type: 'object' } },
      execution: {
        kind: 'standalone-nexus-operation',
        endpoint: 'catalog-endpoint',
        service: 'GreetingService',
        operation: 'greet',
        handler: () => 'hello',
        policies: [],
      },
    } as never);

    expect(() => generateCatalog(registry)).toThrowError(
      'Catalog standalone Nexus execution for example "nexus-with-array-policies" has invalid field types',
    );
  });

  it('rejects boolean standalone Nexus policies', () => {
    const registry = createCatalogRegistry();

    registry.registerTarget({
      id: 'nexus-handler',
      namespace: 'default',
      taskQueue: 'nexus-handler-queue',
      workflowsPath: './workflows',
      workflowExports: {},
    });
    registry.registerExample({
      id: 'nexus-with-boolean-policies',
      title: 'Nexus operation with boolean policies',
      description: 'Contains invalid Nexus policies.',
      targetId: 'nexus-handler',
      capabilityTags: [],
      expectedEvidence: [],
      input: { defaultValue: {}, schema: true },
      startOptions: { defaultValue: {}, schema: true },
      execution: {
        kind: 'standalone-nexus-operation',
        endpoint: 'catalog-endpoint',
        service: 'GreetingService',
        operation: 'greet',
        handler: createNexusHandler('GreetingService'),
        policies: true,
      },
    } as never);

    expect(() => generateCatalog(registry)).toThrowError(
      'Catalog standalone Nexus execution for example "nexus-with-boolean-policies" has invalid field types',
    );
  });

  it('rejects a workflow implementation that differs from its static export', () => {
    const exportedWorkflow = () => 'exported';
    const registeredWorkflow = () => 'registered';
    const registry = createCatalogRegistry();

    registry.registerTarget({
      id: 'catalog',
      namespace: 'default',
      taskQueue: 'catalog',
      workflowsPath: './workflows',
      workflowExports: { greetingWorkflow: exportedWorkflow },
    });
    registry.registerExample({
      id: 'mismatched-workflow',
      title: 'Mismatched workflow',
      description: 'Uses a different function than its static export.',
      targetId: 'catalog',
      capabilityTags: [],
      expectedEvidence: ['A completed workflow result'],
      input: { defaultValue: [], schema: { type: 'array' } },
      startOptions: { defaultValue: {}, schema: { type: 'object' } },
      execution: {
        kind: 'workflow',
        workflowType: 'greetingWorkflow',
        workflow: registeredWorkflow,
        activities: {},
      },
    });

    expect(() => generateCatalog(registry)).toThrowError(
      'Workflow implementation "greetingWorkflow" for example "mismatched-workflow" does not match target "catalog" static export',
    );
  });

  it('requires a non-empty packaged workflow path on every target', () => {
    const registry = createCatalogRegistry();

    registry.registerTarget({
      id: 'catalog',
      namespace: 'default',
      taskQueue: 'catalog',
      workflowsPath: '',
      workflowExports: {},
    });

    expect(() => generateCatalog(registry)).toThrowError(
      'Catalog target "catalog" has an invalid packaged workflowsPath',
    );
  });

  it('rejects missing or invalid known top-level registration fields', () => {
    const registry = createCatalogRegistry();

    registry.registerTarget({
      id: 'catalog',
      namespace: 'default',
      taskQueue: 'catalog',
      workflowsPath: './workflows',
      workflowExports: {},
    });
    registry.registerExample({
      id: 'missing-title',
      description: 'Has no required title.',
      targetId: 'catalog',
      capabilityTags: [],
      expectedEvidence: ['A completed activity result'],
      input: { defaultValue: {}, schema: { type: 'object' } },
      startOptions: { defaultValue: {}, schema: { type: 'object' } },
      execution: {
        kind: 'standalone-activity',
        activityType: 'missingTitleActivity',
        activity: () => 'missing-title',
        timeouts: {},
        policies: {},
      },
    } as never);

    expect(() => generateCatalog(registry)).toThrowError(
      'Catalog example "missing-title" has invalid metadata fields',
    );
  });

  it('rejects unknown execution discriminants before variant validation', () => {
    const registry = createCatalogRegistry();

    registry.registerTarget({
      id: 'catalog',
      namespace: 'default',
      taskQueue: 'catalog',
      workflowsPath: './workflows',
      workflowExports: {},
    });
    registry.registerExample({
      id: 'unknown-execution-kind',
      title: 'Unknown execution kind',
      description: 'Uses an execution kind outside the closed union.',
      targetId: 'catalog',
      capabilityTags: [],
      expectedEvidence: ['No execution is accepted'],
      input: { defaultValue: {}, schema: { type: 'object' } },
      startOptions: { defaultValue: {}, schema: { type: 'object' } },
      execution: {
        kind: 'query',
        workflowType: 'queryWorkflow',
      },
    } as never);

    expect(() => generateCatalog(registry)).toThrowError(
      'Catalog example "unknown-execution-kind" has unknown execution kind "query"',
    );
  });

  it('rejects targets outside the closed runtime contract', () => {
    const invalidTargets = [
      {
        target: {
          id: 'catalog',
          namespace: 'default',
          taskQueue: 'catalog',
          workflowsPath: './workflows',
          workflowExports: {},
          apiKey: 'must-not-enter-a-binding',
        },
        error: 'Catalog target "catalog" contains unknown fields',
      },
      {
        target: {
          id: 'catalog',
          namespace: 42,
          taskQueue: 'catalog',
          workflowsPath: './workflows',
          workflowExports: {},
        },
        error:
          'Catalog target "catalog" has invalid identity or routing fields',
      },
      {
        target: {
          id: 'catalog',
          namespace: 'default',
          taskQueue: 'catalog',
          workflowsPath: './workflows',
          workflowExports: { greetingWorkflow: 'not-a-function' },
        },
        error: 'Catalog target "catalog" has invalid workflow exports',
      },
    ];

    for (const { target, error } of invalidTargets) {
      const registry = createCatalogRegistry();
      registry.registerTarget(target as never);

      expect(() => generateCatalog(registry)).toThrowError(error);
    }
  });

  it('carries optional setup instructions into the browser descriptor', () => {
    const workflow = () => undefined;
    const registerSetupExample = (setupMarkdown?: string) => {
      const registry = createCatalogRegistry();

      registry.registerTarget({
        id: 'catalog',
        namespace: 'default',
        taskQueue: 'catalog',
        workflowsPath: './workflows',
        workflowExports: { setupWorkflow: workflow },
      });
      registry.registerExample({
        id: 'setup-example',
        title: 'Setup example',
        description: 'Shows setup instructions.',
        targetId: 'catalog',
        capabilityTags: [],
        expectedEvidence: [],
        input: { defaultValue: [], schema: {} },
        startOptions: { defaultValue: {}, schema: {} },
        ...(setupMarkdown === undefined ? {} : { setupMarkdown }),
        execution: {
          kind: 'workflow',
          workflowType: 'setupWorkflow',
          workflow,
          activities: {},
        },
      });

      return registry;
    };

    expect(
      generateCatalog(registerSetupExample('Run `make setup` first.'))
        .browserDescriptors[0]?.setupMarkdown,
    ).toBe('Run `make setup` first.');
    expect(
      generateCatalog(registerSetupExample()).browserDescriptors[0],
    ).not.toHaveProperty('setupMarkdown');
    expect(() => generateCatalog(registerSetupExample(''))).toThrow(
      'invalid metadata fields',
    );
  });
});
