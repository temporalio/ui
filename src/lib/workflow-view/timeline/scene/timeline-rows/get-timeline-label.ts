import { formatDurationAbbreviated } from '$lib/utilities/format-time';
import { isLocalActivityMarkerEvent } from '$lib/utilities/is-event-type';

import type { QualifiedHistoryEvent } from '../../../data/history-events/types';
import type { LifecycleGroup } from '../../../data/lifecycle-groups/types';

/** Names a lifecycle from its kind and initiating event. */
export function getTimelineLabel({
  lifecycleGroup,
  event,
}: {
  lifecycleGroup: LifecycleGroup;
  event: QualifiedHistoryEvent;
}): string {
  if (lifecycleGroup.kind === 'workflow') {
    return 'Workflow Execution';
  }

  switch (event.eventType) {
    case 'ActivityTaskScheduled': {
      return (
        event.activityTaskScheduledEventAttributes?.activityType?.name ||
        'Activity'
      );
    }

    case 'TimerStarted': {
      const attributes = event.timerStartedEventAttributes;
      const duration = attributes?.startToFireTimeout
        ? formatDurationAbbreviated(String(attributes.startToFireTimeout))
        : '';
      return (
        [attributes?.timerId, duration && `(${duration})`]
          .filter(Boolean)
          .join(' ') || 'Timer'
      );
    }

    case 'SignalExternalWorkflowExecutionInitiated': {
      return (
        event.signalExternalWorkflowExecutionInitiatedEventAttributes
          ?.signalName || 'Signal'
      );
    }

    case 'WorkflowExecutionSignaled': {
      return (
        event.workflowExecutionSignaledEventAttributes?.signalName ||
        'Signal received'
      );
    }

    case 'MarkerRecorded': {
      return isLocalActivityMarkerEvent(event)
        ? 'Local Activity'
        : event.markerRecordedEventAttributes?.markerName || 'Marker';
    }

    case 'StartChildWorkflowExecutionInitiated': {
      return (
        event.startChildWorkflowExecutionInitiatedEventAttributes?.workflowType
          ?.name || 'Child Workflow'
      );
    }

    case 'WorkflowExecutionUpdateAccepted': {
      return (
        event.workflowExecutionUpdateAcceptedEventAttributes?.acceptedRequest
          ?.input?.name || 'Workflow Update'
      );
    }

    case 'NexusOperationScheduled': {
      const attributes = event.nexusOperationScheduledEventAttributes;
      return (
        [attributes?.service, attributes?.operation]
          .filter(Boolean)
          .join('.') || 'Nexus Operation'
      );
    }

    default: {
      return event.eventType.replace(/([a-z])([A-Z])/g, '$1 $2');
    }
  }
}
