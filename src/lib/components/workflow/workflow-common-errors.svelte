<script lang="ts" module>
  import { persistStore } from '$lib/stores/persist-store';

  export const dismissedWorkflowCommonErrors = persistStore<boolean>(
    'dismissed-workflow-common-errors',
    false,
    true,
  );
</script>

<script lang="ts">
  import { getContext } from 'svelte';

  import CommonErrorCard from '$lib/components/common-errors/common-error-card.svelte';
  import {
    HISTORY_CTX,
    type HistoryContext,
  } from '$lib/contexts/history-context';
  import { translate } from '$lib/i18n/translate';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { getApplicableCommonErrors } from '$lib/utilities/common-error-detection';

  const historyCtx = getContext<HistoryContext>(HISTORY_CTX);
  const events = $derived(historyCtx.history?.events ?? []);

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
