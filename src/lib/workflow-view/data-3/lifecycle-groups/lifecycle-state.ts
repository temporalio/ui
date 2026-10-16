import { isLocalActivityMarkerEvent } from '$lib/utilities/is-event-type';

import type { LifecycleTerminalOutcome } from './types';
import type { NormalizedHistoryEvent } from '../history-events/types';

/** Returns the lifecycle outcome reported by a terminal event, otherwise null. */
export function getTerminalOutcome(
  event: NormalizedHistoryEvent,
): LifecycleTerminalOutcome | null {
  switch (event.eventType) {
    case 'ActivityTaskCompleted':
    case 'ChildWorkflowExecutionCompleted':
    case 'NexusOperationCompleted':
    case 'TimerFired':
    case 'ExternalWorkflowExecutionSignaled':
    case 'WorkflowExecutionUpdateCompleted':
    case 'WorkflowExecutionCompleted': {
      return 'completed';
    }

    case 'ActivityTaskFailed':
    case 'ChildWorkflowExecutionFailed':
    case 'StartChildWorkflowExecutionFailed':
    case 'NexusOperationFailed':
    case 'SignalExternalWorkflowExecutionFailed':
    case 'WorkflowExecutionFailed': {
      return 'failed';
    }

    case 'ActivityTaskTimedOut':
    case 'ChildWorkflowExecutionTimedOut':
    case 'NexusOperationTimedOut':
    case 'WorkflowExecutionTimedOut': {
      return 'timed-out';
    }

    case 'ActivityTaskCanceled':
    case 'ChildWorkflowExecutionCanceled':
    case 'NexusOperationCanceled':
    case 'TimerCanceled':
    case 'WorkflowExecutionCanceled': {
      return 'canceled';
    }

    case 'ChildWorkflowExecutionTerminated':
    case 'WorkflowExecutionTerminated': {
      return 'terminated';
    }

    case 'WorkflowExecutionContinuedAsNew': {
      return 'continued-as-new';
    }

    case 'MarkerRecorded': {
      if (!isLocalActivityMarkerEvent(event)) {
        return null;
      }
      return event.markerRecordedEventAttributes?.failure
        ? 'failed'
        : 'completed';
    }

    default:
      return null;
  }
}

/** Whether the event supplies history-based evidence of a pending lifecycle. */
export function isPendingLifecycleEvent(
  event: NormalizedHistoryEvent,
): boolean {
  switch (event.eventType) {
    case 'ActivityTaskScheduled':
    case 'ActivityTaskStarted':
    case 'NexusOperationScheduled':
    case 'NexusOperationStarted':
    case 'TimerStarted':
    case 'ChildWorkflowExecutionStarted': {
      return true;
    }

    default:
      return false;
  }
}
