<script lang="ts">
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import WorkflowStatusDropdownFilter from './dropdown-filter/workflow-status.svelte';
  import WorkflowIdDropdownFilter from './dropdown-filter/workflow-id.svelte';
  import WorkflowTypeDropdownFilter from './dropdown-filter/workflow-type.svelte';

  export let updating = false;
</script>

<Table class="w-full md:table-fixed" {updating}>
  <TableHeaderRow slot="headers">
    <th class="table-cell w-48"
      ><div class="flex items-center gap-1">
        <WorkflowStatusDropdownFilter />
      </div>
    </th>
    <th class="table-cell md:w-60 xl:w-auto"
      ><div class="flex items-center gap-1">
        <WorkflowIdDropdownFilter />
      </div>
    </th>
    <th class="table-cell md:w-60 xl:w-80">
      <div class="flex items-center gap-1">
        <WorkflowTypeDropdownFilter />
      </div>
    </th>
    <th class="hidden xl:table-cell xl:w-60">Start</th>
    <th class="hidden xl:table-cell xl:w-60">End</th>
  </TableHeaderRow>
  <slot />
</Table>

<style lang="postcss">
</style>
