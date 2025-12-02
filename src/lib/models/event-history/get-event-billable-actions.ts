import type { WorkflowEvent } from '$lib/types/events';
import { isWorkflowTaskFailedEventDueToReset } from '$lib/utilities/get-workflow-task-failed-event';
import {
  isActivityTaskScheduledEvent,
  isActivityTaskStartedEvent,
  isMarkerRecordedEvent,
  isNexusOperationCancelRequestedEvent,
  isNexusOperationScheduledEvent,
  isStartChildWorkflowExecutionInitiatedEvent,
  isTimerStartedEvent,
  isUpsertWorkflowSearchAttributesEvent,
  isWorkflowExecutionOptionsUpdatedEvent,
  isWorkflowExecutionSignaledEvent,
  isWorkflowExecutionStartedEvent,
  isWorkflowExecutionUpdateAcceptedEvent,
  isWorkflowExecutionUpdateRejectedEvent,
  isWorkflowTaskCompletedEvent,
} from '$lib/utilities/is-event-type';

export const getEventBillableActions = (
  event: WorkflowEvent,
  processedWorkflowTaskIds?: Set<string>,
): number => {
  try {
    if (isWorkflowExecutionStartedEvent(event)) {
      // Charge 2 additional for scheduled workflows if first run and not a retry
      const attempt = event.attributes?.attempt || 1;
      const firstRunId = event.attributes?.firstExecutionRunId;
      const currentRunId = event.attributes?.originalExecutionRunId;
      const isFirstRun = firstRunId === currentRunId;
      const isScheduledFirstRun =
        isFirstRun &&
        event.attributes?.searchAttributes?.indexedFields
          ?.TemporalScheduledById;
      if (attempt > 1) return 0;
      if (isScheduledFirstRun) return 3;
      return 1;
    }
    if (isActivityTaskScheduledEvent(event)) return 1;
    if (isTimerStartedEvent(event)) return 1;
    // Don't charge for signaled with start workflows
    if (isWorkflowExecutionSignaledEvent(event) && event.id !== '2') return 1;
    if (isNexusOperationScheduledEvent(event)) return 1;
    if (isNexusOperationCancelRequestedEvent(event)) return 1;
    if (isWorkflowExecutionUpdateAcceptedEvent(event)) return 1;
    if (isWorkflowExecutionUpdateRejectedEvent(event)) return 1;
    if (isWorkflowExecutionOptionsUpdatedEvent(event)) return 1;

    if (isUpsertWorkflowSearchAttributesEvent(event)) {
      const searchAttributeFields = Object.keys(
        event.attributes.searchAttributes.indexedFields,
      );
      if (
        searchAttributeFields?.length === 1 &&
        event.attributes?.searchAttributes?.indexedFields?.TemporalChangeVersion
      ) {
        // Non-billable search attribute update
        return 0;
      }
      return 1;
    }

    if (isMarkerRecordedEvent(event)) {
      const nonBillable = ['core_patch', 'Version'];
      if (nonBillable.includes(event?.attributes?.markerName)) return 0;

      // Check if any other markers are associated with same workflow task. If so, only charge for one marker, not all of them for the workflow task
      const workflowTaskId = event.attributes?.workflowTaskCompletedEventId;
      if (workflowTaskId && processedWorkflowTaskIds) {
        if (processedWorkflowTaskIds.has(String(workflowTaskId))) {
          return 0;
        }
        processedWorkflowTaskIds.add(String(workflowTaskId));
        return 1;
      }

      if (workflowTaskId) return 1;
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
