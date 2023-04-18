import type { EventType } from '$lib/types/events';

export type EventClassification = (typeof eventClassifications)[number];

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

export const getEventClassification = (
  eventType: EventType,
): EventClassification => {
  if (eventType.includes('RequestCancel')) return 'CancelRequested';

  for (const classification of eventClassifications) {
    if (eventType.includes(classification)) return classification;
  }
};
