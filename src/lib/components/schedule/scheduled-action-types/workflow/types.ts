import type { ScheduleListEntry } from '$lib/types';
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

export type WorkflowScheduleListEntry = ScheduleListEntry & {
  info: NonNullable<ScheduleListEntry['info']> & {
    workflowType: NonNullable<
      NonNullable<ScheduleListEntry['info']>['workflowType']
    >;
  };
};
