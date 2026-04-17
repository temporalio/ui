<script lang="ts">
  import CommonErrorList from '$lib/components/common-errors/common-error-list.svelte';
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
</script>

{#if errors.length > 0}
  <CommonErrorList
    {errors}
    class="max-w-screen-lg xl:w-2/3"
    data-testid="workflow-common-errors"
  />
{/if}
