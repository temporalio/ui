<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { timeFormat } from '$lib/stores/time-format';
  import {
    refresh,
    workflows,
    loading,
    updating,
    workflowError,
    workflowCount,
    workflowsQuery,
  } from '$lib/stores/workflows';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import { workflowFilters, workflowSorts } from '$lib/stores/filters';

  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';

  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Pagination from '$lib/holocene/pagination.svelte';
  import WorkflowsSummaryTableWithFilters from '$lib/components/workflow/workflows-summary-table-with-filters.svelte';
  import WorkflowsSummaryRowWithFilters from '$lib/components/workflow/workflows-summary-row-with-filters.svelte';
  import NamespaceSelector from '$lib/holocene/namespace-selector.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import WorkflowAdvancedSearch from '$lib/components/workflow/workflow-advanced-search.svelte';
  import WorkflowDateTimeFilter from '$lib/components/workflow/dropdown-filter/workflow-datetime-filter.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import {
    batchCancelByQuery,
    batchTerminateByQuery,
    bulkCancelByIDs,
    bulkTerminateByIDs,
    pollBatchOperation,
  } from '$lib/services/batch-service';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import { toaster } from '$lib/stores/toaster';
  import BatchOperationConfirmationModal from '$lib/components/workflow/batch-operation-confirmation-modal.svelte';
  import { bulkActionsEnabled as workflowBulkActionsEnabled } from '$lib/utilities/bulk-actions-enabled';
  import { supportsAdvancedVisibility } from '$lib/stores/bulk-actions';

  $: bulkActionsEnabled = workflowBulkActionsEnabled(
    $page.data.settings,
    $supportsAdvancedVisibility,
  );

  let selectedWorkflows: { [index: string]: boolean } = {};
  let showBatchTerminateConfirmationModal: boolean = false;
  let showBatchCancelConfirmationModal: boolean = false;
  let allSelected: boolean = false;
  let pageSelected: boolean = false;
  let terminating: boolean = false;

  $: query = $page.url.searchParams.get('query');

  $: {
    // For returning to page from 'Back to Workflows' with previous search
    if (query) {
      $workflowsQuery = query;
    }
  }

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
    selectedWorkflows = {};
    selectedWorkflowsCount = 0;
  };

  const errorMessage =
    'If you have filters applied, try adjusting them. Otherwise please check your syntax and try again.';

  const refreshWorkflows = () => {
    resetSelection();
    $refresh = Date.now();
  };

  const handleBatchTerminate = () => {
    showBatchTerminateConfirmationModal = true;
  };

  const handleBatchCancel = () => {
    showBatchCancelConfirmationModal = true;
  };

  const resetPageToDefaultState = () => {
    terminating = false;

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

  const handleSelectWorkflow = (
    event: CustomEvent<{ checked: boolean; workflowRunId: string }>,
  ) => {
    const { checked, workflowRunId } = event.detail;
    selectedWorkflows[workflowRunId] = checked;
  };

  const handleToggleAll = (event: CustomEvent<{ checked: boolean }>) => {
    const { checked } = event.detail;
    allSelected = checked;
    $workflows.forEach(
      (workflow) => (selectedWorkflows[workflow.runId] = checked),
    );
  };

  const handleTogglePage = (
    event: CustomEvent<{
      checked: boolean;
      visibleWorkflows: WorkflowExecution[];
    }>,
  ) => {
    const { checked, visibleWorkflows } = event.detail;
    pageSelected = checked;
    visibleWorkflows.forEach(
      (workflow) => (selectedWorkflows[workflow.runId] = checked),
    );
  };

  const terminateWorkflows = async (event: CustomEvent<{ reason: string }>) => {
    const { namespace } = $page.params;
    const { reason } = event.detail;

    if (allSelected) {
      // Idea: persist the job ID and display a progress indicator for large jobs
      await batchTerminateByQuery({
        namespace,
        reason,
        query: batchOperationQuery,
      });
      toaster.push({
        message: 'The batch terminate request is processing in the background.',
        id: 'batch-terminate-success-toast',
      });
    } else {
      terminating = true;
      try {
        const jobId = await bulkTerminateByIDs({
          namespace,
          reason,
          workflows: terminableWorkflows,
        });
        const workflowsTerminated = await pollBatchOperation({
          namespace,
          jobId,
        });
        toaster.push({
          message: `Successfully terminated ${workflowsTerminated} workflows.`,
          id: 'batch-terminate-success-toast',
        });
      } catch (error) {
        toaster.push({
          variant: 'error',
          message: 'Unable to terminate workflows.',
        });
      }
    }
    showBatchTerminateConfirmationModal = false;
    resetPageToDefaultState();
  };

  const cancelWorkflows = async (event: CustomEvent<{ reason: string }>) => {
    const { namespace } = $page.params;
    const { reason } = event.detail;

    if (allSelected) {
      await batchCancelByQuery({
        namespace,
        reason,
        query: batchOperationQuery,
      });
      toaster.push({
        message: 'The batch cancel request is processing in the background.',
        id: 'batch-cancel-success-toast',
      });
    } else {
      try {
        const jobId = await bulkCancelByIDs({
          namespace,
          reason,
          workflows: cancelableWorkflows,
        });
        const workflowsCancelled = await pollBatchOperation({
          namespace,
          jobId,
        });
        toaster.push({
          message: `Successfully cancelled ${workflowsCancelled} workflows.`,
          id: 'batch-cancel-success-toast',
        });
      } catch {
        toaster.push({
          variant: 'error',
          message: 'Unable to cancel workflows.',
        });
      }
    }
    showBatchCancelConfirmationModal = false;
    resetPageToDefaultState();
  };

  $: batchOperationQuery = !$workflowsQuery
    ? 'ExecutionStatus="Running"'
    : $workflowsQuery;

  $: terminableWorkflows = $workflows.filter(
    (workflow) => selectedWorkflows[workflow.runId] && workflow.canBeTerminated,
  );

  $: cancelableWorkflows = $workflows.filter(
    (workflow) =>
      selectedWorkflows[workflow.runId] && workflow.status === 'Running',
  );

  $: totalWorkflowCount = new Intl.NumberFormat('en-US').format(
    $workflowCount?.totalCount ?? 0,
  );

  $: filteredWorkflowCount = new Intl.NumberFormat('en-US').format(
    $workflowCount?.count ?? 0,
  );

  $: selectedWorkflowsCount =
    Object.values(selectedWorkflows).filter(Boolean).length;

  $: {
    if ($workflowFilters) {
      resetSelection();
    }
  }
</script>

<BatchOperationConfirmationModal
  action="Terminate"
  bind:open={showBatchTerminateConfirmationModal}
  loading={terminating}
  {allSelected}
  actionableWorkflowsLength={terminableWorkflows.length}
  query={batchOperationQuery}
  on:confirm={terminateWorkflows}
/>
<BatchOperationConfirmationModal
  action="Cancel"
  bind:open={showBatchCancelConfirmationModal}
  loading={false}
  {allSelected}
  actionableWorkflowsLength={cancelableWorkflows.length}
  query={batchOperationQuery}
  on:confirm={cancelWorkflows}
/>

<div class="mb-2 flex justify-between">
  <div>
    <h1 class="text-2xl" data-cy="namespace-title">
      Recent Workflows
      <NamespaceSelector />
    </h1>
    <div class="flex items-center gap-2 text-sm">
      <p data-cy="namespace-name">
        {$page.params.namespace}
      </p>
      {#if $workflowCount?.totalCount >= 0}
        <div class="h-1 w-1 rounded-full bg-gray-400" />
        <p data-cy="workflow-count">
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
</div>
<Pagination items={$workflows} let:visibleItems aria-label="recent workflows">
  <svelte:fragment slot="action-top-left">
    <WorkflowAdvancedSearch />
  </svelte:fragment>
  <svelte:fragment slot="action-top-center">
    <WorkflowDateTimeFilter />
  </svelte:fragment>
  <WorkflowsSummaryTableWithFilters
    {bulkActionsEnabled}
    updating={$updating}
    visibleWorkflows={visibleItems}
    {selectedWorkflowsCount}
    filteredWorkflowCount={query ? filteredWorkflowCount : totalWorkflowCount}
    {allSelected}
    {pageSelected}
    on:terminateWorkflows={handleBatchTerminate}
    on:cancelWorkflows={handleBatchCancel}
    on:toggleAll={handleToggleAll}
    on:togglePage={handleTogglePage}
  >
    {#each visibleItems as event}
      <WorkflowsSummaryRowWithFilters
        {bulkActionsEnabled}
        workflow={event}
        namespace={$page.params.namespace}
        timeFormat={$timeFormat}
        checkboxDisabled={allSelected}
        selected={selectedWorkflows[event.runId]}
        on:toggleWorkflow={handleSelectWorkflow}
      />
    {:else}
      <tr>
        <td colspan={bulkActionsEnabled ? 6 : 5} class="xl:hidden">
          {#if $loading}
            <Loading />
          {:else}
            <EmptyState
              title="No Workflows Found"
              content={errorMessage}
              error={$workflowError}
            />
          {/if}
        </td>
        <td colspan={bulkActionsEnabled ? 8 : 7} class="hidden xl:table-cell">
          {#if $loading}
            <Loading />
          {:else}
            <EmptyState
              title="No Workflows Found"
              content={errorMessage}
              error={$workflowError}
            />
          {/if}
        </td>
      </tr>
    {/each}
  </WorkflowsSummaryTableWithFilters>
</Pagination>
