<script lang="ts">
  import Table from '$lib/holocene/table/table.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import { page } from '$app/stores';
  import {
    workflowTableColumns,
    addColumn,
    removeColumn,
    moveColumn,
  } from '$lib/stores/workflow-table-columns';
  import IconButton from '$lib/holocene/icon-button.svelte';
  import Drawer from '$lib/holocene/drawer.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import OrderableList from '$lib/holocene/orderable-list.svelte';
  import { routeForEventHistory } from '$lib/utilities/route-for';
  import {
    supportsAdvancedVisibility,
    supportsAdvancedVisibilityWithOrderBy,
  } from '$lib/stores/bulk-actions';
  import { bulkActionsEnabled as workflowBulkActionsEnabled } from '$lib/utilities/bulk-actions-enabled';
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import BatchOperationConfirmationModal from '../batch-operation-confirmation-modal.svelte';
  import {
    workflowsQuery,
    loading,
    updating,
    workflowError,
    workflowCount,
    refresh,
  } from '$lib/stores/workflows';
  import Loading from '$lib/holocene/loading.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import WorkflowsSummaryTableBodyCell from './workflows-summary-table-body-cell.svelte';
  import WorkflowsSummaryTableHeaderCell from './workflows-summary-table-header-cell.svelte';
  import {
    batchCancelByQuery,
    batchTerminateByQuery,
    bulkCancelByIDs,
    bulkTerminateByIDs,
  } from '$lib/services/batch-service';
  import { toaster } from '$lib/stores/toaster';
  import { workflowFilters, workflowSorts } from '$lib/stores/filters';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import { workflowTerminateEnabled } from '$lib/utilities/workflow-terminate-enabled';
  import { workflowCancelEnabled } from '$lib/utilities/workflow-cancel-enabled';
  import { coreUserStore } from '$lib/stores/core-user';
  import BulkActionButton from '$lib/holocene/table/bulk-action-button.svelte';

  export let workflows: WorkflowExecution[];
  export let totalWorkflowCount: string;
  export let filteredWorkflowCount: string;

  let customizationDrawerOpen: boolean = false;
  let selectedWorkflows: WorkflowExecution[] = [];
  let allSelected: boolean = false;
  let pageSelected: boolean = false;
  let batchTerminateConfirmationModal: BatchOperationConfirmationModal;
  let batchCancelConfirmationModal: BatchOperationConfirmationModal;
  let coreUser = coreUserStore();

  const openCustomizationDrawer = () => {
    customizationDrawerOpen = true;
  };

  const closeCustomizationDrawer = () => {
    customizationDrawerOpen = false;
  };

  const onSelectAll = () => {
    allSelected = !allSelected;
    selectedWorkflows = [...workflows];
  };

  const handleCheckboxChange = (event: CustomEvent<{ checked: boolean }>) => {
    const { checked } = event.detail;
    pageSelected = checked;
    if (allSelected) allSelected = false;
    if (checked) {
      selectedWorkflows = [...workflows];
    } else {
      selectedWorkflows = [];
    }
  };

  const resetPageToDefaultState = () => {
    $workflowFilters = [];
    $workflowSorts = [];
    updateQueryParameters({
      url: $page.url,
      parameter: 'query',
      value: '',
      allowEmpty: true,
    });
    $refresh = Date.now();
  };

  const terminateWorkflows = async (event: CustomEvent<{ reason: string }>) => {
    const options = {
      namespace: $page.params.namespace,
      reason: event.detail.reason,
    };
    try {
      if (allSelected) {
        await batchTerminateByQuery({
          ...options,
          query: batchOperationQuery,
        });
        toaster.push({
          message:
            'The batch terminate request is processing in the background.',
          id: 'batch-terminate-success-toast',
        });
      } else {
        const workflowsTerminated = await bulkTerminateByIDs({
          ...options,
          workflows: terminableWorkflows,
        });
        toaster.push({
          message: `Successfully terminated ${workflowsTerminated} workflows.`,
          id: 'batch-terminate-success-toast',
        });
      }
      batchTerminateConfirmationModal.close();
      resetPageToDefaultState();
    } catch (error) {
      batchTerminateConfirmationModal.setError(
        error?.message ?? 'An unknown error occurred.',
      );
    }
  };

  const cancelWorkflows = async (event: CustomEvent<{ reason: string }>) => {
    const options = {
      namespace: $page.params.namespace,
      reason: event.detail.reason,
    };

    try {
      if (allSelected) {
        await batchCancelByQuery({
          ...options,
          query: batchOperationQuery,
        });
        toaster.push({
          message: 'The batch cancel request is processing in the background.',
          id: 'batch-cancel-success-toast',
        });
      } else {
        const workflowsCanceled = await bulkCancelByIDs({
          ...options,
          workflows: cancelableWorkflows,
        });
        toaster.push({
          message: `Successfully cancelled ${workflowsCanceled} workflows.`,
          id: 'batch-cancel-success-toast',
        });
      }
      batchCancelConfirmationModal.close();
      resetPageToDefaultState();
    } catch (error) {
      batchCancelConfirmationModal.setError(
        error?.message ?? 'An unknown error occurred.',
      );
    }
  };

  $: namespace = $page.params.namespace;
  $: selectedWorkflowsCount = selectedWorkflows.length;
  $: showBulkActions = selectedWorkflowsCount > 0;
  $: visibleColumns = $workflowTableColumns.columns;
  $: terminateEnabled = workflowTerminateEnabled($page.data.settings);
  $: cancelEnabled = workflowCancelEnabled($page.data.settings);
  $: currentWorkflowBatchCount = allSelected
    ? totalWorkflowCount
    : filteredWorkflowCount;

  $: sortDisabled =
    $workflowCount?.totalCount >= 1000000 ||
    !$supportsAdvancedVisibilityWithOrderBy;

  $: terminableWorkflows = selectedWorkflows.filter(
    (workflow) => workflow.canBeTerminated,
  );

  $: cancelableWorkflows = selectedWorkflows.filter(
    (workflow) => workflow.status === 'Running',
  );

  $: indeterminate =
    selectedWorkflows.length > 0 && selectedWorkflows.length < workflows.length;

  $: bulkActionsEnabled = workflowBulkActionsEnabled(
    $page.data.settings,
    $supportsAdvancedVisibility,
  );

  $: namespaceWriteDisabled = $coreUser.namespaceWriteDisabled(
    $page.params.namespace,
  );

  $: batchOperationQuery = !$workflowsQuery
    ? 'ExecutionStatus="Running"'
    : $workflowsQuery;
