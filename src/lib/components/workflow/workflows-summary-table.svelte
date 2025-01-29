<script lang="ts">
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';

  let { updating = false, children } = $props();
</script>

<Table class="w-full md:table-fixed" {updating} data-testid="workflows-table">
  {#snippet caption()}
    <caption class="sr-only" slot="caption">Workflows</caption>
  {/snippet}
  {#snippet headers()}
    <TableHeaderRow>
      <th class="w-32 max-md:hidden">Status</th>
      <th class="max-md:hidden md:w-auto">Workflow ID</th>
      <th class="w-60 max-md:hidden">Type</th>
      <th class="w-60 max-xl:hidden">Start</th>
      <th class="w-60 max-xl:hidden">End</th>
      <th class="md:hidden" colspan="3"> Summary </th>
    </TableHeaderRow>
  {/snippet}
  {@render children?.()}
</Table>
