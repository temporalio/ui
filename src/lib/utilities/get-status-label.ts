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

type WorkflowDomainStatus = NonNullable<WorkflowStatus | ScheduleStatus>;
type EventDomainStatus = EventClassification | 'Pending' | 'Retrying';

// Workflow / schedule statuses resolve to the workflows.* namespace.
const workflowStatusLabelKeys: Record<WorkflowDomainStatus, I18nKey> = {
  Running: 'workflows.running',
  TimedOut: 'workflows.timed-out',
  Completed: 'workflows.completed',
  Failed: 'workflows.failed',
  ContinuedAsNew: 'workflows.continued-as-new',
  Canceled: 'workflows.canceled',
  Terminated: 'workflows.terminated',
  Paused: 'workflows.paused',
};

// Event classifications resolve to the events.event-classification.* namespace,
// including names (Running, Completed, …) that also exist as workflow statuses.
const eventClassificationLabelKeys: Record<EventDomainStatus, I18nKey> = {
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

const isWorkflowStatus = (status: string): status is WorkflowDomainStatus =>
  status in workflowStatusLabelKeys;

const isEventClassification = (status: string): status is EventDomainStatus =>
  status in eventClassificationLabelKeys;

/** Label a workflow or schedule status (workflows.* namespace). */
export const getWorkflowStatusLabel = (
  status: WorkflowStatus | ScheduleStatus | undefined,
): string =>
  status && isWorkflowStatus(status)
    ? translate(workflowStatusLabelKeys[status])
    : translate('common.unknown');

/** Label an event classification (events.event-classification.* namespace). */
export const getEventClassificationLabel = (
  classification: EventDomainStatus | undefined,
): string =>
  classification && isEventClassification(classification)
    ? translate(eventClassificationLabelKeys[classification])
    : translate('common.unknown');

/**
 * Polymorphic resolver for WorkflowStatus.svelte, which renders one badge for
 * any status — a workflow execution status, a schedule status, or an event
 * classification — and cannot tell the domain from the value alone. Names
 * shared by both domains (Running, Completed, Failed, Canceled, Terminated,
 * TimedOut) resolve to the workflow label, preserving the component's
 * historical behavior. Domain-specific callers should prefer
 * getWorkflowStatusLabel / getEventClassificationLabel instead.
 */
export const getStatusLabel = (status: Status | undefined): string => {
  if (status && isWorkflowStatus(status)) {
    return translate(workflowStatusLabelKeys[status]);
  }
  if (status && isEventClassification(status)) {
    return translate(eventClassificationLabelKeys[status]);
  }
  return translate('common.unknown');
};
