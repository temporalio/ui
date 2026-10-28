import type { ScheduleListEntry } from '$lib/types';
import type {
  DescribeFullSchedule,
  ScheduleActionRequest,
  SchedulePoliciesRequest,
  ScheduleResponse,
  StartWorkflowRequest,
} from '$lib/types/schedule';

export type WorkflowScheduledActionRequest = {
  action: ScheduleActionRequest;
  policies: Pick<SchedulePoliciesRequest, 'keepOriginalWorkflowId'>;
};

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
