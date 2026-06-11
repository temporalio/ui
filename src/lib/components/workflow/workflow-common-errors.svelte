<script lang="ts" module>
  import { persistStore } from '$lib/stores/persist-store';

  export const dismissedWorkflowCommonErrors = persistStore<boolean>(
    'dismissed-workflow-common-errors',
    false,
    true,
  );
</script>

<script lang="ts">
  import CommonErrorList from '$lib/components/common-errors/common-error-list.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
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

{#if errors.length > 0 && !commonErrorsDismissed}
  <section
    aria-labelledby="workflow-common-errors-title"
    class="border-subtle bg-primary max-w-screen-lg border p-3 xl:w-2/3"
    data-testid="workflow-common-errors"
  >
    <div class="mb-3 flex items-center justify-between gap-2">
      <h5 id="workflow-common-errors-title">Common Errors</h5>
      <Tooltip text={translate('common.dismiss')} left>
        <Button
          aria-label={translate('workflows.dismiss-common-errors')}
          class="h-8 w-8 shrink-0 p-0"
          disableTracking={true}
          leadingIcon="close"
          size="xs"
          variant="ghost"
          on:click={dismissCommonErrors}
        >
          <span class="sr-only">
            {translate('workflows.dismiss-common-errors')}
          </span>
        </Button>
      </Tooltip>
    </div>
    <CommonErrorList {errors} class="gap-3" />
  </section>
{/if}
