import type { ScheduleActionResult } from '$lib/types';
import type {
  DescribeFullSchedule,
  ScheduleResponse,
  StartWorkflowRequest,
} from '$lib/types/schedule';
import type { WorkflowStatus } from '$lib/types/workflows';

import type { ActionFormMode } from '../types';

export type WorkflowSchedule = DescribeFullSchedule & {
  schedule: ScheduleResponse & {
    action: { startWorkflow: StartWorkflowRequest };
  };
};

export type ResolvedWorkflowAction = {
  type: 'workflow';
} & ActionFormMode<WorkflowSchedule>;

/**
 * A row in the schedule's recent runs list. `status` and `runId` start out as
 * the ones recorded on the action; once visibility answers they are replaced
 * by the matching execution's, which for a continue-as-new chain is the latest
 * run rather than the one the schedule started.
 */
export type RecentWorkflowRun = {
  workflowId: string;
  runId: string;
  actualTime: ScheduleActionResult['actualTime'];
  status: WorkflowStatus;
};

export type RecentWorkflowRunEnriched = RecentWorkflowRun & {
  delayed: boolean;
  taskFailure: boolean;
  inVisibility: boolean;
};
