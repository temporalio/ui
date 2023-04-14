<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { page } from '$app/stores';
  import IconButton from '$lib/holocene/icon-button.svelte';
  import { routeForEventHistory } from '$lib/utilities/route-for';
  import { supportsAdvancedVisibilityWithOrderBy } from '$lib/stores/advanced-visibility';
  import { supportsBulkActions } from '$lib/stores/bulk-actions';
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import {
    workflowTableColumns,
    availableWorkflowColumns,
    availableSearchAttributes,
    addColumn,
    removeColumn,
    moveColumn,
    pinColumn,
    MAX_PINNED_COLUMNS,
  } from '$lib/stores/workflow-table-columns';
  import Drawer from '$lib/holocene/drawer.svelte';
  import OrderableList from '$lib/holocene/orderable-list/orderable-list.svelte';
  import OrderableListItem from '$lib/holocene/orderable-list/orderable-list-item.svelte';
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
  import ProgressBar from '$lib/holocene/progress-bar.svelte';

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

  $: namespaceWriteDisabled = $coreUser.namespaceWriteDisabled(
    $page.params.namespace,
  );

  $: checked =
    allSelected ||
    pageSelected ||
    (selectedWorkflowsCount === workflows.length &&
      selectedWorkflowsCount !== 0);

  $: pinnedColumns = $workflowTableColumns.filter((column) => column.pinned);
  $: otherColumns = $workflowTableColumns.filter((column) => !column.pinned);

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

  let resizableContainer: HTMLDivElement;
  let resizableContainerWidth: number;
  let resizing: boolean = false;

  const handleMouseDown = () => {
    resizing = true;
    return false;
  };

  const handleMouseUp = () => {
    resizing = false;
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!resizing) return false;
    const rect = resizableContainer.getBoundingClientRect();
    resizableContainerWidth = event.x - rect.x;
    return false;
  };
</script>

<svelte:window
  on:mousemove|stopPropagation={handleMouseMove}
  on:mouseup|stopPropagation={handleMouseUp}
