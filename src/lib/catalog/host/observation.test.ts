import { describe, expect, it } from 'vitest';

import {
  ApiObservationError,
  toActivityObservation,
  toNexusObservation,
  toWorkflowObservation,
} from './observation';

describe('OSS catalog observation', () => {
  it('keeps a running workflow observable after a delay', () => {
    expect(
      toWorkflowObservation({
        workflowExecutionInfo: {
          status: 'WORKFLOW_EXECUTION_STATUS_RUNNING',
        },
      }),
    ).toEqual({
      state: 'running',
      snapshot: {
        workflowExecutionInfo: {
          status: 'WORKFLOW_EXECUTION_STATUS_RUNNING',
        },
      },
      continuation: { kind: 'delay', afterMs: 1_000 },
    });
  });

  it('keeps a paused workflow observable after a delay', () => {
    expect(
      toWorkflowObservation({
        workflowExecutionInfo: {
          status: 'WORKFLOW_EXECUTION_STATUS_PAUSED',
        },
      }),
    ).toMatchObject({
      state: 'running',
      continuation: { kind: 'delay', afterMs: 1_000 },
    });
  });

  it('finishes observation when a workflow completes', () => {
    const response = {
      workflowExecutionInfo: {
        status: 'WORKFLOW_EXECUTION_STATUS_COMPLETED',
      },
    } as const;

    expect(toWorkflowObservation(response)).toEqual({
      state: 'terminal',
      status: 'completed',
      snapshot: response,
    });
  });

  it('reports each workflow terminal status', () => {
    const cases = [
      ['FAILED', 'failed'],
      ['CANCELED', 'canceled'],
      ['TERMINATED', 'terminated'],
      ['TIMED_OUT', 'timed-out'],
      ['CONTINUED_AS_NEW', 'continued-as-new'],
    ] as const;

    for (const [apiStatus, status] of cases) {
      expect(
        toWorkflowObservation({
          workflowExecutionInfo: {
            status: `WORKFLOW_EXECUTION_STATUS_${apiStatus}`,
          },
        }),
      ).toMatchObject({ state: 'terminal', status });
    }
  });

  it('continues a running activity with a private long-poll cursor', () => {
    expect(
      toActivityObservation({
        runId: 'run-activity',
        info: { status: 'ACTIVITY_EXECUTION_STATUS_RUNNING' },
        longPollToken: 'private-cursor',
      }),
    ).toEqual({
      state: 'running',
      snapshot: {
        runId: 'run-activity',
        info: { status: 'ACTIVITY_EXECUTION_STATUS_RUNNING' },
      },
      continuation: { kind: 'cursor', value: 'private-cursor' },
    });
  });

  it('finishes observation when an activity completes', () => {
    expect(
      toActivityObservation({
        runId: 'run-activity',
        info: { status: 'ACTIVITY_EXECUTION_STATUS_COMPLETED' },
        longPollToken: 'terminal-cursor',
      }),
    ).toEqual({
      state: 'terminal',
      status: 'completed',
      snapshot: {
        runId: 'run-activity',
        info: { status: 'ACTIVITY_EXECUTION_STATUS_COMPLETED' },
      },
    });
  });

  it('reports each activity terminal status', () => {
    const cases = [
      ['FAILED', 'failed'],
      ['CANCELED', 'canceled'],
      ['TERMINATED', 'terminated'],
      ['TIMED_OUT', 'timed-out'],
    ] as const;

    for (const [apiStatus, status] of cases) {
      expect(
        toActivityObservation({
          info: { status: `ACTIVITY_EXECUTION_STATUS_${apiStatus}` },
        }),
      ).toMatchObject({ state: 'terminal', status });
    }
  });

  it('continues a running Nexus operation with a private long-poll cursor', () => {
    expect(
      toNexusObservation({
        info: { status: 'NEXUS_OPERATION_EXECUTION_STATUS_RUNNING' },
        longPollToken: 'private-nexus-cursor',
      }),
    ).toEqual({
      state: 'running',
      snapshot: {
        info: { status: 'NEXUS_OPERATION_EXECUTION_STATUS_RUNNING' },
      },
      continuation: { kind: 'cursor', value: 'private-nexus-cursor' },
    });
  });

  it('finishes observation when a Nexus operation completes', () => {
    expect(
      toNexusObservation({
        info: { status: 'NEXUS_OPERATION_EXECUTION_STATUS_COMPLETED' },
        longPollToken: 'terminal-nexus-cursor',
      }),
    ).toEqual({
      state: 'terminal',
      status: 'completed',
      snapshot: {
        info: { status: 'NEXUS_OPERATION_EXECUTION_STATUS_COMPLETED' },
      },
    });
  });

  it('pauses on a malformed observation response without exposing it', () => {
    expect(() =>
      toActivityObservation({ unexpected: 'secret response' }),
    ).toThrowError(
      expect.objectContaining({
        reason: 'invalid-response',
      } satisfies Partial<ApiObservationError>),
    );
  });
});
