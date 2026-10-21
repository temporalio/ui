import type {
  DescribeFullSchedule,
  ScheduleResponse,
  StartWorkflowRequest,
} from '$lib/types/schedule';

import type { ActionFormMode } from '../types';

export type WorkflowSchedule = DescribeFullSchedule & {
  schedule: ScheduleResponse & {
    action: { startWorkflow: StartWorkflowRequest };
  };
};

export type ResolvedWorkflowAction = {
  type: 'workflow';
} & ActionFormMode<WorkflowSchedule>;
