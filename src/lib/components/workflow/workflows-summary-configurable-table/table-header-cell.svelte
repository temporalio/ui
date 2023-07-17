<script lang="ts">
  import type { WorkflowHeader } from '$lib/stores/workflow-table-columns';

  import ExecutionStatusDropdownFilter from '$lib/components/workflow/dropdown-filter/workflow-status.svelte';
  import TextFilter from '$lib/components/workflow/dropdown-filter/text-filter.svelte';

  export let column: WorkflowHeader;

  $: ({ label } = column);
</script>

<th
  class="workflows-summary-table-header-cell"
  data-testid="workflows-summary-table-header-cell-{label}"
>
  {#if label === 'Status'}
    <ExecutionStatusDropdownFilter />
  {:else if label === 'Workflow ID'}
    <TextFilter attribute="WorkflowId" />
  {:else if label === 'Run ID'}
    <TextFilter attribute="RunId" />
  {:else if label === 'Type'}
    <TextFilter attribute="WorkflowType" />
  {:else}
    {label}
  {/if}
</th>

<style lang="postcss">
  .workflows-summary-table-header-cell {
    @apply whitespace-nowrap px-2 text-left font-secondary text-sm font-medium h-10;
  }
</style>
