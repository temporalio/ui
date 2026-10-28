import type { ScheduleListEntry } from '$lib/types';
import type {
  DescribeFullSchedule,
  ScheduleActionRequest,
  SchedulePoliciesRequest,
} from '$lib/types/schedule';

import type { FormWorkflowDetails } from './workflow/schema';
import type {
  WorkflowSchedule,
  WorkflowScheduleListEntry,
} from './workflow/types';

export type ScheduledActionTypeMap = {
  workflow: {
    details: FormWorkflowDetails;
    schedule: WorkflowSchedule;
    listEntry: WorkflowScheduleListEntry;
  };
};

export type ScheduledActionType = keyof ScheduledActionTypeMap;

export type ScheduledActionFormData<
  Type extends ScheduledActionType = ScheduledActionType,
> = {
  [ActionType in Type]: {
    type: ActionType;
    details: ScheduledActionTypeMap[ActionType]['details'];
  };
}[Type];

export type SupportedScheduledAction<
  Type extends ScheduledActionType = ScheduledActionType,
> = {
  [ActionType in Type]: {
    type: ActionType;
    schedule: ScheduledActionTypeMap[ActionType]['schedule'] | null;
  };
}[Type];

export type ResolvedScheduledAction =
  | SupportedScheduledAction
  | {
      type: 'unknown';

      schedule: DescribeFullSchedule;
    };

export type SupportedScheduledActionListEntry<
  Type extends ScheduledActionType = ScheduledActionType,
> = {
  [ActionType in Type]: {
    type: ActionType;
    schedule: ScheduledActionTypeMap[ActionType]['listEntry'];
  };
}[Type];

export type ResolvedScheduledActionListEntry =
  | SupportedScheduledActionListEntry
  | { type: 'unknown'; schedule: ScheduleListEntry };

export type ScheduledActionRequest = {
  action: ScheduleActionRequest;
  policies: Pick<SchedulePoliciesRequest, 'keepOriginalWorkflowId'>;
};

export type ScheduledActionDefinition<Type extends ScheduledActionType> = {
  type: Type;
  createAction: () => SupportedScheduledAction<Type>;
  resolveSchedule: (
    schedule: DescribeFullSchedule,
  ) => SupportedScheduledAction<Type> | null;
  resolveListEntry: (
    schedule: ScheduleListEntry,
  ) => SupportedScheduledActionListEntry<Type> | null;
  toRequest: (
    actionForm: ScheduledActionFormData<Type>,
    resolvedAction: SupportedScheduledAction<Type>,
  ) => Promise<ScheduledActionRequest>;
};

export type ScheduledActionForm = {
  validate: () => Promise<ScheduledActionFormData | null>;
};

export type ScheduledActionSummaryItem = {
  label: string;
  value: string;
};
