import type { LifecycleReference } from './types';
import type { QualifiedHistoryEvent } from '../history-events/types';

/** Having an eventType of never help ensure the switch in getLifecycleReference is exhaustive  */
function getFallbackLifecycleReference(
  _eventType: never,
  eventId: string,
): LifecycleReference {
  return {
    kind: 'event',
    headEventId: eventId,
  };
}

/** Returns the lifecycle kind and head event ID for a history event. */
export function getLifecycleReference(
  event: QualifiedHistoryEvent,
): LifecycleReference {
  const eventType = event.eventType;

  switch (eventType) {
    case 'ActivityTaskScheduled': {
      return {
        kind: 'activity',
        headEventId: event.eventId,
      };
    }

    case 'ActivityTaskStarted': {
      return {
        kind: 'activity',
        headEventId: String(
          event.activityTaskStartedEventAttributes?.scheduledEventId ??
            event.eventId,
        ),
      };
    }

    case 'ActivityTaskCompleted': {
      return {
        kind: 'activity',
        headEventId: String(
          event.activityTaskCompletedEventAttributes?.scheduledEventId ??
            event.eventId,
        ),
      };
    }

    case 'ActivityTaskFailed': {
      return {
        kind: 'activity',
        headEventId: String(
          event.activityTaskFailedEventAttributes?.scheduledEventId ??
            event.eventId,
        ),
      };
    }

    case 'ActivityTaskTimedOut': {
      return {
        kind: 'activity',
        headEventId: String(
          event.activityTaskTimedOutEventAttributes?.scheduledEventId ??
            event.eventId,
        ),
      };
    }

    case 'ActivityTaskCancelRequested': {
      return {
        kind: 'activity',
        headEventId: String(
          event.activityTaskCancelRequestedEventAttributes?.scheduledEventId ??
            event.eventId,
        ),
      };
    }

    case 'ActivityTaskCanceled': {
      return {
        kind: 'activity',
        headEventId: String(
          event.activityTaskCanceledEventAttributes?.scheduledEventId ??
            event.eventId,
        ),
      };
    }

    case 'TimerStarted': {
      return {
        kind: 'timer',
        headEventId: event.eventId,
      };
    }

    case 'TimerFired': {
      return {
        kind: 'timer',
        headEventId: String(
          event.timerFiredEventAttributes?.startedEventId ?? event.eventId,
        ),
      };
    }

    case 'TimerCanceled': {
      return {
        kind: 'timer',
        headEventId: String(
          event.timerCanceledEventAttributes?.startedEventId ?? event.eventId,
        ),
      };
    }

    case 'WorkflowTaskScheduled': {
      return {
        kind: 'workflow-task',
        headEventId: event.eventId,
      };
    }

    case 'WorkflowTaskStarted': {
      return {
        kind: 'workflow-task',
        headEventId: String(
          event.workflowTaskStartedEventAttributes?.scheduledEventId ??
            event.eventId,
        ),
      };
    }

    case 'WorkflowTaskCompleted': {
      return {
        kind: 'workflow-task',
        headEventId: String(
          event.workflowTaskCompletedEventAttributes?.scheduledEventId ??
            event.eventId,
        ),
      };
    }

    case 'WorkflowTaskFailed': {
      return {
        kind: 'workflow-task',
        headEventId: String(
          event.workflowTaskFailedEventAttributes?.scheduledEventId ??
            event.eventId,
        ),
      };
    }

    case 'WorkflowTaskTimedOut': {
      return {
        kind: 'workflow-task',
        headEventId: String(
          event.workflowTaskTimedOutEventAttributes?.scheduledEventId ??
            event.eventId,
        ),
      };
    }

    case 'StartChildWorkflowExecutionInitiated': {
      return {
        kind: 'child-workflow',
        headEventId: event.eventId,
      };
    }

    case 'StartChildWorkflowExecutionFailed': {
      return {
        kind: 'child-workflow',
        headEventId: String(
          event.startChildWorkflowExecutionFailedEventAttributes
            ?.initiatedEventId ?? event.eventId,
        ),
      };
    }

    case 'ChildWorkflowExecutionStarted': {
      return {
        kind: 'child-workflow',
        headEventId: String(
          event.childWorkflowExecutionStartedEventAttributes
            ?.initiatedEventId ?? event.eventId,
        ),
      };
    }

    case 'ChildWorkflowExecutionCompleted': {
      return {
        kind: 'child-workflow',
        headEventId: String(
          event.childWorkflowExecutionCompletedEventAttributes
            ?.initiatedEventId ?? event.eventId,
        ),
      };
    }

    case 'ChildWorkflowExecutionFailed': {
      return {
        kind: 'child-workflow',
        headEventId: String(
          event.childWorkflowExecutionFailedEventAttributes?.initiatedEventId ??
            event.eventId,
        ),
      };
    }

    case 'ChildWorkflowExecutionCanceled': {
      return {
        kind: 'child-workflow',
        headEventId: String(
          event.childWorkflowExecutionCanceledEventAttributes
            ?.initiatedEventId ?? event.eventId,
        ),
      };
    }

    case 'ChildWorkflowExecutionTimedOut': {
      return {
        kind: 'child-workflow',
        headEventId: String(
          event.childWorkflowExecutionTimedOutEventAttributes
            ?.initiatedEventId ?? event.eventId,
        ),
      };
    }

    case 'ChildWorkflowExecutionTerminated': {
      return {
        kind: 'child-workflow',
        headEventId: String(
          event.childWorkflowExecutionTerminatedEventAttributes
            ?.initiatedEventId ?? event.eventId,
        ),
      };
    }

    case 'NexusOperationScheduled': {
      return {
        kind: 'nexus-operation',
        headEventId: event.eventId,
      };
    }

    case 'NexusOperationStarted': {
      return {
        kind: 'nexus-operation',
        headEventId: String(
          event.nexusOperationStartedEventAttributes?.scheduledEventId ??
            event.eventId,
        ),
      };
    }

    case 'NexusOperationCompleted': {
      return {
        kind: 'nexus-operation',
        headEventId: String(
          event.nexusOperationCompletedEventAttributes?.scheduledEventId ??
            event.eventId,
        ),
      };
    }

    case 'NexusOperationFailed': {
      return {
        kind: 'nexus-operation',
        headEventId: String(
          event.nexusOperationFailedEventAttributes?.scheduledEventId ??
            event.eventId,
        ),
      };
    }

    case 'NexusOperationCanceled': {
      return {
        kind: 'nexus-operation',
        headEventId: String(
          event.nexusOperationCanceledEventAttributes?.scheduledEventId ??
            event.eventId,
        ),
      };
    }

    case 'NexusOperationTimedOut': {
      return {
        kind: 'nexus-operation',
        headEventId: String(
          event.nexusOperationTimedOutEventAttributes?.scheduledEventId ??
            event.eventId,
        ),
      };
    }

    case 'NexusOperationCancelRequested': {
      return {
        kind: 'nexus-operation',
        headEventId: String(
          event.nexusOperationCancelRequestedEventAttributes
            ?.scheduledEventId ?? event.eventId,
        ),
      };
    }

    case 'NexusOperationCancelRequestCompleted': {
      return {
        kind: 'nexus-operation',
        headEventId: String(
          event.nexusOperationCancelRequestCompletedEventAttributes
            ?.scheduledEventId ?? event.eventId,
        ),
      };
    }

    case 'NexusOperationCancelRequestFailed': {
      return {
        kind: 'nexus-operation',
        headEventId: String(
          event.nexusOperationCancelRequestFailedEventAttributes
            ?.scheduledEventId ?? event.eventId,
        ),
      };
    }

    case 'SignalExternalWorkflowExecutionInitiated': {
      return {
        kind: 'external-signal',
        headEventId: event.eventId,
      };
    }

    case 'SignalExternalWorkflowExecutionFailed': {
      return {
        kind: 'external-signal',
        headEventId: String(
          event.signalExternalWorkflowExecutionFailedEventAttributes
            ?.initiatedEventId ?? event.eventId,
        ),
      };
    }

    case 'ExternalWorkflowExecutionSignaled': {
      return {
        kind: 'external-signal',
        headEventId: String(
          event.externalWorkflowExecutionSignaledEventAttributes
            ?.initiatedEventId ?? event.eventId,
        ),
      };
    }

    case 'WorkflowExecutionUpdateAccepted': {
      return {
        kind: 'update',
        headEventId: event.eventId,
      };
    }

    case 'WorkflowExecutionUpdateCompleted': {
      return {
        kind: 'update',
        headEventId: String(
          event.workflowExecutionUpdateCompletedEventAttributes
            ?.acceptedEventId ?? event.eventId,
        ),
      };
    }

    case 'WorkflowExecutionSignaled':
    case 'MarkerRecorded':
    case 'WorkflowExecutionCanceled':
    case 'WorkflowExecutionCancelRequested':
    case 'WorkflowExecutionCompleted':
    case 'WorkflowExecutionContinuedAsNew':
    case 'WorkflowExecutionFailed':
    case 'WorkflowExecutionStarted':
    case 'WorkflowExecutionTerminated':
    case 'WorkflowExecutionTimedOut':
    case 'WorkflowExecutionOptionsUpdated':
    case 'ExternalWorkflowExecutionCancelRequested':
    case 'RequestCancelExternalWorkflowExecutionFailed':
    case 'RequestCancelExternalWorkflowExecutionInitiated':
    case 'UpsertWorkflowSearchAttributes':
    case 'WorkflowExecutionUpdateAdmitted':
    case 'WorkflowExecutionUpdateRejected':
    case 'WorkflowExecutionUpdateRequested':
    case 'WorkflowPropertiesModified': {
      return {
        kind: 'event',
        headEventId: event.eventId,
      };
    }

    default: {
      return getFallbackLifecycleReference(eventType, event.eventId);
    }
  }
}
