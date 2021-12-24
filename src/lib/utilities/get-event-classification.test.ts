import { getEventClassification } from './get-event-classification';

describe(getEventClassification, () => {
  it('should return "Started" for WorkflowExecutionStartedEvent', () => {
    expect(
      getEventClassification({ eventType: 'WorkflowExecutionStartedEvent' }),
    ).toBe('Started');
  });

  it('should return "Completed" for WorkflowExecutionCompletedEvent', () => {
    expect(
      getEventClassification({ eventType: 'WorkflowExecutionCompletedEvent' }),
    ).toBe('Completed');
  });

  it('should return "Failed" for WorkflowExecutionFailedEvent', () => {
    expect(
      getEventClassification({ eventType: 'WorkflowExecutionFailedEvent' }),
    ).toBe('Failed');
  });

  it('should return "TimedOut" for WorkflowExecutionTimedOutEvent', () => {
    expect(
      getEventClassification({ eventType: 'WorkflowExecutionTimedOutEvent' }),
    ).toBe('TimedOut');
  });

  it('should return "Scheduled" for WorkflowTaskScheduledEvent', () => {
    expect(
      getEventClassification({ eventType: 'WorkflowTaskScheduledEvent' }),
    ).toBe('Scheduled');
  });

  it('should return "Started" for WorkflowTaskStartedEvent', () => {
    expect(
      getEventClassification({ eventType: 'WorkflowTaskStartedEvent' }),
    ).toBe('Started');
  });

  it('should return "Completed" for WorkflowTaskCompletedEvent', () => {
    expect(
      getEventClassification({ eventType: 'WorkflowTaskCompletedEvent' }),
    ).toBe('Completed');
  });

  it('should return "TimedOut" for WorkflowTaskTimedOutEvent', () => {
    expect(
      getEventClassification({ eventType: 'WorkflowTaskTimedOutEvent' }),
    ).toBe('TimedOut');
  });

  it('should return "Failed" for WorkflowTaskFailedEvent', () => {
    expect(
      getEventClassification({ eventType: 'WorkflowTaskFailedEvent' }),
    ).toBe('Failed');
  });

  it('should return "Scheduled" for ActivityTaskScheduledEvent', () => {
    expect(
      getEventClassification({ eventType: 'ActivityTaskScheduledEvent' }),
    ).toBe('Scheduled');
  });

  it('should return "Started" for ActivityTaskStartedEvent', () => {
    expect(
      getEventClassification({ eventType: 'ActivityTaskStartedEvent' }),
    ).toBe('Started');
  });

  it('should return "Completed" for ActivityTaskCompletedEvent', () => {
    expect(
      getEventClassification({ eventType: 'ActivityTaskCompletedEvent' }),
    ).toBe('Completed');
  });

  it('should return "Failed" for ActivityTaskFailedEvent', () => {
    expect(
      getEventClassification({ eventType: 'ActivityTaskFailedEvent' }),
    ).toBe('Failed');
  });

  it('should return "TimedOut" for ActivityTaskTimedOutEvent', () => {
    expect(
      getEventClassification({ eventType: 'ActivityTaskTimedOutEvent' }),
    ).toBe('TimedOut');
  });

  it('should return "Started" for TimerStartedEven', () => {
    expect(getEventClassification({ eventType: 'TimerStartedEven' })).toBe(
      'Started',
    );
  });

  it('should return "Fired" for TimerFiredEven', () => {
    expect(getEventClassification({ eventType: 'TimerFiredEven' })).toBe(
      'Fired',
    );
  });

  it('should return "CancelRequested" for ActivityTaskCancelRequestedEvent', () => {
    expect(
      getEventClassification({ eventType: 'ActivityTaskCancelRequestedEvent' }),
    ).toBe('CancelRequested');
  });

  it('should return "Canceled" for ActivityTaskCanceledEvent', () => {
    expect(
      getEventClassification({ eventType: 'ActivityTaskCanceledEvent' }),
    ).toBe('Canceled');
  });

  it('should return "Canceled" for TimerCanceledEvent', () => {
    expect(getEventClassification({ eventType: 'TimerCanceledEvent' })).toBe(
      'Canceled',
    );
  });

  it('should return undefined for MarkerRecordedEvent', () => {
    expect(
      getEventClassification({ eventType: 'MarkerRecordedEvent' }),
    ).toBeUndefined();
  });

  it('should return "Signaled" for WorkflowExecutionSignaledEvent', () => {
    expect(
      getEventClassification({ eventType: 'WorkflowExecutionSignaledEvent' }),
    ).toBe('Signaled');
  });

  it('should return "Terminated" for WorkflowExecutionTerminatedEvent', () => {
    expect(
      getEventClassification({ eventType: 'WorkflowExecutionTerminatedEvent' }),
    ).toBe('Terminated');
  });

  it('should return "CancelRequested" for WorkflowExecutionCancelRequestedEvent', () => {
    expect(
      getEventClassification({
        eventType: 'WorkflowExecutionCancelRequestedEvent',
      }),
    ).toBe('CancelRequested');
  });

  it('should return "Canceled" for WorkflowExecutionCanceledEvent', () => {
    expect(
      getEventClassification({ eventType: 'WorkflowExecutionCanceledEvent' }),
    ).toBe('Canceled');
  });

  it('should return "$x" for RequestCancelExternalWorkflowExecutionInitiatedEvent', () => {
    expect(
      getEventClassification({
        eventType: 'RequestCancelExternalWorkflowExecutionInitiatedEvent',
      }),
    ).toBe('CancelRequested');
  });

  it('should return "$x" for RequestCancelExternalWorkflowExecutionFailedEvent', () => {
    expect(
      getEventClassification({
        eventType: 'RequestCancelExternalWorkflowExecutionFailedEvent',
      }),
    ).toBe('CancelRequested');
  });

  it('should return "CancelRequested" for ExternalWorkflowExecutionCancelRequestedEvent', () => {
    expect(
      getEventClassification({
        eventType: 'ExternalWorkflowExecutionCancelRequestedEvent',
      }),
    ).toBe('CancelRequested');
  });

  it('should return "New" for WorkflowExecutionContinuedAsNewEvent', () => {
    expect(
      getEventClassification({
        eventType: 'WorkflowExecutionContinuedAsNewEvent',
      }),
    ).toBe('New');
  });

  it('should return "$x" for StartChildWorkflowExecutionInitiatedEvent', () => {
    expect(
      getEventClassification({
        eventType: 'StartChildWorkflowExecutionInitiatedEvent',
      }),
    ).toBe('Initiated');
  });

  it('should return "Failed" for StartChildWorkflowExecutionFailedEvent', () => {
    expect(
      getEventClassification({
        eventType: 'StartChildWorkflowExecutionFailedEvent',
      }),
    ).toBe('Failed');
  });

  it('should return "Started" for ChildWorkflowExecutionStartedEvent', () => {
    expect(
      getEventClassification({
        eventType: 'ChildWorkflowExecutionStartedEvent',
      }),
    ).toBe('Started');
  });

  it('should return "Completed" for ChildWorkflowExecutionCompletedEvent', () => {
    expect(
      getEventClassification({
        eventType: 'ChildWorkflowExecutionCompletedEvent',
      }),
    ).toBe('Completed');
  });

  it('should return "Failed" for ChildWorkflowExecutionFailedEvent', () => {
    expect(
      getEventClassification({
        eventType: 'ChildWorkflowExecutionFailedEvent',
      }),
    ).toBe('Failed');
  });

  it('should return "Canceled" for ChildWorkflowExecutionCanceledEvent', () => {
    expect(
      getEventClassification({
        eventType: 'ChildWorkflowExecutionCanceledEvent',
      }),
    ).toBe('Canceled');
  });

  it('should return "TimedOut" for ChildWorkflowExecutionTimedOutEvent', () => {
    expect(
      getEventClassification({
        eventType: 'ChildWorkflowExecutionTimedOutEvent',
      }),
    ).toBe('TimedOut');
  });

  it('should return "Terminated" for ChildWorkflowExecutionTerminatedEvent', () => {
    expect(
      getEventClassification({
        eventType: 'ChildWorkflowExecutionTerminatedEvent',
      }),
    ).toBe('Terminated');
  });

  it('should return "Initiated" for SignalExternalWorkflowExecutionInitiatedEvent', () => {
    expect(
      getEventClassification({
        eventType: 'SignalExternalWorkflowExecutionInitiatedEvent',
      }),
    ).toBe('Initiated');
  });

  it('should return "Failed" for SignalExternalWorkflowExecutionFailedEvent', () => {
    expect(
      getEventClassification({
        eventType: 'SignalExternalWorkflowExecutionFailedEvent',
      }),
    ).toBe('Failed');
  });

  it('should return "Signaled" for ExternalWorkflowExecutionSignaledEvent', () => {
    expect(
      getEventClassification({
        eventType: 'ExternalWorkflowExecutionSignaledEvent',
      }),
    ).toBe('Signaled');
  });

  it('should return undefined for UpsertWorkflowSearchAttributesEvent', () => {
    expect(
      getEventClassification({
        eventType: 'UpsertWorkflowSearchAttributesEvent',
      }),
    ).toBeUndefined();
  });
});

