import { translate } from '$lib/i18n/translate';

import type { ScheduledActionPresentation } from '../../presentation-registry';

import WorkflowFormAdapter from './form/workflow-form-adapter.svelte';
import WorkflowSearchAttributes from './form/workflow-search-attributes.svelte';
import WorkflowDetailsView from './view/workflow-details-view.svelte';
import WorkflowHeader from './view/workflow-header.svelte';
import WorkflowInputCard from './view/workflow-input-card.svelte';
import WorkflowRunsCard from './view/workflow-runs-card.svelte';
import WorkflowSearchAttributesView from './view/workflow-search-attributes-view.svelte';

export const workflowActionPresentation = {
  form: {
    Component: WorkflowFormAdapter,
    searchAttributes: {
      label: () => translate('common.workflows'),
      tabId: 'workflows-tab',
      panelId: 'workflows-panel',
      Component: WorkflowSearchAttributes,
    },
  },
  view: {
    Header: WorkflowHeader,
    Details: WorkflowDetailsView,
    InputCard: WorkflowInputCard,
    RunsCard: WorkflowRunsCard,
    searchAttributes: {
      Component: WorkflowSearchAttributesView,
      getCount: (resolvedAction) =>
        Object.keys(
          resolvedAction.schedule.schedule.action.startWorkflow.searchAttributes
            ?.indexedFields ?? {},
        ).length,
    },
  },
} satisfies ScheduledActionPresentation<'workflow'>;
