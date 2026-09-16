import { describe, expect, it, vi } from 'vitest';

import { assembleWorkbenchHost } from './workbench-host';
import type { BrowserCatalogDescriptor } from '../browser/types';
import type { StartCommand } from '../browser/workbench-host';

const workflowDescriptor: BrowserCatalogDescriptor = {
  id: 'order-lifecycle',
  source: { id: 'oss', label: 'OSS' },
  title: 'Order lifecycle',
  description: 'Runs the order workflow.',
  capabilityTags: [],
  expectedEvidence: [],
  input: { defaultValue: {}, schema: {} },
  startOptions: { defaultValue: {}, schema: {} },
  execution: {
    kind: 'workflow',
    targetId: 'catalog',
    namespace: 'catalog-demo',
    taskQueue: 'catalog-queue',
    workflowType: 'orderWorkflow',
  },
};

const nexusDescriptor: BrowserCatalogDescriptor = {
  ...workflowDescriptor,
  id: 'nexus-greeting',
  execution: {
    kind: 'standalone-nexus-operation',
    targetId: 'nexus-caller',
    namespace: 'caller-demo',
    taskQueue: 'caller-queue',
    endpoint: 'greeting-endpoint',
    service: 'GreetingService',
    operation: 'greet',
    policies: {},
  },
};

const activityDescriptor: BrowserCatalogDescriptor = {
  ...workflowDescriptor,
  id: 'priority-activity',
  execution: {
    kind: 'standalone-activity',
    targetId: 'catalog',
    namespace: 'catalog-demo',
    taskQueue: 'catalog-queue',
    activityType: 'priorityActivity',
    timeouts: {},
    policies: {},
  },
};

const command: StartCommand = {
  exampleId: 'order-lifecycle',
  attempt: { attemptId: 'attempt-1', executionId: 'order-1' },
  input: { orderId: '123' },
  startOptions: { priority: { priorityKey: 3 } },
};

