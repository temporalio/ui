import type { WorkflowEvent } from '$lib/types/events';
import { getErrorCause } from '$lib/utilities/get-workflow-task-failed-event';
import {
  isActivityTaskScheduledEvent,
  isActivityTaskStartedEvent,
  isMarkerRecordedEvent,
  isNexusOperationCancelRequestedEvent,
  isNexusOperationScheduledEvent,
  isPureWorkflowTaskFailedEvent,
  isSignalExternalWorkflowExecutionInitiatedEvent,
  isStartChildWorkflowExecutionInitiatedEvent,
  isTimerStartedEvent,
  isUpsertWorkflowSearchAttributesEvent,
  isWorkflowExecutionContinuedAsNewEvent,
  isWorkflowExecutionOptionsUpdatedEvent,
  isWorkflowExecutionSignaledEvent,
  isWorkflowExecutionStartedEvent,
  isWorkflowExecutionUpdateAcceptedEvent,
  // isWorkflowExecutionUpdateRejectedEvent,
  isWorkflowTaskCompletedEvent,
} from '$lib/utilities/is-event-type';

export const getEventBillableActions = (event: WorkflowEvent): number => {
  try {
    if (isWorkflowExecutionStartedEvent(event)) return 1;
    if (isActivityTaskScheduledEvent(event)) return 1;
    if (isTimerStartedEvent(event)) return 1;
    if (isWorkflowExecutionSignaledEvent(event)) return 1; // Need to return 0 if it starts a  workflow
    if (isSignalExternalWorkflowExecutionInitiatedEvent(event)) return 1;
    if (isNexusOperationScheduledEvent(event)) return 1;
    if (isNexusOperationCancelRequestedEvent(event)) return 1;
    if (isWorkflowExecutionOptionsUpdatedEvent(event)) return 1;
    if (isWorkflowExecutionUpdateAcceptedEvent(event)) return 1;
    if (isUpsertWorkflowSearchAttributesEvent(event)) return 1;
    if (isWorkflowExecutionContinuedAsNewEvent(event)) return 1;
    // if (isWorkflowExecutionUpdateRejectedEvent(event)) return 1; // Need to figure out how to add this type

    if (isMarkerRecordedEvent(event)) {
      const nonBillable = ['core_patch', 'Version'];
      if (nonBillable.includes(event?.attributes?.markerName)) return 0;
      if (event.attributes?.workflowTaskCompletedEventId) return 1;
    }

    if (isPureWorkflowTaskFailedEvent(event)) {
      if (getErrorCause(event) === 'ResetWorkflow') return 1;
    }

    if (isStartChildWorkflowExecutionInitiatedEvent(event)) return 2;

    if (isActivityTaskStartedEvent(event)) {
      const attempts = event.attributes?.attempt || 1;
      return attempts - 1;
    }

    if (isWorkflowTaskCompletedEvent(event)) {
      return Math.min(
        event.attributes?.meteringMetadata
          ?.nonfirstLocalActivityExecutionAttempts || 0,
        100,
      );
    }

    return 0;
  } catch {
    return 0;
  }
};
