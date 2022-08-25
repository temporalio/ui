<script>
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
</script>

<Table class="w-full md:table-fixed">
  <TableHeaderRow slot="headers">
    <th class="hidden w-48 md:table-cell">Status</th>
    <th class="hidden md:table-cell md:w-60 xl:w-auto">Workflow ID</th>
    <th class="hidden md:table-cell md:w-60 xl:w-80">Type</th>
    <th class="hidden xl:table-cell xl:w-60">Start</th>
    <th class="hidden xl:table-cell xl:w-60">End</th>
    <th class="table-cell md:hidden" colspan="3">Summary</th>
  </TableHeaderRow>
  <slot />
</Table>
