import { translate } from '$lib/i18n/translate';

import type { ScheduledActionDefinition } from '../types';
import { toWorkflowScheduleRequest } from './request-mappings';
import { resolveWorkflowAction } from './workflow-form-mode';

import WorkflowDetailsView from './workflow-details-view.svelte';
import WorkflowFormAdapter from './workflow-form-adapter.svelte';
import WorkflowInputCard from './workflow-input-card.svelte';
import WorkflowSearchAttributes from './workflow-search-attributes.svelte';

export const workflowActionDefinition = {
  type: 'workflow',
  resolve: resolveWorkflowAction,
  FormAdapter: WorkflowFormAdapter,
  views: {
    Details: WorkflowDetailsView,
    Input: WorkflowInputCard,
  },
  toRequest: toWorkflowScheduleRequest,
  searchAttributes: {
    label: () => translate('common.workflows'),
    tabId: 'workflows-tab',
    panelId: 'workflows-panel',
    View: WorkflowSearchAttributes,
  },
} satisfies ScheduledActionDefinition<'workflow'>;
