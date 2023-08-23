import { describe, expect, it } from 'vitest';

import type { EventType } from '$lib/types/events';

import {
  eventClassifications,
  getEventClassification,
} from './get-event-classification';

describe('eventClassifications', () => {
  it('should match the last snapshot of the classifications', () => {
    expect(eventClassifications).toEqual([
      'Unspecified',
      'Scheduled',
      'Open',
      'New',
      'Started',
      'Initiated',
      'Running',
      'Completed',
      'Fired',
      'CancelRequested',
      'TimedOut',
      'Signaled',
      'Canceled',
      'Failed',
      'Terminated',
    ]);
  });
});

describe('getEventClassification', () => {
  it('should return "Started" for WorkflowExecutionStarted', () => {
    const eventType: EventType = 'WorkflowExecutionStarted';
    expect(getEventClassification(eventType)).toBe('Started');
  });

  it('should return "Completed" for WorkflowExecutionCompleted', () => {
    const eventType: EventType = 'WorkflowExecutionCompleted';
    expect(getEventClassification(eventType)).toBe('Completed');
  });

  it('should return "Failed" for WorkflowExecutionFailed', () => {
    const eventType: EventType = 'WorkflowExecutionFailed';
    expect(getEventClassification(eventType)).toBe('Failed');
  });

  it('should return "TimedOut" for WorkflowExecutionTimedOut', () => {
    const eventType: EventType = 'WorkflowExecutionTimedOut';
    expect(getEventClassification(eventType)).toBe('TimedOut');
  });

  it('should return "Scheduled" for WorkflowTaskScheduled', () => {
    const eventType: EventType = 'WorkflowTaskScheduled';
    expect(getEventClassification(eventType)).toBe('Scheduled');
  });

  it('should return "Started" for WorkflowTaskStarted', () => {
    const eventType: EventType = 'WorkflowTaskStarted';
    expect(getEventClassification(eventType)).toBe('Started');
  });

  it('should return "Completed" for WorkflowTaskCompleted', () => {
    const eventType: EventType = 'WorkflowTaskCompleted';
    expect(getEventClassification(eventType)).toBe('Completed');
  });

  it('should return "TimedOut" for WorkflowTaskTimedOut', () => {
    const eventType: EventType = 'WorkflowTaskTimedOut';
    expect(getEventClassification(eventType)).toBe('TimedOut');
  });

  it('should return "Failed" for WorkflowTaskFailed', () => {
    const eventType: EventType = 'WorkflowTaskFailed';
    expect(getEventClassification(eventType)).toBe('Failed');
  });

  it('should return "Scheduled" for ActivityTaskScheduled', () => {
    const eventType: EventType = 'ActivityTaskScheduled';
    expect(getEventClassification(eventType)).toBe('Scheduled');
  });

  it('should return "Started" for ActivityTaskStarted', () => {
    const eventType: EventType = 'ActivityTaskStarted';
    expect(getEventClassification(eventType)).toBe('Started');
  });

  it('should return "Completed" for ActivityTaskCompleted', () => {
    const eventType: EventType = 'ActivityTaskCompleted';
    expect(getEventClassification(eventType)).toBe('Completed');
  });

  it('should return "Failed" for ActivityTaskFailed', () => {
    const eventType: EventType = 'ActivityTaskFailed';
    expect(getEventClassification(eventType)).toBe('Failed');
  });

  it('should return "TimedOut" for ActivityTaskTimedOut', () => {
    const eventType: EventType = 'ActivityTaskTimedOut';
    expect(getEventClassification(eventType)).toBe('TimedOut');
  });

  it('should return "Started" for TimerStartedEven', () => {
    const eventType: EventType = 'TimerStarted';
    expect(getEventClassification(eventType)).toBe('Started');
  });

  it('should return "Fired" for TimerFiredEven', () => {
    const eventType: EventType = 'TimerFired';
    expect(getEventClassification(eventType)).toBe('Fired');
  });

  it('should return "CancelRequested" for ActivityTaskCancelRequested', () => {
    const eventType: EventType = 'ActivityTaskCancelRequested';
    expect(getEventClassification(eventType)).toBe('CancelRequested');
  });

  it('should return "Canceled" for ActivityTaskCanceled', () => {
    const eventType: EventType = 'ActivityTaskCanceled';
    expect(getEventClassification(eventType)).toBe('Canceled');
  });

  it('should return "Canceled" for TimerCanceled', () => {
    const eventType: EventType = 'TimerCanceled';
    expect(getEventClassification(eventType)).toBe('Canceled');
  });

  it('should return undefined for MarkerRecorded', () => {
    const eventType: EventType = 'MarkerRecorded';
    expect(getEventClassification(eventType)).toBeUndefined();
  });

  it('should return "Signaled" for WorkflowExecutionSignaled', () => {
    const eventType: EventType = 'WorkflowExecutionSignaled';
    expect(getEventClassification(eventType)).toBe('Signaled');
  });

  it('should return "Terminated" for WorkflowExecutionTerminated', () => {
    const eventType: EventType = 'WorkflowExecutionTerminated';
    expect(getEventClassification(eventType)).toBe('Terminated');
  });

  it('should return "CancelRequested" for WorkflowExecutionCancelRequested', () => {
    expect(getEventClassification('WorkflowExecutionCancelRequested')).toBe(
      'CancelRequested',
    );
  });

  it('should return "Canceled" for WorkflowExecutionCanceled', () => {
    const eventType: EventType = 'WorkflowExecutionCanceled';
    expect(getEventClassification(eventType)).toBe('Canceled');
  });

  it('should return "$x" for RequestCancelExternalWorkflowExecutionInitiated', () => {
    expect(
      getEventClassification('RequestCancelExternalWorkflowExecutionInitiated'),
    ).toBe('CancelRequested');
  });

  it('should return "$x" for RequestCancelExternalWorkflowExecutionFailed', () => {
    expect(
      getEventClassification('RequestCancelExternalWorkflowExecutionFailed'),
    ).toBe('CancelRequested');
  });

  it('should return "CancelRequested" for ExternalWorkflowExecutionCancelRequested', () => {
    expect(
      getEventClassification('ExternalWorkflowExecutionCancelRequested'),
    ).toBe('CancelRequested');
  });

  it('should return "New" for WorkflowExecutionContinuedAsNew', () => {
    const eventType: EventType = 'WorkflowExecutionContinuedAsNew';
    expect(getEventClassification(eventType)).toBe('New');
  });

  it('should return "$x" for StartChildWorkflowExecutionInitiated', () => {
    expect(getEventClassification('StartChildWorkflowExecutionInitiated')).toBe(
      'Initiated',
    );
  });

  it('should return "Failed" for StartChildWorkflowExecutionFailed', () => {
    expect(getEventClassification('StartChildWorkflowExecutionFailed')).toBe(
      'Failed',
    );
  });

  it('should return "Started" for ChildWorkflowExecutionStarted', () => {
    const eventType: EventType = 'ChildWorkflowExecutionStarted';
    expect(getEventClassification(eventType)).toBe('Started');
  });

  it('should return "Completed" for ChildWorkflowExecutionCompleted', () => {
    const eventType: EventType = 'ChildWorkflowExecutionCompleted';
    expect(getEventClassification(eventType)).toBe('Completed');
  });

  it('should return "Failed" for ChildWorkflowExecutionFailed', () => {
    const eventType: EventType = 'ChildWorkflowExecutionFailed';
    expect(getEventClassification(eventType)).toBe('Failed');
  });

  it('should return "Canceled" for ChildWorkflowExecutionCanceled', () => {
    const eventType: EventType = 'ChildWorkflowExecutionCanceled';
    expect(getEventClassification(eventType)).toBe('Canceled');
  });

  it('should return "TimedOut" for ChildWorkflowExecutionTimedOut', () => {
    const eventType: EventType = 'ChildWorkflowExecutionTimedOut';
    expect(getEventClassification(eventType)).toBe('TimedOut');
  });

  it('should return "Terminated" for ChildWorkflowExecutionTerminated', () => {
    expect(getEventClassification('ChildWorkflowExecutionTerminated')).toBe(
      'Terminated',
    );
  });

  it('should return "Initiated" for SignalExternalWorkflowExecutionInitiated', () => {
    expect(
      getEventClassification('SignalExternalWorkflowExecutionInitiated'),
    ).toBe('Initiated');
  });

  it('should return "Failed" for SignalExternalWorkflowExecutionFailed', () => {
    expect(
      getEventClassification('SignalExternalWorkflowExecutionFailed'),
    ).toBe('Failed');
  });

  it('should return "Signaled" for ExternalWorkflowExecutionSignaled', () => {
    expect(getEventClassification('ExternalWorkflowExecutionSignaled')).toBe(
      'Signaled',
    );
  });

  it('should return undefined for UpsertWorkflowSearchAttributes', () => {
    expect(
      getEventClassification('UpsertWorkflowSearchAttributes'),
    ).toBeUndefined();
  });
});
