<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { timeFormat } from '$lib/stores/time-format';
  import { workflowCount, workflowsQuery } from '$lib/stores/workflows';
  import {
    refresh,
    workflows,
    loading,
    updating,
    workflowError,
  } from '$lib/stores/workflows';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import { workflowFilters, workflowSorts } from '$lib/stores/filters';

  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';

  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Pagination from '$lib/holocene/pagination.svelte';
  import WorkflowsSummaryTableWithFilters from '$lib/components/workflow/workflows-summary-table-with-filters.svelte';
  import WorkflowsSummaryRowWithFilters from '$lib/components/workflow/workflows-summary-row-with-filters.svelte';
  import NamespaceSelector from '$lib/holocene/namespace-selector.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$holocene/icon/icon.svelte';
  import WorkflowAdvancedSearch from '$lib/components/workflow/workflow-advanced-search.svelte';
  import TableRow from '$holocene/table/table-row.svelte';
  import WorkflowDateTime from '$lib/components/workflow/dropdown-filter/workflow-datetime-filter.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import {
    batchTerminateByQuery,
    bulkTerminateBySelection,
    pollBatchOperation,
  } from '$lib/services/terminate-service';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import { toaster } from '$lib/holocene/toaster.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { pluralize } from '$lib/utilities/pluralize';

  export let bulkActionsEnabled: boolean = false;

  let selectedWorkflows: { [index: string]: boolean } = {};
  let reason: string = '';
  let showBulkOperationConfirmationModal: boolean = false;
  let allSelected: boolean = false;
  let pageSelected: boolean = false;
  let terminating: boolean = false;

  $: query = $page.url.searchParams.get('query');

  $: {
    // For returning to page from 'Back to Workflows' with previous search
    $workflowsQuery = query;
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

  const handleBulkTerminate = () => {
    showBulkOperationConfirmationModal = true;
  };

  const clearAfterTerminate = () => {
    terminating = false;
    showBulkOperationConfirmationModal = false;
    reason = '';

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

  const terminateWorkflows = async () => {
    const { namespace } = $page.params;

    if (allSelected) {
      const query = !$workflowsQuery
        ? 'ExecutionStatus="Running"'
        : $workflowsQuery;
      // Idea: persist the job ID and display a progress indicator for large jobs
      batchTerminateByQuery({ namespace, reason, query });
      toaster.push({
        message: 'The batch terminate request is processing in the background.',
        id: 'batch-terminate-success-toast',
      });
    } else {
      terminating = true;
      try {
        const jobId = await bulkTerminateBySelection({
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
        showBulkOperationConfirmationModal = false;
        toaster.push({
          variant: 'error',
          message: 'Unable to terminate workflows.',
        });
      }
    }

    clearAfterTerminate();
  };

  const handleCancelBulkTerminateModal = () => {
    showBulkOperationConfirmationModal = false;
    reason = '';
  };

  $: terminableWorkflows = $workflows.filter(
    (workflow) => selectedWorkflows[workflow.runId] && workflow.canBeTerminated,
  );

  $: filteredWorkflowCount = new Intl.NumberFormat('en-US').format(
    $workflowFilters.length === 0
      ? $workflowCount.totalCount
      : $workflowCount.count,
  );

  $: selectedWorkflowsCount =
    Object.values(selectedWorkflows).filter(Boolean).length;

  $: {
    if ($workflowFilters) {
      resetSelection();
    }
  }
</script>

<Modal
  open={showBulkOperationConfirmationModal}
  confirmText="Terminate"
  confirmType="destructive"
  confirmDisabled={reason === ''}
  loading={terminating}
  on:cancelModal={handleCancelBulkTerminateModal}
  on:confirmModal={terminateWorkflows}
>
  <h3 slot="title">Terminate Workflows</h3>
  <svelte:fragment slot="content">
    <div class="mb-4 flex flex-col">
      {#if allSelected}
        <p class="mb-2">
          Are you sure you want to terminate all worklfows matching the
          following query? This action cannot be undone.
        </p>
        <div
          class="mb-2 overflow-scroll whitespace-nowrap rounded border border-primary bg-gray-100 p-2"
        >
          <code>
            {!$workflowsQuery ? 'ExecutionStatus="Running"' : $workflowsQuery}
          </code>
        </div>
        <span class="text-xs"
          >Note: The actual count of workflows that will be terminated is the
          total number of running workflows matching this query at the time of
          clicking “Terminate”.</span
        >
      {:else}
        <p class="mb-4">
          Are you sure you want to terminate <strong
            >{terminableWorkflows.length} running {pluralize(
              'workflow',
              terminableWorkflows.length,
            )}</strong
          >?
        </p>
      {/if}
    </div>
    <Input
      id="bulk-terminate-reason"
      bind:value={reason}
      placeholder="Enter a reason"
    />
  </svelte:fragment>
</Modal>

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
            Results {$workflowCount?.count ?? 0} of {$workflowCount?.totalCount ??
              0} workflows
          {:else}
            {$workflowCount?.totalCount ?? 0} workflows
          {/if}
        </p>
      {/if}
    </div>
  </div>
  <div>
    <Button variant="secondary" on:click={refreshWorkflows}
      ><Icon name="retry" /></Button
    >
  </div>
</div>
<Pagination items={$workflows} let:visibleItems>
  <svelte:fragment slot="action-top-left">
    <WorkflowAdvancedSearch />
  </svelte:fragment>
  <svelte:fragment slot="action-top-center">
    <WorkflowDateTime />
  </svelte:fragment>
  <WorkflowsSummaryTableWithFilters
    {bulkActionsEnabled}
    updating={$updating}
    visibleWorkflows={visibleItems}
    {selectedWorkflowsCount}
    {filteredWorkflowCount}
    {allSelected}
    {pageSelected}
    on:terminateWorkflows={handleBulkTerminate}
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
      <TableRow>
        <td colspan="2" class="hidden xl:table-cell" />
        <td colspan="3">
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
        <td class="hidden xl:table-cell" />
      </TableRow>
    {/each}
  </WorkflowsSummaryTableWithFilters>
</Pagination>
