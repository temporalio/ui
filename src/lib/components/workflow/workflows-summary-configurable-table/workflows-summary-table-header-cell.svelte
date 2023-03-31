<script lang="ts">
  import type { WorkflowHeader } from '$lib/stores/workflow-table-columns';
  import ExecutionStatusDropdownFilter from '../dropdown-filter/workflow-status.svelte';
  import WorkflowIdDropdownFilter from '../dropdown-filter/workflow-id.svelte';
  import WorkflowTypeDropdownFilter from '../dropdown-filter/workflow-type.svelte';
  import StartTimeDropdownFilter from '../dropdown-filter/start-time.svelte';
  import EndTimeDropdownFilter from '../dropdown-filter/end-time.svelte';

  export let column: WorkflowHeader;
  export let sortDisabled: boolean;

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
