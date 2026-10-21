import type {
  DescribeFullSchedule,
  ScheduleActionRequest,
  SchedulePoliciesRequest,
} from '$lib/types/schedule';

import type { FormWorkflowDetails } from './workflow/schema';
import type { ResolvedWorkflowAction } from './workflow/types';

export type ActionFormMode<ExistingSchedule extends DescribeFullSchedule> =
  | { isEditing: false; schedule: null }
  | { isEditing: true; schedule: ExistingSchedule };

export type ScheduledActionFormData = {
  type: 'workflow';
  details: FormWorkflowDetails;
};

export type ScheduledActionType = ScheduledActionFormData['type'];

export type SupportedScheduledAction = ResolvedWorkflowAction;

export type ResolvedScheduledAction =
  | SupportedScheduledAction
  | {
      type: 'unknown';
      isEditing: true;
      schedule: DescribeFullSchedule;
    };

export type ScheduledActionRequest = {
  action: ScheduleActionRequest;
  policies: Partial<SchedulePoliciesRequest>;
};

export type ScheduledActionForm = {
  validate: () => Promise<ScheduledActionFormData | null>;
};

export type ScheduledActionSummaryItem = {
  label: string;
  value: string;
};
