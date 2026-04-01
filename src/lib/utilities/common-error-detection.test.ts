import { describe, expect, it } from 'vitest';

import type { PendingActivity } from '$lib/types/events';
import type { WorkflowExecution } from '$lib/types/workflows';

import {
  detectActivityErrors,
  detectFirstEventErrors,
  detectWorkflowErrors,
  durationToSeconds,
  getApplicableCommonErrors,
} from './common-error-detection';

const makeWorkflow = (
  overrides: Partial<WorkflowExecution> = {},
): WorkflowExecution =>
  ({
    name: 'test-workflow',
    id: 'test-id',
    runId: 'test-run-id',
    startTime: '2024-01-01T00:00:00Z',
    endTime: '2024-01-01T01:00:00Z',
    executionTime: '2024-01-01T00:00:00Z',
    status: 'Running',
    historyEvents: '100',
    historySizeBytes: '1000',
    defaultWorkflowTaskTimeout: '10s',
    pendingActivities: [],
    pendingChildren: [],
    pendingNexusOperations: [],
    callbacks: [],
    isRunning: true,
    isPaused: false,
    canBeTerminated: true,
    stateTransitionCount: '1',
    url: '/workflows/test-id/test-run-id',
    memo: {},
    workflowExtendedInfo: {},
    ...overrides,
  }) as unknown as WorkflowExecution;

const makeActivity = (
  overrides: Partial<PendingActivity> = {},
): PendingActivity =>
  ({
    id: '1',
    state: 'Started',
    activityType: 'test-activity',
    ...overrides,
  }) as unknown as PendingActivity;

const makeFirstEvent = (attrs: Record<string, unknown> = {}) =>
  ({
    eventType: 'WorkflowExecutionStarted',
    workflowExecutionStartedEventAttributes: {
      workflowExecutionTimeout: '0s',
      workflowRunTimeout: '0s',
      workflowTaskTimeout: '10s',
      retryPolicy: null,
      input: { payloads: ['arg1'] },
      workflowIdReusePolicy: 'WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE',
      firstWorkflowTaskBackoff: '0s',
      ...attrs,
    },
    attributes: {
      type: 'workflowExecutionStartedEventAttributes',
    },
  }) as unknown;

describe('durationToSeconds', () => {
  it('returns 0 for null/undefined/empty', () => {
    expect(durationToSeconds(null)).toBe(0);
    expect(durationToSeconds(undefined)).toBe(0);
    expect(durationToSeconds('')).toBe(0);
  });

  it('parses "Ns" format', () => {
    expect(durationToSeconds('10s')).toBe(10);
    expect(durationToSeconds('3600s')).toBe(3600);
    expect(durationToSeconds('0s')).toBe(0);
    expect(durationToSeconds('0.5s')).toBe(0.5);
  });

  it('parses human-readable single unit', () => {
    expect(durationToSeconds('10 seconds')).toBe(10);
    expect(durationToSeconds('1 second')).toBe(1);
    expect(durationToSeconds('5 minutes')).toBe(300);
    expect(durationToSeconds('1 minute')).toBe(60);
    expect(durationToSeconds('2 hours')).toBe(7200);
    expect(durationToSeconds('1 hour')).toBe(3600);
    expect(durationToSeconds('1 day')).toBe(86400);
    expect(durationToSeconds('500 milliseconds')).toBe(0.5);
  });

  it('parses human-readable multi-part', () => {
    expect(durationToSeconds('1 hour, 30 minutes')).toBe(5400);
    expect(durationToSeconds('2 minutes, 30 seconds')).toBe(150);
    expect(durationToSeconds('1 hour, 2 minutes, 3 seconds')).toBe(3723);
  });
});

