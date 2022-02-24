import { getName } from '$lib/utilities/get-event-name';
import { getGroupId } from './get-group-id';

import {
  isActivityTaskScheduledEvent,
  isMarkerRecordedEvent,
  isSignalExternalWorkflowExecutionInitiatedEvent,
  isStartChildWorkflowExecutionInitiatedEvent,
  isTimerStartedEvent,
} from '$lib/utilities/is-event-type';

type StartingEvents = {
  Activity: ActivityTaskScheduledEvent;
  ChildWorkflow: StartChildWorkflowExecutionInitiatedEvent;
  Timer: TimerStartedEvent;
  Signal: SignalExternalWorkflowExecutionInitiatedEvent;
  Marker: MarkerRecordedEvent;
};

const createGroupFor = <K extends keyof StartingEvents>(
  event: StartingEvents[K],
): CompactEventGroup => {
  const id = getGroupId(event);
  const name = getName(event);

  const events = new Map<EventType, HistoryEventWithId>();

  events.set(event.eventType, event);

  return { id, name, events };
};

export const createEventGroup = (event: CommonHistoryEvent) => {
  if (isActivityTaskScheduledEvent(event))
    return createGroupFor<'Activity'>(event);

  if (isStartChildWorkflowExecutionInitiatedEvent(event))
    return createGroupFor<'ChildWorkflow'>(event);

  if (isTimerStartedEvent(event)) return createGroupFor<'Timer'>(event);

  if (isSignalExternalWorkflowExecutionInitiatedEvent(event))
    return createGroupFor<'Signal'>(event);

  if (isMarkerRecordedEvent(event)) return createGroupFor<'Marker'>(event);
};
