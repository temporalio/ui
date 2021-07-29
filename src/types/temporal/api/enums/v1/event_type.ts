/* eslint-disable */
import Long from 'long';
import _m0 from 'protobufjs/minimal';

export const protobufPackage = 'temporal.api.enums.v1';

/** Whenever this list of events is changed do change the function shouldBufferEvent in mutableStateBuilder.go to make sure to do the correct event ordering */
export enum EventType {
  /** EVENT_TYPE_UNSPECIFIED - Place holder and should never appear in a Workflow execution history */
  EVENT_TYPE_UNSPECIFIED = 0,
  /**
   * EVENT_TYPE_WORKFLOW_EXECUTION_STARTED - Workflow execution has been triggered/started
   * It contains Workflow execution inputs, as well as Workflow timeout configurations
   */
  EVENT_TYPE_WORKFLOW_EXECUTION_STARTED = 1,
  /** EVENT_TYPE_WORKFLOW_EXECUTION_COMPLETED - Workflow execution has successfully completed and contains Workflow execution results */
  EVENT_TYPE_WORKFLOW_EXECUTION_COMPLETED = 2,
  /** EVENT_TYPE_WORKFLOW_EXECUTION_FAILED - Workflow execution has unsuccessfully completed and contains the Workflow execution error */
  EVENT_TYPE_WORKFLOW_EXECUTION_FAILED = 3,
  /**
   * EVENT_TYPE_WORKFLOW_EXECUTION_TIMED_OUT - Workflow execution has timed out by the Temporal Server
   * Usually due to the Workflow having not been completed within timeout settings
   */
  EVENT_TYPE_WORKFLOW_EXECUTION_TIMED_OUT = 4,
  /** EVENT_TYPE_WORKFLOW_TASK_SCHEDULED - Workflow Task has been scheduled and the SDK client should now be able to process any new history events */
  EVENT_TYPE_WORKFLOW_TASK_SCHEDULED = 5,
  /** EVENT_TYPE_WORKFLOW_TASK_STARTED - Workflow Task has started and the SDK client has picked up the Workflow Task and is processing new history events */
  EVENT_TYPE_WORKFLOW_TASK_STARTED = 6,
  /**
   * EVENT_TYPE_WORKFLOW_TASK_COMPLETED - Workflow Task has completed
   * The SDK client picked up the Workflow Task and processed new history events
   * SDK client may or may not ask the Temporal Server to do additional work, such as:
   * EVENT_TYPE_ACTIVITY_TASK_SCHEDULED
   * EVENT_TYPE_TIMER_STARTED
   * EVENT_TYPE_UPSERT_WORKFLOW_SEARCH_ATTRIBUTES
   * EVENT_TYPE_MARKER_RECORDED
   * EVENT_TYPE_START_CHILD_WORKFLOW_EXECUTION_INITIATED
   * EVENT_TYPE_REQUEST_CANCEL_EXTERNAL_WORKFLOW_EXECUTION_INITIATED
   * EVENT_TYPE_SIGNAL_EXTERNAL_WORKFLOW_EXECUTION_INITIATED
   * EVENT_TYPE_WORKFLOW_EXECUTION_COMPLETED
   * EVENT_TYPE_WORKFLOW_EXECUTION_FAILED
   * EVENT_TYPE_WORKFLOW_EXECUTION_CANCELED
   * EVENT_TYPE_WORKFLOW_EXECUTION_CONTINUED_AS_NEW
   */
  EVENT_TYPE_WORKFLOW_TASK_COMPLETED = 7,
  /**
   * EVENT_TYPE_WORKFLOW_TASK_TIMED_OUT - Workflow Task encountered a timeout
   * Either an SDK client with a local cache was not available at the time, or it took too long for the SDK client to process the task
   */
  EVENT_TYPE_WORKFLOW_TASK_TIMED_OUT = 8,
  /**
   * EVENT_TYPE_WORKFLOW_TASK_FAILED - Workflow Task encountered a failure
   * Usually this means that the Workflow was non-deterministic
   * However, the Workflow reset functionality also uses this event
   */
  EVENT_TYPE_WORKFLOW_TASK_FAILED = 9,
  /**
   * EVENT_TYPE_ACTIVITY_TASK_SCHEDULED - Activity Task was scheduled
   * The SDK client should pick up this activity task and execute
   * This event type contains activity inputs, as well as activity timeout configurations
   */
  EVENT_TYPE_ACTIVITY_TASK_SCHEDULED = 10,
  /**
   * EVENT_TYPE_ACTIVITY_TASK_STARTED - Activity Task has started executing
   * The SDK client has picked up the Activity Task and is processing the Activity invocation
   */
  EVENT_TYPE_ACTIVITY_TASK_STARTED = 11,
  /**
   * EVENT_TYPE_ACTIVITY_TASK_COMPLETED - Activity Task has finished successfully
   * The SDK client has picked up and successfully completed the Activity Task
   * This event type contains Activity execution results
   */
  EVENT_TYPE_ACTIVITY_TASK_COMPLETED = 12,
  /**
   * EVENT_TYPE_ACTIVITY_TASK_FAILED - Activity Task has finished unsuccessfully
   * The SDK picked up the Activity Task but unsuccessfully completed it
   * This event type contains Activity execution errors
   */
  EVENT_TYPE_ACTIVITY_TASK_FAILED = 13,
  /**
   * EVENT_TYPE_ACTIVITY_TASK_TIMED_OUT - Activity has timed out according to the Temporal Server
   * Activity did not complete within the timeout settings
   */
  EVENT_TYPE_ACTIVITY_TASK_TIMED_OUT = 14,
  /**
   * EVENT_TYPE_ACTIVITY_TASK_CANCEL_REQUESTED - A request to cancel the Activity has occurred
   * The SDK client will be able to confirm cancellation of an Activity during an Activity heartbeat
   */
  EVENT_TYPE_ACTIVITY_TASK_CANCEL_REQUESTED = 15,
  /** EVENT_TYPE_ACTIVITY_TASK_CANCELED - Activity has been cancelled */
  EVENT_TYPE_ACTIVITY_TASK_CANCELED = 16,
  /** EVENT_TYPE_TIMER_STARTED - A timer has started */
  EVENT_TYPE_TIMER_STARTED = 17,
  /** EVENT_TYPE_TIMER_FIRED - A timer has fired */
  EVENT_TYPE_TIMER_FIRED = 18,
  /** EVENT_TYPE_TIMER_CANCELED - A time has been cancelled */
  EVENT_TYPE_TIMER_CANCELED = 19,
  /** EVENT_TYPE_WORKFLOW_EXECUTION_CANCEL_REQUESTED - A request has been made to cancel the Workflow execution */
  EVENT_TYPE_WORKFLOW_EXECUTION_CANCEL_REQUESTED = 20,
  /** EVENT_TYPE_WORKFLOW_EXECUTION_CANCELED - SDK client has confirmed the cancellation request and the Workflow execution has been cancelled */
  EVENT_TYPE_WORKFLOW_EXECUTION_CANCELED = 21,
  /** EVENT_TYPE_REQUEST_CANCEL_EXTERNAL_WORKFLOW_EXECUTION_INITIATED - Workflow has requested that the Temporal Server try to cancel another Workflow */
  EVENT_TYPE_REQUEST_CANCEL_EXTERNAL_WORKFLOW_EXECUTION_INITIATED = 22,
  /**
   * EVENT_TYPE_REQUEST_CANCEL_EXTERNAL_WORKFLOW_EXECUTION_FAILED - Temporal Server could not cancel the targeted Workflow
   * This is usually because the target Workflow could not be found
   */
  EVENT_TYPE_REQUEST_CANCEL_EXTERNAL_WORKFLOW_EXECUTION_FAILED = 23,
  /** EVENT_TYPE_EXTERNAL_WORKFLOW_EXECUTION_CANCEL_REQUESTED - Temporal Server has successfully requested the cancellation of the target Workflow */
  EVENT_TYPE_EXTERNAL_WORKFLOW_EXECUTION_CANCEL_REQUESTED = 24,
  /**
   * EVENT_TYPE_MARKER_RECORDED - A marker has been recorded.
   * This event type is transparent to the Temporal Server
   * The Server will only store it and will not try to understand it.
   */
  EVENT_TYPE_MARKER_RECORDED = 25,
  /**
   * EVENT_TYPE_WORKFLOW_EXECUTION_SIGNALED - Workflow has received a Signal event
   * The event type contains the Signal name, as well as a Signal payload
   */
  EVENT_TYPE_WORKFLOW_EXECUTION_SIGNALED = 26,
  /**
   * EVENT_TYPE_WORKFLOW_EXECUTION_TERMINATED - Workflow execution has been forcefully terminated
   * This is usually because the terminate Workflow API was called
   */
  EVENT_TYPE_WORKFLOW_EXECUTION_TERMINATED = 27,
  /**
   * EVENT_TYPE_WORKFLOW_EXECUTION_CONTINUED_AS_NEW - Workflow has successfully completed and a new Workflow has been started within the same transaction
   * Contains last Workflow execution results as well as new Workflow execution inputs
   */
  EVENT_TYPE_WORKFLOW_EXECUTION_CONTINUED_AS_NEW = 28,
  /** EVENT_TYPE_START_CHILD_WORKFLOW_EXECUTION_INITIATED - Temporal Server will try to start a child Workflow */
  EVENT_TYPE_START_CHILD_WORKFLOW_EXECUTION_INITIATED = 29,
  /**
   * EVENT_TYPE_START_CHILD_WORKFLOW_EXECUTION_FAILED - Child Workflow execution cannot be started/triggered
   * Usually due to a child Workflow ID collision
   */
  EVENT_TYPE_START_CHILD_WORKFLOW_EXECUTION_FAILED = 30,
  /** EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_STARTED - Child Workflow execution has successfully started/triggered */
  EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_STARTED = 31,
  /** EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_COMPLETED - Child Workflow execution has successfully completed */
  EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_COMPLETED = 32,
  /** EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_FAILED - Child Workflow execution has unsuccessfully completed */
  EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_FAILED = 33,
  /** EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_CANCELED - Child Workflow execution has been cancelled */
  EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_CANCELED = 34,
  /** EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_TIMED_OUT - Child Workflow execution has timed out by the Temporal Server */
  EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_TIMED_OUT = 35,
  /** EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_TERMINATED - Child Workflow execution has been terminated */
  EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_TERMINATED = 36,
  /**
   * EVENT_TYPE_SIGNAL_EXTERNAL_WORKFLOW_EXECUTION_INITIATED - Temporal Server will try to Signal the targeted Workflow
   * Contains the Signal name, as well as a Signal payload
   */
  EVENT_TYPE_SIGNAL_EXTERNAL_WORKFLOW_EXECUTION_INITIATED = 37,
  /**
   * EVENT_TYPE_SIGNAL_EXTERNAL_WORKFLOW_EXECUTION_FAILED - Temporal Server cannot Signal the targeted Workflow
   * Usually because the Workflow could not be found
   */
  EVENT_TYPE_SIGNAL_EXTERNAL_WORKFLOW_EXECUTION_FAILED = 38,
  /** EVENT_TYPE_EXTERNAL_WORKFLOW_EXECUTION_SIGNALED - Temporal Server has successfully Signaled the targeted Workflow */
  EVENT_TYPE_EXTERNAL_WORKFLOW_EXECUTION_SIGNALED = 39,
  /** EVENT_TYPE_UPSERT_WORKFLOW_SEARCH_ATTRIBUTES - Workflow search attributes should be updated and synchronized with the visibility store */
  EVENT_TYPE_UPSERT_WORKFLOW_SEARCH_ATTRIBUTES = 40,
  UNRECOGNIZED = -1,
}

