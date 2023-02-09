<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { page } from '$app/stores';

  import { workflowCount } from '$lib/stores/workflows';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import ExecutionStatusDropdownFilter from './dropdown-filter/workflow-status.svelte';
  import WorkflowIdDropdownFilter from './dropdown-filter/workflow-id.svelte';
  import WorkflowTypeDropdownFilter from './dropdown-filter/workflow-type.svelte';
  import StartTimeDropdownFilter from './dropdown-filter/start-time.svelte';
  import EndTimeDropdownFilter from './dropdown-filter/end-time.svelte';
  import BulkActionButton from '$lib/holocene/table/bulk-action-button.svelte';
  import { coreUserStore } from '$lib/stores/core-user';
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import { workflowTerminateEnabled } from '$lib/utilities/workflow-terminate-enabled';
  import { workflowCancelEnabled } from '$lib/utilities/workflow-cancel-enabled';

  const dispatch = createEventDispatcher<{
    terminateWorkflows: undefined;
    cancelWorkflows: undefined;
    toggleAll: { checked: boolean };
    togglePage: { checked: boolean; visibleWorkflows: WorkflowExecution[] };
  }>();

  export let bulkActionsEnabled: boolean = false;
  export let updating: boolean = false;
  export let visibleWorkflows: WorkflowExecution[];
  export let selectedWorkflowsCount: number;
  export let allSelected: boolean;
  export let pageSelected: boolean;
  export let filteredWorkflowCount: string;

  $: terminateEnabled = workflowTerminateEnabled($page.data.settings);
  $: cancelEnabled = workflowCancelEnabled($page.data.settings);

  // Disable sort with workflows over 1M
  $: disabled = $workflowCount?.totalCount >= 1000000;

  const handleBulkTerminate = () => {
    dispatch('terminateWorkflows');
  };

  const handleBulkCancel = () => {
    dispatch('cancelWorkflows');
  };

  const handleSelectAll = (event: MouseEvent | KeyboardEvent) => {
    if (
      event instanceof MouseEvent ||
      (event instanceof KeyboardEvent && event.key === 'Enter')
    ) {
      dispatch('toggleAll', { checked: true });
    }
  };

  const handleCheckboxChange = (event: CustomEvent<{ checked: boolean }>) => {
    const { checked } = event.detail;
    if (checked) {
      dispatch('togglePage', { checked: true, visibleWorkflows });
    } else {
      dispatch('toggleAll', { checked: false });
    }
  };

  let coreUser = coreUserStore();

  $: namespaceWriteDisabled = $coreUser.namespaceWriteDisabled(
    $page.params.namespace,
  );

  $: checked =
    allSelected ||
    pageSelected ||
    (selectedWorkflowsCount === visibleWorkflows.length &&
      selectedWorkflowsCount !== 0);

  $: showBulkActions = selectedWorkflowsCount > 0 || allSelected;

  $: indeterminate =
    selectedWorkflowsCount > 0 &&
    selectedWorkflowsCount < visibleWorkflows.length;
</script>

{#if bulkActionsEnabled}
  <Table
    id="workflows-table-with-bulk-actions"
    class="w-full min-w-[600px] table-fixed"
    {updating}
  >
    <TableHeaderRow slot="headers">
      <th class="table-cell h-10 w-12">
        <div class="w-12">
          {#if !updating}
            <Checkbox
              id="select-visible-workflows"
              onDark
              {checked}
              {indeterminate}
              on:change={handleCheckboxChange}
            />
          {/if}
        </div>
      </th>
      {#if showBulkActions}
        <th class="w-32 overflow-visible whitespace-nowrap">
          {#if allSelected}
            <span class="font-semibold"
              >All {filteredWorkflowCount} selected</span
            >
          {:else}
            <span class="font-semibold">{selectedWorkflowsCount} selected</span>
            <span>
              (or <button
                data-testid="select-all-workflows"
                on:click={handleSelectAll}
                class="cursor-pointer underline"
                >select all {filteredWorkflowCount}</button
              >)
            </span>
          {/if}
          <div class="ml-4 inline-flex gap-2">
            {#if cancelEnabled}
              <BulkActionButton
                dataCy="bulk-cancel-button"
                disabled={namespaceWriteDisabled}
                on:click={handleBulkCancel}
                >Request Cancellation</BulkActionButton
              >
            {/if}
            {#if terminateEnabled}
              <BulkActionButton
                variant="destructive"
                dataCy="bulk-terminate-button"
                disabled={namespaceWriteDisabled}
                on:click={handleBulkTerminate}>Terminate</BulkActionButton
              >
            {/if}
          </div>
        </th>
        <th class="table-cell md:w-auto" />
        <th class="table-cell xl:w-60" />
        <th class="hidden xl:table-cell xl:w-60" />
        <th class="hidden xl:table-cell xl:w-60" />
      {:else}
        <th class="table-cell w-32"
          ><div class="flex items-center gap-1">
            <ExecutionStatusDropdownFilter />
          </div>
        </th>
        <th class="table-cell md:w-auto"
          ><div class="flex items-center gap-1">
            <WorkflowIdDropdownFilter />
          </div>
        </th>
        <th class="table-cell xl:w-60">
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
      {/if}
    </TableHeaderRow>
    <slot />
  </Table>
{:else}
  <Table class="w-full md:table-fixed" {updating}>
    <TableHeaderRow slot="headers">
      <th class="table-cell w-32"
        ><div class="flex items-center gap-1">
          <ExecutionStatusDropdownFilter />
        </div>
      </th>
      <th class="table-cell md:w-auto"
        ><div class="flex items-center gap-1">
          <WorkflowIdDropdownFilter />
        </div>
      </th>
      <th class="table-cell xl:w-60">
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
{/if}
