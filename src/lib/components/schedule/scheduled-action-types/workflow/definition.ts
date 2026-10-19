import { translate } from '$lib/i18n/translate';

import type { ScheduledActionDefinition } from '../types';

import WorkflowSearchAttributes from './workflow-search-attributes.svelte';

export const workflowActionDefinition = {
  searchAttributes: {
    label: () => translate('common.workflows'),
    tabId: 'workflows-tab',
    panelId: 'workflows-panel',
    View: WorkflowSearchAttributes,
  },
} satisfies ScheduledActionDefinition;
