import type { I18nKey } from '$lib/i18n';
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

export type ClassificationTypeOption = {
  label: I18nKey;
  option: typeof eventClassifications | undefined;
  color?: string;
};

export const allClassificationTypeOptions: ClassificationTypeOption[] = [
  { label: 'events.category.all', option: undefined },
  ...eventClassifications.map((classification) => {
    return {
      label: `events.event-classification.${classification.toLowerCase()}`,
      option: classification.toString(),
    };
  }),
];
