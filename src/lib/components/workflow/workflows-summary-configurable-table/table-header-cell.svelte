<script lang="ts">
  import type { WorkflowHeader } from '$lib/stores/workflow-table-columns';

  export let column: WorkflowHeader;

  $: ({ label } = column);
</script>

<th
  class="workflows-summary-table-header-cell"
  data-testid="workflows-summary-table-header-cell-{label}"
>
  {label}
</th>

<style lang="postcss">
  .workflows-summary-table-header-cell {
    @apply whitespace-nowrap px-2 text-left text-sm font-medium;
  }
</style>
