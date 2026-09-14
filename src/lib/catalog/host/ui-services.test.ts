import { describe, expect, it, vi } from 'vitest';

import type { Payload } from '$lib/types';
import { encodePayloads } from '$lib/utilities/encode-payload';

import { createApiWorkbenchHost } from './ui-services';
import type { BrowserCatalogDescriptor } from '../browser/types';
import type { AcceptedLaunchOutcome } from '../browser/workbench-host';

vi.mock('$lib/utilities/encode-payload', () => ({
  encodePayloads: vi.fn(),
}));

const descriptor: BrowserCatalogDescriptor = {
  id: 'order-lifecycle',
  source: { id: 'oss', label: 'OSS' },
  title: 'Order lifecycle',
  description: 'Runs the order workflow.',
  capabilityTags: [],
  expectedEvidence: [],
  input: { defaultValue: [], schema: {} },
  startOptions: { defaultValue: {}, schema: {} },
  execution: {
    kind: 'workflow',
    targetId: 'catalog',
    namespace: 'catalog-demo',
    taskQueue: 'catalog-queue',
    workflowType: 'orderWorkflow',
  },
};

const activityDescriptor: BrowserCatalogDescriptor = {
  ...descriptor,
  id: 'priority-activity',
  execution: {
    kind: 'standalone-activity',
    targetId: 'catalog',
    namespace: 'catalog-demo',
    taskQueue: 'catalog-queue',
    activityType: 'priorityActivity',
    timeouts: { scheduleToCloseTimeout: '1m' },
    policies: { retryPolicy: { maximumAttempts: 3 } },
  },
};

