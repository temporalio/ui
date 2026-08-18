import { describe, expect, it, vi } from 'vitest';

import { createCatalogSessionStore } from './session-store';
import { startFromEditors, startWithDefaults } from './start-example';
import type { BrowserCatalogDescriptor, JsonSchema, JsonValue } from './types';
import type { ReadinessCheck, WorkbenchHost } from './workbench-host';

const descriptor: BrowserCatalogDescriptor = {
  id: 'order-lifecycle',
  source: { id: 'oss', label: 'OSS' },
  title: 'Order lifecycle',
  description: 'Start and inspect an order workflow.',
  capabilityTags: ['Workflow'],
  expectedEvidence: ['Workflow details'],
  input: {
    defaultValue: ['customer-123'],
    schema: { type: 'array', items: { type: 'string' } },
  },
  startOptions: {
    defaultValue: { workflowId: 'order-lifecycle-01' },
    schema: {
      type: 'object',
      properties: { workflowId: { type: 'string' } },
    },
  },
  execution: {
    kind: 'workflow',
    targetId: 'catalog',
    namespace: 'default',
    taskQueue: 'catalog-tasks',
    workflowType: 'OrderLifecycle',
  },
};

const host = ({
  readiness = [],
}: {
  readiness?: ReadinessCheck[];
} = {}): WorkbenchHost => ({
  start: vi.fn(async (command) => ({
    status: 'accepted' as const,
    reference: {
      exampleId: command.exampleId,
      kind: descriptor.execution.kind,
      attempt: command.attempt,
      target: descriptor.execution,
      runId: 'run-1',
    },
  })),
  checkReadiness: vi.fn(async () => readiness),
  observe: vi.fn(async () => ({
    state: 'terminal' as const,
    status: 'completed' as const,
    snapshot: {},
  })),
  evidenceLink: vi.fn(),
});

const run = (
  catalogHost: WorkbenchHost,
  currentDescriptor: BrowserCatalogDescriptor = descriptor,
  input: JsonValue = currentDescriptor.input.defaultValue,
  startOptions: JsonValue = currentDescriptor.startOptions.defaultValue,
) =>
  startFromEditors({
    descriptor: currentDescriptor,
    host: catalogHost,
    inputEditor: JSON.stringify(input),
    startOptionsEditor: JSON.stringify(startOptions),
    sessionStore: createCatalogSessionStore(catalogHost, {
      createId: () => 'attempt-1',
    }),
  });

