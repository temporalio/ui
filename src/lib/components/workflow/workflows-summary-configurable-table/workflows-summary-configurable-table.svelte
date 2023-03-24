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
    workflowPinnedColumnsWidth,
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
  let resizableContainer: HTMLDivElement;
  let resizableContainerWidth: number = $workflowPinnedColumnsWidth;
  let resizing: boolean = false;

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

  const handleMouseDown = (event: MouseEvent) => {
    if (resizableContainer.clientWidth - event.x < 3) {
      resizing = true;
    }
    return false;
  };

  const handleMouseUp = () => {
    if (resizing) resizing = false;
    $workflowPinnedColumnsWidth = resizableContainerWidth;
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
<div class="relative flex flex-row w-full rounded-lg overflow-auto">
  <div
    class="workflow-summary-table-wrapper pinned"
    bind:this={resizableContainer}
    style="width:{resizableContainerWidth}px;"
    on:mousedown|stopPropagation|preventDefault={handleMouseDown}
  >
    <table class="workflow-summary-table pinned">
      <thead>
        <tr class="workflow-summary-header-row pinned">
          {#if $supportsBulkActions}
            <th>
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
          {#if $supportsBulkActions && showBulkActions}
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
        {#if $updating}
          <ProgressBar />
        {/if}
      </thead>
      <tbody>
        {#each workflows as workflow}
          <tr
            class="workflow-summary-row pinned"
            on:click={() => goToWorkflow(workflow)}
          >
            {#if $supportsBulkActions}
              <td>
                <Checkbox
                  hoverable
                  bind:group={selectedWorkflows}
                  value={workflow}
                  disabled={allSelected}
                />
              </td>
            {/if}
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
        <tr class="workflow-summary-header-row">
          {#each otherColumns as column}
            <WorkflowsSummaryTableHeaderCell {column} {sortDisabled} />
          {/each}
          <th class="px-2 h-10 w-12 text-right">
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
        {#each workflows as workflow}
          <tr
            class="workflow-summary-row"
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
      {/each}
    </OrderableList>
    <OrderableList>
      <svelte:fragment slot="heading">
        Available Headings <span class="font-normal">(not in view)</span>
      </svelte:fragment>
      {#each $availableWorkflowColumns as column, index}
        <OrderableListItem static {index} on:addItem={() => addColumn(column)}>
          {column}
        </OrderableListItem>
      {:else}
        <OrderableListItem readonly>No Available Headings</OrderableListItem>
      {/each}
    </OrderableList>
    <OrderableList>
      <svelte:fragment slot="heading">
        Custom Search Attributes <span class="font-normal">(not in view)</span>
      </svelte:fragment>
      {#each $availableSearchAttributes as searchAttribute, index}
        <OrderableListItem
          static
          {index}
          on:addItem={() => addColumn(searchAttribute)}
        >
          {searchAttribute}
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
  .workflow-summary-table-wrapper {
    @apply relative flex bg-white border-primary border-y-2 overflow-y-visible;

    &.pinned {
      /* 40px is width of checkbox column */
      @apply overflow-x-hidden rounded-l-lg min-w-[40px] max-w-fit border-l-2;

      &::after {
        @apply absolute right-0 content-[''] bg-primary w-[3px] h-full cursor-ew-resize;
      }
    }

    &:not(.pinned) {
      @apply overflow-x-scroll flex-grow rounded-r-lg border-r-2;
    }
  }

  .workflow-summary-table {
    &.pinned {
      @apply rounded-l-lg;
    }

    &:not(.pinned) {
      @apply rounded-r-lg table-auto w-full;
    }
  }

  .workflow-summary-header-row {
    @apply bg-primary text-white h-10;

    &.pinned {
      :global(th) {
        @apply first:rounded-tl;
      }
    }

    &:not(.pinned) {
      :global(th) {
        @apply last:rounded-tr;
      }
    }
  }

  .workflow-summary-row {
    @apply border-b border-primary cursor-pointer;

    &:last-of-type {
      @apply border-b-0;

      &.pinned {
        :global(td) {
          @apply first:rounded-bl-lg;
        }
      }

      &:not(.pinned) {
        :global(td) {
          @apply last:rounded-br-lg;
        }
      }
    }
  }

  :global(.workflow-summary-row:hover > td) {
    @apply bg-gradient-to-br from-blue-100 to-purple-100 bg-fixed;

    :global(.table-link) {
      @apply text-blue-700 underline decoration-blue-700;
    }
  }
</style>
