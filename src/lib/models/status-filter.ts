import type { I18nKey } from '$lib/i18n';
import type { WorkflowStatus } from '$lib/types/workflows';
import { activityStatuses } from '$lib/utilities/get-activity-status-and-count';
import { nexusOperationStatuses } from '$lib/utilities/get-nexus-operation-status-and-count';
import type { StatusAttribute } from '$lib/utilities/query/quick-filter';

import { type WorkerStatus, workerStatuses } from './worker-status';
import { workflowStatuses } from './workflow-status';

export type StatusFilter = {
  attribute: StatusAttribute;
  labelKey: I18nKey;
  statuses: readonly WorkflowStatus[] | readonly WorkerStatus[];
};

const executionStatusFilter = (
  statuses: readonly WorkflowStatus[],
): StatusFilter => ({
  attribute: 'ExecutionStatus',
  labelKey: 'common.execution-status',
  statuses,
});

export const workflowStatusFilter = executionStatusFilter(workflowStatuses);

export const activityStatusFilter = executionStatusFilter(activityStatuses);

export const nexusOperationStatusFilter = executionStatusFilter(
  nexusOperationStatuses,
);

export const workerStatusFilter: StatusFilter = {
  attribute: 'WorkerStatus',
  labelKey: 'common.worker-status',
  statuses: workerStatuses,
};
