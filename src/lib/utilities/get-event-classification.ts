import { format } from './format-camel-case';

export type EventClassification = typeof eventClassifications[number];

export const eventClassifications = [
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

export const isEvent = (event: unknown): event is HistoryEventWithId => {
  if (typeof event !== 'object') return false;
  if (event.hasOwnProperty('eventType')) return true;
  return false;
};

export const isActivity = (
  event: HistoryEventWithId | PendingActivity,
): event is PendingActivity => {
  if (typeof event !== 'object') return false;
  if (event.hasOwnProperty('activityType')) return true;
  return false;
};

export const getEventClassification = (
  event: HistoryEventWithId | PendingActivity,
): EventClassification => {
  let eventType: string;

  if (isEvent(event)) eventType = event.eventType;
  if (isActivity(event)) eventType = event.activityType?.name;

  if (eventType.includes('RequestCancel')) return 'CancelRequested';
  for (const classification of eventClassifications) {
    if (eventType.includes(classification)) return classification;
  }
};

const getName = (event: HistoryEventWithId | PendingActivity): string => {
  if (isEvent(event)) return String(event.eventType);
  if (isActivity(event)) return String(event.activityType.name);
};

const getTime = (event: HistoryEventWithId | PendingActivity): string => {
  if (isEvent(event)) return String(event.eventTime);
  if (isActivity(event)) return String(event.lastStartedTime);
};

const getId = (event: HistoryEventWithId | PendingActivity): string => {
  if (isEvent(event)) return String(event.eventId);
  if (isActivity(event)) return String(event.activityId);
};

export const formatEvent = (event: HistoryEventWithId | PendingActivity) => {
  const name = format(getName(event));
  const timeStamp = getTime(event);
  const classification = getEventClassification(event);
  const tag = getName(event);
  const id = getId(event);

  return {
    id,
    name,
    timeStamp,
    classification,
    tag,
    pending: isActivity(event),
  };
};
