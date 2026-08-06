// @vitest-environment node

import path from 'node:path';

import type { render } from 'svelte/server';

import { svelte } from '@sveltejs/vite-plugin-svelte';
import type { Component } from 'svelte';
import { createServer } from 'vite';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { startIsolatedViteServer } from '$lib/test-utilities/isolated-vite-server';

import {
  logLaunchOutcome,
  logLaunchRequested,
  logObservationPaused,
  logObservationTerminal,
} from './execution-log';
import { createWorkflowCatalogSessionStore } from './session-store';
import type { BrowserWorkflowCatalogDescriptor } from './types';
import type {
  AcceptedLaunchOutcome,
  ExecutionObservation,
  ReadinessCheck,
  WorkbenchHost,
} from './workbench-host';

import {
  createReadinessLoader,
  formatReadinessCheck,
  observeAcceptedAttempt,
  startFromEditors,
  terminalStatusPresentation,
} from './workbench.svelte';

let workbench: Component<Record<string, unknown>>;
let renderComponent: typeof render;
let closeViteServer: (() => Promise<void>) | undefined;

beforeAll(async () => {
  const projectRoot = process.cwd();
  const lifecycle = await startIsolatedViteServer(
    createServer,
    {
      root: projectRoot,
      configFile: false,
      appType: 'custom',
      plugins: [svelte({ hot: false })],
      resolve: {
        alias: {
          $lib: path.resolve(projectRoot, 'src/lib'),
          $types: path.resolve(projectRoot, 'src/types'),
          $app: path.resolve(projectRoot, 'src/lib/svelte-mocks/app'),
        },
      },
      server: { middlewareMode: true },
    },
    async (server) => ({
      workbench: (
        await server.ssrLoadModule(
          '/src/lib/workflow-catalog/browser/workbench.svelte',
        )
      ).default,
      renderComponent: (await server.ssrLoadModule('svelte/server')).render,
    }),
  );
  closeViteServer = lifecycle.close;
  ({ renderComponent, workbench } = lifecycle.value);
});

afterAll(async () => closeViteServer?.());

const descriptor: BrowserWorkflowCatalogDescriptor = {
  id: 'order-lifecycle',
  source: 'shared',
  title: 'Order lifecycle',
  description: 'Start and inspect an order workflow.',
  capabilityTags: ['Workflow', 'Links'],
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
    taskQueue: 'catalog',
    workflowType: 'OrderLifecycle',
  },
};

const createHost = (): WorkbenchHost => ({
  start: vi.fn(),
  checkReadiness: async () => [],
  observe: vi.fn(
    async (): Promise<ExecutionObservation> => ({
      state: 'terminal',
      status: 'completed',
      snapshot: {},
    }),
  ),
  evidenceLink: () => ({ href: '/workflows/example', label: 'Details' }),
});

const acceptedReference: AcceptedLaunchOutcome['reference'] = {
  exampleId: descriptor.id,
  kind: 'workflow',
  attempt: { attemptId: 'attempt-1', executionId: 'execution-1' },
  target: { targetId: 'catalog', namespace: 'default', taskQueue: 'catalog' },
  runId: 'run-1',
};

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, reject, resolve };
};

