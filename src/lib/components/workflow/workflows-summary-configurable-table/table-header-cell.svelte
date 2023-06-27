<script lang="ts">
  import type { WorkflowHeader } from '$lib/stores/workflow-table-columns';
  import { workflowCount } from '$lib/stores/workflows';
  import { supportsAdvancedVisibilityWithOrderBy } from '$lib/stores/advanced-visibility';

  import ExecutionStatusDropdownFilter from '$lib/components/workflow/dropdown-filter/workflow-status.svelte';
  import StartTimeDropdownFilter from '$lib/components/workflow/dropdown-filter/start-time.svelte';
  import EndTimeDropdownFilter from '$lib/components/workflow/dropdown-filter/end-time.svelte';
  import TextFilter from '$lib/components/workflow/dropdown-filter/text-filter.svelte';
  import LabsModeGuard from '$lib/holocene/labs-mode-guard.svelte';

  export let column: WorkflowHeader;
  $: sortDisabled =
    $workflowCount?.totalCount >= 1000000 ||
    !$supportsAdvancedVisibilityWithOrderBy;

  $: ({ label } = column);
</script>

<th
  class="workflows-summary-table-header-cell"
  data-testid="workflows-summary-table-header-cell-{label}"
>
  <LabsModeGuard>
    <svelte:fragment slot="fallback">
      {#if label === 'Status'}
        <ExecutionStatusDropdownFilter />
      {:else if label === 'Workflow ID'}
        <TextFilter attribute="WorkflowId" />
      {:else if label === 'Run ID'}
        <TextFilter attribute="RunId" />
      {:else if label === 'Type'}
        <TextFilter attribute="WorkflowType" />
      {:else if label === 'Start'}
        <StartTimeDropdownFilter disabled={sortDisabled} />
      {:else if label === 'End'}
        <EndTimeDropdownFilter disabled={sortDisabled} />
      {:else}
        {label}
      {/if}
    </svelte:fragment>
    {label}
  </LabsModeGuard>
</th>

<style lang="postcss">
  .workflows-summary-table-header-cell {
    @apply whitespace-nowrap px-2 text-left font-secondary text-sm font-medium h-10;
  }
</style>
