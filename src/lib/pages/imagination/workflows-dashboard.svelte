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

  import {
    toListWorkflowFilters,
    updateQueryParamsFromFilter,
  } from '$lib/utilities/query/to-list-workflow-filters';

  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Pagination from '$lib/holocene/pagination.svelte';
  import WorkflowsSummaryTableWithFilters from '$lib/components/workflow/workflows-summary-table-with-filters.svelte';
  import WorkflowsSummaryRowWithFilters from '$lib/components/workflow/workflows-summary-row-with-filters.svelte';
  import NamespaceSelector from '$lib/holocene/namespace-selector.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import WorkflowAdvancedSearch from '$lib/components/workflow/workflow-advanced-search.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
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
  import WorkflowsSummaryTable from '$lib/components/workflow/workflows-summary-table.svelte';
  import WorkflowsSummaryRow from '$lib/components/workflow/workflows-summary-row.svelte';
  import ApiPagination from '$lib/holocene/api-pagination.svelte';
  import {
    fetchAllWorkflows,
    fetchPaginatedWorkflows,
    fetchStatusesWorkflowCount,
    fetchStatusWorkflowCount,
  } from '$lib/services/workflow-service';
  import EmptyRow from './_empty-row.svelte';
  import Card from '$lib/holocene/card.svelte';
  import WorkflowsImagination from './workflows-imagination.svelte';
  import StatusCard from './_status-card.svelte';
  import PieChart from './_pie-chart.svelte';
  import TimePicker from './_time-picker.svelte';

  export let bulkActionsEnabled: boolean = false;
  export let cancelEnabled: boolean = false;
  export let terminateEnabled: boolean = false;

  let selectedWorkflows: { [index: string]: boolean } = {};
  let showBatchTerminateConfirmationModal: boolean = false;
  let showBatchCancelConfirmationModal: boolean = false;
  let allSelected: boolean = false;
  let pageSelected: boolean = false;
  let terminating: boolean = false;
  let cancelling: boolean = false;

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
      cancelling = true;
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

  let totals = {
    running: { count: 0, color: '#93c5fd' },
    failed: { count: 0, color: '#fca5a5' },
    timedOut: { count: 0, color: '#fdba74' },
    canceled: { count: 0, color: '#fde047' },
    terminated: { count: 0, color: '#d4d4d8' },
    completed: { count: 0, color: '#86efac' },
  };

  $: namespace = $page.params.namespace;

  const fetchStatusCounts = async () => {
    totals.running.count = await fetchStatusWorkflowCount(
      namespace,
      'Running',
      $workflowFilters,
    );
    totals.failed.count = await fetchStatusWorkflowCount(
      namespace,
      'Failed',
      $workflowFilters,
    );
    totals.timedOut.count = await fetchStatusWorkflowCount(
      namespace,
      'TimedOut',
      $workflowFilters,
    );
    totals.canceled.count = await fetchStatusWorkflowCount(
      namespace,
      'Canceled',
      $workflowFilters,
    );
    totals.terminated.count = await fetchStatusWorkflowCount(
      namespace,
      'Terminated',
      $workflowFilters,
    );
    totals.completed.count = await fetchStatusWorkflowCount(
      namespace,
      'Completed',
      $workflowFilters,
    );
  };

  $: query, fetchStatusCounts();

  // For Imagination Pagination

  let activeTotal: number = 0;
  let activeStatus: WorkflowStatus = 'Running';

  const onStatusClick = (status: WorkflowStatus, count: number) => {
    activeStatus = status;
    activeTotal = count;
  };
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
  <div class="justify-between">
    <h1 class="text-2xl" data-cy="namespace-title">
      Recent Workflows
      <NamespaceSelector />
    </h1>
    <div class="flex items-center gap-2 text-sm">
      <p data-cy="namespace-name">
        {namespace}
      </p>
      <!-- {#if $workflowCount?.totalCount >= 0}
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
      {/if} -->
    </div>
  </div>
  <div class="flex items-center gap-4">
    <Button variant="secondary" class="h-10 w-10" on:click={refreshWorkflows}
      ><Icon name="retry" /></Button
    >
    <!-- <WorkflowDateTimeFilter /> -->
  </div>
</div>
<div class="flex flex-row gap-4 items-stretch">
  <Card class="bg-gray-700">
    {#key totals}
      <PieChart {totals} />
    {/key}
  </Card>
  <StatusCard
    count={totals.running.count}
    status="Running"
    onClick={onStatusClick}
    active={activeStatus === 'Running'}
  />
  <StatusCard
    count={totals.failed.count}
    status="Failed"
    onClick={onStatusClick}
    active={activeStatus === 'Failed'}
  />
  <StatusCard
    count={totals.timedOut.count}
    status="TimedOut"
    onClick={onStatusClick}
    active={activeStatus === 'TimedOut'}
  />
  <StatusCard
    count={totals.terminated.count}
    status="Terminated"
    onClick={onStatusClick}
    active={activeStatus === 'Terminated'}
  />
  <StatusCard
    count={totals.canceled.count}
    status="Canceled"
    onClick={onStatusClick}
    active={activeStatus === 'Canceled'}
  />
  <StatusCard
    count={totals.completed.count}
    status="Completed"
    onClick={onStatusClick}
    active={activeStatus === 'Completed'}
  />
  <Card class="w-auto text-center">
    <h3>In the Last</h3>
    <TimePicker />
  </Card>
</div>
<WorkflowsImagination {activeTotal} {activeStatus} />
