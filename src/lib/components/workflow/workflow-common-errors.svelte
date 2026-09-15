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
  import { fullEventHistory } from '$lib/stores/events';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { getApplicableCommonErrors } from '$lib/utilities/common-error-detection';

  const { workflow } = $derived($workflowRun);
  const firstEvent = $derived($fullEventHistory[0]);
  const errors = $derived(
    workflow
      ? getApplicableCommonErrors(workflow, firstEvent, $fullEventHistory)
      : [],
  );
  const commonErrorsDismissed = $derived($dismissedWorkflowCommonErrors);

  function dismissCommonErrors() {
    $dismissedWorkflowCommonErrors = true;
  }
</script>

{#if !commonErrorsDismissed}
  <CommonErrorCard
    {errors}
    class="max-w-screen-lg xl:w-2/3"
    data-testid="workflow-common-errors"
    dismissLabel={translate('workflows.dismiss-common-errors')}
    onDismiss={dismissCommonErrors}
  />
{/if}
