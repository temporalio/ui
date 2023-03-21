<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Table from '$lib/holocene/table-v2/table.svelte';
  import TableHeaderRow from '$lib/holocene/table-v2/table-header-row.svelte';
  import TableRow from '$lib/holocene/table-v2/table-row.svelte';
  import { page } from '$app/stores';
  import IconButton from '$lib/holocene/icon-button.svelte';
  import { routeForEventHistory } from '$lib/utilities/route-for';
  import {
    supportsAdvancedVisibility,
    supportsAdvancedVisibilityWithOrderBy,
  } from '$lib/stores/bulk-actions';
  import { bulkActionsEnabled as workflowBulkActionsEnabled } from '$lib/utilities/bulk-actions-enabled';
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import {
    workflowTableColumns,
    addColumn,
    removeColumn,
    moveColumn,
    pinColumn,
  } from '$lib/stores/workflow-table-columns';
  import Drawer from '$lib/holocene/drawer.svelte';
  import OrderableList from '$lib/holocene/orderable-list.svelte';
  import {
    loading,
    updating,
    workflowError,
    workflowCount,
  } from '$lib/stores/workflows';
  import Loading from '$lib/holocene/loading.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import WorkflowsSummaryTableBodyCell from './workflows-summary-table-body-cell.svelte';
  import WorkflowsSummaryTableHeaderCell from './workflows-summary-table-header-cell.svelte';
  import { workflowTerminateEnabled } from '$lib/utilities/workflow-terminate-enabled';
  import { workflowCancelEnabled } from '$lib/utilities/workflow-cancel-enabled';
  import { coreUserStore } from '$lib/stores/core-user';
  import BulkActionButton from '$lib/holocene/table/bulk-action-button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { goto } from '$app/navigation';

  const dispatch = createEventDispatcher<{
    terminateWorkflows: undefined;
    cancelWorkflows: undefined;
    selectAll: { checked: boolean };
    togglePage:
      | { checked: true; workflows: WorkflowExecution[] }
      | { checked: false };
  }>();

  export let workflows: WorkflowExecution[];
  export let filteredWorkflowCount: string;
  export let selectedWorkflows: WorkflowExecution[];
  export let allSelected: boolean;
  export let pageSelected: boolean;

  let coreUser = coreUserStore();
  let customizationDrawerOpen: boolean = false;
  let resizableTableWrapper: HTMLDivElement;

  $: namespace = $page.params.namespace;
  $: selectedWorkflowsCount = selectedWorkflows.length;
  $: showBulkActions = selectedWorkflowsCount > 0;
  $: terminateEnabled = workflowTerminateEnabled($page.data.settings);
  $: cancelEnabled = workflowCancelEnabled($page.data.settings);

  $: sortDisabled =
    $workflowCount?.totalCount >= 1000000 ||
    !$supportsAdvancedVisibilityWithOrderBy;

  $: indeterminate =
    selectedWorkflows.length > 0 && selectedWorkflows.length < workflows.length;

  $: bulkActionsEnabled = workflowBulkActionsEnabled(
    $page.data.settings,
    $supportsAdvancedVisibility,
  );

  $: namespaceWriteDisabled = $coreUser.namespaceWriteDisabled(
    $page.params.namespace,
  );

  $: checked =
    allSelected ||
    pageSelected ||
    (selectedWorkflowsCount === workflows.length &&
      selectedWorkflowsCount !== 0);

  $: pinnedColumns = $workflowTableColumns.columns.filter(
    (column) => column.pinned,
  );

  $: otherColumns = $workflowTableColumns.columns.filter(
    (column) => !column.pinned,
  );

  const openCustomizationDrawer = () => {
    customizationDrawerOpen = true;
  };

  const closeCustomizationDrawer = () => {
    customizationDrawerOpen = false;
  };

  const handleSelectAll = (event: MouseEvent | KeyboardEvent) => {
    if (
      event instanceof MouseEvent ||
      (event instanceof KeyboardEvent && event.key === 'Enter')
    ) {
      dispatch('selectAll');
    }
  };

  const handleCheckboxChange = (event: CustomEvent<{ checked: boolean }>) => {
    const { checked } = event.detail;
    dispatch('togglePage', { checked, ...(checked && { workflows }) });
  };

  const goToWorkflow = (workflow: WorkflowExecution) => {
    goto(
      routeForEventHistory({
        namespace,
        workflow: workflow.id,
        run: workflow.runId,
      }),
    );
  };

  let mousePos;
  const resize = (event: MouseEvent) => {
    const dx = -mousePos - event.x;
    mousePos = event.x;
    resizableTableWrapper.style.width =
      parseInt(getComputedStyle(resizableTableWrapper, '').width) + dx + 'px';
  };

  const handleStartResize = (event: MouseEvent) => {
    console.log(event.offsetX, resizableTableWrapper.clientWidth);
    if (resizableTableWrapper.clientWidth - event.offsetX <= 3) {
      document.addEventListener('mousemove', resize);
    }
  };

  const handleEndResize = () => {
    document.removeEventListener('mousemove', resize, false);
  };
