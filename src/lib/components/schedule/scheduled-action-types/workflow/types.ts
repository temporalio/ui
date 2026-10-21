import type {
  DescribeFullSchedule,
  ScheduleResponse,
  StartWorkflowRequest,
} from '$lib/types/schedule';

export type WorkflowSchedule = DescribeFullSchedule & {
  schedule: ScheduleResponse & {
    action: { startWorkflow: StartWorkflowRequest };
  };
};

export type ResolvedWorkflowAction = {
  type: 'workflow';
  schedule: WorkflowSchedule | null;
};