/>
<div class="workflow-summary-tables-wrapper">
  <div
    class="workflow-summary-table-wrapper pinned"
    class:batch-actions-enabled={$supportsBulkActions}
    class:batch-actions-visible={showBulkActions}
    class:no-columns-pinned={pinnedColumns.length === 0}
    bind:this={resizableContainer}
    style="width:{resizableContainerWidth
      ? resizableContainerWidth + 'px'
      : '50%'};"
  >
    <table class="workflow-summary-table pinned">
      <thead>
        <tr
          class="workflow-summary-header-row pinned"
          class:batch-actions-visible={showBulkActions}
        >
          {#if $supportsBulkActions}
            <th class="min-w-[40px] rounded-tl-lg">
              {#if workflows.length > 0 && $workflowTableColumns.length > 0}
                <Checkbox
                  id="select-visible-workflows"
                  aria-label="select all workflows"
                  onDark
                  hoverable
                  {checked}
                  {indeterminate}
                  on:change={handleCheckboxChange}
                />
              {/if}
            </th>
          {/if}
          {#if $supportsBulkActions && showBulkActions}
            <th
              class="text-left text-sm font-medium overflow-visible whitespace-nowrap font-secondary px-2"
              colspan={pinnedColumns.length || 1}
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
        {#if $updating}
          <ProgressBar />
        {/if}
      </thead>
      <tbody>
        {#if $workflowTableColumns.length > 0}
          {#each workflows as workflow}
            <tr
              class="workflow-summary-configurable-row pinned"
              on:click={() => goToWorkflow(workflow)}
            >
              {#if $supportsBulkActions}
                <td>
                  <Checkbox
                    hoverable
                    bind:group={selectedWorkflows}
                    value={workflow}
                    disabled={allSelected}
                    aria-label="select workflow"
                  />
                </td>
              {/if}
              {#each pinnedColumns as column}
                <WorkflowsSummaryTableBodyCell {column} {workflow} />
              {/each}
            </tr>
          {/each}
        {:else}
          <tr />
        {/if}
      </tbody>
    </table>
  </div>
  <div
    class="resizer"
    on:mousedown|stopPropagation|preventDefault={handleMouseDown}
  />
  <div class="workflow-summary-table-wrapper">
    <table class="workflow-summary-table">
      <thead>
        <tr class="workflow-summary-header-row">
          {#each otherColumns as column}
            <WorkflowsSummaryTableHeaderCell {column} {sortDisabled} />
          {/each}
          <th
            class="h-10 leading-[48px] text-right sticky right-0 block w-auto bg-primary"
          >
            <IconButton
              icon="vertical-ellipsis"
              on:click={openCustomizationDrawer}
            />
          </th>
        </tr>
        {#if $updating}
          <ProgressBar />
        {/if}
      </thead>
      <tbody>
        {#if $workflowTableColumns.length > 0}
          {#each workflows as workflow}
            <tr
              class="workflow-summary-configurable-row"
              on:click={() => goToWorkflow(workflow)}
            >
              {#each otherColumns as column}
                <WorkflowsSummaryTableBodyCell {column} {workflow} />
              {/each}
              <td />
            </tr>
          {:else}
            <tr>
              <td colspan={otherColumns.length + 1}>
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
        {:else}
          <tr>
            <td class="px-8">
              <EmptyState title="No column headers are in view">
                <p class="text-center">
                  At least one column heading is required to display workflows.
                  Click the <span class="whitespace-nowrap"
                    >(<Icon class="inline" name="vertical-ellipsis" />)</span
                  >
                  in the top right corner of the Workflow List to reveal the Configure
                  Workflow List panel. Click the
                  <span class="whitespace-nowrap"
                    >(<Icon class="inline" name="add" />)</span
                  > to add column headings.
                </p>
              </EmptyState>
            </td>
          </tr>
        {/if}
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
  <div class="flex flex-col gap-4">
    <OrderableList>
      <svelte:fragment slot="heading">
        Workflow Headings <span class="font-normal">(in view)</span>
      </svelte:fragment>
      {#each $workflowTableColumns as { label, pinned }, index (label)}
        <OrderableListItem
          {index}
          {pinned}
          totalItems={$workflowTableColumns.length}
          maxPinnedItems={MAX_PINNED_COLUMNS}
          on:moveItem={(event) =>
            moveColumn(event.detail.from, event.detail.to)}
          on:pinItem={() => pinColumn(label)}
          on:removeItem={() => removeColumn(label)}
        >
          {label}
        </OrderableListItem>
      {:else}
        <OrderableListItem readonly>No headings in view</OrderableListItem>
      {/each}
    </OrderableList>
    <OrderableList>
      <svelte:fragment slot="heading">
        Available Headings <span class="font-normal">(not in view)</span>
      </svelte:fragment>
      {#each $availableWorkflowColumns as { label }, index}
        <OrderableListItem static {index} on:addItem={() => addColumn(label)}>
          {label}
        </OrderableListItem>
      {:else}
        <OrderableListItem readonly
          >All available headings are in view</OrderableListItem
        >
      {/each}
    </OrderableList>
    <OrderableList>
      <svelte:fragment slot="heading">
        Custom Search Attributes <span class="font-normal">(not in view)</span>
      </svelte:fragment>
      {#each $availableSearchAttributes as { label }, index}
        <OrderableListItem static {index} on:addItem={() => addColumn(label)}>
          {label}
        </OrderableListItem>
      {:else}
        <OrderableListItem readonly
          >No Custom Search Attributes</OrderableListItem
        >
      {/each}
    </OrderableList>
  </div>
</Drawer>

<style lang="postcss">
  .workflow-summary-tables-wrapper {
    @apply flex flex-row w-full rounded-xl border-primary border-2 bg-white overflow-auto;
  }

  .workflow-summary-table-wrapper {
    @apply flex overflow-y-visible;
  }

  .workflow-summary-table-wrapper.pinned {
    @apply shrink-0 overflow-x-hidden rounded-l-lg max-md:max-w-[50%] max-md:overflow-x-scroll max-w-fit min-w-[40px];
  }

  .resizer {
    box-shadow: 2px 0 4px rgb(0 0 0 / 25%);

    @apply z-10 bg-primary w-0 border-r-[3px] border-primary cursor-col-resize;
  }

  .workflow-summary-table-wrapper.pinned.batch-actions-visible {
    @apply !w-full after:pointer-events-none;
  }

  .workflow-summary-table-wrapper.pinned.no-columns-pinned.batch-actions-enabled {
    @apply !w-[40px] overflow-visible;
  }

  .workflow-summary-table-wrapper.pinned.no-columns-pinned:not(
      .batch-actions-enabled
    ) {
    @apply !w-0 !min-w-0;
  }

  .workflow-summary-table-wrapper:not(.pinned) {
    @apply overflow-x-scroll overscroll-x-contain flex-grow rounded-r-lg;
  }

  .workflow-summary-table-wrapper.pinned.no-columns-pinned {
    @apply after:pointer-events-none;
  }

  .workflow-summary-table-wrapper.pinned.no-columns-pinned.batch-actions-visible {
    @apply !w-[40px];
  }

  .workflow-summary-table:not(.pinned) {
    @apply table-auto w-full;
  }

  .workflow-summary-header-row {
    @apply bg-primary text-white h-10;
  }

  .workflow-summary-header-row.pinned.batch-actions-visible {
    @apply z-20;
  }

  .workflow-summary-configurable-row {
    @apply border-b border-primary cursor-pointer h-11 last-of-type:border-b-0;
  }

  .workflow-summary-configurable-row:hover {
    /* bg-fixed solves an issue with safari applying the gradient on each td instead of across the entire row */
    @apply bg-gradient-to-br from-blue-100 to-purple-100 bg-fixed;

    :global(.table-link) {
      @apply text-blue-700 underline decoration-blue-700;
    }
  }
</style>
