<script lang="ts">
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';

  export let updating: boolean = false;
</script>

<Table class="w-full md:table-fixed" {updating} data-testid="workflows-table">
  <TableHeaderRow slot="headers">
    <th class="w-32 max-md:hidden">Status</th>
    <th class="max-md:hidden md:w-auto">Workflow ID</th>
    <th class="w-60 max-md:hidden">Type</th>
    <th class="w-60 max-xl:hidden">Start</th>
    <th class="w-60 max-xl:hidden">End</th>
    <th class="md:hidden" colspan="3"> Summary </th>
  </TableHeaderRow>
  <slot />
</Table>
