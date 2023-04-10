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

{#if label === 'Status'}
  <th class="workflows-summary-table-header-cell">
    <ExecutionStatusDropdownFilter />
  </th>
{:else if label === 'Workflow ID'}
  <th class="workflows-summary-table-header-cell">
    <WorkflowIdDropdownFilter />
  </th>
{:else if label === 'Type'}
  <th class="workflows-summary-table-header-cell">
    <WorkflowTypeDropdownFilter />
  </th>
{:else if label === 'Start'}
  <th class="workflows-summary-table-header-cell">
    <StartTimeDropdownFilter disabled={sortDisabled} />
  </th>
{:else if label === 'End'}
  <th class="workflows-summary-table-header-cell">
    <EndTimeDropdownFilter disabled={sortDisabled} />
  </th>
{:else}
  <th class="workflows-summary-table-header-cell">{label}</th>
{/if}

<style lang="postcss">
  .workflows-summary-table-header-cell {
    @apply whitespace-nowrap px-2 text-left font-secondary text-sm font-medium h-10;
  }
</style>
