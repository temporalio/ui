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
  import { workflowFilters } from '$lib/stores/filters';

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
    batchTerminateWorkflows,
    pollBatchOperation,
  } from '$lib/services/terminate-service';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import { toaster } from '$lib/holocene/toaster.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { pluralize } from '$lib/utilities/pluralize';

  export let bulkActionsEnabled: boolean = false;

  let selectedWorkflows: WorkflowExecution[] = [];
  let terminationReason: string = '';
  let showBulkOperationConfirmationModal: boolean = false;
  let allSelected: boolean = false;
  let terminating: boolean = false;

  $: query = $page.url.searchParams.get('query');

  $: {
    if (query) {
      // For returning to page from 'Back to Workflows' with previous search
      $workflowsQuery = query;
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
    selectedWorkflows = [];
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

  const terminateWorkflows = async () => {
    terminating = true;
    const { namespace } = $page.params;
    try {
      const jobId = await batchTerminateWorkflows({
        namespace,
        workflowExecutions: terminableWorkflows,
        reason: terminationReason,
      });

      await pollBatchOperation({ namespace, jobId });
    } catch (error) {
      showBulkOperationConfirmationModal = false;
      toaster.push({
        variant: 'error',
        message: 'Unable to terminate workflows.',
      });

      return;
    }

    toaster.push({
      variant: 'success',
      message: `Successfully terminated ${terminableWorkflows.length} workflows.`,
      id: 'batch-terminate-success-toast',
    });
    selectedWorkflows = [];
    allSelected = false;
    terminating = false;
    showBulkOperationConfirmationModal = false;
    terminationReason = '';
    updateQueryParameters({ parameter: 'query', value: '', url: $page.url });
  };

  $: terminableWorkflows = selectedWorkflows.filter(
    (workflows) => workflows.canBeTerminated,
  );
</script>

<Modal
  open={showBulkOperationConfirmationModal}
  confirmText="Terminate"
  confirmType="destructive"
  confirmDisabled={terminationReason === ''}
  loading={terminating}
  on:cancelModal={() => (showBulkOperationConfirmationModal = false)}
  on:confirmModal={terminateWorkflows}
>
  <h3 slot="title">Terminate Workflows</h3>
  <svelte:fragment slot="content">
    <p class="mb-2">
      Are you sure you want to terminate <strong
        >{terminableWorkflows.length} running {pluralize(
          'workflow',
          terminableWorkflows.length,
        )}</strong
      >? This action cannot be undone.
    </p>
    <Input
      id="bulk-terminate-reason"
      bind:value={terminationReason}
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
    terminableWorkflowCount={terminableWorkflows.length}
    bind:selectedWorkflows
    bind:allSelected
    on:terminateWorkflows={handleBulkTerminate}
  >
    {#each visibleItems as event}
      <WorkflowsSummaryRowWithFilters
        {bulkActionsEnabled}
        workflow={event}
        namespace={$page.params.namespace}
        timeFormat={$timeFormat}
        selected={selectedWorkflows.includes(event)}
      />
    {:else}
      <TableRow>
        <td class="hidden xl:table-cell" />
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
