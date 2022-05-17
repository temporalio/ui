import {
  isActivityTaskScheduledEvent,
  isMarkerRecordedEvent,
  isSignalExternalWorkflowExecutionInitiatedEvent,
  isStartChildWorkflowExecutionInitiatedEvent,
  isWorkflowExecutionSignaledEvent,
  isTimerStartedEvent,
} from '$lib/utilities/is-event-type';
import {
  eventIsFailureOrTimedOut,
  eventIsCanceled,
  eventIsTerminated,
} from './get-event-in-group';

import { getGroupId } from './get-group-id';
import { getEventGroupName } from './get-group-name';
import { getLastEvent } from './get-last-event';

type StartingEvents = {
  Activity: ActivityTaskScheduledEvent;
  ChildWorkflow: StartChildWorkflowExecutionInitiatedEvent;
  Timer: TimerStartedEvent;
  Signal: SignalExternalWorkflowExecutionInitiatedEvent;
  SignalReceived: WorkflowExecutionSignaledEvent;
  Marker: MarkerRecordedEvent;
};

const createGroupFor = <K extends keyof StartingEvents>(
  event: StartingEvents[K],
): EventGroup => {
  const id = getGroupId(event);
  const name = getEventGroupName(event);
  const { timestamp, category, classification } = event;

  const initialEvent = event;

  const events: EventGroup['events'] = new Map();
  const eventIds: EventGroup['eventIds'] = new Set();

  events.set(event.id, event);
  eventIds.add(event.id);

  return {
    id,
    name,
    events,
    eventIds,
    initialEvent,
    timestamp,
    category,
    classification,
    get eventTime() {
      return getLastEvent(this)?.eventTime;
    },
    get attributes() {
      return getLastEvent(this)?.attributes;
    },
    get eventList() {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return Array.from(this.events, ([key, value]) => value);
    },
    get isFailureOrTimedOut() {
      return Boolean(this.eventList.find(eventIsFailureOrTimedOut));
    },
    get isCanceled() {
      return Boolean(this.eventList.find(eventIsCanceled));
    },
    get isTerminated() {
      return Boolean(this.eventList.find(eventIsTerminated));
    },
  };
};

export const createEventGroup = (event: CommonHistoryEvent): EventGroup => {
  if (isActivityTaskScheduledEvent(event))
    return createGroupFor<'Activity'>(event);

  if (isStartChildWorkflowExecutionInitiatedEvent(event))
    return createGroupFor<'ChildWorkflow'>(event);

  if (isTimerStartedEvent(event)) return createGroupFor<'Timer'>(event);

  if (isSignalExternalWorkflowExecutionInitiatedEvent(event))
    return createGroupFor<'Signal'>(event);

  if (isWorkflowExecutionSignaledEvent(event))
    return createGroupFor<'SignalReceived'>(event);

  if (isMarkerRecordedEvent(event)) return createGroupFor<'Marker'>(event);
};