describe('Workflow catalog workbench', () => {
  it('logs a launch request with only its safe execution identifiers', () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);

    try {
      logLaunchRequested({
        exampleId: descriptor.id,
        attempt: acceptedReference.attempt,
        target: acceptedReference.target,
      });

      expect(info).toHaveBeenCalledWith(
        JSON.stringify({
          component: 'workflow-catalog',
          event: 'launch',
          status: 'requested',
          exampleId: descriptor.id,
          attemptId: 'attempt-1',
          executionId: 'execution-1',
          targetId: 'catalog',
          namespace: 'default',
          taskQueue: 'catalog',
        }),
      );
    } finally {
      info.mockRestore();
    }
  });

  it('logs accepted, rejected, and uncertain launch outcomes without execution inputs', () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);

    try {
      logLaunchOutcome({ status: 'accepted', reference: acceptedReference });
      logLaunchOutcome({
        status: 'rejected',
        reason: 'conflict',
        reference: acceptedReference,
      });
      logLaunchOutcome({
        status: 'uncertain',
        reason: 'transport-failure',
        reference: acceptedReference,
      });

      expect(info).toHaveBeenNthCalledWith(
        1,
        JSON.stringify({
          component: 'workflow-catalog',
          event: 'launch',
          status: 'accepted',
          exampleId: descriptor.id,
          attemptId: 'attempt-1',
          executionId: 'execution-1',
          targetId: 'catalog',
          namespace: 'default',
          taskQueue: 'catalog',
          runId: 'run-1',
        }),
      );
      expect(info).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('"reason":"conflict"'),
      );
      expect(info).toHaveBeenNthCalledWith(
        3,
        expect.stringContaining('"reason":"transport-failure"'),
      );
    } finally {
      info.mockRestore();
    }
  });

  it('logs terminal and paused observations with safe status reasons', () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);

    try {
      logObservationTerminal(acceptedReference, 'completed');
      logObservationPaused(acceptedReference);

      expect(info).toHaveBeenNthCalledWith(
        1,
        JSON.stringify({
          component: 'workflow-catalog',
          event: 'observation',
          status: 'terminal',
          reason: 'completed',
          exampleId: descriptor.id,
          attemptId: 'attempt-1',
          executionId: 'execution-1',
          targetId: 'catalog',
          namespace: 'default',
          taskQueue: 'catalog',
          runId: 'run-1',
        }),
      );
      expect(info).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('"reason":"observation-error"'),
      );
    } finally {
      info.mockRestore();
    }
  });

  it('logs a paused observation only after a non-abort error', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    const host = createHost();
    host.observe = vi.fn(async () => {
      throw new Error('raw observation payload must stay private');
    });
    const aborted = new AbortController();
    aborted.abort();

    try {
      await observeAcceptedAttempt({
        host,
        reference: acceptedReference,
        signal: new AbortController().signal,
      });
      expect(info).toHaveBeenCalledOnce();
      await observeAcceptedAttempt({
        host,
        reference: acceptedReference,
        signal: aborted.signal,
      });

      expect(info).toHaveBeenCalledOnce();
      expect(info).toHaveBeenCalledWith(
        expect.stringContaining('"reason":"observation-error"'),
      );
    } finally {
      info.mockRestore();
    }
  });

  it('emits requested and accepted launch logs around a successful editor start', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    const host = createHost();
    host.start = vi.fn(async () => ({
      status: 'accepted' as const,
      reference: acceptedReference,
    }));

    try {
      const result = await startFromEditors({
        descriptor,
        host,
        inputEditor: JSON.stringify(descriptor.input.defaultValue),
        startOptionsEditor: JSON.stringify(
          descriptor.startOptions.defaultValue,
        ),
      });

      if ('error' in result) throw new Error('expected a successful start');
      const events = info.mock.calls.map(([event]) => JSON.parse(event));

      expect(events).toEqual([
        {
          component: 'workflow-catalog',
          event: 'launch',
          status: 'requested',
          exampleId: descriptor.id,
          attemptId: result.attempt.attemptId,
          executionId: result.attempt.executionId,
          targetId: 'catalog',
          namespace: 'default',
          taskQueue: 'catalog',
        },
        {
          component: 'workflow-catalog',
          event: 'launch',
          status: 'accepted',
          exampleId: descriptor.id,
          attemptId: 'attempt-1',
          executionId: 'execution-1',
          targetId: 'catalog',
          namespace: 'default',
          taskQueue: 'catalog',
          runId: 'run-1',
        },
      ]);
    } finally {
      info.mockRestore();
    }
  });

  it('emits terminal and paused observation logs from observation sessions', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    const terminalHost = createHost();
    terminalHost.observe = vi.fn(async () => ({
      state: 'terminal' as const,
      status: 'completed' as const,
      snapshot: {},
    }));
    const pausedHost = createHost();
    pausedHost.observe = vi.fn(async () => {
      throw new Error('raw observation snapshot must stay private');
    });

    try {
      await observeAcceptedAttempt({
        host: terminalHost,
        reference: acceptedReference,
        signal: new AbortController().signal,
      });
      await observeAcceptedAttempt({
        host: pausedHost,
        reference: acceptedReference,
        signal: new AbortController().signal,
      });

      expect(info.mock.calls.map(([event]) => JSON.parse(event))).toEqual([
        {
          component: 'workflow-catalog',
          event: 'observation',
          status: 'terminal',
          reason: 'completed',
          exampleId: descriptor.id,
          attemptId: 'attempt-1',
          executionId: 'execution-1',
          targetId: 'catalog',
          namespace: 'default',
          taskQueue: 'catalog',
          runId: 'run-1',
        },
        {
          component: 'workflow-catalog',
          event: 'observation',
          status: 'paused',
          reason: 'observation-error',
          exampleId: descriptor.id,
          attemptId: 'attempt-1',
          executionId: 'execution-1',
          targetId: 'catalog',
          namespace: 'default',
          taskQueue: 'catalog',
          runId: 'run-1',
        },
      ]);
    } finally {
      info.mockRestore();
    }
  });

  it('renders completed terminal executions as success and failed executions as danger', () => {
    expect(terminalStatusPresentation('completed')).toEqual({
      label: 'Completed',
      type: 'success',
    });
    expect(terminalStatusPresentation('failed')).toEqual({
      label: 'Failed',
      type: 'danger',
    });
    expect(terminalStatusPresentation('terminated').type).toBe('danger');
    expect(terminalStatusPresentation('timed-out').type).toBe('danger');
    expect(terminalStatusPresentation('canceled').type).toBe('warning');
    expect(terminalStatusPresentation('continued-as-new').type).toBe('primary');
  });

  it('opens in the unselected catalog state with searchable supplied examples', () => {
    const { body } = renderComponent(workbench, {
      props: { descriptors: [descriptor], host: createHost() },
    });

    expect(body).toContain('Choose an example to run and inspect.');
    expect(body).toContain('aria-label="Filter example catalog"');
    expect(body).toContain('aria-label="Example source filter"');
    expect(body).toContain('aria-pressed="true"');
    expect(body).toContain('Order lifecycle');
    expect(body).not.toContain('Configure example');
  });

  it('marks local examples clearly in the all-examples catalog', () => {
    const localDescriptor = { ...descriptor, source: 'local' as const };
    const { body } = renderComponent(workbench, {
      props: { descriptors: [localDescriptor], host: createHost() },
    });

    expect(body).toContain('Order lifecycle');
    expect(body).toContain('Local');
  });

  it('renders sessions that were launched before the workbench mounts', async () => {
    const host = createHost();
    host.start = vi.fn(async () => ({
      status: 'rejected' as const,
      reason: 'conflict' as const,
      reference: acceptedReference,
    }));
    const sessionStore = createWorkflowCatalogSessionStore(host, {
      createId: (() => {
        const ids = ['attempt-1', 'execution-1'];
        return () => ids.shift() as string;
      })(),
    });

    await sessionStore.start({
      descriptor,
      input: descriptor.input.defaultValue,
      startOptions: descriptor.startOptions.defaultValue,
    });

    const { body } = renderComponent(workbench, {
      props: { descriptors: [descriptor], host, sessionStore },
    });

    expect(body).toContain('Run sessions');
    expect(body).toContain('Order lifecycle');
    expect(body).toContain('attempt-1');
    expect(body).toContain('Rejected');
  });

  it('observes concurrent accepted attempts independently', async () => {
    const first = deferred<ExecutionObservation>();
    const second = deferred<ExecutionObservation>();
    const host = createHost();
    host.observe = vi
      .fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    const firstController = new AbortController();
    const secondController = new AbortController();

    const firstResult = observeAcceptedAttempt({
      host,
      reference: acceptedReference,
      signal: firstController.signal,
    });
    const secondResult = observeAcceptedAttempt({
      host,
      reference: {
        ...acceptedReference,
        attempt: { attemptId: 'attempt-2', executionId: 'execution-2' },
        runId: 'run-2',
      },
      signal: secondController.signal,
    });
    first.resolve({
      state: 'terminal',
      status: 'completed',
      snapshot: { result: 'first' },
    });
    second.resolve({
      state: 'terminal',
      status: 'failed',
      snapshot: { result: 'second' },
    });

    await expect(firstResult).resolves.toMatchObject({
      state: 'execution-terminal',
      terminalStatus: 'completed',
    });
    await expect(secondResult).resolves.toMatchObject({
      state: 'execution-terminal',
      terminalStatus: 'failed',
    });
    expect(host.observe).toHaveBeenCalledTimes(2);
  });

  it('stops observing after a terminal result and preserves its snapshot', async () => {
    const host = createHost();
    host.observe = vi.fn(
      async (): Promise<ExecutionObservation> => ({
        state: 'terminal',
        status: 'completed',
        snapshot: { result: 'done' },
      }),
    );

    await expect(
      observeAcceptedAttempt({
        host,
        reference: acceptedReference,
        signal: new AbortController().signal,
      }),
    ).resolves.toEqual({
      state: 'execution-terminal',
      snapshot: { result: 'done' },
      terminalStatus: 'completed',
    });
    expect(host.observe).toHaveBeenCalledOnce();
  });

  it('pauses after an observation error and resumes from its saved continuation without starting again', async () => {
    const host = createHost();
    host.observe = vi
      .fn()
      .mockResolvedValueOnce({
        state: 'running',
        snapshot: { progress: 1 },
        continuation: 'next-page',
      })
      .mockRejectedValueOnce(new Error('temporary observation failure'))
      .mockResolvedValueOnce({
        state: 'terminal',
        status: 'completed',
        snapshot: { progress: 2 },
      });

    const paused = await observeAcceptedAttempt({
      host,
      reference: acceptedReference,
      signal: new AbortController().signal,
    });
    expect(paused).toMatchObject({
      state: 'observation-paused',
      snapshot: { progress: 1 },
      continuation: 'next-page',
    });

    await observeAcceptedAttempt({
      host,
      reference: acceptedReference,
      signal: new AbortController().signal,
      snapshot: paused.snapshot,
      continuation: paused.continuation,
    });

    expect(host.observe).toHaveBeenLastCalledWith(
      { reference: acceptedReference, continuation: 'next-page' },
      expect.any(AbortSignal),
    );
    expect(host.start).not.toHaveBeenCalled();
  });

  it('stopping one observation does not stop another attempt', async () => {
    const observations = new Map<
      string,
      ReturnType<typeof deferred<ExecutionObservation>>
    >();
    const host = createHost();
    host.observe = vi.fn((request, signal) => {
      const pending = deferred<ExecutionObservation>();
      observations.set(request.reference.runId, pending);
      signal.addEventListener('abort', () => {
        pending.reject(new DOMException('Stopped', 'AbortError'));
      });
      return pending.promise;
    });
    const stoppedController = new AbortController();
    const continuingController = new AbortController();
    const stopped = observeAcceptedAttempt({
      host,
      reference: acceptedReference,
      signal: stoppedController.signal,
    });
    const continuing = observeAcceptedAttempt({
      host,
      reference: { ...acceptedReference, runId: 'run-2' },
      signal: continuingController.signal,
    });

    stoppedController.abort();
    observations.get('run-2')?.resolve({
      state: 'terminal',
      status: 'completed',
      snapshot: { isolated: true },
    });

    await expect(stopped).resolves.toMatchObject({ state: 'stopped' });
    await expect(continuing).resolves.toMatchObject({
      state: 'execution-terminal',
      snapshot: { isolated: true },
    });
    expect(continuingController.signal.aborted).toBe(false);
  });

  it('ignores stale readiness results after selection changes or Back', async () => {
    const first = deferred<ReadinessCheck[]>();
    const second = deferred<ReadinessCheck[]>();
    const signals: (AbortSignal | undefined)[] = [];
    const host = createHost();
    host.checkReadiness = vi.fn((_exampleId, signal) => {
      signals.push(signal);
      return signals.length === 1 ? first.promise : second.promise;
    });
    const loader = createReadinessLoader(() => host);

    const staleSelection = loader.load('first');
    const currentSelection = loader.load('second');
    expect(signals[0]?.aborted).toBe(true);
    first.resolve([]);
    second.resolve([
      { kind: 'worker', required: false, state: 'ready', taskQueueType: 1 },
    ]);

    await expect(staleSelection).resolves.toEqual({ state: 'stale' });
    await expect(currentSelection).resolves.toMatchObject({ state: 'current' });

    const backRequest = loader.load('first');
    loader.cancel();
    expect(signals[2]?.aborted).toBe(true);
    await expect(backRequest).resolves.toEqual({ state: 'stale' });
  });

  it('does not throw when readiness is aborted after navigating Back', async () => {
    const host = createHost();
    host.checkReadiness = vi.fn(async () => {
      throw new DOMException('Canceled by Back', 'AbortError');
    });

    await expect(
      startFromEditors({
        descriptor,
        host,
        inputEditor: JSON.stringify(descriptor.input.defaultValue),
        startOptionsEditor: JSON.stringify(
          descriptor.startOptions.defaultValue,
        ),
      }),
    ).resolves.toEqual({ error: 'unable-to-start' });
    expect(host.start).not.toHaveBeenCalled();
  });

  it('shows an input error and does not start when valid JSON violates the input schema', async () => {
    const host = createHost();

    const result = await startFromEditors({
      descriptor,
      host,
      inputEditor: '{"customer":"not-an-array"}',
      startOptionsEditor: JSON.stringify(descriptor.startOptions.defaultValue),
    });

    expect(result).toEqual({ error: 'input-schema-mismatch' });
    expect(host.start).not.toHaveBeenCalled();
  });

  it('validates local draft-2020-12 input schemas when CSP blocks Function', async () => {
    const host = createHost();
    const cspDescriptor = structuredClone(descriptor);
    cspDescriptor.input = {
      defaultValue: ['Temporal'],
      schema: {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        type: 'array',
        items: { $ref: '#/$defs/workflowName' },
        $defs: {
          workflowName: { const: 'Temporal' },
        },
      },
    };
    const functionSpy = vi
      .spyOn(globalThis, 'Function')
      .mockImplementation(() => {
        throw new Error(
          'Refused to evaluate a string as JavaScript due to CSP',
        );
      });

    try {
      await startFromEditors({
        descriptor: cspDescriptor,
        host,
        inputEditor: JSON.stringify(cspDescriptor.input.defaultValue),
        startOptionsEditor: JSON.stringify(
          cspDescriptor.startOptions.defaultValue,
        ),
      });
    } finally {
      functionSpy.mockRestore();
    }

    expect(host.start).toHaveBeenCalledWith(
      expect.objectContaining({ input: ['Temporal'] }),
    );
  });

  it('does not start when an input violates an enum declared by its JSON schema', async () => {
    const host = createHost();
    const enumDescriptor = structuredClone(descriptor);
    enumDescriptor.input = {
      defaultValue: 'standard',
      schema: { type: 'string', enum: ['standard', 'priority'] },
    };

    const result = await startFromEditors({
      descriptor: enumDescriptor,
      host,
      inputEditor: JSON.stringify('unsupported'),
      startOptionsEditor: JSON.stringify(
        enumDescriptor.startOptions.defaultValue,
      ),
    });

    expect(result).toEqual({ error: 'input-schema-mismatch' });
    expect(host.start).not.toHaveBeenCalled();
  });

  it('starts with arbitrary JSON when the input schema is true', async () => {
    const host = createHost();
    const acceptsAnyInputDescriptor = structuredClone(descriptor);
    acceptsAnyInputDescriptor.input.schema = true;

    await startFromEditors({
      descriptor: acceptsAnyInputDescriptor,
      host,
      inputEditor: '{"unexpected":[true,null,42]}',
      startOptionsEditor: JSON.stringify(
        acceptsAnyInputDescriptor.startOptions.defaultValue,
      ),
    });

    expect(host.start).toHaveBeenCalledWith(
      expect.objectContaining({ input: { unexpected: [true, null, 42] } }),
    );
  });

  it('rejects input before host dispatch when the input schema is false', async () => {
    const host = createHost();
    const rejectsEveryInputDescriptor = structuredClone(descriptor);
    rejectsEveryInputDescriptor.input.schema = false;

    const result = await startFromEditors({
      descriptor: rejectsEveryInputDescriptor,
      host,
      inputEditor: 'null',
      startOptionsEditor: JSON.stringify(
        rejectsEveryInputDescriptor.startOptions.defaultValue,
      ),
    });

    expect(result).toEqual({ error: 'input-schema-mismatch' });
    expect(host.start).not.toHaveBeenCalled();
  });

  it('rejects non-object start options when their schema is true', async () => {
    const host = createHost();
    const acceptsAnyStartOptionsDescriptor = structuredClone(descriptor);
    acceptsAnyStartOptionsDescriptor.startOptions.schema = true;

    const result = await startFromEditors({
      descriptor: acceptsAnyStartOptionsDescriptor,
      host,
      inputEditor: JSON.stringify(
        acceptsAnyStartOptionsDescriptor.input.defaultValue,
      ),
      startOptionsEditor: '["custom",42,true]',
    });

    expect(result).toEqual({ error: 'unsupported-start-options' });
    expect(host.start).not.toHaveBeenCalled();
  });

  it('rejects undeclared start-option keys when their schema is true', async () => {
    const host = createHost();
    const acceptsAnyStartOptionsDescriptor = structuredClone(descriptor);
    acceptsAnyStartOptionsDescriptor.startOptions.schema = true;

    const result = await startFromEditors({
      descriptor: acceptsAnyStartOptionsDescriptor,
      host,
      inputEditor: JSON.stringify(
        acceptsAnyStartOptionsDescriptor.input.defaultValue,
      ),
      startOptionsEditor: '{"custom":"option"}',
    });

    expect(result).toEqual({ error: 'unsupported-start-options' });
    expect(host.start).not.toHaveBeenCalled();
  });

  it('starts with an empty object when the start-options schema is true', async () => {
    const host = createHost();
    const emptyStartOptionsDescriptor = structuredClone(descriptor);
    emptyStartOptionsDescriptor.startOptions.schema = true;

    await startFromEditors({
      descriptor: emptyStartOptionsDescriptor,
      host,
      inputEditor: JSON.stringify(
        emptyStartOptionsDescriptor.input.defaultValue,
      ),
      startOptionsEditor: '{}',
    });

    expect(host.start).toHaveBeenCalledWith(
      expect.objectContaining({ startOptions: {} }),
    );
  });

  it('rejects start options before host dispatch when their schema is false', async () => {
    const host = createHost();
    const rejectsEveryStartOptionsDescriptor = structuredClone(descriptor);
    rejectsEveryStartOptionsDescriptor.startOptions.schema = false;

    const result = await startFromEditors({
      descriptor: rejectsEveryStartOptionsDescriptor,
      host,
      inputEditor: JSON.stringify(
        rejectsEveryStartOptionsDescriptor.input.defaultValue,
      ),
      startOptionsEditor: 'null',
    });

    expect(result).toEqual({ error: 'unsupported-start-options' });
    expect(host.start).not.toHaveBeenCalled();
  });

  it('does not let additionalProperties true authorize an undeclared start option', async () => {
    const host = createHost();
    const closedStartOptionsDescriptor = structuredClone(descriptor);
    closedStartOptionsDescriptor.startOptions.schema = {
      type: 'object',
      properties: { workflowId: { type: 'string' } },
      additionalProperties: true,
    };

    const result = await startFromEditors({
      descriptor: closedStartOptionsDescriptor,
      host,
      inputEditor: JSON.stringify(
        closedStartOptionsDescriptor.input.defaultValue,
      ),
      startOptionsEditor:
        '{"workflowId":"order-lifecycle-01","taskQueue":"other"}',
    });

    expect(result).toEqual({ error: 'unsupported-start-options' });
    expect(host.start).not.toHaveBeenCalled();
  });

  it('does not let an additionalProperties schema authorize an undeclared start option', async () => {
    const host = createHost();
    const closedStartOptionsDescriptor = structuredClone(descriptor);
    closedStartOptionsDescriptor.startOptions.schema = {
      type: 'object',
      properties: { workflowId: { type: 'string' } },
      additionalProperties: { type: 'string' },
    };

    const result = await startFromEditors({
      descriptor: closedStartOptionsDescriptor,
      host,
      inputEditor: JSON.stringify(
        closedStartOptionsDescriptor.input.defaultValue,
      ),
      startOptionsEditor:
        '{"workflowId":"order-lifecycle-01","taskQueue":"other"}',
    });

    expect(result).toEqual({ error: 'unsupported-start-options' });
    expect(host.start).not.toHaveBeenCalled();
  });

  it('does not treat a nested property declaration as a top-level start option', async () => {
    const host = createHost();
    const nestedDescriptor = structuredClone(descriptor);
    nestedDescriptor.startOptions.schema = {
      type: 'object',
      properties: {
        container: {
          type: 'object',
          properties: { requestId: { type: 'string' } },
        },
      },
      additionalProperties: true,
    };

    const result = await startFromEditors({
      descriptor: nestedDescriptor,
      host,
      inputEditor: JSON.stringify(nestedDescriptor.input.defaultValue),
      startOptionsEditor: '{"requestId":"request-01"}',
    });

    expect(result).toEqual({ error: 'unsupported-start-options' });
    expect(host.start).not.toHaveBeenCalled();
  });

  it('starts when a composed schema declares an optional start option absent from the defaults', async () => {
    const host = createHost();
    const startOptionsDescriptor = structuredClone(descriptor);
    startOptionsDescriptor.startOptions = {
      defaultValue: { workflowId: 'order-lifecycle-01' },
      schema: {
        $defs: {
          startOptions: {
            type: 'object',
            properties: {
              workflowId: { type: 'string' },
              requestId: { type: 'string' },
            },
          },
        },
        allOf: [{ $ref: '#/$defs/startOptions' }],
      },
    };

    await startFromEditors({
      descriptor: startOptionsDescriptor,
      host,
      inputEditor: JSON.stringify(startOptionsDescriptor.input.defaultValue),
      startOptionsEditor:
        '{"workflowId":"order-lifecycle-01","requestId":"request-01"}',
    });

    expect(host.start).toHaveBeenCalledWith(
      expect.objectContaining({
        startOptions: {
          workflowId: 'order-lifecycle-01',
          requestId: 'request-01',
        },
      }),
    );
  });

  it('derives start-option keys through escaped local JSON Pointer segments', async () => {
    const host = createHost();
    const escapedReferenceDescriptor = structuredClone(descriptor);
    escapedReferenceDescriptor.startOptions.schema = {
      $defs: {
        'start/options~v1': {
          type: 'object',
          properties: { requestId: { type: 'string' } },
        },
      },
      $ref: '#/$defs/start~1options~0v1',
    };

    await startFromEditors({
      descriptor: escapedReferenceDescriptor,
      host,
      inputEditor: JSON.stringify(
        escapedReferenceDescriptor.input.defaultValue,
      ),
      startOptionsEditor: '{"requestId":"request-01"}',
    });

    expect(host.start).toHaveBeenCalledWith(
      expect.objectContaining({ startOptions: { requestId: 'request-01' } }),
    );
  });

  it('derives start-option keys through local JSON Pointer array indices', async () => {
    const host = createHost();
    const arrayReferenceDescriptor = structuredClone(descriptor);
    arrayReferenceDescriptor.startOptions.schema = {
      $defs: {
        alternatives: {
          anyOf: [
            {
              type: 'object',
              properties: { requestId: { type: 'string' } },
            },
          ],
        },
      },
      $ref: '#/$defs/alternatives/anyOf/0',
    };

    await startFromEditors({
      descriptor: arrayReferenceDescriptor,
      host,
      inputEditor: JSON.stringify(arrayReferenceDescriptor.input.defaultValue),
      startOptionsEditor: '{"requestId":"request-01"}',
    });

    expect(host.start).toHaveBeenCalledWith(
      expect.objectContaining({ startOptions: { requestId: 'request-01' } }),
    );
  });

  it('authorizes start-option keys through local named anchors', async () => {
    const host = createHost();
    const anchoredReferenceDescriptor = structuredClone(descriptor);
    anchoredReferenceDescriptor.startOptions.schema = {
      $defs: {
        options: {
          $anchor: 'options',
          type: 'object',
          properties: { requestId: { type: 'string' } },
          required: ['requestId'],
        },
      },
      $ref: '#options',
    };

    await startFromEditors({
      descriptor: anchoredReferenceDescriptor,
      host,
      inputEditor: JSON.stringify(
        anchoredReferenceDescriptor.input.defaultValue,
      ),
      startOptionsEditor: '{"requestId":"request-01"}',
    });

    expect(host.start).toHaveBeenCalledWith(
      expect.objectContaining({ startOptions: { requestId: 'request-01' } }),
    );
  });

  it('does not dispatch when a cyclic local schema reference cannot validate', async () => {
    const host = createHost();
    const cyclicReferenceDescriptor = structuredClone(descriptor);
    cyclicReferenceDescriptor.startOptions.schema = {
      $defs: { cycle: { $ref: '#/$defs/cycle' } },
      $ref: '#/$defs/cycle',
    };

    const result = await startFromEditors({
      descriptor: cyclicReferenceDescriptor,
      host,
      inputEditor: JSON.stringify(cyclicReferenceDescriptor.input.defaultValue),
      startOptionsEditor: '{}',
    });

    expect(result).toEqual({ error: 'invalid-schema' });
    expect(host.start).not.toHaveBeenCalled();
  });

  it('starts with a key declared by a matching oneOf branch', async () => {
    const host = createHost();
    const oneOfDescriptor = structuredClone(descriptor);
    oneOfDescriptor.startOptions.schema = {
      type: 'object',
      oneOf: [
        {
          properties: { workflowId: { type: 'string' } },
          required: ['workflowId'],
        },
        {
          properties: { requestId: { type: 'string' } },
          required: ['requestId'],
        },
      ],
    };

    await startFromEditors({
      descriptor: oneOfDescriptor,
      host,
      inputEditor: JSON.stringify(oneOfDescriptor.input.defaultValue),
      startOptionsEditor: '{"requestId":"request-01"}',
    });

    expect(host.start).toHaveBeenCalledWith(
      expect.objectContaining({ startOptions: { requestId: 'request-01' } }),
    );
  });

  it('starts with a key declared by an anyOf branch', async () => {
    const host = createHost();
    const anyOfDescriptor = structuredClone(descriptor);
    anyOfDescriptor.startOptions.schema = {
      type: 'object',
      anyOf: [
        { properties: { workflowId: { type: 'string' } } },
        { properties: { requestId: { type: 'string' } } },
      ],
    };

    await startFromEditors({
      descriptor: anyOfDescriptor,
      host,
      inputEditor: JSON.stringify(anyOfDescriptor.input.defaultValue),
      startOptionsEditor: '{"requestId":"request-01"}',
    });

    expect(host.start).toHaveBeenCalledWith(
      expect.objectContaining({ startOptions: { requestId: 'request-01' } }),
    );
  });

  it('starts with keys declared by a matching conditional branch', async () => {
    const host = createHost();
    const conditionalDescriptor = structuredClone(descriptor);
    conditionalDescriptor.startOptions.schema = {
      type: 'object',
      properties: { mode: { enum: ['request', 'workflow'] } },
      if: {
        properties: { mode: { const: 'request' } },
        required: ['mode'],
      },
      then: {
        properties: { requestId: { type: 'string' } },
        required: ['requestId'],
      },
      else: {
        properties: { workflowId: { type: 'string' } },
        required: ['workflowId'],
      },
    };

    await startFromEditors({
      descriptor: conditionalDescriptor,
      host,
      inputEditor: JSON.stringify(conditionalDescriptor.input.defaultValue),
      startOptionsEditor: '{"mode":"request","requestId":"request-01"}',
    });

    expect(host.start).toHaveBeenCalledWith(
      expect.objectContaining({
        startOptions: { mode: 'request', requestId: 'request-01' },
      }),
    );
  });

  it('rejects an unevaluated top-level start option before host dispatch', async () => {
    const host = createHost();
    const composedDescriptor = structuredClone(descriptor);
    composedDescriptor.startOptions.schema = {
      $defs: {
        startOptions: {
          type: 'object',
          properties: { workflowId: { type: 'string' } },
        },
      },
      allOf: [{ $ref: '#/$defs/startOptions' }],
    };

    const result = await startFromEditors({
      descriptor: composedDescriptor,
      host,
      inputEditor: JSON.stringify(composedDescriptor.input.defaultValue),
      startOptionsEditor:
        '{"workflowId":"order-lifecycle-01","taskQueue":"other"}',
    });

    expect(result).toEqual({ error: 'unsupported-start-options' });
    expect(host.start).not.toHaveBeenCalled();
  });

  it('reports an invalid registered schema without dispatching to the host', async () => {
    const host = createHost();
    const invalidSchemaDescriptor = structuredClone(descriptor);
    invalidSchemaDescriptor.input.schema = { type: 'not-a-json-schema-type' };

    const result = await startFromEditors({
      descriptor: invalidSchemaDescriptor,
      host,
      inputEditor: JSON.stringify(invalidSchemaDescriptor.input.defaultValue),
      startOptionsEditor: JSON.stringify(
        invalidSchemaDescriptor.startOptions.defaultValue,
      ),
    });

    expect(result).toEqual({ error: 'invalid-schema' });
    expect(host.start).not.toHaveBeenCalled();
  });

  it('does not dispatch when an async input schema returns a validation promise', async () => {
    const host = createHost();
    const asyncSchemaDescriptor = structuredClone(descriptor);
    asyncSchemaDescriptor.input.schema = { $async: true, type: 'string' };

    const result = await startFromEditors({
      descriptor: asyncSchemaDescriptor,
      host,
      inputEditor: '42',
      startOptionsEditor: JSON.stringify(
        asyncSchemaDescriptor.startOptions.defaultValue,
      ),
    });

    expect(result).toEqual({ error: 'invalid-schema' });
    expect(host.start).not.toHaveBeenCalled();
  });

  it('reports an invalid start-options schema without dispatching to the host', async () => {
    const host = createHost();
    const invalidSchemaDescriptor = structuredClone(descriptor);
    invalidSchemaDescriptor.startOptions.schema = {
      type: 'not-a-json-schema-type',
    };

    const result = await startFromEditors({
      descriptor: invalidSchemaDescriptor,
      host,
      inputEditor: JSON.stringify(invalidSchemaDescriptor.input.defaultValue),
      startOptionsEditor: JSON.stringify(
        invalidSchemaDescriptor.startOptions.defaultValue,
      ),
    });

    expect(result).toEqual({ error: 'invalid-schema' });
    expect(host.start).not.toHaveBeenCalled();
  });

  it('refreshes readiness and blocks a required unavailable Nexus endpoint before dispatch', async () => {
    const events: string[] = [];
    const host = createHost();
    host.checkReadiness = vi.fn(async () => {
      events.push('readiness');
      return [
        {
          kind: 'nexus-endpoint',
          required: true,
          state: 'unavailable',
        },
      ] satisfies ReadinessCheck[];
    });
    host.start = vi.fn(async () => {
      events.push('start');
      throw new Error('must not dispatch');
    });

    const result = await startFromEditors({
      descriptor,
      host,
      inputEditor: JSON.stringify(descriptor.input.defaultValue),
      startOptionsEditor: JSON.stringify(descriptor.startOptions.defaultValue),
    });

    expect(result).toEqual({ error: 'required-readiness-unavailable' });
    expect(events).toEqual(['readiness']);
    expect(host.start).not.toHaveBeenCalled();
  });

  it.each([
    [
      {
        kind: 'worker',
        required: false,
        state: 'indeterminate',
        taskQueueType: 1,
      },
      'Worker readiness: Indeterminate',
    ],
    [
      { kind: 'worker', required: false, state: 'skipped', taskQueueType: 2 },
      'Worker readiness: Skipped',
    ],
  ] as const)(
    'labels a %s readiness state without calling it unavailable',
    (check, expected) => {
      expect(formatReadinessCheck(check as ReadinessCheck)).toBe(expected);
    },
  );
});
