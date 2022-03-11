import { getEventClassification } from './get-event-classification';

describe(getEventClassification, () => {
  it('should return "Started" for WorkflowExecutionStartedEvent', () => {
    expect(getEventClassification('WorkflowExecutionStartedEvent')).toBe(
      'Started',
    );
  });

  it('should return "Completed" for WorkflowExecutionCompletedEvent', () => {
    expect(getEventClassification('WorkflowExecutionCompletedEvent')).toBe(
      'Completed',
    );
  });

  it('should return "Failed" for WorkflowExecutionFailedEvent', () => {
    expect(getEventClassification('WorkflowExecutionFailedEvent')).toBe(
      'Failed',
    );
  });

  it('should return "TimedOut" for WorkflowExecutionTimedOutEvent', () => {
    expect(getEventClassification('WorkflowExecutionTimedOutEvent')).toBe(
      'TimedOut',
    );
  });

  it('should return "Scheduled" for WorkflowTaskScheduledEvent', () => {
    expect(getEventClassification('WorkflowTaskScheduledEvent')).toBe(
      'Scheduled',
    );
  });

  it('should return "Started" for WorkflowTaskStartedEvent', () => {
    expect(getEventClassification('WorkflowTaskStartedEvent')).toBe('Started');
  });

  it('should return "Completed" for WorkflowTaskCompletedEvent', () => {
    expect(getEventClassification('WorkflowTaskCompletedEvent')).toBe(
      'Completed',
    );
  });

  it('should return "TimedOut" for WorkflowTaskTimedOutEvent', () => {
    expect(getEventClassification('WorkflowTaskTimedOutEvent')).toBe(
      'TimedOut',
    );
  });

  it('should return "Failed" for WorkflowTaskFailedEvent', () => {
    expect(getEventClassification('WorkflowTaskFailedEvent')).toBe('Failed');
  });

  it('should return "Scheduled" for ActivityTaskScheduledEvent', () => {
    expect(getEventClassification('ActivityTaskScheduledEvent')).toBe(
      'Scheduled',
    );
  });

  it('should return "Started" for ActivityTaskStartedEvent', () => {
    expect(getEventClassification('ActivityTaskStartedEvent')).toBe('Started');
  });

  it('should return "Completed" for ActivityTaskCompletedEvent', () => {
    expect(getEventClassification('ActivityTaskCompletedEvent')).toBe(
      'Completed',
    );
  });

  it('should return "Failed" for ActivityTaskFailedEvent', () => {
    expect(getEventClassification('ActivityTaskFailedEvent')).toBe('Failed');
  });

  it('should return "TimedOut" for ActivityTaskTimedOutEvent', () => {
    expect(getEventClassification('ActivityTaskTimedOutEvent')).toBe(
      'TimedOut',
    );
  });

  it('should return "Started" for TimerStartedEven', () => {
    expect(getEventClassification('TimerStartedEvent')).toBe('Started');
  });

  it('should return "Fired" for TimerFiredEven', () => {
    expect(getEventClassification('TimerFiredEvent')).toBe('Fired');
  });

  it('should return "CancelRequested" for ActivityTaskCancelRequestedEvent', () => {
    expect(getEventClassification('ActivityTaskCancelRequestedEvent')).toBe(
      'CancelRequested',
    );
  });

  it('should return "Canceled" for ActivityTaskCanceledEvent', () => {
    expect(getEventClassification('ActivityTaskCanceledEvent')).toBe(
      'Canceled',
    );
  });

  it('should return "Canceled" for TimerCanceledEvent', () => {
    expect(getEventClassification('TimerCanceledEventt')).toBe('Canceled');
  });

  it('should return undefined for MarkerRecordedEvent', () => {
    expect(getEventClassification('MarkerRecordedEvent')).toBeUndefined();
  });

  it('should return "Signaled" for WorkflowExecutionSignaledEvent', () => {
    expect(getEventClassification('WorkflowExecutionSignaledEvent')).toBe(
      'Signaled',
    );
  });

  it('should return "Terminated" for WorkflowExecutionTerminatedEvent', () => {
    expect(getEventClassification('WorkflowExecutionTerminatedEvent')).toBe(
      'Terminated',
    );
  });

  it('should return "CancelRequested" for WorkflowExecutionCancelRequestedEvent', () => {
    expect(
      getEventClassification({
        eventType: 'WorkflowExecutionCancelRequestedEvent',
      }),
    ).toBe('CancelRequested');
  });

  it('should return "Canceled" for WorkflowExecutionCanceledEvent', () => {
    expect(getEventClassification('WorkflowExecutionCanceledEvent')).toBe(
      'Canceled',
    );
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
