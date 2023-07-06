import { describe, expect, it } from 'vitest';

import type { CommonHistoryEvent } from '$lib/types/events';

import { getGroupId } from './get-group-id';

import allEventTypesFixture from '$fixtures/all-event-types.json';

const events = allEventTypesFixture as unknown as CommonHistoryEvent[];

describe('getGroupId', () => {
  it('should get the correct ID for WorkflowExecutionCanceled events', () => {
    expect(getGroupId(events['WorkflowExecutionCanceled'])).toBe('13');
  });

  it('should get the correct ID for TimerCanceled events', () => {
    expect(getGroupId(events['TimerCanceled'])).toBe('7');
  });

  it('should get the correct ID for WorkflowTaskCompleted events', () => {
    expect(getGroupId(events['WorkflowTaskCompleted'])).toBe('4');
  });

  it('should get the correct ID for WorkflowTaskStarted events', () => {
    expect(getGroupId(events['WorkflowTaskStarted'])).toBe('3');
  });

  it('should get the correct ID for WorkflowTaskScheduled events', () => {
    expect(getGroupId(events['WorkflowTaskScheduled'])).toBe('2');
  });

  it('should get the correct ID for WorkflowExecutionCancelRequested events', () => {
    expect(getGroupId(events['WorkflowExecutionCancelRequested'])).toBe('8');
  });

  it('should get the correct ID for TimerStarted events', () => {
    expect(getGroupId(events['TimerStarted'])).toBe('8');
  });

  it('should get the correct ID for UpsertWorkflowSearchAttributes events', () => {
    expect(getGroupId(events['UpsertWorkflowSearchAttributes'])).toBe('6');
  });

  it('should get the correct ID for MarkerRecorded events', () => {
    expect(getGroupId(events['MarkerRecorded'])).toBe('5');
  });

  it('should get the correct ID for WorkflowExecutionStarted events', () => {
    expect(getGroupId(events['WorkflowExecutionStarted'])).toBe('1');
  });

  it('should get the correct ID for WorkflowExecutionCompleted events', () => {
    expect(getGroupId(events['WorkflowExecutionCompleted'])).toBe('18');
  });

  it('should get the correct ID for ActivityTaskCompleted events', () => {
    expect(getGroupId(events['ActivityTaskCompleted'])).toBe('7');
  });

  it('should get the correct ID for ActivityTaskStarted events', () => {
    expect(getGroupId(events['ActivityTaskStarted'])).toBe('7');
  });

  it('should get the correct ID for ActivityTaskScheduled events', () => {
    expect(getGroupId(events['ActivityTaskScheduled'])).toBe('13');
  });

  it('should get the correct ID for TimerFired events', () => {
    expect(getGroupId(events['TimerFired'])).toBe('8');
  });

  it('should get the correct ID for WorkflowExecutionFailed events', () => {
    expect(getGroupId(events['WorkflowExecutionFailed'])).toBe('7');
  });

  it('should get the correct ID for WorkflowExecutionTerminated events', () => {
    expect(getGroupId(events['WorkflowExecutionTerminated'])).toBe('30');
  });

  it('should get the correct ID for ExternalWorkflowExecutionSignaled events', () => {
    expect(getGroupId(events['ExternalWorkflowExecutionSignaled'])).toBe('26');
  });

  it('should get the correct ID for SignalExternalWorkflowExecutionInitiated events', () => {
    expect(getGroupId(events['SignalExternalWorkflowExecutionInitiated'])).toBe(
      '25',
    );
  });

  it('should get the correct ID for WorkflowExecutionSignaled events', () => {
    expect(getGroupId(events['WorkflowExecutionSignaled'])).toBe('12');
  });

  it('should get the correct ID for WorkflowExecutionTimedOut events', () => {
    expect(getGroupId(events['WorkflowExecutionTimedOut'])).toBe('18');
  });

  it('should get the correct ID for WorkflowTaskTimedOut events', () => {
    expect(getGroupId(events['WorkflowTaskTimedOut'])).toBe('16');
  });

  it('should get the correct ID for ActivityTaskTimedOut events', () => {
    expect(getGroupId(events['ActivityTaskTimedOut'])).toBe('13');
  });

  it('should get the correct ID for TimerCanceled events', () => {
    const event = {
      timerCanceledEventAttributes: {
        startedEventId: '42',
      },
    } as unknown as CommonHistoryEvent;
    expect(getGroupId(event)).toBe('42');
  });

  it('should get the correct ID for ChildWorkflowExecutionCompleted events', () => {
    const event = {
      childWorkflowExecutionCompletedEventAttributes: {
        initiatedEventId: '42',
      },
    } as unknown as CommonHistoryEvent;
    expect(getGroupId(event)).toBe('42');
  });

  it('should get the correct ID for ChildWorkflowExecutionStarted events', () => {
    const event = {
      childWorkflowExecutionStartedEventAttributes: {
        initiatedEventId: '42',
      },
    } as unknown as CommonHistoryEvent;
    expect(getGroupId(event)).toBe('42');
  });

  it('should get the correct ID for ActivityTaskFailed events', () => {
    const event = {
      activityTaskFailedEventAttributes: {
        scheduledEventId: '42',
      },
    } as unknown as CommonHistoryEvent;
    expect(getGroupId(event)).toBe('42');
  });

  it('should get the correct ID for ActivityTaskCancelRequested events', () => {
    const event = {
      activityTaskCancelRequestedEventAttributes: {
        scheduledEventId: '42',
      },
    } as unknown as CommonHistoryEvent;
    expect(getGroupId(event)).toBe('42');
  });

  it('should get the correct ID for ActivityTaskCanceled events', () => {
    const event = {
      activityTaskCanceledEventAttributes: {
        scheduledEventId: '42',
      },
    } as unknown as CommonHistoryEvent;
    expect(getGroupId(event)).toBe('42');
  });
});
