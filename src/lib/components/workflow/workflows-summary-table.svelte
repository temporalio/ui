<script>
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
</script>

<Table class="w-full">
  <TableHeaderRow slot="headers">
    <th class="hidden md:table-cell w-28">Status</th>
    <th class="hidden md:table-cell md:w-60 xl:w-auto">Workflow ID</th>
    <th class="hidden md:table-cell md:w-60 xl:w-80">Type</th>
    <th class="hidden xl:table-cell xl:w-64">Start</th>
    <th class="hidden xl:table-cell xl:w-64">End</th>
    <th class="table-cell md:hidden" colspan="3">Summary</th>
  </TableHeaderRow>
  <slot />
</Table>