describe('catalog example start', () => {
  it('starts the default input through the shared session store', async () => {
    const catalogHost = host();

    await expect(
      startWithDefaults({
        descriptor,
        host: catalogHost,
        sessionStore: createCatalogSessionStore(catalogHost, {
          createId: () => 'attempt-1',
        }),
      }),
    ).resolves.toEqual({ started: true });
    expect(catalogHost.start).toHaveBeenCalledWith(
      expect.objectContaining({
        exampleId: descriptor.id,
        input: descriptor.input.defaultValue,
        startOptions: descriptor.startOptions.defaultValue,
      }),
      expect.any(AbortSignal),
    );
  });

  it('reports fresh readiness before dispatch', async () => {
    const readiness = [
      { kind: 'worker', required: false, state: 'ready', taskQueueType: 1 },
    ] satisfies ReadinessCheck[];
    const catalogHost = host({ readiness });
    const onReadiness = vi.fn();

    await startFromEditors({
      descriptor,
      host: catalogHost,
      inputEditor: JSON.stringify(descriptor.input.defaultValue),
      startOptionsEditor: JSON.stringify(descriptor.startOptions.defaultValue),
      onReadiness,
      sessionStore: createCatalogSessionStore(catalogHost),
    });

    expect(onReadiness).toHaveBeenCalledWith(readiness);
    expect(catalogHost.start).toHaveBeenCalledOnce();
  });

  it('does not dispatch invalid JSON, input, or start options', async () => {
    const catalogHost = host();
    const sessionStore = createCatalogSessionStore(catalogHost);

    await expect(
      startFromEditors({
        descriptor,
        host: catalogHost,
        inputEditor: '{',
        startOptionsEditor: '{}',
        sessionStore,
      }),
    ).resolves.toEqual({ error: 'invalid-json' });
    await expect(
      run(catalogHost, descriptor, { customer: 'not-an-array' }),
    ).resolves.toEqual({ error: 'input-schema-mismatch' });
    await expect(
      run(catalogHost, descriptor, descriptor.input.defaultValue, {
        workflowId: 'order-lifecycle-01',
        taskQueue: 'other',
      }),
    ).resolves.toEqual({ error: 'unsupported-start-options' });
    expect(catalogHost.start).not.toHaveBeenCalled();
  });

  it('reports invalid and asynchronous registered schemas', async () => {
    const catalogHost = host();
    const invalid = structuredClone(descriptor);
    invalid.input.schema = { type: 'not-a-json-schema-type' };
    const asynchronous = structuredClone(descriptor);
    asynchronous.input.schema = { $async: true, type: 'string' };

    await expect(run(catalogHost, invalid)).resolves.toEqual({
      error: 'invalid-schema',
    });
    await expect(run(catalogHost, asynchronous, 'value')).resolves.toEqual({
      error: 'invalid-schema',
    });
    expect(catalogHost.start).not.toHaveBeenCalled();
  });

  it('blocks a required unavailable prerequisite before dispatch', async () => {
    const catalogHost = host({
      readiness: [
        {
          kind: 'nexus-endpoint',
          required: true,
          state: 'unavailable',
          endpoint: 'greeting-endpoint',
        },
      ],
    });

    await expect(run(catalogHost)).resolves.toEqual({
      error: 'required-readiness-unavailable',
    });
    expect(catalogHost.start).not.toHaveBeenCalled();
  });

  it('reports readiness failures without dispatch', async () => {
    const catalogHost = host();
    catalogHost.checkReadiness = vi.fn(async () => {
      throw new Error('unavailable');
    });

    await expect(run(catalogHost)).resolves.toEqual({
      error: 'unable-to-start',
    });
    expect(catalogHost.start).not.toHaveBeenCalled();
  });

  it('accepts arbitrary input with a true schema but only declared start options', async () => {
    const catalogHost = host();
    const acceptsAnyInput = structuredClone(descriptor);
    acceptsAnyInput.input.schema = true;

    await expect(
      run(catalogHost, acceptsAnyInput, { unexpected: [true, null, 42] }),
    ).resolves.toEqual({ started: true });

    const undeclaredOptions = structuredClone(descriptor);
    undeclaredOptions.startOptions.schema = true;
    await expect(
      run(catalogHost, undeclaredOptions, descriptor.input.defaultValue, {
        custom: 'option',
      }),
    ).resolves.toEqual({ error: 'unsupported-start-options' });
  });

  it.each([
    [
      'a composed local reference',
      {
        $defs: {
          options: {
            type: 'object',
            properties: { requestId: { type: 'string' } },
          },
        },
        allOf: [{ $ref: '#/$defs/options' }],
      },
    ],
    [
      'an escaped JSON Pointer',
      {
        $defs: {
          'start/options~v1': {
            type: 'object',
            properties: { requestId: { type: 'string' } },
          },
        },
        $ref: '#/$defs/start~1options~0v1',
      },
    ],
    [
      'a local named anchor',
      {
        $defs: {
          options: {
            $anchor: 'options',
            type: 'object',
            properties: { requestId: { type: 'string' } },
            required: ['requestId'],
          },
        },
        $ref: '#options',
      },
    ],
    [
      'a matching oneOf branch',
      {
        type: 'object',
        oneOf: [
          {
            properties: { requestId: { type: 'string' } },
            required: ['requestId'],
          },
          {
            properties: { workflowId: { type: 'string' } },
            required: ['workflowId'],
          },
        ],
      },
    ],
  ] as const)('derives allowed options from %s', async (_name, schema) => {
    const catalogHost = host();
    const currentDescriptor = structuredClone(descriptor);
    currentDescriptor.startOptions = {
      defaultValue: {},
      schema: schema as JsonSchema,
    };

    await expect(
      run(
        catalogHost,
        currentDescriptor,
        currentDescriptor.input.defaultValue,
        { requestId: 'request-01' },
      ),
    ).resolves.toEqual({ started: true });
  });

  it('rejects a cyclic local schema reference', async () => {
    const catalogHost = host();
    const currentDescriptor = structuredClone(descriptor);
    currentDescriptor.startOptions.schema = {
      $defs: { cycle: { $ref: '#/$defs/cycle' } },
      $ref: '#/$defs/cycle',
    };

    await expect(
      run(
        catalogHost,
        currentDescriptor,
        currentDescriptor.input.defaultValue,
        {},
      ),
    ).resolves.toEqual({ error: 'invalid-schema' });
    expect(catalogHost.start).not.toHaveBeenCalled();
  });
});
