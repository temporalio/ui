<script lang="ts">
  import type { WorkflowHeader } from '$lib/stores/workflow-table-columns';
  import { workflowCount } from '$lib/stores/workflows';
  import { supportsAdvancedVisibilityWithOrderBy } from '$lib/stores/advanced-visibility';

  import ExecutionStatusDropdownFilter from '$lib/components/workflow/dropdown-filter/workflow-status.svelte';
  import WorkflowIdDropdownFilter from '$lib/components/workflow/dropdown-filter/workflow-id.svelte';
  import WorkflowTypeDropdownFilter from '$lib/components/workflow/dropdown-filter/workflow-type.svelte';
  import StartTimeDropdownFilter from '$lib/components/workflow/dropdown-filter/start-time.svelte';
  import EndTimeDropdownFilter from '$lib/components/workflow/dropdown-filter/end-time.svelte';

  export let column: WorkflowHeader;
  $: sortDisabled =
    $workflowCount?.totalCount >= 1000000 ||
    !$supportsAdvancedVisibilityWithOrderBy;

  $: ({ label } = column);
</script>

<th class="workflows-summary-table-header-cell">
  {#if label === 'Status'}
    <ExecutionStatusDropdownFilter />
  {:else if label === 'Workflow ID'}
    <WorkflowIdDropdownFilter />
  {:else if label === 'Type'}
    <WorkflowTypeDropdownFilter />
  {:else if label === 'Start'}
    <StartTimeDropdownFilter disabled={sortDisabled} />
  {:else if label === 'End'}
    <EndTimeDropdownFilter disabled={sortDisabled} />
  {:else}
    {label}
  {/if}
</th>

<style lang="postcss">
  .workflows-summary-table-header-cell {
    @apply whitespace-nowrap px-2 text-left font-secondary text-sm font-medium h-10;
  }
</style>
