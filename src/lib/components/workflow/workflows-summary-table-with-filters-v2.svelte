<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { page } from '$app/stores';

  import { workflowCount } from '$lib/stores/workflows';
  import TableHeaderRow from '$lib/holocene/table-v2/table-header-row.svelte';
  import Table from '$lib/holocene/table-v2/table.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
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
  import { supportsAdvancedVisibilityWithOrderBy } from '$lib/stores/bulk-actions';

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
  export let columns: Array<{
    path: string;
    width?: number;
    resize?: boolean;
  }>;

  $: terminateEnabled = workflowTerminateEnabled($page.data.settings);
  $: cancelEnabled = workflowCancelEnabled($page.data.settings);

  // Disable sort with workflows over 1M or if order by not supported
  $: disabled =
    $workflowCount?.totalCount >= 1000000 ||
    !$supportsAdvancedVisibilityWithOrderBy;

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

<Table id="workflows-table-with-bulk-actions" {columns} {updating}>
  <TableHeaderRow slot="headers">
    {#if bulkActionsEnabled}
      <th style="padding: 0 0.75rem;" class="!sticky left-0 z-20 bg-white">
        {#if !updating}
          <Checkbox
            id="select-visible-workflows"
            onDark
            hoverable
            {checked}
            {indeterminate}
            on:change={handleCheckboxChange}
          />
        {/if}
      </th>
    {/if}
    {#if bulkActionsEnabled && showBulkActions}
      <th
        class="overflow-visible whitespace-nowrap"
        style="grid-column:
              span {columns.length - 1} / span {columns.length -
              1};"
      >
        {#if allSelected}
          <span class="font-semibold">
            All {filteredWorkflowCount} selected
          </span>
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
              testId="bulk-cancel-button"
              disabled={namespaceWriteDisabled}
              on:click={handleBulkCancel}>Request Cancellation</BulkActionButton
            >
          {/if}
          {#if terminateEnabled}
            <BulkActionButton
              variant="destructive"
              testId="bulk-terminate-button"
              disabled={namespaceWriteDisabled}
              on:click={handleBulkTerminate}>Terminate</BulkActionButton
            >
          {/if}
        </div>
      </th>
    {:else}
      <th>
        <ExecutionStatusDropdownFilter />
      </th>
      <th>
        <WorkflowIdDropdownFilter />
      </th>
      <th>
        <WorkflowTypeDropdownFilter />
      </th>
      <th>
        <StartTimeDropdownFilter {disabled} />
      </th>
      <th>
        <EndTimeDropdownFilter {disabled} />
      </th>
      <th class="!sticky right-0 z-20 bg-white">
        <Icon name="vertical-ellipsis" />
      </th>
    {/if}
  </TableHeaderRow>
  <slot />
</Table>
