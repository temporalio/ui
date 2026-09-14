import type { I18nKey } from '$lib/i18n';
import { translate } from '$lib/i18n/translate';
import type { ScheduleStatus } from '$lib/types/schedule';
import type { WorkflowStatus } from '$lib/types/workflows';

type WorkflowStatusLabelValue = NonNullable<WorkflowStatus | ScheduleStatus>;

const workflowStatusLabelKeys: Record<WorkflowStatusLabelValue, I18nKey> = {
  Running: 'workflows.running',
  TimedOut: 'workflows.timed-out',
  Completed: 'workflows.completed',
  Failed: 'workflows.failed',
  ContinuedAsNew: 'workflows.continued-as-new',
  Canceled: 'workflows.canceled',
  Terminated: 'workflows.terminated',
  Paused: 'workflows.paused',
};

const isWorkflowStatus = (status: string): status is WorkflowStatusLabelValue =>
  status in workflowStatusLabelKeys;

export const getWorkflowStatusLabel = (
  status: WorkflowStatus | ScheduleStatus | undefined,
): string =>
  status && isWorkflowStatus(status)
    ? translate(workflowStatusLabelKeys[status])
    : translate('common.unknown');
