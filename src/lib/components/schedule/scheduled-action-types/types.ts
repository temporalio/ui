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

export type ScheduledActionFormAdapterProps = {
  resolvedAction: ResolvedScheduledAction;
  customSearchAttributes: SearchAttributes;
  searchAttributes: SearchAttributesSchema;
  onSummaryChange: (summary: ScheduledActionSummaryItem[]) => void;
};

export type ScheduledActionRequestParts = {
  action: ScheduleActionRequest;
  policies: Partial<SchedulePoliciesRequest>;
};

export type ScheduledActionDefinition = {
  type: ScheduledActionType;
  resolve: (
    schedule: DescribeFullSchedule | null,
  ) => ResolvedScheduledAction | null;
  loadFormAdapter: () => Promise<
    Component<
      ScheduledActionFormAdapterProps,
      ScheduledActionForm,
      'searchAttributes'
    >
  >;
  toRequest: (
    data: ScheduledActionFormData,
    resolvedAction: ResolvedScheduledAction,
  ) => Promise<ScheduledActionRequestParts>;
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
