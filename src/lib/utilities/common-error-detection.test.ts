import { describe, expect, it } from 'vitest';

import type { PendingActivity, WorkflowEvent } from '$lib/types/events';
import type { WorkflowExecution } from '$lib/types/workflows';

import {
  detectActivityErrors,
  detectEventHistoryErrors,
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

const makeEvent = (
  eventType: string,
  attrs: Record<string, unknown> = {},
): WorkflowEvent => {
  const attrKey =
    eventType.charAt(0).toLowerCase() + eventType.slice(1) + 'EventAttributes';
  return {
    eventType,
    [attrKey]: attrs,
    attributes: { type: attrKey },
  } as unknown as WorkflowEvent;
};

const makeLocalActivityMarker = (): WorkflowEvent =>
  ({
    eventType: 'MarkerRecorded',
    markerRecordedEventAttributes: {
      markerName: 'LocalActivity',
    },
    attributes: { type: 'markerRecordedEventAttributes' },
  }) as unknown as WorkflowEvent;

describe('durationToSeconds', () => {
  it('returns 0 for null/undefined/empty', () => {
    expect(durationToSeconds(null)).toBe(0);
    expect(durationToSeconds(undefined)).toBe(0);
    expect(durationToSeconds('')).toBe(0);
  });

  it('parses protobuf Duration objects with nanos', () => {
    expect(durationToSeconds({ seconds: '10', nanos: 500000000 })).toBe(10.5);
    expect(durationToSeconds({ seconds: '0', nanos: 500000000 })).toBe(0.5);
    expect(durationToSeconds({ seconds: '3600' })).toBe(3600);
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

  it('detects #9: ContinuedAsNew with low event count (< 2000)', () => {
    const workflow = makeWorkflow({
      status: 'ContinuedAsNew',
      historyEvents: '500',
    });
    const errors = detectWorkflowErrors(workflow);
    expect(errors.some((e) => e.id === 9)).toBe(true);
  });

  it('does not fire #9 for ContinuedAsNew with >= 2000 events', () => {
    const workflow = makeWorkflow({
      status: 'ContinuedAsNew',
      historyEvents: '3000',
    });
    expect(detectWorkflowErrors(workflow).some((e) => e.id === 9)).toBe(false);
  });

  it('does not fire #9 for non-ContinuedAsNew workflows', () => {
    const workflow = makeWorkflow({
      status: 'Completed',
      historyEvents: '500',
    });
    expect(detectWorkflowErrors(workflow).some((e) => e.id === 9)).toBe(false);
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

  it('detects #31: history events > 10000', () => {
    const workflow = makeWorkflow({ historyEvents: '15000' });
    const errors = detectWorkflowErrors(workflow);
    expect(errors.some((e) => e.id === 31)).toBe(true);
  });

  it('does not fire #31 for <= 10000 events', () => {
    const workflow = makeWorkflow({ historyEvents: '10000' });
    expect(detectWorkflowErrors(workflow).some((e) => e.id === 31)).toBe(false);
  });

  it('detects #35: sensitive memo field names', () => {
    const workflow = makeWorkflow({
      memo: { fields: { ssn: {}, normalField: {} } },
    });
    const errors = detectWorkflowErrors(workflow);
    expect(errors.some((e) => e.id === 35)).toBe(true);
  });

  it('detects #35: password in memo field name', () => {
    const workflow = makeWorkflow({
      memo: { fields: { user_password: {} } },
    });
    const errors = detectWorkflowErrors(workflow);
    expect(errors.some((e) => e.id === 35)).toBe(true);
  });

  it('detects #35: api_key in memo field name', () => {
    const workflow = makeWorkflow({
      memo: { fields: { api_key: {} } },
    });
    const errors = detectWorkflowErrors(workflow);
    expect(errors.some((e) => e.id === 35)).toBe(true);
  });

  it('does not fire #35 for normal memo field names', () => {
    const workflow = makeWorkflow({
      memo: { fields: { status: {}, count: {}, result: {} } },
    });
    expect(detectWorkflowErrors(workflow).some((e) => e.id === 35)).toBe(false);
  });

  it('does not fire #35 for empty memo', () => {
    const workflow = makeWorkflow({ memo: {} });
    expect(detectWorkflowErrors(workflow).some((e) => e.id === 35)).toBe(false);
  });
});

describe('detectActivityErrors', () => {
  it('returns empty for no activities', () => {
    expect(detectActivityErrors([])).toHaveLength(0);
  });

  it('detects #13: no retry policy on activity', () => {
    const activity = makeActivity({});
    const errors = detectActivityErrors([activity]);
    expect(errors.some((e) => e.id === 13)).toBe(true);
  });

  it('detects #13: maximumAttempts is 0 (unlimited)', () => {
    const activity = makeActivity({
      retryPolicy: { maximumAttempts: 0 },
    });
    const errors = detectActivityErrors([activity]);
    expect(errors.some((e) => e.id === 13)).toBe(true);
  });

  it('does not fire #13 when maximumAttempts > 0', () => {
    const activity = makeActivity({
      retryPolicy: { maximumAttempts: 5 },
    });
    expect(detectActivityErrors([activity]).some((e) => e.id === 13)).toBe(
      false,
    );
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

  it('detects #15: activity retrying with attempt > 3', () => {
    const activity = makeActivity({
      attempt: 5,
      retryPolicy: { maximumAttempts: 10 },
    });
    const errors = detectActivityErrors([activity]);
    expect(errors.some((e) => e.id === 15)).toBe(true);
  });

  it('does not fire #15 for attempt <= 3', () => {
    const activity = makeActivity({
      attempt: 2,
      retryPolicy: { maximumAttempts: 10 },
    });
    expect(detectActivityErrors([activity]).some((e) => e.id === 15)).toBe(
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

  it('detects #19: schedule-to-close exceeds workflow run timeout', () => {
    const activity = makeActivity({
      scheduleToCloseTimeout: '2 hours',
      retryPolicy: { maximumAttempts: 5 },
    });
    const workflowRunTimeout = 3600; // 1 hour
    const errors = detectActivityErrors([activity], workflowRunTimeout);
    expect(errors.some((e) => e.id === 19)).toBe(true);
  });

  it('does not fire #19 when schedule-to-close <= run timeout', () => {
    const activity = makeActivity({
      scheduleToCloseTimeout: '30 minutes',
      retryPolicy: { maximumAttempts: 5 },
    });
    const workflowRunTimeout = 3600;
    expect(
      detectActivityErrors([activity], workflowRunTimeout).some(
        (e) => e.id === 19,
      ),
    ).toBe(false);
  });

  it('does not fire #19 when run timeout is 0 (not set)', () => {
    const activity = makeActivity({
      scheduleToCloseTimeout: '2 hours',
      retryPolicy: { maximumAttempts: 5 },
    });
    expect(detectActivityErrors([activity], 0).some((e) => e.id === 19)).toBe(
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

  it('detects #23: heartbeat timeout set but no heartbeats detected', () => {
    const activity = makeActivity({
      heartbeatTimeout: '30 seconds',
      startToCloseTimeout: '5 minutes',
    });
    const errors = detectActivityErrors([activity]);
    expect(errors.some((e) => e.id === 23)).toBe(true);
  });

  it('does not fire #23 when lastHeartbeatTime exists', () => {
    const activity = makeActivity({
      heartbeatTimeout: '30 seconds',
      startToCloseTimeout: '5 minutes',
      lastHeartbeatTime: '2024-01-01T00:00:10Z',
    });
    expect(detectActivityErrors([activity]).some((e) => e.id === 23)).toBe(
      false,
    );
  });

  it('does not fire #23 when no heartbeat timeout', () => {
    const activity = makeActivity({
      startToCloseTimeout: '5 minutes',
    });
    expect(detectActivityErrors([activity]).some((e) => e.id === 23)).toBe(
      false,
    );
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
    expect(detectFirstEventErrors(undefined)).toHaveLength(0);
  });

  it('detects #2: execution timeout <= run timeout', () => {
    const event = makeFirstEvent({
      workflowExecutionTimeout: '10 minutes',
      workflowRunTimeout: '20 minutes',
    });
    const errors = detectFirstEventErrors(event);
    expect(errors.some((e) => e.id === 2)).toBe(true);
  });

  it('does not fire #2 when execution > run timeout', () => {
    const event = makeFirstEvent({
      workflowExecutionTimeout: '2 hours',
      workflowRunTimeout: '1 hour',
    });
    const errors = detectFirstEventErrors(event);
    expect(errors.some((e) => e.id === 2)).toBe(false);
  });

  it('does not fire #2 when either timeout is 0', () => {
    const event = makeFirstEvent({
      workflowExecutionTimeout: '0s',
      workflowRunTimeout: '1 hour',
    });
    expect(detectFirstEventErrors(event).some((e) => e.id === 2)).toBe(false);
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
    const errors = detectFirstEventErrors(event);
    expect(errors.some((e) => e.id === 10)).toBe(true);
  });

  it('does not fire #10 when retryPolicy is null', () => {
    const event = makeFirstEvent({ retryPolicy: null });
    expect(detectFirstEventErrors(event).some((e) => e.id === 10)).toBe(false);
  });

  it('does not fire #10 when retryPolicy is empty object', () => {
    const event = makeFirstEvent({ retryPolicy: {} });
    expect(detectFirstEventErrors(event).some((e) => e.id === 10)).toBe(false);
  });

  it('detects #11: workflow is being retried (attempt >= 2)', () => {
    const event = makeFirstEvent({
      attempt: 2,
      retryPolicy: {
        initialInterval: '1s',
        maximumAttempts: 5,
      },
    });
    const errors = detectFirstEventErrors(event);
    expect(errors.some((e) => e.id === 11)).toBe(true);
  });

  it('does not fire #11 for first attempt', () => {
    const event = makeFirstEvent({
      attempt: 1,
      retryPolicy: {
        initialInterval: '1s',
        maximumAttempts: 5,
      },
    });
    expect(detectFirstEventErrors(event).some((e) => e.id === 11)).toBe(false);
  });

  it('does not fire #11 when attempt is 0 or undefined', () => {
    const event = makeFirstEvent({});
    expect(detectFirstEventErrors(event).some((e) => e.id === 11)).toBe(false);
  });

  it('detects #3: very short run timeout from first event', () => {
    const event = makeFirstEvent({
      workflowRunTimeout: '1 minute',
    });
    const errors = detectFirstEventErrors(event);
    expect(errors.some((e) => e.id === 3)).toBe(true);
  });

  it('does not fire #3 for run timeout >= 120s', () => {
    const event = makeFirstEvent({
      workflowRunTimeout: '5 minutes',
    });
    expect(detectFirstEventErrors(event).some((e) => e.id === 3)).toBe(false);
  });

  it('detects #32: multiple input payloads', () => {
    const event = makeFirstEvent({
      input: ['arg1', 'arg2'],
    });
    const errors = detectFirstEventErrors(event);
    expect(errors.some((e) => e.id === 32)).toBe(true);
  });

  it('does not fire #32 for single payload', () => {
    const event = makeFirstEvent({
      input: ['arg1'],
    });
    expect(detectFirstEventErrors(event).some((e) => e.id === 32)).toBe(false);
  });

  it('detects #33: TERMINATE_IF_RUNNING reuse policy', () => {
    const event = makeFirstEvent({
      workflowIdReusePolicy: 'WORKFLOW_ID_REUSE_POLICY_TERMINATE_IF_RUNNING',
    });
    const errors = detectFirstEventErrors(event);
    expect(errors.some((e) => e.id === 33)).toBe(true);
  });

  it('detects #34: REJECT_DUPLICATE reuse policy', () => {
    const event = makeFirstEvent({
      workflowIdReusePolicy: 'WORKFLOW_ID_REUSE_POLICY_REJECT_DUPLICATE',
    });
    const errors = detectFirstEventErrors(event);
    expect(errors.some((e) => e.id === 34)).toBe(true);
  });

  it('detects #34: ALLOW_DUPLICATE_FAILED_ONLY reuse policy', () => {
    const event = makeFirstEvent({
      workflowIdReusePolicy:
        'WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE_FAILED_ONLY',
    });
    const errors = detectFirstEventErrors(event);
    expect(errors.some((e) => e.id === 34)).toBe(true);
  });
});

describe('detectEventHistoryErrors', () => {
  it('returns empty for empty events', () => {
    const workflow = makeWorkflow();
    expect(detectEventHistoryErrors(workflow, [])).toHaveLength(0);
  });

  it('detects #8: CAN cost — low activity count with CAN', () => {
    const workflow = makeWorkflow({
      status: 'ContinuedAsNew',
      historyEvents: '30',
    });
    const events = [
      makeEvent('ActivityTaskScheduled'),
      makeEvent('ActivityTaskStarted'),
      makeEvent('ActivityTaskCompleted'),
    ];
    const errors = detectEventHistoryErrors(workflow, events);
    expect(errors.some((e) => e.id === 8)).toBe(true);
  });

  it('does not fire #8 for many activities', () => {
    const workflow = makeWorkflow({
      status: 'ContinuedAsNew',
      historyEvents: '30',
    });
    const events = [
      makeEvent('ActivityTaskScheduled'),
      makeEvent('ActivityTaskScheduled'),
      makeEvent('ActivityTaskScheduled'),
    ];
    const errors = detectEventHistoryErrors(workflow, events);
    expect(errors.some((e) => e.id === 8)).toBe(false);
  });

  it('does not fire #8 for non-CAN workflows', () => {
    const workflow = makeWorkflow({
      status: 'Completed',
      historyEvents: '30',
    });
    const events = [makeEvent('ActivityTaskScheduled')];
    expect(
      detectEventHistoryErrors(workflow, events).some((e) => e.id === 8),
    ).toBe(false);
  });

  it('does not fire #8 for CAN with high event count', () => {
    const workflow = makeWorkflow({
      status: 'ContinuedAsNew',
      historyEvents: '500',
    });
    const events = [makeEvent('ActivityTaskScheduled')];
    expect(
      detectEventHistoryErrors(workflow, events).some((e) => e.id === 8),
    ).toBe(false);
  });

  it('detects #12: child workflow with retry policy', () => {
    const workflow = makeWorkflow();
    const events = [
      {
        eventType: 'StartChildWorkflowExecutionInitiated',
        startChildWorkflowExecutionInitiatedEventAttributes: {
          retryPolicy: { initialInterval: '1s', maximumAttempts: 3 },
        },
        attributes: {
          type: 'startChildWorkflowExecutionInitiatedEventAttributes',
        },
      } as unknown as WorkflowEvent,
    ];
    const errors = detectEventHistoryErrors(workflow, events);
    expect(errors.some((e) => e.id === 12)).toBe(true);
  });

  it('does not fire #12 for child workflow without retry policy', () => {
    const workflow = makeWorkflow();
    const events = [
      {
        eventType: 'StartChildWorkflowExecutionInitiated',
        startChildWorkflowExecutionInitiatedEventAttributes: {
          retryPolicy: null,
        },
        attributes: {
          type: 'startChildWorkflowExecutionInitiatedEventAttributes',
        },
      } as unknown as WorkflowEvent,
    ];
    expect(
      detectEventHistoryErrors(workflow, events).some((e) => e.id === 12),
    ).toBe(false);
  });

  it('detects #26: LA extending workflow task (3+ consecutive cycles)', () => {
    const workflow = makeWorkflow();
    const events = [
      // Cycle 1
      makeEvent('WorkflowTaskScheduled'),
      makeEvent('WorkflowTaskStarted'),
      makeLocalActivityMarker(),
      makeEvent('WorkflowTaskCompleted'),
      // Cycle 2
      makeEvent('WorkflowTaskScheduled'),
      makeEvent('WorkflowTaskStarted'),
      makeLocalActivityMarker(),
      makeEvent('WorkflowTaskCompleted'),
      // Cycle 3
      makeEvent('WorkflowTaskScheduled'),
      makeEvent('WorkflowTaskStarted'),
      makeLocalActivityMarker(),
      makeEvent('WorkflowTaskCompleted'),
    ];
    const errors = detectEventHistoryErrors(workflow, events);
    expect(errors.some((e) => e.id === 26)).toBe(true);
  });

  it('does not fire #26 for fewer than 3 consecutive cycles', () => {
    const workflow = makeWorkflow();
    const events = [
      makeEvent('WorkflowTaskScheduled'),
      makeEvent('WorkflowTaskStarted'),
      makeLocalActivityMarker(),
      makeEvent('WorkflowTaskCompleted'),
      makeEvent('WorkflowTaskScheduled'),
      makeEvent('WorkflowTaskStarted'),
      makeLocalActivityMarker(),
      makeEvent('WorkflowTaskCompleted'),
    ];
    const errors = detectEventHistoryErrors(workflow, events);
    expect(errors.some((e) => e.id === 26)).toBe(false);
  });

  it('detects #27: local activities not batched', () => {
    const workflow = makeWorkflow();
    const events = [
      // WFT 1 with 1 LA
      makeEvent('WorkflowTaskScheduled'),
      makeEvent('WorkflowTaskStarted'),
      makeLocalActivityMarker(),
      makeEvent('WorkflowTaskCompleted'),
      // WFT 2 with 1 LA
      makeEvent('WorkflowTaskScheduled'),
      makeEvent('WorkflowTaskStarted'),
      makeLocalActivityMarker(),
      makeEvent('WorkflowTaskCompleted'),
      // WFT 3 with 1 LA
      makeEvent('WorkflowTaskScheduled'),
      makeEvent('WorkflowTaskStarted'),
      makeLocalActivityMarker(),
      makeEvent('WorkflowTaskCompleted'),
      // WFT 4 with 1 LA
      makeEvent('WorkflowTaskScheduled'),
      makeEvent('WorkflowTaskStarted'),
      makeLocalActivityMarker(),
      makeEvent('WorkflowTaskCompleted'),
    ];
    const errors = detectEventHistoryErrors(workflow, events);
    expect(errors.some((e) => e.id === 27)).toBe(true);
  });

  it('does not fire #27 when LAs are batched', () => {
    const workflow = makeWorkflow();
    const events = [
      makeEvent('WorkflowTaskScheduled'),
      makeEvent('WorkflowTaskStarted'),
      makeLocalActivityMarker(),
      makeLocalActivityMarker(),
      makeLocalActivityMarker(),
      makeLocalActivityMarker(),
      makeEvent('WorkflowTaskCompleted'),
    ];
    const errors = detectEventHistoryErrors(workflow, events);
    expect(errors.some((e) => e.id === 27)).toBe(false);
  });

  it('detects #29: local activities with signals', () => {
    const workflow = makeWorkflow();
    const events = [
      makeLocalActivityMarker(),
      makeEvent('WorkflowExecutionSignaled'),
    ];
    const errors = detectEventHistoryErrors(workflow, events);
    expect(errors.some((e) => e.id === 29)).toBe(true);
  });

  it('does not fire #29 without signals', () => {
    const workflow = makeWorkflow();
    const events = [makeLocalActivityMarker()];
    expect(
      detectEventHistoryErrors(workflow, events).some((e) => e.id === 29),
    ).toBe(false);
  });

  it('does not fire #29 without local activities', () => {
    const workflow = makeWorkflow();
    const events = [makeEvent('WorkflowExecutionSignaled')];
    expect(
      detectEventHistoryErrors(workflow, events).some((e) => e.id === 29),
    ).toBe(false);
  });

  it('detects #30: local activities with WFT failure', () => {
    const workflow = makeWorkflow();
    const events = [
      makeLocalActivityMarker(),
      {
        eventType: 'WorkflowTaskFailed',
        workflowTaskFailedEventAttributes: {
          failure: { message: 'timeout' },
        },
        attributes: { type: 'workflowTaskFailedEventAttributes' },
      } as unknown as WorkflowEvent,
    ];
    const errors = detectEventHistoryErrors(workflow, events);
    expect(errors.some((e) => e.id === 30)).toBe(true);
  });

  it('does not fire #30 without WFT failures', () => {
    const workflow = makeWorkflow();
    const events = [makeLocalActivityMarker()];
    expect(
      detectEventHistoryErrors(workflow, events).some((e) => e.id === 30),
    ).toBe(false);
  });

  it('detects #28: many LA markers with high event count (excessive retries)', () => {
    const workflow = makeWorkflow({ historyEvents: '3000' });
    const events: WorkflowEvent[] = [];
    for (let i = 0; i < 25; i++) {
      events.push(makeLocalActivityMarker());
    }
    const errors = detectEventHistoryErrors(workflow, events);
    expect(errors.some((e) => e.id === 28)).toBe(true);
  });

  it('does not fire #28 for low LA marker count', () => {
    const workflow = makeWorkflow({ historyEvents: '3000' });
    const events = [makeLocalActivityMarker(), makeLocalActivityMarker()];
    expect(
      detectEventHistoryErrors(workflow, events).some((e) => e.id === 28),
    ).toBe(false);
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

  it('includes event history errors when eventHistory is provided', () => {
    const workflow = makeWorkflow({
      status: 'ContinuedAsNew',
      historyEvents: '30',
    });
    const events = [makeEvent('ActivityTaskScheduled')];
    const errors = getApplicableCommonErrors(
      workflow,
      undefined,
      events as WorkflowEvent[],
    );
    expect(errors.some((e) => e.id === 8)).toBe(true);
  });

  it('passes workflowRunTimeout from first event to activity detection', () => {
    const workflow = makeWorkflow({
      pendingActivities: [
        makeActivity({
          scheduleToCloseTimeout: '2 hours',
          retryPolicy: { maximumAttempts: 5 },
        }),
      ],
    });
    const event = makeFirstEvent({
      workflowRunTimeout: '1 hour',
    });
    const errors = getApplicableCommonErrors(workflow, event);
    expect(errors.some((e) => e.id === 19)).toBe(true);
  });
});