export function eventTypeFromJSON(object: any): EventType {
  switch (object) {
    case 0:
    case 'EVENT_TYPE_UNSPECIFIED':
      return EventType.EVENT_TYPE_UNSPECIFIED;
    case 1:
    case 'EVENT_TYPE_WORKFLOW_EXECUTION_STARTED':
      return EventType.EVENT_TYPE_WORKFLOW_EXECUTION_STARTED;
    case 2:
    case 'EVENT_TYPE_WORKFLOW_EXECUTION_COMPLETED':
      return EventType.EVENT_TYPE_WORKFLOW_EXECUTION_COMPLETED;
    case 3:
    case 'EVENT_TYPE_WORKFLOW_EXECUTION_FAILED':
      return EventType.EVENT_TYPE_WORKFLOW_EXECUTION_FAILED;
    case 4:
    case 'EVENT_TYPE_WORKFLOW_EXECUTION_TIMED_OUT':
      return EventType.EVENT_TYPE_WORKFLOW_EXECUTION_TIMED_OUT;
    case 5:
    case 'EVENT_TYPE_WORKFLOW_TASK_SCHEDULED':
      return EventType.EVENT_TYPE_WORKFLOW_TASK_SCHEDULED;
    case 6:
    case 'EVENT_TYPE_WORKFLOW_TASK_STARTED':
      return EventType.EVENT_TYPE_WORKFLOW_TASK_STARTED;
    case 7:
    case 'EVENT_TYPE_WORKFLOW_TASK_COMPLETED':
      return EventType.EVENT_TYPE_WORKFLOW_TASK_COMPLETED;
    case 8:
    case 'EVENT_TYPE_WORKFLOW_TASK_TIMED_OUT':
      return EventType.EVENT_TYPE_WORKFLOW_TASK_TIMED_OUT;
    case 9:
    case 'EVENT_TYPE_WORKFLOW_TASK_FAILED':
      return EventType.EVENT_TYPE_WORKFLOW_TASK_FAILED;
    case 10:
    case 'EVENT_TYPE_ACTIVITY_TASK_SCHEDULED':
      return EventType.EVENT_TYPE_ACTIVITY_TASK_SCHEDULED;
    case 11:
    case 'EVENT_TYPE_ACTIVITY_TASK_STARTED':
      return EventType.EVENT_TYPE_ACTIVITY_TASK_STARTED;
    case 12:
    case 'EVENT_TYPE_ACTIVITY_TASK_COMPLETED':
      return EventType.EVENT_TYPE_ACTIVITY_TASK_COMPLETED;
    case 13:
    case 'EVENT_TYPE_ACTIVITY_TASK_FAILED':
      return EventType.EVENT_TYPE_ACTIVITY_TASK_FAILED;
    case 14:
    case 'EVENT_TYPE_ACTIVITY_TASK_TIMED_OUT':
      return EventType.EVENT_TYPE_ACTIVITY_TASK_TIMED_OUT;
    case 15:
    case 'EVENT_TYPE_ACTIVITY_TASK_CANCEL_REQUESTED':
      return EventType.EVENT_TYPE_ACTIVITY_TASK_CANCEL_REQUESTED;
    case 16:
    case 'EVENT_TYPE_ACTIVITY_TASK_CANCELED':
      return EventType.EVENT_TYPE_ACTIVITY_TASK_CANCELED;
    case 17:
    case 'EVENT_TYPE_TIMER_STARTED':
      return EventType.EVENT_TYPE_TIMER_STARTED;
    case 18:
    case 'EVENT_TYPE_TIMER_FIRED':
      return EventType.EVENT_TYPE_TIMER_FIRED;
    case 19:
    case 'EVENT_TYPE_TIMER_CANCELED':
      return EventType.EVENT_TYPE_TIMER_CANCELED;
    case 20:
    case 'EVENT_TYPE_WORKFLOW_EXECUTION_CANCEL_REQUESTED':
      return EventType.EVENT_TYPE_WORKFLOW_EXECUTION_CANCEL_REQUESTED;
    case 21:
    case 'EVENT_TYPE_WORKFLOW_EXECUTION_CANCELED':
      return EventType.EVENT_TYPE_WORKFLOW_EXECUTION_CANCELED;
    case 22:
    case 'EVENT_TYPE_REQUEST_CANCEL_EXTERNAL_WORKFLOW_EXECUTION_INITIATED':
      return EventType.EVENT_TYPE_REQUEST_CANCEL_EXTERNAL_WORKFLOW_EXECUTION_INITIATED;
    case 23:
    case 'EVENT_TYPE_REQUEST_CANCEL_EXTERNAL_WORKFLOW_EXECUTION_FAILED':
      return EventType.EVENT_TYPE_REQUEST_CANCEL_EXTERNAL_WORKFLOW_EXECUTION_FAILED;
    case 24:
    case 'EVENT_TYPE_EXTERNAL_WORKFLOW_EXECUTION_CANCEL_REQUESTED':
      return EventType.EVENT_TYPE_EXTERNAL_WORKFLOW_EXECUTION_CANCEL_REQUESTED;
    case 25:
    case 'EVENT_TYPE_MARKER_RECORDED':
      return EventType.EVENT_TYPE_MARKER_RECORDED;
    case 26:
    case 'EVENT_TYPE_WORKFLOW_EXECUTION_SIGNALED':
      return EventType.EVENT_TYPE_WORKFLOW_EXECUTION_SIGNALED;
    case 27:
    case 'EVENT_TYPE_WORKFLOW_EXECUTION_TERMINATED':
      return EventType.EVENT_TYPE_WORKFLOW_EXECUTION_TERMINATED;
    case 28:
    case 'EVENT_TYPE_WORKFLOW_EXECUTION_CONTINUED_AS_NEW':
      return EventType.EVENT_TYPE_WORKFLOW_EXECUTION_CONTINUED_AS_NEW;
    case 29:
    case 'EVENT_TYPE_START_CHILD_WORKFLOW_EXECUTION_INITIATED':
      return EventType.EVENT_TYPE_START_CHILD_WORKFLOW_EXECUTION_INITIATED;
    case 30:
    case 'EVENT_TYPE_START_CHILD_WORKFLOW_EXECUTION_FAILED':
      return EventType.EVENT_TYPE_START_CHILD_WORKFLOW_EXECUTION_FAILED;
    case 31:
    case 'EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_STARTED':
      return EventType.EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_STARTED;
    case 32:
    case 'EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_COMPLETED':
      return EventType.EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_COMPLETED;
    case 33:
    case 'EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_FAILED':
      return EventType.EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_FAILED;
    case 34:
    case 'EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_CANCELED':
      return EventType.EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_CANCELED;
    case 35:
    case 'EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_TIMED_OUT':
      return EventType.EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_TIMED_OUT;
    case 36:
    case 'EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_TERMINATED':
      return EventType.EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_TERMINATED;
    case 37:
    case 'EVENT_TYPE_SIGNAL_EXTERNAL_WORKFLOW_EXECUTION_INITIATED':
      return EventType.EVENT_TYPE_SIGNAL_EXTERNAL_WORKFLOW_EXECUTION_INITIATED;
    case 38:
    case 'EVENT_TYPE_SIGNAL_EXTERNAL_WORKFLOW_EXECUTION_FAILED':
      return EventType.EVENT_TYPE_SIGNAL_EXTERNAL_WORKFLOW_EXECUTION_FAILED;
    case 39:
    case 'EVENT_TYPE_EXTERNAL_WORKFLOW_EXECUTION_SIGNALED':
      return EventType.EVENT_TYPE_EXTERNAL_WORKFLOW_EXECUTION_SIGNALED;
    case 40:
    case 'EVENT_TYPE_UPSERT_WORKFLOW_SEARCH_ATTRIBUTES':
      return EventType.EVENT_TYPE_UPSERT_WORKFLOW_SEARCH_ATTRIBUTES;
    case -1:
    case 'UNRECOGNIZED':
    default:
      return EventType.UNRECOGNIZED;
  }
}

