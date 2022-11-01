<script>
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
</script>

<Table variant="fancy" class="w-full md:table-fixed">
  <TableHeaderRow slot="headers">
    <th class="w-28 md:table-cell">Status</th>
    <th class="md:table-cell md:w-80 xl:w-auto">Schedule Name</th>
    <th class="hidden md:table-cell md:w-60 xl:w-80">Workflow Type</th>
    <th class="hidden xl:table-cell xl:w-60">Recent Runs</th>
    <th class="hidden xl:table-cell xl:w-60">Upcoming Runs</th>
  </TableHeaderRow>
  <slot />
</Table>
