<script>
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
</script>

<Table class="table-fixed">
  <TableHeaderRow slot="headers">
    <th class="w-28">Status</th>
    <th class="md:w-80 xl:w-auto">Schedule Name</th>
    <th class="w-60 max-md:hidden xl:w-80">Workflow Type</th>
    <th class="w-56 max-xl:hidden">Recent Runs</th>
    <th class="w-56 max-xl:hidden">Upcoming Runs</th>
  </TableHeaderRow>
  <slot />
</Table>
