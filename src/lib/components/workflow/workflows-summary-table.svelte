<script lang="ts">
  import { workflowCount } from '$lib/stores/workflows';

  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import ExecutionStatusDropdownFilter from './dropdown-filter/workflow-status.svelte';
  import WorkflowIdDropdownFilter from './dropdown-filter/workflow-id.svelte';
  import WorkflowTypeDropdownFilter from './dropdown-filter/workflow-type.svelte';
  import StartTimeDropdownFilter from './dropdown-filter/start-time.svelte';
  import EndTimeDropdownFilter from './dropdown-filter/end-time.svelte';

  export let updating = false;

  // Disable sort with workflows over 10M
  $: disabled = $workflowCount?.totalCount >= 10000000;
</script>

<Table class="w-full md:table-fixed" {updating}>
  <TableHeaderRow slot="headers">
    <th class="table-cell w-48"
      ><div class="flex items-center gap-1">
        <ExecutionStatusDropdownFilter />
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
    <th class="hidden xl:table-cell xl:w-60">
      <div class="flex items-center gap-1">
        <StartTimeDropdownFilter {disabled} />
      </div>
    </th>
    <th class="hidden xl:table-cell xl:w-60">
      <div class="flex items-center gap-1">
        <EndTimeDropdownFilter {disabled} />
      </div>
    </th>
  </TableHeaderRow>
  <slot />
</Table>

<style lang="postcss">
</style>