export function eventTypeToJSON(object: EventType): string {
  switch (object) {
    case EventType.EVENT_TYPE_UNSPECIFIED:
      return 'EVENT_TYPE_UNSPECIFIED';
    case EventType.EVENT_TYPE_WORKFLOW_EXECUTION_STARTED:
      return 'EVENT_TYPE_WORKFLOW_EXECUTION_STARTED';
    case EventType.EVENT_TYPE_WORKFLOW_EXECUTION_COMPLETED:
      return 'EVENT_TYPE_WORKFLOW_EXECUTION_COMPLETED';
    case EventType.EVENT_TYPE_WORKFLOW_EXECUTION_FAILED:
      return 'EVENT_TYPE_WORKFLOW_EXECUTION_FAILED';
    case EventType.EVENT_TYPE_WORKFLOW_EXECUTION_TIMED_OUT:
      return 'EVENT_TYPE_WORKFLOW_EXECUTION_TIMED_OUT';
    case EventType.EVENT_TYPE_WORKFLOW_TASK_SCHEDULED:
      return 'EVENT_TYPE_WORKFLOW_TASK_SCHEDULED';
    case EventType.EVENT_TYPE_WORKFLOW_TASK_STARTED:
      return 'EVENT_TYPE_WORKFLOW_TASK_STARTED';
    case EventType.EVENT_TYPE_WORKFLOW_TASK_COMPLETED:
      return 'EVENT_TYPE_WORKFLOW_TASK_COMPLETED';
    case EventType.EVENT_TYPE_WORKFLOW_TASK_TIMED_OUT:
      return 'EVENT_TYPE_WORKFLOW_TASK_TIMED_OUT';
    case EventType.EVENT_TYPE_WORKFLOW_TASK_FAILED:
      return 'EVENT_TYPE_WORKFLOW_TASK_FAILED';
    case EventType.EVENT_TYPE_ACTIVITY_TASK_SCHEDULED:
      return 'EVENT_TYPE_ACTIVITY_TASK_SCHEDULED';
    case EventType.EVENT_TYPE_ACTIVITY_TASK_STARTED:
      return 'EVENT_TYPE_ACTIVITY_TASK_STARTED';
    case EventType.EVENT_TYPE_ACTIVITY_TASK_COMPLETED:
      return 'EVENT_TYPE_ACTIVITY_TASK_COMPLETED';
    case EventType.EVENT_TYPE_ACTIVITY_TASK_FAILED:
      return 'EVENT_TYPE_ACTIVITY_TASK_FAILED';
    case EventType.EVENT_TYPE_ACTIVITY_TASK_TIMED_OUT:
      return 'EVENT_TYPE_ACTIVITY_TASK_TIMED_OUT';
    case EventType.EVENT_TYPE_ACTIVITY_TASK_CANCEL_REQUESTED:
      return 'EVENT_TYPE_ACTIVITY_TASK_CANCEL_REQUESTED';
    case EventType.EVENT_TYPE_ACTIVITY_TASK_CANCELED:
      return 'EVENT_TYPE_ACTIVITY_TASK_CANCELED';
    case EventType.EVENT_TYPE_TIMER_STARTED:
      return 'EVENT_TYPE_TIMER_STARTED';
    case EventType.EVENT_TYPE_TIMER_FIRED:
      return 'EVENT_TYPE_TIMER_FIRED';
    case EventType.EVENT_TYPE_TIMER_CANCELED:
      return 'EVENT_TYPE_TIMER_CANCELED';
    case EventType.EVENT_TYPE_WORKFLOW_EXECUTION_CANCEL_REQUESTED:
      return 'EVENT_TYPE_WORKFLOW_EXECUTION_CANCEL_REQUESTED';
    case EventType.EVENT_TYPE_WORKFLOW_EXECUTION_CANCELED:
      return 'EVENT_TYPE_WORKFLOW_EXECUTION_CANCELED';
    case EventType.EVENT_TYPE_REQUEST_CANCEL_EXTERNAL_WORKFLOW_EXECUTION_INITIATED:
      return 'EVENT_TYPE_REQUEST_CANCEL_EXTERNAL_WORKFLOW_EXECUTION_INITIATED';
    case EventType.EVENT_TYPE_REQUEST_CANCEL_EXTERNAL_WORKFLOW_EXECUTION_FAILED:
      return 'EVENT_TYPE_REQUEST_CANCEL_EXTERNAL_WORKFLOW_EXECUTION_FAILED';
    case EventType.EVENT_TYPE_EXTERNAL_WORKFLOW_EXECUTION_CANCEL_REQUESTED:
      return 'EVENT_TYPE_EXTERNAL_WORKFLOW_EXECUTION_CANCEL_REQUESTED';
    case EventType.EVENT_TYPE_MARKER_RECORDED:
      return 'EVENT_TYPE_MARKER_RECORDED';
    case EventType.EVENT_TYPE_WORKFLOW_EXECUTION_SIGNALED:
      return 'EVENT_TYPE_WORKFLOW_EXECUTION_SIGNALED';
    case EventType.EVENT_TYPE_WORKFLOW_EXECUTION_TERMINATED:
      return 'EVENT_TYPE_WORKFLOW_EXECUTION_TERMINATED';
    case EventType.EVENT_TYPE_WORKFLOW_EXECUTION_CONTINUED_AS_NEW:
      return 'EVENT_TYPE_WORKFLOW_EXECUTION_CONTINUED_AS_NEW';
    case EventType.EVENT_TYPE_START_CHILD_WORKFLOW_EXECUTION_INITIATED:
      return 'EVENT_TYPE_START_CHILD_WORKFLOW_EXECUTION_INITIATED';
    case EventType.EVENT_TYPE_START_CHILD_WORKFLOW_EXECUTION_FAILED:
      return 'EVENT_TYPE_START_CHILD_WORKFLOW_EXECUTION_FAILED';
    case EventType.EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_STARTED:
      return 'EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_STARTED';
    case EventType.EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_COMPLETED:
      return 'EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_COMPLETED';
    case EventType.EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_FAILED:
      return 'EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_FAILED';
    case EventType.EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_CANCELED:
      return 'EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_CANCELED';
    case EventType.EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_TIMED_OUT:
      return 'EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_TIMED_OUT';
    case EventType.EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_TERMINATED:
      return 'EVENT_TYPE_CHILD_WORKFLOW_EXECUTION_TERMINATED';
    case EventType.EVENT_TYPE_SIGNAL_EXTERNAL_WORKFLOW_EXECUTION_INITIATED:
      return 'EVENT_TYPE_SIGNAL_EXTERNAL_WORKFLOW_EXECUTION_INITIATED';
    case EventType.EVENT_TYPE_SIGNAL_EXTERNAL_WORKFLOW_EXECUTION_FAILED:
      return 'EVENT_TYPE_SIGNAL_EXTERNAL_WORKFLOW_EXECUTION_FAILED';
    case EventType.EVENT_TYPE_EXTERNAL_WORKFLOW_EXECUTION_SIGNALED:
      return 'EVENT_TYPE_EXTERNAL_WORKFLOW_EXECUTION_SIGNALED';
    case EventType.EVENT_TYPE_UPSERT_WORKFLOW_SEARCH_ATTRIBUTES:
      return 'EVENT_TYPE_UPSERT_WORKFLOW_SEARCH_ATTRIBUTES';
    default:
      return 'UNKNOWN';
  }
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}