describe(isEvent, () => {
  it('should return true if the event has an eventType', () => {
    expect(isEvent({ eventType: 'Workflow Started' })).toBe(true);
  });

  it('should return false if the event does not have an eventType', () => {
    expect(isEvent({ activityType: 'Workflow Started' })).toBe(false);
  });

  it('should return false if passed null', () => {
    expect(isEvent(null)).toBe(false);
  });

  it('should return false if passed a string', () => {
    expect(isEvent('string')).toBe(false);
  });

  it('should return false if passed a number', () => {
    expect(isEvent(4)).toBe(false);
  });

  it('should return false if passed an array', () => {
    expect(isEvent([])).toBe(false);
  });
});

describe(isActivity, () => {
  it('should return true if the event has an eventType', () => {
    expect(isActivity({ activityType: { name: 'Workflow Started' } })).toBe(
      true,
    );
  });

  it('should return false if the event does not have an eventType', () => {
    expect(isActivity({ eventType: 'Workflow Started' })).toBe(false);
  });

  it('should return false if passed null', () => {
    expect(isActivity(null)).toBe(false);
  });

  it('should return false if passed a string', () => {
    expect(isActivity('string')).toBe(false);
  });

  it('should return false if passed a number', () => {
    expect(isActivity(4)).toBe(false);
  });

  it('should return false if passed an array', () => {
    expect(isActivity([])).toBe(false);
  });
});

describe(formatEvent, () => {
  it('should correctly get the name from an event', () => {
    const result = formatEvent({ eventType: 'WorkflowStarted' });
    expect(result.name).toBe('Workflow Started');
  });

  it('should correctly get the tag from an event', () => {
    const result = formatEvent({ eventType: 'WorkflowStarted' });
    expect(result.tag).toBe('WorkflowStarted');
  });

  it('should correctly get the name from an activity', () => {
    const result = formatEvent({
      activityType: { name: 'LongActivity' },
      state: 'Started',
    });
    expect(result.name).toBe('Long Activity: Started');
  });

  it('should correctly get the tag from an activity', () => {
    const result = formatEvent({ eventType: 'WorkflowStarted' });
    expect(result.tag).toBe('WorkflowStarted');
  });
});
