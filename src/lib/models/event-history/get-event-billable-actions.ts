import type { WorkflowEvent } from '$lib/types/events';
import { isWorkflowTaskFailedEventDueToReset } from '$lib/utilities/get-workflow-task-failed-event';
import {
  isActivityTaskScheduledEvent,
  isActivityTaskStartedEvent,
  isMarkerRecordedEvent,
  isNexusOperationCancelRequestedEvent,
  isNexusOperationScheduledEvent,
  isSignalExternalWorkflowExecutionInitiatedEvent,
  isStartChildWorkflowExecutionInitiatedEvent,
  isTimerStartedEvent,
  isUpsertWorkflowSearchAttributesEvent,
  isWorkflowExecutionContinuedAsNewEvent,
  isWorkflowExecutionOptionsUpdatedEvent,
  isWorkflowExecutionSignaledEvent,
  isWorkflowExecutionStartedEvent,
  isWorkflowExecutionUpdateAcceptedEvent,
  isWorkflowExecutionUpdateRejectedEvent,
  isWorkflowTaskCompletedEvent,
} from '$lib/utilities/is-event-type';

export const getEventBillableActions = (event: WorkflowEvent): number => {
  try {
    if (isWorkflowExecutionStartedEvent(event)) return 1;
    if (isActivityTaskScheduledEvent(event)) return 1;
    if (isTimerStartedEvent(event)) return 1;
    if (isWorkflowExecutionSignaledEvent(event) && event.id !== '2') return 1;
    if (isSignalExternalWorkflowExecutionInitiatedEvent(event)) return 1;
    if (isNexusOperationScheduledEvent(event)) return 1;
    if (isNexusOperationCancelRequestedEvent(event)) return 1;
    if (isWorkflowExecutionUpdateAcceptedEvent(event)) return 1;
    if (isWorkflowExecutionContinuedAsNewEvent(event)) return 1;
    if (isWorkflowExecutionUpdateRejectedEvent(event)) return 1;
    if (isUpsertWorkflowSearchAttributesEvent(event)) {
      const searchAttributeFields = Object.keys(
        event.searchAttributes.indexedFields,
      );
      if (
        searchAttributeFields?.length === 1 &&
        !!event.searchAttributes.indexedFields?.TemporalChangeVersion
      ) {
        // Non-billable search attribute update
        return 0;
      }
      return 1;
    }
    if (
      isWorkflowExecutionOptionsUpdatedEvent(event) &&
      (!!event.attributes?.versioningOverride ||
        event?.attributes.unsetVersioningOverride) &&
      (!!event.attributes.attachedCompletionCallbacks ||
        !!event.attributes.attachedRequestId)
    )
      // Non-billable async callback
      return 1;

    if (isMarkerRecordedEvent(event)) {
      const nonBillable = ['core_patch', 'Version'];
      if (nonBillable.includes(event?.attributes?.markerName)) return 0;
      if (event.attributes?.workflowTaskCompletedEventId) return 1;
    }

    if (isWorkflowTaskFailedEventDueToReset(event)) return 1;

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
