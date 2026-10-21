import type { Component } from 'svelte';

import type { SearchAttributesSchema } from '$lib/stores/search-attributes';
import type { SearchAttributes } from '$lib/types/workflows';

import type {
  ScheduledActionForm,
  ScheduledActionSummaryItem,
  ScheduledActionType,
  SupportedScheduledAction,
} from './types';
import { workflowActionPresentation } from './workflow/presentation';

type ActionFormProps<Type extends ScheduledActionType> = {
  resolvedAction: Extract<SupportedScheduledAction, { type: Type }>;
  customSearchAttributes: SearchAttributes;
  searchAttributes: SearchAttributesSchema;
  onSummaryChange: (summary: ScheduledActionSummaryItem[]) => void;
};

type ActionViewProps<Type extends ScheduledActionType> = {
  schedule: NonNullable<
    Extract<SupportedScheduledAction, { type: Type }>['schedule']
  >;
  namespace: string;
  scheduleId: string;
};

export type ScheduledActionPresentation<Type extends ScheduledActionType> = {
  form: {
    Component: Component<
      ActionFormProps<Type>,
      ScheduledActionForm,
      'searchAttributes'
    >;
    searchAttributes: {
      label: () => string;
      tabId: string;
      panelId: string;
      Component: Component<
        { attributes: SearchAttributesSchema },
        Record<string, never>,
        'attributes'
      >;
    };
  };
  view: {
    AdvancedSettings: Component<ActionViewProps<Type>>;
    Header: Component<ActionViewProps<Type>>;
    Details: Component<ActionViewProps<Type>>;
    InputCard: Component<ActionViewProps<Type>>;
    searchAttributes: {
      Component: Component<ActionViewProps<Type>>;
      getCount: (schedule: ActionViewProps<Type>['schedule']) => number;
    };
    RunsCard: Component<
      ActionViewProps<Type> & {
        openBackfillConfirmationModal: () => void;
        openTriggerConfirmationModal: () => void;
      }
    >;
  };
};

export const scheduledActionPresentations: {
  [Type in ScheduledActionType]: ScheduledActionPresentation<Type>;
} = {
  workflow: workflowActionPresentation,
};