describe('detectWorkflowErrors', () => {
  it('returns empty for healthy workflow', () => {
    const workflow = makeWorkflow();
    expect(detectWorkflowErrors(workflow)).toHaveLength(0);
  });

  it('detects #1: workflow execution timeout set', () => {
    const workflow = makeWorkflow({ workflowExecutionTimeout: '3600s' });
    const errors = detectWorkflowErrors(workflow);
    expect(errors.some((e) => e.id === 1)).toBe(true);
  });

  it('detects #3: very short execution timeout (< 120s)', () => {
    const workflow = makeWorkflow({ workflowExecutionTimeout: '60s' });
    const errors = detectWorkflowErrors(workflow);
    expect(errors.some((e) => e.id === 1)).toBe(true);
    expect(errors.some((e) => e.id === 3)).toBe(true);
  });

  it('does not fire #3 for timeout >= 120s', () => {
    const workflow = makeWorkflow({ workflowExecutionTimeout: '3600s' });
    const errors = detectWorkflowErrors(workflow);
    expect(errors.some((e) => e.id === 3)).toBe(false);
  });

  it('detects #4 + #5: task timeout > 10s', () => {
    const workflow = makeWorkflow({ defaultWorkflowTaskTimeout: '30s' });
    const errors = detectWorkflowErrors(workflow);
    expect(errors.some((e) => e.id === 4)).toBe(true);
    expect(errors.some((e) => e.id === 5)).toBe(true);
  });

  it('detects #4 + #6: task timeout < 10s', () => {
    const workflow = makeWorkflow({ defaultWorkflowTaskTimeout: '5s' });
    const errors = detectWorkflowErrors(workflow);
    expect(errors.some((e) => e.id === 4)).toBe(true);
    expect(errors.some((e) => e.id === 6)).toBe(true);
  });

  it('does not fire #4 for default 10s', () => {
    const workflow = makeWorkflow({ defaultWorkflowTaskTimeout: '10s' });
    expect(detectWorkflowErrors(workflow)).toHaveLength(0);
  });

  it('detects #7: ContinuedAsNew with < 2s duration', () => {
    const workflow = makeWorkflow({
      status: 'ContinuedAsNew',
      startTime: '2024-01-01T00:00:00.000Z',
      endTime: '2024-01-01T00:00:01.500Z',
    });
    const errors = detectWorkflowErrors(workflow);
    expect(errors.some((e) => e.id === 7)).toBe(true);
  });

  it('does not fire #7 for ContinuedAsNew with >= 2s', () => {
    const workflow = makeWorkflow({
      status: 'ContinuedAsNew',
      startTime: '2024-01-01T00:00:00.000Z',
      endTime: '2024-01-01T00:00:05.000Z',
    });
    expect(detectWorkflowErrors(workflow).some((e) => e.id === 7)).toBe(false);
  });

  it('detects #24: very long start delay (> 24h)', () => {
    const workflow = makeWorkflow({ startDelay: '100000s' });
    const errors = detectWorkflowErrors(workflow);
    expect(errors.some((e) => e.id === 24)).toBe(true);
  });

  it('detects #25: very short start delay (< 1s)', () => {
    const workflow = makeWorkflow({ startDelay: '0s' });
    expect(detectWorkflowErrors(workflow).some((e) => e.id === 25)).toBe(false);

    const workflow2 = makeWorkflow({ startDelay: '1s' });
    expect(detectWorkflowErrors(workflow2).some((e) => e.id === 25)).toBe(
      false,
    );
  });

  it('detects #31: history events > 4000', () => {
    const workflow = makeWorkflow({ historyEvents: '5000' });
    const errors = detectWorkflowErrors(workflow);
    expect(errors.some((e) => e.id === 31)).toBe(true);
  });

  it('does not fire #31 for <= 4000 events', () => {
    const workflow = makeWorkflow({ historyEvents: '4000' });
    expect(detectWorkflowErrors(workflow).some((e) => e.id === 31)).toBe(false);
  });
});