</script>

<Table
  updating={$updating}
  id={bulkActionsEnabled
    ? 'workflows-table-with-bulk-actions'
    : 'workflows-table'}
>
  <TableHeaderRow slot="headers">
    {#if bulkActionsEnabled}
      <th class="w-12" style="padding:0;">
        <Checkbox
          id="select-visible-workflows"
          onDark
          hoverable
          bind:checked={pageSelected}
          on:change={handleCheckboxChange}
          {indeterminate}
        />
      </th>
    {/if}
    {#if showBulkActions}
      <th colspan={visibleColumns.length}>
        {#if allSelected}
          <span class="font-semibold">
            All {currentWorkflowBatchCount} selected
          </span>
        {:else}
          <span class="font-semibold">{selectedWorkflowsCount} selected</span>
          <span>
            (or <button
              data-testid="select-all-workflows"
              on:click={onSelectAll}
              class="cursor-pointer underline"
              >select all {currentWorkflowBatchCount}</button
            >)
          </span>
        {/if}
        <div class="ml-4 inline-flex gap-2">
          {#if cancelEnabled}
            <BulkActionButton
              testId="bulk-cancel-button"
              disabled={namespaceWriteDisabled}
              on:click={() => batchCancelConfirmationModal.open()}
              >Request Cancellation</BulkActionButton
            >
          {/if}
          {#if terminateEnabled}
            <BulkActionButton
              variant="destructive"
              testId="bulk-terminate-button"
              disabled={namespaceWriteDisabled}
              on:click={() => batchTerminateConfirmationModal.open()}
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
    <th class="w-6">
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
        <td style="padding:0;">
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
      <td />
    </TableRow>
  {:else}
    <tr>
      <td colspan={visibleColumns.length + (bulkActionsEnabled ? 4 : 3)}>
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
</Table>

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
  >
    <svelte:fragment slot="main-heading">
      Workflow Headings <span class="font-normal">(in view)</span>
    </svelte:fragment>
    <svelte:fragment slot="bank-heading">
      Available Headings <span class="font-normal">(not in view)</span>
    </svelte:fragment>
  </OrderableList>
</Drawer>

<BatchOperationConfirmationModal
  action="Terminate"
  bind:this={batchTerminateConfirmationModal}
  {allSelected}
  actionableWorkflowsLength={terminableWorkflows.length}
  query={batchOperationQuery}
  on:confirm={terminateWorkflows}
/>

<BatchOperationConfirmationModal
  action="Cancel"
  bind:this={batchCancelConfirmationModal}
  {allSelected}
  actionableWorkflowsLength={cancelableWorkflows.length}
  query={batchOperationQuery}
  on:confirm={cancelWorkflows}
/>

<style lang="postcss">
  :global(.workflow-summary-row:hover) {
    @apply bg-gradient-to-br from-blue-100 to-purple-100 bg-fixed;

    :global(.table-link) {
      @apply text-blue-700 underline decoration-blue-700;
    }
  }
</style>
