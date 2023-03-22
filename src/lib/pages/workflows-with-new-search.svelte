<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import {
    refresh,
    workflows,
    loading,
    updating,
    workflowCount,
    workflowsQuery,
    workflowsSearchParams,
  } from '$lib/stores/workflows';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import { workflowFilters, workflowSorts } from '$lib/stores/filters';
  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';
  import Pagination from '$lib/holocene/pagination.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import WorkflowAdvancedSearch from '$lib/components/workflow/workflow-advanced-search.svelte';
  import WorkflowDateTimeFilter from '$lib/components/workflow/dropdown-filter/workflow-datetime-filter.svelte';
  import {
    batchCancelByQuery,
    batchTerminateByQuery,
    bulkCancelByIDs,
    bulkTerminateByIDs,
  } from '$lib/services/batch-service';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import BatchOperationConfirmationModal from '$lib/components/workflow/batch-operation-confirmation-modal.svelte';
  import { supportsAdvancedVisibility } from '$lib/stores/bulk-actions';
  import { toaster } from '$lib/stores/toaster';
  import FeatureGuard from '$lib/components/feature-guard.svelte';
  import WorkflowsSummaryNonConfigurableTable from '$lib/components/workflow/workflows-summary-non-configurable-table/workflows-summary-non-configurable-table.svelte';
  import WorkflowsSummaryConfigurableTable from '$lib/components/workflow/workflows-summary-configurable-table/workflows-summary-configurable-table.svelte';

  // TODO: Make me a feature flag
  export let workflowTableCustomizationEnabled: boolean = true;

  let selectedWorkflows: WorkflowExecution[] = [];
  let batchTerminateConfirmationModal: BatchOperationConfirmationModal;
  let batchCancelConfirmationModal: BatchOperationConfirmationModal;
  let allSelected: boolean = false;
  let pageSelected: boolean = false;
  let scrollY;

  $: query = $page.url.searchParams.get('query');
  $: query && ($workflowsQuery = query);

  // For returning to page from 'Back to Workflows' with previous search
  $: searchParams = $page.url.searchParams.toString();
  $: searchParams, ($workflowsSearchParams = searchParams);

  $: {
    if (!$workflowFilters.length && !$workflowSorts.length) {
      $workflowsQuery = '';
    }
  }

  onMount(() => {
    $lastUsedNamespace = $page.params.namespace;
    if (query) {
      // Set filters from inital page load query if it exists
      $workflowFilters = toListWorkflowFilters(query);
    } else {
      $workflowFilters = [];
    }
  });

  const resetSelection = () => {
    allSelected = false;
    pageSelected = false;
    selectedWorkflows = [];
  };

  const refreshWorkflows = () => {
    resetSelection();
    $refresh = Date.now();
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
    refreshWorkflows();
  };

  const openBatchCancelConfirmationModal = () => {
    batchCancelConfirmationModal.open();
  };

  const openBatchTerminateConfirmationModal = () => {
    batchTerminateConfirmationModal.open();
  };

  const handleSelectAll = (workflows: WorkflowExecution[]) => {
    allSelected = true;
    selectedWorkflows = [...workflows];
  };

  const handleTogglePage = (
    event: CustomEvent<{
      checked: boolean;
      workflows: WorkflowExecution[];
    }>,
  ) => {
    const { checked, workflows } = event.detail;
    pageSelected = checked;
    if (allSelected) allSelected = false;
    if (checked) {
      selectedWorkflows = [...workflows];
    } else {
      selectedWorkflows = [];
    }
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

  $: batchOperationQuery = !$workflowsQuery
    ? 'ExecutionStatus="Running"'
    : $workflowsQuery;

  $: terminableWorkflows = selectedWorkflows.filter(
    (workflow) => workflow.canBeTerminated,
  );

  $: cancelableWorkflows = selectedWorkflows.filter(
    (workflow) => workflow.status === 'Running',
  );

  $: totalWorkflowCount = new Intl.NumberFormat('en-US').format(
    $workflowCount?.totalCount ?? 0,
  );

  $: filteredWorkflowCount = new Intl.NumberFormat('en-US').format(
    $workflowCount?.count ?? 0,
  );

  $: {
    if ($workflowFilters) {
      resetSelection();
    }
  }
</script>

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

<svelte:window bind:scrollY />

<header class="mb-2 flex justify-between">
  <div>
    <h1 class="text-2xl" data-cy="namespace-title">Recent Workflows</h1>
    <div class="flex items-center gap-2 text-sm">
      <p data-testid="namespace-name">
        {$page.params.namespace}
      </p>
      {#if $workflowCount?.totalCount >= 0 && $supportsAdvancedVisibility}
        <div class="h-1 w-1 rounded-full bg-gray-400" />
        <p data-testid="workflow-count">
          {#if $loading}
            <span class="text-gray-400">loading</span>
          {:else if $updating}
            <span class="text-gray-400">filtering</span>
          {:else if query}
            Results {filteredWorkflowCount} of {totalWorkflowCount} workflows
          {:else}
            {totalWorkflowCount} workflows
          {/if}
        </p>
      {/if}
    </div>
  </div>
  <div>
    <button
      aria-label="retry workflows"
      class="cursor-pointer rounded-full p-1 hover:bg-gray-900 hover:text-white"
      on:click={refreshWorkflows}
    >
      <Icon name="retry" class="h-8 w-8" />
    </button>
  </div>
</header>
<Pagination items={$workflows} let:visibleItems aria-label="recent workflows">
  <svelte:fragment slot="action-top-left">
    <WorkflowAdvancedSearch />
  </svelte:fragment>
  <svelte:fragment slot="action-top-center">
    <WorkflowDateTimeFilter />
  </svelte:fragment>
  <FeatureGuard enabled={workflowTableCustomizationEnabled}>
    <WorkflowsSummaryConfigurableTable
      {allSelected}
      {pageSelected}
      bind:selectedWorkflows
      workflows={visibleItems}
      filteredWorkflowCount={query ? filteredWorkflowCount : totalWorkflowCount}
      on:selectAll={() => handleSelectAll(visibleItems)}
      on:togglePage={handleTogglePage}
      on:cancelWorkflows={openBatchCancelConfirmationModal}
      on:terminateWorkflows={openBatchTerminateConfirmationModal}
    />
    <WorkflowsSummaryNonConfigurableTable
      slot="fallback"
      {allSelected}
      {pageSelected}
      bind:selectedWorkflows
      workflows={visibleItems}
      filteredWorkflowCount={query ? filteredWorkflowCount : totalWorkflowCount}
      on:selectAll={() => handleSelectAll(visibleItems)}
      on:togglePage={handleTogglePage}
      on:cancelWorkflows={openBatchCancelConfirmationModal}
      on:terminateWorkflows={openBatchTerminateConfirmationModal}
    />
  </FeatureGuard>
</Pagination>