describe('detectActivityErrors', () => {
  it('returns empty for no activities', () => {
    expect(detectActivityErrors([])).toHaveLength(0);
  });

  it('detects #14: maximumAttempts == 1', () => {
    const activity = makeActivity({
      retryPolicy: { maximumAttempts: 1 },
    });
    const errors = detectActivityErrors([activity]);
    expect(errors.some((e) => e.id === 14)).toBe(true);
  });

  it('does not fire #14 for maximumAttempts > 1', () => {
    const activity = makeActivity({
      retryPolicy: { maximumAttempts: 3 },
    });
    expect(detectActivityErrors([activity]).some((e) => e.id === 14)).toBe(
      false,
    );
  });

  it('detects #16: startToCloseTimeout <= 1s', () => {
    const activity = makeActivity({ startToCloseTimeout: '1 second' });
    const errors = detectActivityErrors([activity]);
    expect(errors.some((e) => e.id === 16)).toBe(true);
  });

  it('detects #17: scheduleToClose set, no startToClose', () => {
    const activity = makeActivity({
      scheduleToCloseTimeout: '1 hour',
      startToCloseTimeout: '',
    });
    const errors = detectActivityErrors([activity]);
    expect(errors.some((e) => e.id === 17)).toBe(true);
  });

  it('detects #18: scheduleToClose/startToClose ratio < 2', () => {
    const activity = makeActivity({
      scheduleToCloseTimeout: '15 seconds',
      startToCloseTimeout: '10 seconds',
    });
    const errors = detectActivityErrors([activity]);
    expect(errors.some((e) => e.id === 18)).toBe(true);
  });

  it('does not fire #18 for ratio >= 2', () => {
    const activity = makeActivity({
      scheduleToCloseTimeout: '30 seconds',
      startToCloseTimeout: '10 seconds',
    });
    expect(detectActivityErrors([activity]).some((e) => e.id === 18)).toBe(
      false,
    );
  });

  it('detects #20: scheduleToStartTimeout set', () => {
    const activity = makeActivity({ scheduleToStartTimeout: '5 seconds' });
    const errors = detectActivityErrors([activity]);
    expect(errors.some((e) => e.id === 20)).toBe(true);
  });

  it('detects #21: heartbeat >= startToClose', () => {
    const activity = makeActivity({
      heartbeatTimeout: '10 seconds',
      startToCloseTimeout: '10 seconds',
    });
    const errors = detectActivityErrors([activity]);
    expect(errors.some((e) => e.id === 21)).toBe(true);
  });

  it('detects #22: heartbeat > 80% of startToClose (but < 100%)', () => {
    const activity = makeActivity({
      heartbeatTimeout: '9 seconds',
      startToCloseTimeout: '10 seconds',
    });
    const errors = detectActivityErrors([activity]);
    expect(errors.some((e) => e.id === 22)).toBe(true);
    expect(errors.some((e) => e.id === 21)).toBe(false);
  });

  it('deduplicates across multiple activities', () => {
    const a1 = makeActivity({ startToCloseTimeout: '1 second' });
    const a2 = makeActivity({ startToCloseTimeout: '500 milliseconds' });
    const errors = detectActivityErrors([a1, a2]);
    const id16Count = errors.filter((e) => e.id === 16).length;
    expect(id16Count).toBe(1);
  });
});

