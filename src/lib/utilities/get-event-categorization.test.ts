import {
  eventTypeInCategory,
  isCategoryType,
} from './get-event-categorization';

describe(eventTypeInCategory, () => {
  it('should categorize a "ActivityTaskCanceled" as a "activity"', () => {
    expect(
      eventTypeInCategory('activity')({ eventType: 'ActivityTaskCanceled' }),
    ).toBe(true);
  });

  it('should categorize a "ActivityTaskCancelRequested" as a "activity"', () => {
    expect(
      eventTypeInCategory('activity')({
        eventType: 'ActivityTaskCancelRequested',
      }),
    ).toBe(true);
  });

  it('should categorize a "ActivityTaskCompleted" as a "activity"', () => {
    expect(
      eventTypeInCategory('activity')({ eventType: 'ActivityTaskCompleted' }),
    ).toBe(true);
  });

  it('should categorize a "ActivityTaskFailed" as a "activity"', () => {
    expect(
      eventTypeInCategory('activity')({ eventType: 'ActivityTaskFailed' }),
    ).toBe(true);
  });

  it('should categorize a "ActivityTaskScheduled" as a "activity"', () => {
    expect(
      eventTypeInCategory('activity')({ eventType: 'ActivityTaskScheduled' }),
    ).toBe(true);
  });

  it('should categorize a "ActivityTaskStarted" as a "activity"', () => {
    expect(
      eventTypeInCategory('activity')({ eventType: 'ActivityTaskStarted' }),
    ).toBe(true);
  });

  it('should categorize a "ActivityTaskTimedOut" as a "activity"', () => {
    expect(
      eventTypeInCategory('activity')({ eventType: 'ActivityTaskTimedOut' }),
    ).toBe(true);
  });

  it('should categorize a "ChildWorkflowExecutionCanceled" as a "child-workflow"', () => {
    expect(
      eventTypeInCategory('child-workflow')({
        eventType: 'ChildWorkflowExecutionCanceled',
      }),
    ).toBe(true);
  });

  it('should categorize a "ChildWorkflowExecutionCompleted" as a "child-workflow"', () => {
    expect(
      eventTypeInCategory('child-workflow')({
        eventType: 'ChildWorkflowExecutionCompleted',
      }),
    ).toBe(true);
  });

  it('should categorize a "ChildWorkflowExecutionFailed" as a "child-workflow"', () => {
    expect(
      eventTypeInCategory('child-workflow')({
        eventType: 'ChildWorkflowExecutionFailed',
      }),
    ).toBe(true);
  });

  it('should categorize a "ChildWorkflowExecutionStarted" as a "child-workflow"', () => {
    expect(
      eventTypeInCategory('child-workflow')({
        eventType: 'ChildWorkflowExecutionStarted',
      }),
    ).toBe(true);
  });

  it('should categorize a "ChildWorkflowExecutionTerminated" as a "child-workflow"', () => {
    expect(
      eventTypeInCategory('child-workflow')({
        eventType: 'ChildWorkflowExecutionTerminated',
      }),
    ).toBe(true);
  });

  it('should categorize a "ChildWorkflowExecutionTimedOut" as a "child-workflow"', () => {
    expect(
      eventTypeInCategory('child-workflow')({
        eventType: 'ChildWorkflowExecutionTimedOut',
      }),
    ).toBe(true);
  });

  it('should categorize a "StartChildWorkflowExecutionFailed" as a "child-workflow"', () => {
    expect(
      eventTypeInCategory('child-workflow')({
        eventType: 'StartChildWorkflowExecutionFailed',
      }),
    ).toBe(true);
  });

  it('should categorize a "StartChildWorkflowExecutionInitiated" as a "child-workflow"', () => {
    expect(
      eventTypeInCategory('child-workflow')({
        eventType: 'StartChildWorkflowExecutionInitiated',
      }),
    ).toBe(true);
  });

  it('should categorize a "SignalExternalWorkflowExecutionFailed" as a "signal"', () => {
    expect(
      eventTypeInCategory('signal')({
        eventType: 'SignalExternalWorkflowExecutionFailed',
      }),
    ).toBe(true);
  });

  it('should categorize a "SignalExternalWorkflowExecutionInitiated" as a "signal"', () => {
    expect(
      eventTypeInCategory('signal')({
        eventType: 'SignalExternalWorkflowExecutionInitiated',
      }),
    ).toBe(true);
  });

  it('should categorize a "TimerCanceled" as a "timer"', () => {
    expect(eventTypeInCategory('timer')({ eventType: 'TimerCanceled' })).toBe(
      true,
    );
  });

  it('should categorize a "TimerFired" as a "timer"', () => {
    expect(eventTypeInCategory('timer')({ eventType: 'TimerFired' })).toBe(
      true,
    );
  });

  it('should categorize a "TimerStarted" as a "timer"', () => {
    expect(eventTypeInCategory('timer')({ eventType: 'TimerStarted' })).toBe(
      true,
    );
  });

  it('should categorize a "WorkflowExecutionCanceled" as a "workflow"', () => {
    expect(
      eventTypeInCategory('workflow')({
        eventType: 'WorkflowExecutionCanceled',
      }),
    ).toBe(true);
  });

  it('should categorize a "WorkflowExecutionCancelRequested" as a "workflow"', () => {
    expect(
      eventTypeInCategory('workflow')({
        eventType: 'WorkflowExecutionCancelRequested',
      }),
    ).toBe(true);
  });

  it('should categorize a "WorkflowExecutionCompleted" as a "workflow"', () => {
    expect(
      eventTypeInCategory('workflow')({
        eventType: 'WorkflowExecutionCompleted',
      }),
    ).toBe(true);
  });

  it('should categorize a "WorkflowExecutionContinuedAsNew" as a "workflow"', () => {
    expect(
      eventTypeInCategory('workflow')({
        eventType: 'WorkflowExecutionContinuedAsNew',
      }),
    ).toBe(true);
  });

  it('should categorize a "WorkflowExecutionFailed" as a "workflow"', () => {
    expect(
      eventTypeInCategory('workflow')({ eventType: 'WorkflowExecutionFailed' }),
    ).toBe(true);
  });

  it('should categorize a "WorkflowExecutionSignaled" as a "workflow"', () => {
    expect(
      eventTypeInCategory('workflow')({
        eventType: 'WorkflowExecutionSignaled',
      }),
    ).toBe(true);
  });

  it('should categorize a "WorkflowExecutionStarted" as a "workflow"', () => {
    expect(
      eventTypeInCategory('workflow')({
        eventType: 'WorkflowExecutionStarted',
      }),
    ).toBe(true);
  });

  it('should categorize a "WorkflowExecutionTerminated" as a "workflow"', () => {
    expect(
      eventTypeInCategory('workflow')({
        eventType: 'WorkflowExecutionTerminated',
      }),
    ).toBe(true);
  });

  it('should categorize a "WorkflowExecutionTimedOut" as a "workflow"', () => {
    expect(
      eventTypeInCategory('workflow')({
        eventType: 'WorkflowExecutionTimedOut',
      }),
    ).toBe(true);
  });

  it('should categorize a "WorkflowTaskCompleted" as a "workflow"', () => {
    expect(
      eventTypeInCategory('workflow')({ eventType: 'WorkflowTaskCompleted' }),
    ).toBe(true);
  });

  it('should categorize a "WorkflowTaskFailed" as a "workflow"', () => {
    expect(
      eventTypeInCategory('workflow')({ eventType: 'WorkflowTaskFailed' }),
    ).toBe(true);
  });

  it('should categorize a "WorkflowTaskScheduled" as a "workflow"', () => {
    expect(
      eventTypeInCategory('workflow')({ eventType: 'WorkflowTaskScheduled' }),
    ).toBe(true);
  });

  it('should categorize a "WorkflowTaskStarted" as a "workflow"', () => {
    expect(
      eventTypeInCategory('workflow')({ eventType: 'WorkflowTaskStarted' }),
    ).toBe(true);
  });

  it('should categorize a "WorkflowTaskTimedOut" as a "workflow"', () => {
    expect(
      eventTypeInCategory('workflow')({ eventType: 'WorkflowTaskTimedOut' }),
    ).toBe(true);
  });

  it('should categorize a "ExternalWorkflowExecutionCancelRequested" as a "workflow"', () => {
    expect(
      eventTypeInCategory('workflow')({
        eventType: 'ExternalWorkflowExecutionCancelRequested',
      }),
    ).toBe(true);
  });

  it('should categorize a "ExternalWorkflowExecutionSignaled" as a "workflow"', () => {
    expect(
      eventTypeInCategory('workflow')({
        eventType: 'ExternalWorkflowExecutionSignaled',
      }),
    ).toBe(true);
  });

  it('should categorize a "RequestCancelExternalWorkflowExecutionFailed" as a "workflow"', () => {
    expect(
      eventTypeInCategory('workflow')({
        eventType: 'RequestCancelExternalWorkflowExecutionFailed',
      }),
    ).toBe(true);
  });

  it('should categorize a "RequestCancelExternalWorkflowExecutionInitiated" as a "workflow"', () => {
    expect(
      eventTypeInCategory('workflow')({
        eventType: 'RequestCancelExternalWorkflowExecutionInitiated',
      }),
    ).toBe(true);
  });

  it('should categorize a "MarkerRecorded" as a "command"', () => {
    expect(
      eventTypeInCategory('command')({ eventType: 'MarkerRecorded' }),
    ).toBe(true);
  });

  it('should categorize a "UpsertWorkflowSearchAttributes" as a "command"', () => {
    expect(
      eventTypeInCategory('command')({
        eventType: 'UpsertWorkflowSearchAttributes',
      }),
    ).toBe(true);
  });
});

describe(isCategoryType, () => {
  it('should return true for "activity"', () => {
    expect(isCategoryType('activity')).toBeTruthy();
  });

  it('should return true for "child-workflow"', () => {
    expect(isCategoryType('child-workflow')).toBeTruthy();
  });

  it('should return true for "signal"', () => {
    expect(isCategoryType('signal')).toBeTruthy();
  });

  it('should return true for "timer"', () => {
    expect(isCategoryType('timer')).toBeTruthy();
  });

  it('should return true for "workflow"', () => {
    expect(isCategoryType('workflow')).toBeTruthy();
  });

  it('should return true for "command"', () => {
    expect(isCategoryType('command')).toBeTruthy();
  });
});
