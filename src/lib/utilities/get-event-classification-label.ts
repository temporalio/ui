import type { I18nKey } from '$lib/i18n';
import { translate } from '$lib/i18n/translate';
import type { EventClassification } from '$lib/models/event-history/get-event-classification';

type EventClassificationLabelValue =
  | EventClassification
  | 'Pending'
  | 'Retrying';

const eventClassificationLabelKeys: Record<
  EventClassificationLabelValue,
  I18nKey
> = {
  Unspecified: 'events.event-classification.unspecified',
  Scheduled: 'events.event-classification.scheduled',
  Open: 'events.event-classification.open',
  New: 'events.event-classification.new',
  Started: 'events.event-classification.started',
  Initiated: 'events.event-classification.initiated',
  Running: 'events.event-classification.running',
  Completed: 'events.event-classification.completed',
  Fired: 'events.event-classification.fired',
  CancelRequested: 'events.event-classification.cancelrequested',
  TimedOut: 'events.event-classification.timedout',
  Signaled: 'events.event-classification.signaled',
  Canceled: 'events.event-classification.canceled',
  Failed: 'events.event-classification.failed',
  Terminated: 'events.event-classification.terminated',
  Pending: 'events.event-classification.pending',
  Retrying: 'events.event-classification.retrying',
};

const isEventClassification = (
  status: string,
): status is EventClassificationLabelValue =>
  status in eventClassificationLabelKeys;

export const getEventClassificationLabel = (
  classification: EventClassificationLabelValue | undefined,
): string =>
  classification && isEventClassification(classification)
    ? translate(eventClassificationLabelKeys[classification])
    : translate('common.unknown');
