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

export const getEventClassification = (
  event: HistoryEventWithId,
): EventClassification => {
  const eventType = event.eventType.toString();

  if (eventType.includes('RequestCancel')) return 'CancelRequested';
  for (const classification of eventClassifications) {
    if (eventType.includes(classification)) return classification;
  }
};