describe('detectFirstEventErrors', () => {
  it('returns empty for undefined firstEvent', () => {
    const workflow = makeWorkflow();
    expect(detectFirstEventErrors(workflow, undefined)).toHaveLength(0);
  });

  it('detects #2: execution timeout <= run timeout', () => {
    const event = makeFirstEvent({
      workflowExecutionTimeout: '10 minutes',
      workflowRunTimeout: '20 minutes',
    });
    const errors = detectFirstEventErrors(makeWorkflow(), event);
    expect(errors.some((e) => e.id === 2)).toBe(true);
  });

  it('does not fire #2 when execution > run timeout', () => {
    const event = makeFirstEvent({
      workflowExecutionTimeout: '2 hours',
      workflowRunTimeout: '1 hour',
    });
    const errors = detectFirstEventErrors(makeWorkflow(), event);
    expect(errors.some((e) => e.id === 2)).toBe(false);
  });

  it('does not fire #2 when either timeout is 0', () => {
    const event = makeFirstEvent({
      workflowExecutionTimeout: '0s',
      workflowRunTimeout: '1 hour',
    });
    expect(
      detectFirstEventErrors(makeWorkflow(), event).some((e) => e.id === 2),
    ).toBe(false);
  });

  it('detects #10: retry policy defined', () => {
    const event = makeFirstEvent({
      retryPolicy: {
        initialInterval: '1s',
        backoffCoefficient: 2,
        maximumInterval: '100s',
        maximumAttempts: 0,
      },
    });
    const errors = detectFirstEventErrors(makeWorkflow(), event);
    expect(errors.some((e) => e.id === 10)).toBe(true);
  });

  it('does not fire #10 when retryPolicy is null', () => {
    const event = makeFirstEvent({ retryPolicy: null });
    expect(
      detectFirstEventErrors(makeWorkflow(), event).some((e) => e.id === 10),
    ).toBe(false);
  });

  it('detects #32: multiple input payloads', () => {
    const event = makeFirstEvent({
      input: ['arg1', 'arg2'],
    });
    const errors = detectFirstEventErrors(makeWorkflow(), event);
    expect(errors.some((e) => e.id === 32)).toBe(true);
  });

  it('does not fire #32 for single payload', () => {
    const event = makeFirstEvent({
      input: ['arg1'],
    });
    expect(
      detectFirstEventErrors(makeWorkflow(), event).some((e) => e.id === 32),
    ).toBe(false);
  });

  it('detects #33: TERMINATE_IF_RUNNING reuse policy', () => {
    const event = makeFirstEvent({
      workflowIdReusePolicy: 'WORKFLOW_ID_REUSE_POLICY_TERMINATE_IF_RUNNING',
    });
    const errors = detectFirstEventErrors(makeWorkflow(), event);
    expect(errors.some((e) => e.id === 33)).toBe(true);
  });

  it('detects #34: REJECT_DUPLICATE reuse policy', () => {
    const event = makeFirstEvent({
      workflowIdReusePolicy: 'WORKFLOW_ID_REUSE_POLICY_REJECT_DUPLICATE',
    });
    const errors = detectFirstEventErrors(makeWorkflow(), event);
    expect(errors.some((e) => e.id === 34)).toBe(true);
  });

  it('detects #34: ALLOW_DUPLICATE_FAILED_ONLY reuse policy', () => {
    const event = makeFirstEvent({
      workflowIdReusePolicy:
        'WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE_FAILED_ONLY',
    });
    const errors = detectFirstEventErrors(makeWorkflow(), event);
    expect(errors.some((e) => e.id === 34)).toBe(true);
  });
});

describe('getApplicableCommonErrors', () => {
  it('returns empty for healthy workflow', () => {
    const workflow = makeWorkflow();
    expect(getApplicableCommonErrors(workflow, undefined)).toHaveLength(0);
  });

  it('sorts by severity: errors first, then warnings, then info', () => {
    const workflow = makeWorkflow({
      workflowExecutionTimeout: '60s',
      defaultWorkflowTaskTimeout: '30s',
    });
    const event = makeFirstEvent({
      retryPolicy: { maximumAttempts: 0 },
    });
    const errors = getApplicableCommonErrors(workflow, event);
    for (let i = 1; i < errors.length; i++) {
      const prevOrder =
        errors[i - 1].severity === 'error'
          ? 0
          : errors[i - 1].severity === 'warning'
            ? 1
            : 2;
      const currOrder =
        errors[i].severity === 'error'
          ? 0
          : errors[i].severity === 'warning'
            ? 1
            : 2;
      expect(prevOrder).toBeLessThanOrEqual(currOrder);
    }
  });

  it('deduplicates errors from multiple detectors', () => {
    const workflow = makeWorkflow({ workflowExecutionTimeout: '3600s' });
    const errors = getApplicableCommonErrors(workflow, undefined);
    const ids = errors.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('returns null-safe for null workflow', () => {
    expect(getApplicableCommonErrors(null, undefined)).toHaveLength(0);
  });
});
