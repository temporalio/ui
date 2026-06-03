import type { I18nKey } from '$lib/i18n';
import { translate } from '$lib/i18n/translate';
import type { EventClassification } from '$lib/models/event-history/get-event-classification';
import type { ScheduleStatus } from '$lib/types/schedule';
import type { WorkflowStatus } from '$lib/types/workflows';

export type Status =
  | WorkflowStatus
  | ScheduleStatus
  | EventClassification
  | 'Pending'
  | 'Retrying';

const statusLabelKeys: Record<Status, I18nKey> = {
  Running: 'workflows.running',
  TimedOut: 'workflows.timed-out',
  Completed: 'workflows.completed',
  Failed: 'workflows.failed',
  ContinuedAsNew: 'workflows.continued-as-new',
  Canceled: 'workflows.canceled',
  Terminated: 'workflows.terminated',
  Paused: 'workflows.paused',
  Scheduled: 'events.event-classification.scheduled',
  Started: 'events.event-classification.started',
  Unspecified: 'events.event-classification.unspecified',
  Open: 'events.event-classification.open',
  New: 'events.event-classification.new',
  Initiated: 'events.event-classification.initiated',
  Fired: 'events.event-classification.fired',
  CancelRequested: 'events.event-classification.cancelrequested',
  Signaled: 'events.event-classification.signaled',
  Pending: 'events.event-classification.pending',
  Retrying: 'events.event-classification.retrying',
};

export const getStatusLabel = (status: Status | undefined): string =>
  status && status in statusLabelKeys
    ? translate(statusLabelKeys[status])
    : translate('common.unknown');
