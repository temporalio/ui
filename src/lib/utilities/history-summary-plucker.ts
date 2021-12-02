const summaryExtractors = {
ActivityTaskCancelRequested: d => ({ Id: d.activityId }),
ActivityTaskCompleted: d => ({ result: d.result }),
ActivityTaskFailed: d => ({
  details: d.details,
  reason: d.reason,
}),
ActivityTaskScheduled: d => ({
  'Close Timeout': d.scheduleToCloseTimeout?.duration,
  Id: d.activityId,
  input: d.input,
  Name: d.activityType.name,
}),
ActivityTaskStarted: d => ({
  attempt: d.attempt,
  identity: d.identity,
  requestId: d.requestId,
}),
ActivityTaskTimedOut: d => ({
  'Timeout Type': d.failure?.timeoutFailureInfo?.timeoutType,
}),
ChildWorkflowExecutionCompleted: d => ({
  result: d.result,
  Workflow: d,
}),
ChildWorkflowExecutionStarted: d => ({
  Workflow: d,
}),
WorkflowTaskCompleted: d => ({ identity: d.identity }),
WorkflowTaskScheduled: d => ({
  Taskqueue: d.taskQueue.name,
  Timeout: d.startToCloseTimeout?.duration,
}),
WorkflowTaskStarted: d => ({ requestId: d.requestId }),
WorkflowTaskTimedOut: d => ({ 'Timeout Type': d.timeoutType }),
ExternalWorkflowExecutionSignaled: d => ({
  Workflow: d,
}),
StartChildWorkflowExecutionInitiated: d => ({
  input: d.input,
  Taskqueue: d.taskQueue.name,
  Workflow: d.workflowType.name,
}),
SignalExternalWorkflowExecutionInitiated: d => ({
  input: d.input,
  signal: d.signalName,
  Workflow: d,
}),
TimerStarted: d => ({
  'Fire Timeout': d.startToFireTimeout?.duration,
  'Timer ID': d.timerId,
}),
WorkflowExecutionStarted: d => {
  const summary = {
    'Close Timeout': d.startToFireTimeout?.duration,
    identity: d.identity,
    input: d.input,
    Parent: undefined,
    Workflow: d.workflowType ? d.workflowType.name : '',
  };

  return summary;
},
WorkflowExecutionCompleted: d => ({
  result: d.result,
  newExecutionRunId: d.newExecutionRunId || undefined,
}),
WorkflowExecutionFailed: d => ({
  message: d.failure?.message,
  newExecutionRunId: d.newExecutionRunId || undefined,
}),
WorkflowExecutionTimedOut: d => ({
  retryState: d.retryState,
  newExecutionRunId: d.newExecutionRunId || undefined,
}),
WorkflowTaskFailed: d => ({ message: d.failure?.message }),
ChildWorkflowExecutionFailed: d => ({ message: d.failure?.message }),
};

const isKnownEventType = eventType => {
return eventType in summaryExtractors;
};

const extractEventSummary = (eventType, eventDetails) => {
return isKnownEventType(eventType)
  ? summaryExtractors[eventType](eventDetails)
  : eventDetails;
};

export { extractEventSummary };