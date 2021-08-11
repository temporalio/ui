import WorkflowExecutionStartedEvent from '$lib/components/events/workflow-execution-started-event.svelte';
import WorkflowExecutionCompletedEvent from '$lib/components/events/workflow-execution-completed-event.svelte';
import WorkflowExecutionFailedEvent from '$lib/components/events/workflow-execution-failed-event.svelte';
import WorkflowExecutionTimedOutEvent from '$lib/components/events/workflow-execution-timed-out-event.svelte';
import WorkflowTaskScheduledEvent from '$lib/components/events/workflow-task-scheduled-event.svelte';
import WorkflowTaskStartedEvent from '$lib/components/events/workflow-task-started-event.svelte';
import WorkflowTaskCompletedEvent from '$lib/components/events/workflow-task-completed-event.svelte';
import WorkflowTaskTimedOutEvent from '$lib/components/events/workflow-task-timed-out-event.svelte';
import WorkflowTaskFailedEvent from '$lib/components/events/workflow-task-failed-event.svelte';
import ActivityTaskScheduledEvent from '$lib/components/events/activity-task-scheduled-event.svelte';
import ActivityTaskStartedEvent from '$lib/components/events/activity-task-started-event.svelte';
import ActivityTaskCompletedEvent from '$lib/components/events/activity-task-completed-event.svelte';
import ActivityTaskFailedEvent from '$lib/components/events/activity-task-failed-event.svelte';
import ActivityTaskTimedOutEvent from '$lib/components/events/activity-task-timed-out-event.svelte';
import TimerStartedEvent from '$lib/components/events/timer-started-event.svelte';
import TimerFiredEvent from '$lib/components/events/timer-fired-event.svelte';
import ActivityTaskCancelRequestedEvent from '$lib/components/events/activity-task-cancel-requested-event.svelte';
import ActivityTaskCanceledEvent from '$lib/components/events/activity-task-canceled-event.svelte';
import TimerCanceledEvent from '$lib/components/events/timer-canceled-event.svelte';
import MarkerRecordedEvent from '$lib/components/events/marker-recorded-event.svelte';
import WorkflowExecutionSignaledEvent from '$lib/components/events/workflow-execution-signaled-event.svelte';
import WorkflowExecutionTerminatedEvent from '$lib/components/events/workflow-execution-terminated-event.svelte';
import WorkflowExecutionCancelRequestedEvent from '$lib/components/events/workflow-execution-cancel-requested-event.svelte';
import WorkflowExecutionCanceledEvent from '$lib/components/events/workflow-execution-canceled-event.svelte';
import RequestCancelExternalWorkflowExecutionInitiatedEvent from '$lib/components/events/request-cancel-external-workflow-execution-initiated-event.svelte';
import RequestCancelExternalWorkflowExecutionFailedEvent from '$lib/components/events/request-cancel-external-workflow-execution-failed-event.svelte';
import ExternalWorkflowExecutionCancelRequestedEvent from '$lib/components/events/external-workflow-execution-cancel-requested-event.svelte';
import WorkflowExecutionContinuedAsNewEvent from '$lib/components/events/workflow-execution-continued-as-new-event.svelte';
import StartChildWorkflowExecutionInitiatedEvent from '$lib/components/events/start-child-workflow-execution-initiated-event.svelte';
import StartChildWorkflowExecutionFailedEvent from '$lib/components/events/start-child-workflow-execution-failed-event.svelte';
import ChildWorkflowExecutionStartedEvent from '$lib/components/events/child-workflow-execution-started-event.svelte';
import ChildWorkflowExecutionCompletedEvent from '$lib/components/events/child-workflow-execution-completed-event.svelte';
import ChildWorkflowExecutionFailedEvent from '$lib/components/events/child-workflow-execution-failed-event.svelte';
import ChildWorkflowExecutionCanceledEvent from '$lib/components/events/child-workflow-execution-canceled-event.svelte';
import ChildWorkflowExecutionTimedOutEvent from '$lib/components/events/child-workflow-execution-timed-out-event.svelte';
import ChildWorkflowExecutionTerminatedEvent from '$lib/components/events/child-workflow-execution-terminated-event.svelte';
import SignalExternalWorkflowExecutionInitiatedEvent from '$lib/components/events/signal-external-workflow-execution-initiated-event.svelte';
import SignalExternalWorkflowExecutionFailedEvent from '$lib/components/events/signal-external-workflow-execution-failed-event.svelte';
import ExternalWorkflowExecutionSignaledEvent from '$lib/components/events/external-workflow-execution-signaled-event.svelte';
import UpsertWorkflowSearchAttributesEvent from '$lib/components/events/upsert-workflow-search-attributes-event.svelte';

