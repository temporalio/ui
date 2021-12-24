import { format } from './format-camel-case';

export type EventClassification = typeof eventClassifications[number];

type EventSummary = {
  id: string;
  name: string;
  timeStamp: string;
  classification: EventClassification;
  tag: string;
  pending: boolean;
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

export const isActivity = (
  event: HistoryEventWithId | PendingActivity,
): event is PendingActivity => {
  if (event === null) return false;
  if (typeof event !== 'object') return false;
  if (Array.isArray(event)) return false;
  if (has(event, 'activityType')) return true;
  return false;
};

export const getEventClassification = (
  event: HistoryEventWithId | PendingActivity,
): EventClassification => {
  if (isActivity(event)) return event.state;

  const eventType = event.eventType;

  if (eventType.includes('RequestCancel')) return 'CancelRequested';
  for (const classification of eventClassifications) {
    if (eventType.includes(classification)) return classification;
  }
};

const getName = (event: HistoryEventWithId | PendingActivity): string => {
  if (isEvent(event)) return String(event.eventType);
  if (isActivity(event)) return `${event.activityType.name}:${event.state}`;
};

const getTime = (event: HistoryEventWithId | PendingActivity): string => {
  if (isEvent(event)) return String(event.eventTime);
  if (isActivity(event)) return String(event.lastStartedTime);
};

const getId = (event: HistoryEventWithId | PendingActivity): string => {
  if (isEvent(event)) return String(event.eventId);
  if (isActivity(event)) return String(event.activityId);
};

export const formatEvent = (
  event: HistoryEventWithId | PendingActivity,
): EventSummary => {
  return {
    id: getId(event),
    name: format(getName(event)),
    timeStamp: getTime(event),
    classification: getEventClassification(event),
    tag: getName(event),
    pending: isActivity(event),
  };
};
