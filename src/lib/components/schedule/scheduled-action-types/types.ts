import type { ScheduleListEntry } from '$lib/types';
import type {
  DescribeFullSchedule,
  ScheduleActionRequest,
  SchedulePoliciesRequest,
} from '$lib/types/schedule';

import type { FormWorkflowDetails } from './workflow/schema';
import type {
  ResolvedWorkflowAction,
  WorkflowScheduleListEntry,
} from './workflow/types';

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

      schedule: DescribeFullSchedule;
    };

export type SupportedScheduledActionListEntry = {
  type: 'workflow';
  schedule: WorkflowScheduleListEntry;
};

export type ResolvedScheduledActionListEntry =
  | SupportedScheduledActionListEntry
  | { type: 'unknown'; schedule: ScheduleListEntry };

export type ScheduledActionRequest = {
  action: ScheduleActionRequest;
  policies: Pick<SchedulePoliciesRequest, 'keepOriginalWorkflowId'>;
};

export type ScheduledActionForm = {
  validate: () => Promise<ScheduledActionFormData | null>;
};

export type ScheduledActionSummaryItem = {
  label: string;
  value: string;
};