describe('OSS WorkbenchHost', () => {
  it('starts with routing from the registered descriptor', async () => {
    const launch = vi.fn().mockResolvedValue({
      status: 'accepted',
      runId: 'run-1',
    });
    const host = assembleWorkbenchHost({
      descriptors: [workflowDescriptor],
      launch,
      checkWorker: vi.fn(),
      checkNexusEndpoint: vi.fn(),
      createEvidenceHref: vi.fn(),
    });

    const outcome = await host.start(command);

    expect(launch).toHaveBeenCalledWith(
      {
        kind: 'workflow',
        target: {
          targetId: 'catalog',
          namespace: 'catalog-demo',
          taskQueue: 'catalog-queue',
        },
        workflowType: 'orderWorkflow',
        workflowId: 'order-1',
        input: { orderId: '123' },
        startOptions: { priority: { priorityKey: 3 } },
      },
      undefined,
    );
    expect(outcome).toEqual({
      status: 'accepted',
      reference: {
        exampleId: 'order-lifecycle',
        kind: 'workflow',
        attempt: { attemptId: 'attempt-1', executionId: 'order-1' },
        target: {
          targetId: 'catalog',
          namespace: 'catalog-demo',
          taskQueue: 'catalog-queue',
        },
        runId: 'run-1',
      },
    });
  });

  it('uses the configured workflow ID for the request and launch reference', async () => {
    const launch = vi.fn().mockResolvedValue({
      status: 'accepted',
      runId: 'run-1',
    });
    const host = assembleWorkbenchHost({
      descriptors: [workflowDescriptor],
      launch,
      checkWorker: vi.fn(),
      checkNexusEndpoint: vi.fn(),
      createEvidenceHref: vi.fn(),
    });

    const outcome = await host.start({
      ...command,
      startOptions: { workflowId: 'configured-workflow' },
    });

    expect(launch).toHaveBeenCalledWith(
      expect.objectContaining({ workflowId: 'configured-workflow' }),
      undefined,
    );
    expect(outcome.reference.attempt).toEqual({
      attemptId: 'attempt-1',
      executionId: 'configured-workflow',
    });
  });

  it('keeps registered routing fixed after host creation', async () => {
    const descriptor = structuredClone(workflowDescriptor);
    const launch = vi.fn().mockResolvedValue({
      status: 'accepted',
      runId: 'run-1',
    });
    const host = assembleWorkbenchHost({
      descriptors: [descriptor],
      launch,
      checkWorker: vi.fn(),
      checkNexusEndpoint: vi.fn(),
      createEvidenceHref: vi.fn(),
    });

    descriptor.execution.namespace = 'changed';
    descriptor.execution.taskQueue = 'changed';

    await host.start(command);

    expect(launch).toHaveBeenCalledWith(
      expect.objectContaining({
        target: {
          targetId: 'catalog',
          namespace: 'catalog-demo',
          taskQueue: 'catalog-queue',
        },
      }),
      undefined,
    );
  });

  it('keeps the submitted attempt identity in the launch result', async () => {
    const submittedCommand = structuredClone(command);
    const host = assembleWorkbenchHost({
      descriptors: [workflowDescriptor],
      launch: vi.fn().mockResolvedValue({ status: 'accepted', runId: 'run-1' }),
      checkWorker: vi.fn(),
      checkNexusEndpoint: vi.fn(),
      createEvidenceHref: vi.fn(),
    });

    const outcome = await host.start(submittedCommand);
    submittedCommand.attempt.executionId = 'changed';

    expect(outcome.reference.attempt.executionId).toBe('order-1');
  });

  it('uses the attempt execution identity as the Nexus operation fallback', async () => {
    const launch = vi
      .fn()
      .mockResolvedValue({ status: 'accepted', runId: 'run-1' });
    const host = assembleWorkbenchHost({
      descriptors: [nexusDescriptor],
      launch,
      checkWorker: vi.fn(),
      checkNexusEndpoint: vi.fn(),
      createEvidenceHref: vi.fn(),
    });

    await host.start({ ...command, exampleId: 'nexus-greeting' });

    expect(launch.mock.calls.map(([request]) => request)).toEqual([
      expect.objectContaining({
        kind: 'standalone-nexus-operation',
        operationId: 'order-1',
        endpoint: 'greeting-endpoint',
        service: 'GreetingService',
        operation: 'greet',
      }),
    ]);
  });

  it('uses the configured Nexus operation ID', async () => {
    const launch = vi
      .fn()
      .mockResolvedValue({ status: 'accepted', runId: 'run-nexus' });
    const host = assembleWorkbenchHost({
      descriptors: [nexusDescriptor],
      launch,
      checkWorker: vi.fn(),
      checkNexusEndpoint: vi.fn(),
      createEvidenceHref: vi.fn(),
    });

    const outcome = await host.start({
      ...command,
      exampleId: nexusDescriptor.id,
      startOptions: { operationId: 'configured-operation' },
    });

    expect(launch).toHaveBeenCalledWith(
      expect.objectContaining({ operationId: 'configured-operation' }),
      undefined,
    );
    expect(outcome.reference.attempt.executionId).toBe('configured-operation');
  });

  it('uses the exact configured activity ID', async () => {
    const launch = vi
      .fn()
      .mockResolvedValue({ status: 'accepted', runId: 'run-activity' });
    const host = assembleWorkbenchHost({
      descriptors: [activityDescriptor],
      launch,
      checkWorker: vi.fn(),
      checkNexusEndpoint: vi.fn(),
      createEvidenceHref: vi.fn(),
    });

    const outcome = await host.start({
      ...command,
      exampleId: activityDescriptor.id,
      startOptions: { activityId: 'configured-activity' },
    });

    expect(launch).toHaveBeenCalledWith(
      expect.objectContaining({ activityId: 'configured-activity' }),
      undefined,
    );
    expect(outcome.reference.attempt.executionId).toBe('configured-activity');
  });

  it('uses a different generated activity ID for each unchanged launch', async () => {
    const launch = vi
      .fn()
      .mockResolvedValue({ status: 'accepted', runId: 'run-activity' });
    const host = assembleWorkbenchHost({
      descriptors: [activityDescriptor],
      launch,
      checkWorker: vi.fn(),
      checkNexusEndpoint: vi.fn(),
      createEvidenceHref: vi.fn(),
    });

    const first = await host.start({
      ...command,
      exampleId: activityDescriptor.id,
      attempt: { attemptId: 'attempt-1', executionId: 'activity-1' },
      startOptions: {},
    });
    const second = await host.start({
      ...command,
      exampleId: activityDescriptor.id,
      attempt: { attemptId: 'attempt-2', executionId: 'activity-2' },
      startOptions: {},
    });

    expect(launch.mock.calls.map(([request]) => request.activityId)).toEqual([
      'activity-1',
      'activity-2',
    ]);
    expect(first.reference.attempt.executionId).toBe('activity-1');
    expect(second.reference.attempt.executionId).toBe('activity-2');
  });

  it('reports an accepted response without a run ID as uncertain', async () => {
    const host = assembleWorkbenchHost({
      descriptors: [workflowDescriptor],
      launch: vi.fn().mockResolvedValue({ status: 'accepted' }),
      checkWorker: vi.fn(),
      checkNexusEndpoint: vi.fn(),
      createEvidenceHref: vi.fn(),
    });

    await expect(host.start(command)).resolves.toEqual({
      status: 'uncertain',
      reason: 'unusable-response',
      reference: {
        exampleId: 'order-lifecycle',
        kind: 'workflow',
        attempt: { attemptId: 'attempt-1', executionId: 'order-1' },
        target: {
          targetId: 'catalog',
          namespace: 'catalog-demo',
          taskQueue: 'catalog-queue',
        },
      },
    });
  });

  it('reports a truthy non-string run ID as uncertain', async () => {
    const host = assembleWorkbenchHost({
      descriptors: [workflowDescriptor],
      launch: vi.fn().mockResolvedValue({ status: 'accepted', runId: 42 }),
      checkWorker: vi.fn(),
      checkNexusEndpoint: vi.fn(),
      createEvidenceHref: vi.fn(),
    });

    await expect(host.start(command)).resolves.toMatchObject({
      status: 'uncertain',
      reason: 'unusable-response',
    });
  });

  it('reports a known request rejection without retrying', async () => {
    const launch = vi.fn().mockResolvedValue({
      status: 'rejected',
      reason: 'conflict',
    });
    const host = assembleWorkbenchHost({
      descriptors: [workflowDescriptor],
      launch,
      checkWorker: vi.fn(),
      checkNexusEndpoint: vi.fn(),
      createEvidenceHref: vi.fn(),
    });

    await expect(host.start(command)).resolves.toMatchObject({
      status: 'rejected',
      reason: 'conflict',
      reference: {
        attempt: { attemptId: 'attempt-1', executionId: 'order-1' },
      },
    });
    expect(launch).toHaveBeenCalledTimes(1);
  });

  it('reports a transport failure as uncertain without retrying', async () => {
    const launch = vi.fn().mockRejectedValue(new TypeError('fetch failed'));
    const host = assembleWorkbenchHost({
      descriptors: [workflowDescriptor],
      launch,
      checkWorker: vi.fn(),
      checkNexusEndpoint: vi.fn(),
      createEvidenceHref: vi.fn(),
    });

    await expect(host.start(command)).resolves.toMatchObject({
      status: 'uncertain',
      reason: 'transport-failure',
      reference: {
        attempt: { attemptId: 'attempt-1', executionId: 'order-1' },
      },
    });
    expect(launch).toHaveBeenCalledTimes(1);
  });

  it('rejects an already-aborted attempt before dispatch', async () => {
    const launch = vi.fn();
    const controller = new AbortController();
    controller.abort();
    const host = assembleWorkbenchHost({
      descriptors: [workflowDescriptor],
      launch,
      checkWorker: vi.fn(),
      checkNexusEndpoint: vi.fn(),
      createEvidenceHref: vi.fn(),
    });

    await expect(host.start(command, controller.signal)).resolves.toMatchObject(
      {
        status: 'rejected',
        reason: 'aborted',
        reference: {
          attempt: { attemptId: 'attempt-1', executionId: 'order-1' },
        },
      },
    );
    expect(launch).not.toHaveBeenCalled();
  });

  it('rejects a missing attempt identity before dispatch', async () => {
    const launch = vi.fn();
    const host = assembleWorkbenchHost({
      descriptors: [workflowDescriptor],
      launch,
      checkWorker: vi.fn(),
      checkNexusEndpoint: vi.fn(),
      createEvidenceHref: vi.fn(),
    });

    await expect(
      host.start({
        ...command,
        attempt: { attemptId: '', executionId: '' },
      }),
    ).resolves.toMatchObject({
      status: 'rejected',
      reason: 'invalid-request',
    });
    expect(launch).not.toHaveBeenCalled();
  });

  it('reports an abort after dispatch as uncertain', async () => {
    const controller = new AbortController();
    const host = assembleWorkbenchHost({
      descriptors: [workflowDescriptor],
      launch: vi.fn().mockImplementation(async () => {
        controller.abort();
        return { status: 'accepted', runId: 'run-1' };
      }),
      checkWorker: vi.fn(),
      checkNexusEndpoint: vi.fn(),
      createEvidenceHref: vi.fn(),
    });

    await expect(host.start(command, controller.signal)).resolves.toMatchObject(
      {
        status: 'uncertain',
        reason: 'aborted-after-dispatch',
        reference: {
          attempt: { attemptId: 'attempt-1', executionId: 'order-1' },
        },
      },
    );
  });

  it('builds an evidence link for an accepted launch', async () => {
    const createEvidenceHref = vi.fn().mockReturnValue('/workflow/run-1');
    const host = assembleWorkbenchHost({
      descriptors: [workflowDescriptor],
      launch: vi.fn().mockResolvedValue({
        status: 'accepted',
        runId: 'run-1',
      }),
      checkWorker: vi.fn(),
      checkNexusEndpoint: vi.fn(),
      createEvidenceHref,
    });
    const outcome = await host.start(command);

    if (outcome.status !== 'accepted') throw new Error('Expected acceptance');

    expect(host.evidenceLink(outcome)).toEqual({
      href: '/workflow/run-1',
      label: 'Open details',
    });
    expect(createEvidenceHref).toHaveBeenCalledWith(outcome.reference);
  });

  it('reports a missing workflow poller as advisory readiness', async () => {
    const checkWorker = vi.fn().mockResolvedValue(false);
    const host = assembleWorkbenchHost({
      descriptors: [workflowDescriptor],
      launch: vi.fn(),
      checkWorker,
      checkNexusEndpoint: vi.fn(),
      createEvidenceHref: vi.fn(),
    });

    await expect(host.checkReadiness('order-lifecycle')).resolves.toEqual([
      {
        kind: 'worker',
        required: false,
        state: 'unavailable',
        taskQueueType: 1,
      },
    ]);
    expect(checkWorker).toHaveBeenCalledWith(
      {
        namespace: 'catalog-demo',
        taskQueue: 'catalog-queue',
        taskQueueType: 1,
      },
      undefined,
    );
  });

  it('checks a required Nexus endpoint separately from its advisory worker', async () => {
    const checkNexusEndpoint = vi.fn().mockResolvedValue(false);
    const host = assembleWorkbenchHost({
      descriptors: [nexusDescriptor],
      launch: vi.fn(),
      checkWorker: vi.fn().mockResolvedValue(true),
      checkNexusEndpoint,
      createEvidenceHref: vi.fn(),
    });

    await expect(host.checkReadiness('nexus-greeting')).resolves.toEqual([
      {
        kind: 'worker',
        required: false,
        state: 'ready',
        taskQueueType: 3,
      },
      {
        kind: 'nexus-endpoint',
        required: true,
        state: 'unavailable',
        endpoint: 'greeting-endpoint',
      },
    ]);
    expect(checkNexusEndpoint).toHaveBeenCalledWith(
      { namespace: 'caller-demo', endpoint: 'greeting-endpoint' },
      undefined,
    );
  });

  it('performs one observation request with the accepted reference and signal', async () => {
    const observe = vi.fn().mockResolvedValue({
      state: 'running',
      snapshot: { status: 'running' },
      continuation: { kind: 'delay', afterMs: 1_000 },
    });
    const host = assembleWorkbenchHost({
      descriptors: [workflowDescriptor],
      launch: vi.fn(),
      observe,
      checkWorker: vi.fn(),
      checkNexusEndpoint: vi.fn(),
      createEvidenceHref: vi.fn(),
    });
    const controller = new AbortController();
    const reference = {
      exampleId: workflowDescriptor.id,
      kind: 'workflow' as const,
      attempt: { attemptId: 'attempt-observe', executionId: 'workflow-1' },
      target: {
        targetId: 'catalog',
        namespace: 'catalog-demo',
        taskQueue: 'catalog-queue',
      },
      runId: 'run-1',
    };

    await host.observe(
      { reference, continuation: { kind: 'delay', afterMs: 1_000 } },
      controller.signal,
    );

    expect(observe).toHaveBeenCalledTimes(1);
    expect(observe).toHaveBeenCalledWith(
      { reference, continuation: { kind: 'delay', afterMs: 1_000 } },
      controller.signal,
    );
  });

  it('rejects observation routing that differs from the registered descriptor', async () => {
    const observe = vi.fn().mockResolvedValue({
      state: 'running',
      snapshot: { status: 'running' },
      continuation: { kind: 'delay', afterMs: 1_000 },
    });
    const host = assembleWorkbenchHost({
      descriptors: [workflowDescriptor],
      launch: vi.fn(),
      observe,
      checkWorker: vi.fn(),
      checkNexusEndpoint: vi.fn(),
      createEvidenceHref: vi.fn(),
    });

    await expect(
      host.observe(
        {
          reference: {
            exampleId: workflowDescriptor.id,
            kind: 'workflow',
            attempt: {
              attemptId: 'attempt-forged',
              executionId: 'workflow-forged',
            },
            target: {
              targetId: 'catalog',
              namespace: 'other-namespace',
              taskQueue: 'catalog-queue',
            },
            runId: 'run-forged',
          },
        },
        new AbortController().signal,
      ),
    ).rejects.toMatchObject({ reason: 'invalid-response' });
    expect(observe).not.toHaveBeenCalled();
  });
});
