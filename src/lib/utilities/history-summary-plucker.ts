import { getComponentForEventType } from './get-component-for-event-type';

const summaryExtractors = {
  ActivityTaskCancelRequested: ({ activityId }) => ({ activityId }),
  ActivityTaskCompleted: ({ result }) => ({ result }),
  ActivityTaskFailed: ({ detail, reason }) => ({ detail, reason }),
  ActivityTaskScheduled: ({
    startToCloseTimeout,
    activityId,
    input,
    activity,
  }) => ({ startToCloseTimeout, activityId, input, activity }),
  ActivityTaskStarted: ({ attempt, identity, requestId }) => ({
    attempt,
    identity,
    requestId,
  }),
  ActivityTaskTimedOut: ({ failure }) => ({ failure }),
  ChildWorkflowExecutionCompleted: ({ result }) => ({ result }),
  ChildWorkflowExecutionStarted: (eventAttrs) => eventAttrs,
  WorkflowTaskCompleted: ({ identity }) => ({ identity }),
  WorkflowTaskScheduled: ({ taskQueue, startToCloseTimeout }) => ({
    taskQueue,
    startToCloseTimeout,
  }),
  WorkflowTaskStarted: ({ requestId }) => ({ requestId }),
  WorkflowTaskTimedOut: ({ timeoutType }) => ({ timeoutType }),
  ExternalWorkflowExecutionSignaled: (eventAttrs) => eventAttrs,
  StartChildWorkflowExecutionInitiated: ({
    input,
    taskQueue,
    workflowType,
  }) => ({
    input,
    Taskqueue: taskQueue.name,
    Workflow: workflowType.name,
  }),
  SignalExternalWorkflowExecutionInitiated: ({ input, signalName }) => ({
    input,
    signalName,
  }),
  TimerStarted: ({ startToFireTimeout, timerId }) => ({
    startToFireTimeout,
    timerId,
  }),
  WorkflowExecutionStarted: ({
    workflowRunTimeout,
    identity,
    input,
    workflowType,
  }) => ({
    workflowRunTimeout,
    identity,
    input,
    workflowType: workflowType?.name ?? '',
  }),
  WorkflowExecutionCompleted: ({ result, newExecutionRunId }) => ({
    result,
    newExecutionRunId,
  }),
  WorkflowExecutionFailed: ({ failure, newExecutionRunId }) => ({
    message: failure?.message ?? '',
    newExecutionRunId,
  }),
  WorkflowExecutionTimedOut: ({ retryState, newExecutionRunId }) => ({
    retryState,
    newExecutionRunId,
  }),
  WorkflowTaskFailed: ({ failure }) => ({ message: failure?.message ?? '' }),
  ChildWorkflowExecutionFailed: ({ failure }) => ({
    message: failure?.message ?? '',
  }),
};

export const getHistorySummary = (event) => {
  return (
    summaryExtractors[event.eventType](getComponentForEventType(event)) ??
    getComponentForEventType(event)
  );
};
