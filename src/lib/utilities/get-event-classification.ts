import { format } from './format-camel-case';
import { routeFor } from './route-for';
import { getLastEvent } from '$lib/models/group-events/get-last-event';

import type { WorkflowParameters } from './route-for';
import type { Timestamp } from '$types';

export type EventClassification = typeof eventClassifications[number];
type EventOrGroup = HistoryEventWithId | PendingActivity | CompactEventGroup;

type EventSummary = {
  id: string;
  name: string;
  timeStamp: string;
  classification: EventClassification;
  tag: string;
  pending: boolean;
  activity: boolean;
  type: 'event' | 'pending-activity' | 'activity';
  routeFor: (parameters: WorkflowParameters) => string;
};

export const eventClassifications = [
  'Unspecified',
  'Scheduled',
  'Open',
  'New',
  'Started',
  'Initiated',
  'Running',
  'Completed',
  'Fired',
  'CancelRequested',
  'TimedOut',
  'Signaled',
  'Canceled',
  'Failed',
  'Terminated',
] as const;

const has = (target: unknown, property: string): boolean => {
  return Object.prototype.hasOwnProperty.call(target, property);
};

export const isEvent = (event: unknown): event is HistoryEventWithId => {
  if (event === null) return false;
  if (typeof event !== 'object') return false;
  if (Array.isArray(event)) return false;
  if (has(event, 'eventType')) return true;
  return false;
};

export const isPendingActivity = (
  event: EventOrGroup,
): event is PendingActivity => {
  if (event === null) return false;
  if (typeof event !== 'object') return false;
  if (Array.isArray(event)) return false;
  if (has(event, 'activityType')) return true;
  return false;
};

export const isEventGroup = (
  eventOrGroup: EventOrGroup,
): eventOrGroup is CompactEventGroup => {
  return has(eventOrGroup, 'events');
};

export const isEventGroups = (
  eventsOrGroups: unknown[],
): eventsOrGroups is CompactEventGroups => {
  return eventsOrGroups.every(isEventGroup);
};

export const getEventClassification = (
  event: EventOrGroup,
): EventClassification => {
  if (isPendingActivity(event)) return event.state;
  if (isEventGroup(event)) {
    event =
      event.events.get('ActivityTaskScheduled') ??
      event.events.get('TimerStarted') ??
      event.events.get('WorkflowExecutionSignaled') ??
      event.events.get('MarkerRecorded') ??
      event.events.get('StartChildWorkflowExecutionInitiated');
  }

  const eventType = event.eventType;

  if (eventType.includes('RequestCancel')) return 'CancelRequested';
  for (const classification of eventClassifications) {
    if (eventType.includes(classification)) return classification;
  }
};

const getName = (event: EventOrGroup): string => {
  if (isEvent(event)) return String(event.eventType);
  if (isPendingActivity(event))
    return `${event.activityType.name}:${event.state}`;
  if (isEventGroup(event)) return event.name;
};

const getTime = (event: EventOrGroup): string => {
  let ts: Timestamp;

  if (isEvent(event)) ts = event.eventTime;
  if (isPendingActivity(event)) ts = event.lastStartedTime;
  if (isEventGroup(event)) ts = getLastEvent(event).eventTime;

  return ts ? String(ts) : null;
};

const getId = (event: EventOrGroup): string => {
  if (isEvent(event)) return String(event.eventId);
  if (isPendingActivity(event)) return String(event.activityId);
  if (isEventGroup(event)) return String(event.id);
};

const getType = (
  event: EventOrGroup,
): 'event' | 'pending-activity' | 'activity' => {
  if (isEvent(event)) return 'event';
  if (isPendingActivity(event)) return 'pending-activity';
  if (isEventGroup(event)) return 'activity';
};

export const getHref = (
  event: EventOrGroup | PendingActivity,
  parameters: WorkflowParameters,
): string => {
  if (isEvent(event)) {
    const route = routeFor('workflow.events.full.event', {
      ...parameters,
      eventId: String(event.eventId),
    });

    return route;
  }

  if (isPendingActivity(event)) {
    return routeFor('workflow.events.full.pending', {
      ...parameters,
      eventId: String(event.activityId),
    });
  }

  if (isEventGroup(event)) {
    return routeFor('workflow.events.compact.activity', {
      ...parameters,
      eventId: String(event.id),
    });
  }
};

export const formatEvent = (event: EventOrGroup): EventSummary => {
  return {
    id: getId(event),
    name: format(getName(event)),
    timeStamp: getTime(event),
    classification: getEventClassification(event),
    tag: getName(event),
    type: getType(event),
    pending: isPendingActivity(event),
    activity: isEventGroup(event),
    routeFor: (parameters: WorkflowParameters) => getHref(event, parameters),
  };
};
