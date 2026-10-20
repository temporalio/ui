import type { Component } from 'svelte';

import type { SearchAttributesSchema } from '$lib/stores/search-attributes';
import type {
  DescribeFullSchedule,
  ScheduleActionRequest,
  SchedulePoliciesRequest,
} from '$lib/types/schedule';
import type { SearchAttributes } from '$lib/types/workflows';

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

export type ResolvedScheduledAction = ResolvedWorkflowAction;

export type ScheduledActionResolution<
  Action extends ResolvedScheduledAction = ResolvedScheduledAction,
> =
  | { status: 'known'; action: Action }
  | { status: 'unknown'; schedule: DescribeFullSchedule };

export type ScheduledActionFormAdapterProps<
  Type extends ScheduledActionType = ScheduledActionType,
> = {
  resolvedAction: Extract<ResolvedScheduledAction, { type: Type }>;
  customSearchAttributes: SearchAttributes;
  searchAttributes: SearchAttributesSchema;
  onSummaryChange: (summary: ScheduledActionSummaryItem[]) => void;
};

export type ScheduledActionRequest = {
  action: ScheduleActionRequest;
  policies: Partial<SchedulePoliciesRequest>;
};

export type ScheduledActionDefinition<
  Type extends ScheduledActionType = ScheduledActionType,
> = {
  type: Type;
  resolve: (
    schedule: DescribeFullSchedule,
  ) => Extract<ResolvedScheduledAction, { type: Type; isEditing: true }> | null;
  loadFormAdapter: () => Promise<
    Component<
      ScheduledActionFormAdapterProps<Type>,
      ScheduledActionForm,
      'searchAttributes'
    >
  >;
  toRequest: (
    data: Extract<ScheduledActionFormData, { type: Type }>,
    resolvedAction: Extract<ResolvedScheduledAction, { type: Type }>,
  ) => Promise<ScheduledActionRequest>;
  searchAttributes: {
    label: () => string;
    tabId: string;
    panelId: string;
    View: Component<
      { attributes: SearchAttributesSchema },
      Record<string, unknown>, // we require no exports
      'attributes'
    >;
  };
};

export type ScheduledActionForm = {
  validate: () => Promise<ScheduledActionFormData | null>;
};

export type ScheduledActionSummaryItem = {
  label: string;
  value: string;
};
