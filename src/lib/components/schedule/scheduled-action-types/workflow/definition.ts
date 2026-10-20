import { translate } from '$lib/i18n/translate';

import type { ScheduledActionDefinition } from '../types';
import { toWorkflowScheduleRequest } from './request-mappings';
import { resolveWorkflowAction } from './workflow-form-mode';

import WorkflowSearchAttributes from './workflow-search-attributes.svelte';

export const workflowActionDefinition = {
  type: 'workflow',
  resolve: resolveWorkflowAction,
  loadFormAdapter: async () =>
    (await import('./workflow-form-adapter.svelte')).default,
  toRequest: toWorkflowScheduleRequest,
  searchAttributes: {
    label: () => translate('common.workflows'),
    tabId: 'workflows-tab',
    panelId: 'workflows-panel',
    View: WorkflowSearchAttributes,
  },
} satisfies ScheduledActionDefinition<'workflow'>;
