import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { NexusOperationCallbackInfo } from '$lib/types';
import { requestFromAPI } from '$lib/utilities/request-from-api';

import {
  getNexusOperationExecution,
  pollNexusOperationExecution,
  toNexusOperationCallbacks,
} from './standalone-nexus-operations';

vi.mock('$lib/utilities/request-from-api', () => ({
  requestFromAPI: vi.fn(),
}));

vi.mock('$lib/utilities/route-for-api', () => ({
  routeForApi: (route: string) => `/api/v1/${route}`,
}));

const nexusHandlerCallback: NexusOperationCallbackInfo = {
  trigger: { operationCompleted: {} },
  info: {
    callback: {
      nexusHandler: {
        taskQueueName: 'callback-task-queue',
        service: 'callback-service',
        operation: 'callback-operation',
      },
      links: [
        {
          callback: {
            namespace: 'default',
            execution: {
              type: 'EXECUTION_TYPE_NEXUS_OPERATION',
              businessId: 'operation-id',
              runId: 'run-id',
            },
            requestId: 'link-request-id',
          },
        },
      ],
    },
    registrationTime: '2026-10-27T10:00:00Z',
    state: 'CALLBACK_STATE_BACKING_OFF' as unknown as NonNullable<
      NexusOperationCallbackInfo['info']
    >['state'],
    attempt: 3,
    lastAttemptCompleteTime: '2026-10-27T10:05:00Z',
    lastAttemptFailure: { message: 'handler unavailable' },
    nextAttemptScheduleTime: '2026-10-27T10:06:00Z',
    blockedReason: 'circuit breaker open',
    requestId: 'callback-request-id',
  },
};

const callbackInState = (state: string): NexusOperationCallbackInfo => ({
  info: {
    state: state as unknown as NonNullable<
      NexusOperationCallbackInfo['info']
    >['state'],
  },
});

describe('toNexusOperationCallbacks', () => {
  it.each([
    ['undefined', undefined],
    ['null', null],
    ['an empty list', []],
  ])('returns no callbacks for %s', (_, input) => {
    expect(toNexusOperationCallbacks(input)).toEqual([]);
  });

  it.each([
    ['CALLBACK_STATE_UNSPECIFIED', 'Unspecified'],
    ['CALLBACK_STATE_STANDBY', 'Standby'],
    ['CALLBACK_STATE_SCHEDULED', 'Scheduled'],
    ['CALLBACK_STATE_BACKING_OFF', 'BackingOff'],
    ['CALLBACK_STATE_FAILED', 'Failed'],
    ['CALLBACK_STATE_SUCCEEDED', 'Succeeded'],
    ['CALLBACK_STATE_BLOCKED', 'Blocked'],
  ])('maps %s to a readable %s state', (state, readable) => {
    const [callback] = toNexusOperationCallbacks([callbackInState(state)]);

    expect(callback.state).toBe(readable);
  });

  it('maps the NexusHandler target, request ID, attempts, timing, failure, blocked reason and links', () => {
    const [callback] = toNexusOperationCallbacks([nexusHandlerCallback]);

    expect(callback).toEqual({
      callback: {
        nexusHandler: {
          taskQueueName: 'callback-task-queue',
          service: 'callback-service',
          operation: 'callback-operation',
        },
        links: [
          {
            callback: {
              namespace: 'default',
              execution: {
                type: 'EXECUTION_TYPE_NEXUS_OPERATION',
                businessId: 'operation-id',
                runId: 'run-id',
              },
              requestId: 'link-request-id',
            },
          },
        ],
      },
      registrationTime: '2026-10-27T10:00:00Z',
      state: 'BackingOff',
      attempt: 3,
      lastAttemptCompleteTime: '2026-10-27T10:05:00Z',
      lastAttemptFailure: { message: 'handler unavailable' },
      nextAttemptScheduleTime: '2026-10-27T10:06:00Z',
      blockedReason: 'circuit breaker open',
      requestId: 'callback-request-id',
    });
  });

  it('skips entries without callback info', () => {
    const callbacks = toNexusOperationCallbacks([
      { trigger: { operationCompleted: {} } },
      { info: null },
      nexusHandlerCallback,
    ]);

    expect(callbacks).toHaveLength(1);
    expect(callbacks[0].requestId).toBe('callback-request-id');
  });

  it('leaves missing fields undefined and marks a missing state Unspecified', () => {
    const [callback] = toNexusOperationCallbacks([
      { info: { callback: null, blockedReason: null } },
    ]);

    expect(callback).toEqual({
      callback: undefined,
      blockedReason: undefined,
      state: 'Unspecified',
    });
  });

  it('maps 2,000 callbacks in order', () => {
    const input = Array.from({ length: 2000 }, (_, index) => ({
      info: {
        requestId: `request-${index}`,
        state: 'CALLBACK_STATE_STANDBY' as unknown as NonNullable<
          NexusOperationCallbackInfo['info']
        >['state'],
      },
    }));

    const callbacks = toNexusOperationCallbacks(input);

    expect(callbacks).toHaveLength(2000);
    expect(callbacks[0].requestId).toBe('request-0');
    expect(callbacks[1999].requestId).toBe('request-1999');
    expect(callbacks.every(({ state }) => state === 'Standby')).toBe(true);
  });
});

describe('getNexusOperationExecution', () => {
  beforeEach(() => {
    vi.mocked(requestFromAPI).mockReset();
  });

  it('maps completion callbacks from the describe response', async () => {
    vi.mocked(requestFromAPI).mockResolvedValue({
      info: { status: 'NEXUS_OPERATION_EXECUTION_STATUS_RUNNING' },
      completionCallbacks: [nexusHandlerCallback],
    });

    const execution = await getNexusOperationExecution(
      'default',
      'operation-id',
      'run-id',
    );

    expect(execution.completionCallbacks).toHaveLength(1);
    expect(execution.completionCallbacks?.[0].state).toBe('BackingOff');
  });

  it('returns no completion callbacks when the response has none', async () => {
    vi.mocked(requestFromAPI).mockResolvedValue({
      info: { status: 'NEXUS_OPERATION_EXECUTION_STATUS_RUNNING' },
    });

    const execution = await getNexusOperationExecution(
      'default',
      'operation-id',
      'run-id',
    );

    expect(execution.completionCallbacks).toEqual([]);
  });
});

describe('pollNexusOperationExecution', () => {
  beforeEach(() => {
    vi.mocked(requestFromAPI).mockReset();
  });

  it('maps completion callbacks from the long-poll response', async () => {
    vi.mocked(requestFromAPI).mockResolvedValue({
      info: { status: 'NEXUS_OPERATION_EXECUTION_STATUS_RUNNING' },
      completionCallbacks: [nexusHandlerCallback],
    });

    const execution = await pollNexusOperationExecution(
      'default',
      'operation-id',
      'run-id',
      'token',
      new AbortController().signal,
    );

    expect(execution?.completionCallbacks?.[0].state).toBe('BackingOff');
  });

  it('returns undefined for an empty long-poll response', async () => {
    vi.mocked(requestFromAPI).mockResolvedValue({});

    const execution = await pollNexusOperationExecution(
      'default',
      'operation-id',
      'run-id',
      'token',
      new AbortController().signal,
    );

    expect(execution).toBeUndefined();
  });
});
