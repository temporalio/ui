import type { Component } from 'svelte';

import type { SearchAttributesSchema } from '$lib/stores/search-attributes';

import type { FormWorkflowDetails } from './workflow/schema';

export type ActionFormMode<ExistingAction> =
  | { isEditing: false; existingAction?: never }
  | { isEditing: true; existingAction: ExistingAction };

export type ScheduledActionFormData = {
  type: 'workflow';
  details: FormWorkflowDetails;
};

export type ScheduledActionDefinition = {
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
