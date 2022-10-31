<script lang="ts">
  import BulkActionButton from '$lib/holocene/table/bulk-action-button.svelte';
  import SelectableTable from '$lib/holocene/table/selectable-table.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    bulkTerminate: { selectedWorkflows: WorkflowExecution[] };
  }>();

  export let bulkActionsEnabled: boolean;
  export let updating = false;
  export let visibleWorkflows: WorkflowExecution[];
  export let selectedWorkflows: WorkflowExecution[];

  let allSelected: boolean;

  const handleClickBulkTerminate = () => {
    dispatch('bulkTerminate', { selectedWorkflows });

    allSelected = false;
    selectedWorkflows = [];
  };
</script>

{#if bulkActionsEnabled}
  <SelectableTable
    class="w-full md:table-fixed"
    bind:allSelected
    bind:selectedItems={selectedWorkflows}
    items={visibleWorkflows}
    {updating}
  >
    <svelte:fragment slot="default-headers">
      <th class="hidden w-48 md:table-cell">Status</th>
      <th class="hidden md:table-cell md:w-60 xl:w-auto">Workflow ID</th>
      <th class="hidden md:table-cell md:w-60 xl:w-80">Type</th>
      <th class="hidden xl:table-cell xl:w-60">Start</th>
      <th class="hidden xl:table-cell xl:w-60">End</th>
      <th class="table-cell md:hidden" colspan="3">Summary</th>
    </svelte:fragment>
    <svelte:fragment slot="bulk-action-headers">
      <th class="hidden w-48 md:table-cell">
        <BulkActionButton on:click={handleClickBulkTerminate}
          >Terminate</BulkActionButton
        >
      </th>
      <th class="hidden md:table-cell md:w-60 xl:w-auto" />
      <th class="hidden md:table-cell md:w-60 xl:w-80" />
      <th class="hidden xl:table-cell xl:w-60" />
      <th class="hidden xl:table-cell xl:w-60" />
      <th class="table-cell md:hidden" colspan="3" />
    </svelte:fragment>
    <slot />
  </SelectableTable>
{:else}
  <Table class="w-full md:table-fixed" {updating}>
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
{/if}
