<script lang="ts">
  import { page } from '$app/stores';
  import BulkActionButton from '$lib/holocene/table/bulk-action-button.svelte';
  import SelectableTable from '$lib/holocene/table/selectable-table.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { coreUserStore } from '$lib/stores/core-user';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ terminateWorkflows: undefined }>();

  export let bulkActionsEnabled: boolean = false;
  export let updating: boolean = false;
  export let visibleWorkflows: WorkflowExecution[] = [];
  export let selectedWorkflows: WorkflowExecution[] = [];
  export let terminableWorkflowCount: number = 0;
  export let allSelected: boolean = false;

  const handleBulkTerminate = () => {
    dispatch('terminateWorkflows');
  };

  let coreUser = coreUserStore();
  $: terminateDisabled = $coreUser.terminateDisabled($page.params.namespace);
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
      <th class="hidden w-32 md:table-cell">Status</th>
      <th class="hidden h-10 md:table-cell md:w-60 xl:w-auto">Workflow ID</th>
      <th class="hidden md:table-cell md:w-60 xl:w-80">Type</th>
      <th class="hidden xl:table-cell xl:w-60">Start</th>
      <th class="hidden xl:table-cell xl:w-60">End</th>
      <th class="table-cell md:hidden" colspan="3">Summary</th>
    </svelte:fragment>
    <svelte:fragment slot="bulk-action-headers">
      <th class="inline-block w-32 md:table-cell">
        <span class="font-semibold">{selectedWorkflows.length} selected</span>
      </th>
      <th class="h-10 md:w-60 xl:w-auto">
        {#if terminableWorkflowCount > 0}
          <BulkActionButton
            dataCy="bulk-terminate-button"
            disabled={terminateDisabled}
            on:click={handleBulkTerminate}>Terminate</BulkActionButton
          >
        {:else}
          <span class="whitespace-nowrap italic"
            >No bulk actions available for selected workflows.</span
          >
        {/if}
      </th>
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
      <th class="hidden w-32 md:table-cell">Status</th>
      <th class="hidden md:table-cell md:w-60 xl:w-auto">Workflow ID</th>
      <th class="hidden md:table-cell md:w-60 xl:w-80">Type</th>
      <th class="hidden xl:table-cell xl:w-60">Start</th>
      <th class="hidden xl:table-cell xl:w-60">End</th>
      <th class="table-cell md:hidden" colspan="3">Summary</th>
    </TableHeaderRow>
    <slot />
  </Table>
{/if}