const nexusDescriptor: BrowserCatalogDescriptor = {
  ...descriptor,
  id: 'nexus-greeting',
  execution: {
    kind: 'standalone-nexus-operation',
    targetId: 'nexus-caller',
    namespace: 'caller-demo',
    taskQueue: 'caller-queue',
    endpoint: 'greeting-endpoint',
    service: 'GreetingService',
    operation: 'greet',
    policies: { scheduleToCloseTimeout: '1m' },
  },
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

describe('createApiWorkbenchHost', () => {
  it('starts a workflow through the authenticated UI REST route with locked routing', async () => {
    const request = vi.fn().mockResolvedValue(jsonResponse({ runId: 'run-1' }));
    const host = createApiWorkbenchHost({
      descriptors: [descriptor],
      request,
      encodeInput: vi.fn().mockResolvedValue([{ data: 'encoded' }]),
      getIdentity: () => 'developer@example.com',
      createRequestId: () => 'request-1',
    });

    const outcome = await host.start({
      exampleId: descriptor.id,
      attempt: { attemptId: 'attempt-1', executionId: 'workflow-1' },
      input: ['one', 'two'],
      startOptions: {
        namespace: 'changed',
        taskQueue: { name: 'changed' },
        workflowType: { name: 'changed' },
        priority: { priorityKey: 3 },
      },
    });

    expect(outcome.status).toBe('accepted');
    expect(request).toHaveBeenCalledTimes(1);
    const [url, init] = request.mock.calls[0];
    expect(url).toMatch(
      /\/api\/v1\/namespaces\/catalog-demo\/workflows\/workflow-1\?$/,
    );
    expect(init.signal).toBeUndefined();
    expect(JSON.parse(String(init.body))).toEqual({
      priority: { priorityKey: 3 },
      identity: 'developer@example.com',
      requestId: 'request-1',
      workflowId: 'workflow-1',
      workflowType: { name: 'orderWorkflow' },
      taskQueue: { name: 'catalog-queue' },
      input: { payloads: [{ data: 'encoded' }] },
    });
  });

  it('starts a default-encoded workflow with json/plain payloads without using the UI codec', async () => {
    const payload: Payload = {
      metadata: { encoding: new TextEncoder().encode('json/plain') },
      data: new TextEncoder().encode('"Temporal"'),
    };
    vi.mocked(encodePayloads).mockResolvedValueOnce([payload]);
    const request = vi
      .fn()
      .mockResolvedValue(jsonResponse({ runId: 'run-json-plain' }));
    const host = createApiWorkbenchHost({
      descriptors: [descriptor],
      request,
      getIdentity: () => 'developer@example.com',
      createRequestId: () => 'request-json-plain',
    });

    const outcome = await host.start({
      exampleId: descriptor.id,
      attempt: {
        attemptId: 'attempt-json-plain',
        executionId: 'workflow-json-plain',
      },
      input: ['Temporal'],
      startOptions: {},
    });

    expect(outcome.status).toBe('accepted');
    expect(encodePayloads).toHaveBeenCalledWith({
      input: '"Temporal"',
      encoding: 'json/plain',
      encodeWithCodec: false,
    });
    const [, init] = request.mock.calls[0];
    const body = JSON.parse(String(init.body));
    expect(body.input.payloads).toEqual(JSON.parse(JSON.stringify([payload])));
  });

  it('dispatches a workflow after async encoding without resolving identity outside host construction', async () => {
    const request = vi
      .fn()
      .mockResolvedValue(jsonResponse({ runId: 'run-async' }));
    const payload: Payload = {
      data: new TextEncoder().encode('codec-encoded'),
    };
    let resolveEncoding!: (payloads: Payload[]) => void;
    const encodeInput = vi.fn(
      () =>
        new Promise<Payload[]>((resolve) => {
          resolveEncoding = resolve;
        }),
    );
    let constructing = true;
    const getIdentity = vi.fn(() => {
      if (!constructing) {
        throw new Error('identity resolved outside host construction');
      }

      return 'developer@example.com';
    });
    const host = createApiWorkbenchHost({
      descriptors: [descriptor],
      request,
      encodeInput,
      getIdentity,
      createRequestId: () => 'request-async',
    });
    constructing = false;

    const launch = host.start({
      exampleId: descriptor.id,
      attempt: { attemptId: 'attempt-async', executionId: 'workflow-async' },
      input: ['one'],
      startOptions: {},
    });
    resolveEncoding([payload]);

    await expect(launch).resolves.toMatchObject({ status: 'accepted' });
    expect(getIdentity).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledTimes(1);
    const [, init] = request.mock.calls[0];
    const body = JSON.parse(String(init.body));
    expect(body).toMatchObject({
      identity: 'developer@example.com',
      requestId: 'request-async',
    });
    expect(body.input.payloads).toEqual(JSON.parse(JSON.stringify([payload])));
  });

  it('starts an activity with registered policy and locked routing', async () => {
    const request = vi.fn().mockResolvedValue(jsonResponse({ runId: 'run-2' }));
    const host = createApiWorkbenchHost({
      descriptors: [activityDescriptor],
      request,
      encodeInput: vi.fn().mockResolvedValue([{ data: 'encoded' }]),
      getIdentity: () => 'developer@example.com',
      createRequestId: () => 'request-2',
    });

    const outcome = await host.start({
      exampleId: activityDescriptor.id,
      attempt: { attemptId: 'attempt-2', executionId: 'activity-2' },
      input: { orderId: 'one' },
      startOptions: {
        activityId: 'activity-2',
        taskQueue: { name: 'changed' },
        activityType: { name: 'changed' },
        priority: { priorityKey: 5 },
      },
    });

    expect(outcome.status).toBe('accepted');
    const [url, init] = request.mock.calls[0];
    expect(url).toMatch(
      /\/api\/v1\/namespaces\/catalog-demo\/activities\/activity-2\?$/,
    );
    expect(JSON.parse(String(init.body))).toEqual({
      scheduleToCloseTimeout: '1m',
      retryPolicy: { maximumAttempts: 3 },
      priority: { priorityKey: 5 },
      identity: 'developer@example.com',
      requestId: 'request-2',
      activityId: 'activity-2',
      activityType: { name: 'priorityActivity' },
      taskQueue: { name: 'catalog-queue' },
      input: { payloads: [{ data: 'encoded' }] },
    });
  });

  it('starts a Nexus operation with registered policy and locked routing', async () => {
    const request = vi.fn().mockResolvedValue(jsonResponse({ runId: 'run-3' }));
    const host = createApiWorkbenchHost({
      descriptors: [nexusDescriptor],
      request,
      encodeInput: vi.fn().mockResolvedValue([{ data: 'encoded' }]),
      getIdentity: () => 'developer@example.com',
      createRequestId: () => 'request-3',
    });

    const outcome = await host.start({
      exampleId: nexusDescriptor.id,
      attempt: { attemptId: 'attempt-3', executionId: 'operation-3' },
      input: { name: 'Temporal' },
      startOptions: {
        endpoint: 'changed',
        service: 'Changed',
        operation: 'changed',
        idConflictPolicy: 'NEXUS_OPERATION_ID_CONFLICT_POLICY_FAIL',
      },
    });

    expect(outcome.status).toBe('accepted');
    const [url, init] = request.mock.calls[0];
    expect(url).toMatch(
      /\/api\/v1\/namespaces\/caller-demo\/nexus-operations\/operation-3\?$/,
    );
    expect(JSON.parse(String(init.body))).toEqual({
      scheduleToCloseTimeout: '1m',
      idConflictPolicy: 'NEXUS_OPERATION_ID_CONFLICT_POLICY_FAIL',
      identity: 'developer@example.com',
      requestId: 'request-3',
      operationId: 'operation-3',
      endpoint: 'greeting-endpoint',
      service: 'GreetingService',
      operation: 'greet',
      input: { data: 'encoded' },
    });
  });

  it('checks workflow readiness with task queue type 1', async () => {
    const request = vi
      .fn()
      .mockResolvedValue(jsonResponse({ pollers: [{ identity: 'worker' }] }));
    const host = createApiWorkbenchHost({
      descriptors: [descriptor],
      request,
    });

    await expect(host.checkReadiness(descriptor.id)).resolves.toEqual([
      {
        kind: 'worker',
        required: false,
        state: 'ready',
        taskQueueType: 1,
      },
    ]);
    expect(request.mock.calls[0][0]).toMatch(
      /\/api\/v1\/namespaces\/catalog-demo\/task-queues\/catalog-queue\?taskQueueType=1$/,
    );
  });

  it('checks activity readiness with task queue type 2', async () => {
    const request = vi.fn().mockResolvedValue(jsonResponse({ pollers: [] }));
    const host = createApiWorkbenchHost({
      descriptors: [activityDescriptor],
      request,
    });

    await host.checkReadiness(activityDescriptor.id);

    expect(request.mock.calls[0][0]).toMatch(/\?taskQueueType=2$/);
  });

  it('checks Nexus readiness with task queue type 3 and the exact endpoint', async () => {
    const request = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/task-queues/')) {
        return jsonResponse({ pollers: [{ identity: 'nexus-worker' }] });
      }
      return jsonResponse({
        endpoints: [{ spec: { name: 'greeting-endpoint' } }],
      });
    });
    const host = createApiWorkbenchHost({
      descriptors: [nexusDescriptor],
      request,
    });

    await expect(host.checkReadiness(nexusDescriptor.id)).resolves.toEqual([
      {
        kind: 'worker',
        required: false,
        state: 'ready',
        taskQueueType: 3,
      },
      {
        kind: 'nexus-endpoint',
        required: true,
        state: 'ready',
        endpoint: 'greeting-endpoint',
      },
    ]);
    expect(request.mock.calls.map(([url]) => url)).toEqual([
      expect.stringMatching(
        /\/api\/v1\/namespaces\/caller-demo\/task-queues\/caller-queue\?taskQueueType=3$/,
      ),
      expect.stringMatching(
        /\/api\/v1\/nexus\/endpoints\?name=greeting-endpoint$/,
      ),
    ]);
  });

  it('classifies a known HTTP conflict as rejected', async () => {
    const host = createApiWorkbenchHost({
      descriptors: [descriptor],
      request: vi
        .fn()
        .mockResolvedValue(jsonResponse({ message: 'exists' }, 409)),
      encodeInput: vi.fn().mockResolvedValue([]),
    });

    await expect(
      host.start({
        exampleId: descriptor.id,
        attempt: { attemptId: 'attempt-4', executionId: 'workflow-4' },
        input: [],
        startOptions: {},
      }),
    ).resolves.toMatchObject({ status: 'rejected', reason: 'conflict' });
  });

  it('classifies an unauthorized response as forbidden', async () => {
    const host = createApiWorkbenchHost({
      descriptors: [descriptor],
      request: vi
        .fn()
        .mockResolvedValue(jsonResponse({ message: 'unauthorized' }, 401)),
      encodeInput: vi.fn().mockResolvedValue([]),
    });

    await expect(
      host.start({
        exampleId: descriptor.id,
        attempt: { attemptId: 'attempt-401', executionId: 'workflow-401' },
        input: [],
        startOptions: {},
      }),
    ).resolves.toMatchObject({ status: 'rejected', reason: 'forbidden' });
  });

  it.each([
    [400, 'invalid-request'],
    [422, 'invalid-request'],
    [403, 'forbidden'],
    [404, 'not-found'],
  ] as const)(
    'classifies launch HTTP %s as a known rejection',
    async (status, reason) => {
      const host = createApiWorkbenchHost({
        descriptors: [descriptor],
        request: vi
          .fn()
          .mockResolvedValue(jsonResponse({ message: 'rejected' }, status)),
        encodeInput: vi.fn().mockResolvedValue([]),
      });

      await expect(
        host.start({
          exampleId: descriptor.id,
          attempt: {
            attemptId: `attempt-${status}`,
            executionId: `workflow-${status}`,
          },
          input: [],
          startOptions: {},
        }),
      ).resolves.toMatchObject({ status: 'rejected', reason });
    },
  );

  it('leaves a rate-limited launch uncertain', async () => {
    const request = vi
      .fn()
      .mockResolvedValue(jsonResponse({ message: 'try later' }, 429));
    const host = createApiWorkbenchHost({
      descriptors: [descriptor],
      request,
      encodeInput: vi.fn().mockResolvedValue([]),
    });

    await expect(
      host.start({
        exampleId: descriptor.id,
        attempt: { attemptId: 'attempt-429', executionId: 'workflow-429' },
        input: [],
        startOptions: {},
      }),
    ).resolves.toMatchObject({
      status: 'uncertain',
      reason: 'transport-failure',
    });
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('leaves a server-error launch uncertain', async () => {
    const request = vi
      .fn()
      .mockResolvedValue(jsonResponse({ message: 'unavailable' }, 503));
    const host = createApiWorkbenchHost({
      descriptors: [descriptor],
      request,
      encodeInput: vi.fn().mockResolvedValue([]),
    });

    await expect(
      host.start({
        exampleId: descriptor.id,
        attempt: { attemptId: 'attempt-503', executionId: 'workflow-503' },
        input: [],
        startOptions: {},
      }),
    ).resolves.toMatchObject({
      status: 'uncertain',
      reason: 'transport-failure',
    });
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('leaves a request-timeout launch uncertain', async () => {
    const request = vi
      .fn()
      .mockResolvedValue(jsonResponse({ message: 'timeout' }, 408));
    const host = createApiWorkbenchHost({
      descriptors: [descriptor],
      request,
      encodeInput: vi.fn().mockResolvedValue([]),
    });

    await expect(
      host.start({
        exampleId: descriptor.id,
        attempt: { attemptId: 'attempt-408', executionId: 'workflow-408' },
        input: [],
        startOptions: {},
      }),
    ).resolves.toMatchObject({
      status: 'uncertain',
      reason: 'transport-failure',
    });
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('leaves a transport failure uncertain', async () => {
    const host = createApiWorkbenchHost({
      descriptors: [descriptor],
      request: vi.fn().mockRejectedValue(new TypeError('fetch failed')),
      encodeInput: vi.fn().mockResolvedValue([]),
    });

    await expect(
      host.start({
        exampleId: descriptor.id,
        attempt: { attemptId: 'attempt-5', executionId: 'workflow-5' },
        input: [],
        startOptions: {},
      }),
    ).resolves.toMatchObject({
      status: 'uncertain',
      reason: 'transport-failure',
    });
  });

  it('leaves a malformed success run ID uncertain', async () => {
    const host = createApiWorkbenchHost({
      descriptors: [descriptor],
      request: vi.fn().mockResolvedValue(jsonResponse({ runId: 42 })),
      encodeInput: vi.fn().mockResolvedValue([]),
    });

    await expect(
      host.start({
        exampleId: descriptor.id,
        attempt: {
          attemptId: 'attempt-malformed-run',
          executionId: 'workflow-malformed-run',
        },
        input: [],
        startOptions: {},
      }),
    ).resolves.toMatchObject({
      status: 'uncertain',
      reason: 'unusable-response',
    });
  });

  it('rejects input encoding failure before dispatch', async () => {
    const request = vi.fn();
    const host = createApiWorkbenchHost({
      descriptors: [descriptor],
      request,
      encodeInput: vi.fn().mockRejectedValue(new Error('invalid input')),
    });

    await expect(
      host.start({
        exampleId: descriptor.id,
        attempt: {
          attemptId: 'attempt-encoding',
          executionId: 'workflow-encoding',
        },
        input: [],
        startOptions: {},
      }),
    ).resolves.toMatchObject({
      status: 'rejected',
      reason: 'invalid-request',
    });
    expect(request).not.toHaveBeenCalled();
  });

  it('links an accepted workflow to its existing details page', () => {
    const host = createApiWorkbenchHost({ descriptors: [descriptor] });
    const outcome: AcceptedLaunchOutcome = {
      status: 'accepted',
      reference: {
        exampleId: descriptor.id,
        kind: 'workflow',
        attempt: { attemptId: 'attempt-6', executionId: 'workflow-6' },
        target: {
          targetId: 'catalog',
          namespace: 'catalog-demo',
          taskQueue: 'catalog-queue',
        },
        runId: 'run-6',
      },
    };

    expect(host.evidenceLink(outcome).href).toMatch(
      /\/namespaces\/catalog-demo\/workflows\/workflow-6\/run-6\/timeline$/,
    );
  });

  it.each([
    {
      kind: 'standalone-activity' as const,
      expected:
        /\/namespaces\/catalog-demo\/activities\/execution-7\/run-7\/details$/,
    },
    {
      kind: 'standalone-nexus-operation' as const,
      expected:
        /\/namespaces\/catalog-demo\/nexus-operations\/execution-7\/run-7\/details$/,
    },
  ])(
    'links an accepted $kind to its existing details page',
    ({ kind, expected }) => {
      const host = createApiWorkbenchHost({ descriptors: [descriptor] });
      const outcome: AcceptedLaunchOutcome = {
        status: 'accepted',
        reference: {
          exampleId: descriptor.id,
          kind,
          attempt: { attemptId: 'attempt-7', executionId: 'execution-7' },
          target: {
            targetId: 'catalog',
            namespace: 'catalog-demo',
            taskQueue: 'catalog-queue',
          },
          runId: 'run-7',
        },
      };

      expect(host.evidenceLink(outcome).href).toMatch(expected);
    },
  );

  it('describes the exact workflow run once and returns a delayed continuation', async () => {
    const request = vi.fn().mockResolvedValue(
      jsonResponse({
        workflowExecutionInfo: {
          status: 'WORKFLOW_EXECUTION_STATUS_RUNNING',
        },
      }),
    );
    const host = createApiWorkbenchHost({
      descriptors: [descriptor],
      request,
    });
    const controller = new AbortController();

    const observation = await host.observe(
      {
        reference: {
          exampleId: descriptor.id,
          kind: 'workflow',
          attempt: {
            attemptId: 'attempt-observe',
            executionId: 'workflow-observe',
          },
          target: {
            targetId: 'catalog',
            namespace: 'catalog-demo',
            taskQueue: 'catalog-queue',
          },
          runId: 'run-observe',
        },
      },
      controller.signal,
    );

    expect(observation).toMatchObject({
      state: 'running',
      continuation: { kind: 'delay', afterMs: 1_000 },
    });
    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0][0]).toMatch(
      /\/api\/v1\/namespaces\/catalog-demo\/workflows\/workflow-observe\?execution.runId=run-observe$/,
    );
    expect(request.mock.calls[0][1].signal).toBe(controller.signal);
  });

  it('long-polls the exact activity run from its saved cursor', async () => {
    const request = vi.fn().mockResolvedValue(
      jsonResponse({
        info: { status: 'ACTIVITY_EXECUTION_STATUS_RUNNING' },
        longPollToken: 'next-activity-cursor',
      }),
    );
    const host = createApiWorkbenchHost({
      descriptors: [activityDescriptor],
      request,
    });
    const controller = new AbortController();

    const observation = await host.observe(
      {
        reference: {
          exampleId: activityDescriptor.id,
          kind: 'standalone-activity',
          attempt: {
            attemptId: 'attempt-activity-observe',
            executionId: 'activity-observe',
          },
          target: {
            targetId: 'catalog',
            namespace: 'catalog-demo',
            taskQueue: 'catalog-queue',
          },
          runId: 'activity-run-observe',
        },
        continuation: { kind: 'cursor', value: 'activity-cursor' },
      },
      controller.signal,
    );

    expect(observation).toMatchObject({
      state: 'running',
      continuation: { kind: 'cursor', value: 'next-activity-cursor' },
    });
    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0][0]).toMatch(
      /\/activities\/activity-observe\?.*runId=activity-run-observe.*longPollToken=activity-cursor/,
    );
    expect(request.mock.calls[0][1].signal).toBe(controller.signal);
  });

  it('begins activity observation without a cursor', async () => {
    const request = vi.fn().mockResolvedValue(
      jsonResponse({
        info: { status: 'ACTIVITY_EXECUTION_STATUS_RUNNING' },
        longPollToken: 'first-activity-cursor',
      }),
    );
    const host = createApiWorkbenchHost({
      descriptors: [activityDescriptor],
      request,
    });

    const observation = await host.observe(
      {
        reference: {
          exampleId: activityDescriptor.id,
          kind: 'standalone-activity',
          attempt: {
            attemptId: 'attempt-activity-first',
            executionId: 'activity-first',
          },
          target: {
            targetId: 'catalog',
            namespace: 'catalog-demo',
            taskQueue: 'catalog-queue',
          },
          runId: 'activity-run-first',
        },
      },
      new AbortController().signal,
    );

    expect(observation).toMatchObject({
      state: 'running',
      continuation: { kind: 'cursor', value: 'first-activity-cursor' },
    });
    expect(request.mock.calls[0][0]).not.toContain('longPollToken');
  });

  it('long-polls the exact Nexus operation run from its saved cursor', async () => {
    const request = vi.fn().mockResolvedValue(
      jsonResponse({
        info: { status: 'NEXUS_OPERATION_EXECUTION_STATUS_COMPLETED' },
      }),
    );
    const host = createApiWorkbenchHost({
      descriptors: [nexusDescriptor],
      request,
    });
    const controller = new AbortController();

    const observation = await host.observe(
      {
        reference: {
          exampleId: nexusDescriptor.id,
          kind: 'standalone-nexus-operation',
          attempt: {
            attemptId: 'attempt-nexus-observe',
            executionId: 'nexus-observe',
          },
          target: {
            targetId: 'nexus-caller',
            namespace: 'caller-demo',
            taskQueue: 'caller-queue',
          },
          runId: 'nexus-run-observe',
        },
        continuation: { kind: 'cursor', value: 'nexus-cursor' },
      },
      controller.signal,
    );

    expect(observation).toMatchObject({
      state: 'terminal',
      status: 'completed',
    });
    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0][0]).toMatch(
      /\/nexus-operations\/nexus-observe\?.*runId=nexus-run-observe.*longPollToken=nexus-cursor/,
    );
    expect(request.mock.calls[0][1].signal).toBe(controller.signal);
  });

  it('waits for a workflow continuation delay before describing again', async () => {
    vi.useFakeTimers();
    const request = vi.fn().mockResolvedValue(
      jsonResponse({
        workflowExecutionInfo: {
          status: 'WORKFLOW_EXECUTION_STATUS_COMPLETED',
        },
      }),
    );
    const host = createApiWorkbenchHost({
      descriptors: [descriptor],
      request,
    });
    const controller = new AbortController();
    const observing = host.observe(
      {
        reference: {
          exampleId: descriptor.id,
          kind: 'workflow',
          attempt: {
            attemptId: 'attempt-delay',
            executionId: 'workflow-delay',
          },
          target: {
            targetId: 'catalog',
            namespace: 'catalog-demo',
            taskQueue: 'catalog-queue',
          },
          runId: 'run-delay',
        },
        continuation: { kind: 'delay', afterMs: 1_000 },
      },
      controller.signal,
    );

    await vi.advanceTimersByTimeAsync(999);
    expect(request).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    await expect(observing).resolves.toMatchObject({
      state: 'terminal',
      status: 'completed',
    });
    expect(request).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('stops a delayed workflow observation when it is aborted', async () => {
    vi.useFakeTimers();
    const request = vi.fn();
    const host = createApiWorkbenchHost({
      descriptors: [descriptor],
      request,
    });
    const controller = new AbortController();
    const observing = host.observe(
      {
        reference: {
          exampleId: descriptor.id,
          kind: 'workflow',
          attempt: {
            attemptId: 'attempt-abort-delay',
            executionId: 'workflow-abort-delay',
          },
          target: {
            targetId: 'catalog',
            namespace: 'catalog-demo',
            taskQueue: 'catalog-queue',
          },
          runId: 'run-abort-delay',
        },
        continuation: { kind: 'delay', afterMs: 1_000 },
      },
      controller.signal,
    );

    controller.abort();
    await expect(observing).rejects.toMatchObject({ name: 'AbortError' });
    expect(request).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('pauses observation safely when the server forbids a request', async () => {
    const host = createApiWorkbenchHost({
      descriptors: [descriptor],
      request: vi
        .fn()
        .mockResolvedValue(jsonResponse({ message: 'sensitive' }, 403)),
    });

    await expect(
      host.observe(
        {
          reference: {
            exampleId: descriptor.id,
            kind: 'workflow',
            attempt: {
              attemptId: 'attempt-forbidden',
              executionId: 'workflow-forbidden',
            },
            target: {
              targetId: 'catalog',
              namespace: 'catalog-demo',
              taskQueue: 'catalog-queue',
            },
            runId: 'run-forbidden',
          },
        },
        new AbortController().signal,
      ),
    ).rejects.toMatchObject({
      name: 'ApiObservationError',
      reason: 'forbidden',
      message: 'Observation paused',
    });
  });

  it.each([
    [404, 'not-found'],
    [429, 'rate-limited'],
    [503, 'server-error'],
  ] as const)(
    'pauses observation safely for HTTP %s',
    async (status, reason) => {
      const host = createApiWorkbenchHost({
        descriptors: [descriptor],
        request: vi
          .fn()
          .mockResolvedValue(jsonResponse({ message: 'sensitive' }, status)),
      });

      await expect(
        host.observe(
          {
            reference: {
              exampleId: descriptor.id,
              kind: 'workflow',
              attempt: {
                attemptId: `attempt-${status}`,
                executionId: `workflow-${status}`,
              },
              target: {
                targetId: 'catalog',
                namespace: 'catalog-demo',
                taskQueue: 'catalog-queue',
              },
              runId: `run-${status}`,
            },
          },
          new AbortController().signal,
        ),
      ).rejects.toMatchObject({ name: 'ApiObservationError', reason });
    },
  );

  it('pauses observation safely after a transport failure', async () => {
    const host = createApiWorkbenchHost({
      descriptors: [descriptor],
      request: vi.fn().mockRejectedValue(new TypeError('sensitive failure')),
    });

    await expect(
      host.observe(
        {
          reference: {
            exampleId: descriptor.id,
            kind: 'workflow',
            attempt: {
              attemptId: 'attempt-transport',
              executionId: 'workflow-transport',
            },
            target: {
              targetId: 'catalog',
              namespace: 'catalog-demo',
              taskQueue: 'catalog-queue',
            },
            runId: 'run-transport',
          },
        },
        new AbortController().signal,
      ),
    ).rejects.toMatchObject({
      name: 'ApiObservationError',
      reason: 'transport-failure',
      message: 'Observation paused',
    });
  });
});
