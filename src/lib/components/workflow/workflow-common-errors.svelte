<script lang="ts" module>
  import { persistStore } from '$lib/stores/persist-store';

  export const dismissedWorkflowCommonErrors = persistStore<boolean>(
    'dismissed-workflow-common-errors',
    false,
    true,
  );
</script>

<script lang="ts">
  import CommonErrorCard from '$lib/components/common-errors/common-error-card.svelte';
  import { translate } from '$lib/i18n/translate';
  import { getWorkflowHistoryController } from '$lib/services/workflow-history-controller.svelte.js';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { getApplicableCommonErrors } from '$lib/utilities/common-error-detection';

  const historyController = getWorkflowHistoryController();
  const events = $derived(historyController.history.events);

  const { workflow } = $derived($workflowRun);
  const firstEvent = $derived(events[0]);
  const errors = $derived(
    workflow ? getApplicableCommonErrors(workflow, firstEvent, events) : [],
  );
  const commonErrorsDismissed = $derived($dismissedWorkflowCommonErrors);

  function dismissCommonErrors() {
    $dismissedWorkflowCommonErrors = true;
  }
</script>

{#if !commonErrorsDismissed}
  <CommonErrorCard
    {errors}
    data-testid="workflow-diagnostics"
    dismissLabel={translate('workflows.dismiss-diagnostics')}
    onDismiss={dismissCommonErrors}
  />
{/if}
