import type { Payload } from '$lib/types';
import type {
  ActivityTaskScheduledEvent,
  CommonHistoryEvent,
  MarkerRecordedEvent,
  NexusOperationScheduledEvent,
  SignalExternalWorkflowExecutionInitiatedEvent,
  StartChildWorkflowExecutionInitiatedEvent,
  TimerStartedEvent,
  WorkflowExecutionSignaledEvent,
  WorkflowExecutionUpdateAcceptedEvent,
  WorkflowTaskScheduledEvent,
} from '$lib/types/events';
import {
  isActivityTaskScheduledEvent,
  isLocalActivityMarkerEvent,
  isMarkerRecordedEvent,
  isNexusOperationScheduledEvent,
  isSignalExternalWorkflowExecutionInitiatedEvent,
  isStartChildWorkflowExecutionInitiatedEvent,
  isTimerStartedEvent,
  isWorkflowExecutionSignaledEvent,
  isWorkflowExecutionUpdateAcceptedEvent,
  isWorkflowTaskScheduledEvent,
} from '$lib/utilities/is-event-type';

import type { EventGroup } from './event-groups';
import {
  eventIsCanceled,
  eventIsFailureOrTimedOut,
  eventIsTerminated,
} from './get-event-in-group';
import { getGroupId } from './get-group-id';
import {
  getEventGroupDisplayName,
  getEventGroupLabel,
  getEventGroupName,
} from './get-group-name';
import { getLastEvent } from './get-last-event';

type StartingEvents = {
  Activity: ActivityTaskScheduledEvent;
  ChildWorkflow: StartChildWorkflowExecutionInitiatedEvent;
  Timer: TimerStartedEvent;
  Signal: SignalExternalWorkflowExecutionInitiatedEvent;
  SignalReceived: WorkflowExecutionSignaledEvent;
  LocalActivity: MarkerRecordedEvent;
  Marker: MarkerRecordedEvent;
  Update: WorkflowExecutionUpdateAcceptedEvent;
  WorkflowTask: WorkflowTaskScheduledEvent;
  Nexus: NexusOperationScheduledEvent;
};

const createGroupFor = <K extends keyof StartingEvents>(
  event: StartingEvents[K] & { userMetadata?: { summary: Payload } },
): EventGroup => {
  const id = getGroupId(event);
  const name = getEventGroupName(event);
  const label = getEventGroupLabel(event);
  const displayName = getEventGroupDisplayName(event);
  const { timestamp, category, classification } = event;

  // Single flat array — no Map, no Set, no closure cache.
  // Groups have 1–5 events so array ops are O(1) in practice.
  const eventList: EventGroup['eventList'] = [event as never];

  return {
    id,
    name,
    label,
    displayName,
    eventList,
    initialEvent: event,
    timestamp,
    category: isLocalActivityMarkerEvent(event) ? 'local-activity' : category,
    classification,
    level: undefined,
    pendingActivity: undefined,
    pendingNexusOperation: undefined,
    userMetadata: event?.userMetadata,
    get eventTime() {
      return this.lastEvent?.eventTime;
    },
    get attributes() {
      return getLastEvent(this)?.attributes;
    },
    get links() {
      const out = [];
      for (const e of eventList) for (const l of e.links) out.push(l);
      return out;
    },
    get lastEvent() {
      return getLastEvent(this);
    },
    get finalClassification() {
      return getLastEvent(this).classification;
    },
    get isPending() {
      return (
        !!this.pendingActivity ||
        !!this.pendingNexusOperation ||
        (isTimerStartedEvent(this.initialEvent) && eventList.length === 1) ||
        (isStartChildWorkflowExecutionInitiatedEvent(this.initialEvent) &&
          eventList.length === 2)
      );
    },
    get isFailureOrTimedOut() {
      return Boolean(eventList.find(eventIsFailureOrTimedOut));
    },
    get isCanceled() {
      return Boolean(eventList.find(eventIsCanceled));
    },
    get isTerminated() {
      return Boolean(eventList.find(eventIsTerminated));
    },
    get billableActions() {
      let n = 0;
      for (const e of eventList) n += e.billableActions;
      return n;
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

  if (isMarkerRecordedEvent(event)) {
    if (isLocalActivityMarkerEvent(event)) {
      return createGroupFor<'LocalActivity'>(event);
    }
    return createGroupFor<'Marker'>(event);
  }

  if (isWorkflowExecutionUpdateAcceptedEvent(event))
    return createGroupFor<'Update'>(event);

  if (isNexusOperationScheduledEvent(event))
    return createGroupFor<'Nexus'>(event);
};

export const createWorkflowTaskGroup = (
  event: CommonHistoryEvent,
): EventGroup => {
  if (isWorkflowTaskScheduledEvent(event))
    return createGroupFor<'WorkflowTask'>(event);
};