const eventTypes = {
  WorkflowExecutionStarted: WorkflowExecutionStartedEvent,
  WorkflowExecutionCompleted: WorkflowExecutionCompletedEvent,
  WorkflowExecutionFailed: WorkflowExecutionFailedEvent,
  WorkflowExecutionTimedOut: WorkflowExecutionTimedOutEvent,
  WorkflowTaskScheduled: WorkflowTaskScheduledEvent,
  WorkflowTaskStarted: WorkflowTaskStartedEvent,
  WorkflowTaskCompleted: WorkflowTaskCompletedEvent,
  WorkflowTaskTimedOut: WorkflowTaskTimedOutEvent,
  WorkflowTaskFailed: WorkflowTaskFailedEvent,
  ActivityTaskScheduled: ActivityTaskScheduledEvent,
  ActivityTaskStarted: ActivityTaskStartedEvent,
  ActivityTaskCompleted: ActivityTaskCompletedEvent,
  ActivityTaskFailed: ActivityTaskFailedEvent,
  ActivityTaskTimedOut: ActivityTaskTimedOutEvent,
  TimerStarted: TimerStartedEvent,
  TimerFired: TimerFiredEvent,
  ActivityTaskCancelRequested: ActivityTaskCancelRequestedEvent,
  ActivityTaskCanceled: ActivityTaskCanceledEvent,
  TimerCanceled: TimerCanceledEvent,
  MarkerRecorded: MarkerRecordedEvent,
  WorkflowExecutionSignaled: WorkflowExecutionSignaledEvent,
  WorkflowExecutionTerminated: WorkflowExecutionTerminatedEvent,
  WorkflowExecutionCancelRequested: WorkflowExecutionCancelRequestedEvent,
  WorkflowExecutionCanceled: WorkflowExecutionCanceledEvent,
  RequestCancelExternalWorkflowExecutionInitiated: RequestCancelExternalWorkflowExecutionInitiatedEvent,
  RequestCancelExternalWorkflowExecutionFailed: RequestCancelExternalWorkflowExecutionFailedEvent,
  ExternalWorkflowExecutionCancelRequested: ExternalWorkflowExecutionCancelRequestedEvent,
  WorkflowExecutionContinuedAsNew: WorkflowExecutionContinuedAsNewEvent,
  StartChildWorkflowExecutionInitiated: StartChildWorkflowExecutionInitiatedEvent,
  StartChildWorkflowExecutionFailed: StartChildWorkflowExecutionFailedEvent,
  ChildWorkflowExecutionStarted: ChildWorkflowExecutionStartedEvent,
  ChildWorkflowExecutionCompleted: ChildWorkflowExecutionCompletedEvent,
  ChildWorkflowExecutionFailed: ChildWorkflowExecutionFailedEvent,
  ChildWorkflowExecutionCanceled: ChildWorkflowExecutionCanceledEvent,
  ChildWorkflowExecutionTimedOut: ChildWorkflowExecutionTimedOutEvent,
  ChildWorkflowExecutionTerminated: ChildWorkflowExecutionTerminatedEvent,
  SignalExternalWorkflowExecutionInitiated: SignalExternalWorkflowExecutionInitiatedEvent,
  SignalExternalWorkflowExecutionFailed: SignalExternalWorkflowExecutionFailedEvent,
  ExternalWorkflowExecutionSignaled: ExternalWorkflowExecutionSignaledEvent,
  UpsertWorkflowSearchAttributes: UpsertWorkflowSearchAttributesEvent,
};

type EventTypes = typeof eventTypes;

export const getComponentForEventType = (
  event: HistoryEvent,
): EventTypes[keyof EventTypes] => {
  console.log(event.eventType);
  return eventTypes[event.eventType];
};