</script>

<!-- <Table
  updating={$updating}
  id={bulkActionsEnabled
    ? 'workflows-table-with-bulk-actions'
    : 'workflows-table'}
  columns={[
    { label: 'Select', width: 40 },
    ...visibleColumns,
    { label: 'Orderable List', width: 32 },
  ]}
>
  <TableHeaderRow slot="headers">
    {#if bulkActionsEnabled}
      <th
        style="padding: 0;"
        class="non-resizable !sticky left-0 z-20 bg-white"
      >
        <Checkbox
          id="select-visible-workflows"
          onDark
          hoverable
          {checked}
          {indeterminate}
          on:change={handleCheckboxChange}
        />
      </th>
    {/if}
    {#if bulkActionsEnabled && showBulkActions}
      <th
        class="overflow-visible whitespace-nowrap"
        style="grid-column: span {visibleColumns.length} / span {visibleColumns.length};"
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
              on:click={() => dispatch('cancelWorkflows')}
              >Request Cancellation</BulkActionButton
            >
          {/if}
          {#if terminateEnabled}
            <BulkActionButton
              variant="destructive"
              testId="bulk-terminate-button"
              disabled={namespaceWriteDisabled}
              on:click={() => dispatch('terminateWorkflows')}
              >Terminate</BulkActionButton
            >
          {/if}
        </div>
      </th>
    {:else}
      {#each visibleColumns as column}
        <WorkflowsSummaryTableHeaderCell {column} {sortDisabled} />
      {/each}
    {/if}
    <th class="non-resizable !sticky right-0 z-20 bg-white">
      <IconButton icon="vertical-ellipsis" on:click={openCustomizationDrawer} />
    </th>
  </TableHeaderRow>
  {#each workflows as workflow}
    {@const href = routeForEventHistory({
      namespace,
      workflow: workflow.id,
      run: workflow.runId,
    })}
    <TableRow {href} class="workflow-summary-row">
      {#if bulkActionsEnabled}
        <td style="padding: 0;" class="!sticky left-0 z-20 bg-white">
          <Checkbox
            hoverable
            bind:group={selectedWorkflows}
            value={workflow}
            disabled={allSelected}
          />
        </td>
      {/if}
      {#each visibleColumns as column}
        <WorkflowsSummaryTableBodyCell {column} {workflow} />
      {/each}
      <td class="!sticky right-0 z-20 bg-white" />
    </TableRow>
  {:else}
    <tr>
      <td
        class="flex justify-center"
        style="grid-column: span {visibleColumns.length +
          2} / span {visibleColumns.length + 2};"
      >
        {#if $loading}
          <Loading />
        {:else}
          <EmptyState
            title="No Workflows Found"
            content="If you have filters applied, try adjusting them. Otherwise please check your syntax and try again."
            error={$workflowError}
          />
        {/if}
      </td>
    </tr>
  {/each}
</Table> -->
<div class="relative flex flex-row w-full rounded-xl border-3 border-primary">
  <div
    class="workflow-summary-table-wrapper pinned"
    bind:this={resizableTableWrapper}
    on:mousedown={handleStartResize}
    on:mouseup={handleEndResize}
  >
    <table class="workflow-summary-table pinned">
      <thead>
        <tr class="bg-primary text-white h-10">
          <th class="rounded-tl">
            <Checkbox
              id="select-visible-workflows"
              onDark
              hoverable
              {checked}
              {indeterminate}
              on:change={handleCheckboxChange}
            />
          </th>
          {#if bulkActionsEnabled && showBulkActions}
            <th
              class="text-left text-sm font-medium overflow-visible whitespace-nowrap font-secondary px-2"
              colspan={pinnedColumns.length}
            >
              {#if allSelected}
                <span class="font-semibold">
                  All {filteredWorkflowCount} selected
                </span>
              {:else}
                <span class="font-semibold"
                  >{selectedWorkflowsCount} selected</span
                >
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
                    on:click={() => dispatch('cancelWorkflows')}
                    >Request Cancellation</BulkActionButton
                  >
                {/if}
                {#if terminateEnabled}
                  <BulkActionButton
                    variant="destructive"
                    testId="bulk-terminate-button"
                    disabled={namespaceWriteDisabled}
                    on:click={() => dispatch('terminateWorkflows')}
                    >Terminate</BulkActionButton
                  >
                {/if}
              </div>
            </th>
          {:else}
            {#each pinnedColumns as column}
              <WorkflowsSummaryTableHeaderCell {column} {sortDisabled} />
            {/each}
          {/if}
        </tr>
      </thead>
      <tbody class="bg-white">
        {#each workflows as workflow}
          <tr
            class="workflow-summary-row pinned"
            on:click={() => goToWorkflow(workflow)}
          >
            <td class="first-of-type:rounded-bl-lg">
              <Checkbox
                hoverable
                bind:group={selectedWorkflows}
                value={workflow}
                disabled={allSelected}
              />
            </td>
            {#each pinnedColumns as column}
              <WorkflowsSummaryTableBodyCell {column} {workflow} />
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  <div class="workflow-summary-table-wrapper">
    <table class="workflow-summary-table">
      <thead>
        <tr class="bg-primary text-white h-10">
          {#each otherColumns as column}
            <WorkflowsSummaryTableHeaderCell {column} {sortDisabled} />
          {/each}
          <th class="rounded-tr px-2 h-10 w-12">
            <IconButton
              icon="vertical-ellipsis"
              on:click={openCustomizationDrawer}
            />
          </th>
        </tr>
      </thead>
      <tbody class="bg-white">
        {#each workflows as workflow}
          <tr
            class="workflow-summary-row"
            on:click={() => goToWorkflow(workflow)}
          >
            {#each otherColumns as column}
              <WorkflowsSummaryTableBodyCell {column} {workflow} />
            {/each}
            <td class="last-of-type:rounded-br-lg" />
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<Drawer
  open={customizationDrawerOpen}
  onClick={closeCustomizationDrawer}
  position="right"
  dark={false}
  title="Configure Workflow List"
>
  <svelte:fragment slot="subtitle">
    <span>Add (</span><Icon class="inline" name="add" /><span
      >), re-arrange (</span
    ><Icon class="inline" name="chevron-selector-vertical" /><span
      >), and remove (</span
    ><Icon class="inline" name="hyphen" /><span
      >), Workflow<br />Headings to personalize the Workflow List Table.</span
    >
  </svelte:fragment>
  <OrderableList
    items={$workflowTableColumns.columns}
    availableItems={$workflowTableColumns.availableColumns}
    onAddItem={addColumn}
    onRemoveItem={removeColumn}
    onMoveItem={moveColumn}
    onPinItem={pinColumn}
  >
    <svelte:fragment slot="main-heading">
      Workflow Headings <span class="font-normal">(in view)</span>
    </svelte:fragment>
    <svelte:fragment slot="bank-heading">
      Available Headings <span class="font-normal">(not in view)</span>
    </svelte:fragment>
  </OrderableList>
</Drawer>

<style lang="postcss">
  .workflow-summary-table-wrapper {
    @apply flex;

    &.pinned {
      /* @apply overflow-hidden; */
      &::after {
        @apply content-[''] bg-primary w-[3px] left-0 h-full cursor-col-resize;
      }
    }

    &:not(.pinned) {
      @apply overflow-x-scroll flex-grow rounded-r;
    }
  }

  .workflow-summary-table {
    &.pinned {
      @apply rounded-l-lg resize-x last-of-type:rounded-bl;
    }

    &:not(.pinned) {
      @apply rounded-r-lg table-auto w-full last-of-type:rounded-br;
    }
  }

  .workflow-summary-row {
    @apply border-b border-primary last:border-b-0 cursor-pointer;

    &.pinned {
      @apply rounded-bl;
    }

    &:not(.pinned) {
      @apply rounded-br;
    }
  }

  :global(.workflow-summary-row:hover > td) {
    @apply bg-gradient-to-br from-blue-100 to-purple-100 bg-fixed;

    :global(.table-link) {
      @apply text-blue-700 underline decoration-blue-700;
    }
  }
</style>
