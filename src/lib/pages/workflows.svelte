<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { page } from '$app/stores';
  import { timeFormat } from '$lib/stores/time-format';
  import { workflowsSearch } from '$lib/stores/workflows';
  import {
    refresh,
    workflows,
    loading,
    updating,
    workflowError,
  } from '$lib/stores/workflows';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Pagination from '$lib/holocene/pagination.svelte';
  import WorkflowsSummaryRow from '$lib/components/workflow/workflows-summary-row.svelte';
  import NamespaceSelector from '$lib/holocene/namespace-selector.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$holocene/icon/icon.svelte';
  import TableRow from '$holocene/table/table-row.svelte';
  import WorkflowFilters from '$lib/components/workflow/workflow-filters.svelte';
  import { getSearchType } from '$lib/utilities/search-type-parameter';
  import { toListWorkflowParameters } from '$lib/utilities/query/to-list-workflow-parameters';
  import Loading from '$lib/holocene/loading.svelte';
  import WorkflowsSummaryTable from '$lib/components/workflow/workflows-summary-table.svelte';
  import { toaster } from '$lib/holocene/toaster.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import {
    batchTerminateWorkflows,
    pollBatchOperation,
  } from '$lib/services/terminate-service';
  import Input from '$lib/holocene/input/input.svelte';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  export let bulkActionsEnabled: boolean = true;

  let searchType: 'basic' | 'advanced' = getSearchType($page.url);
  let selectedWorkflows: WorkflowExecution[] = [];
  let terminationReason: string = '';
  let showBulkOperationConfirmationModal: boolean = false;
  let allSelected: boolean = false;

  const errorMessage =
    searchType === 'advanced'
      ? 'Please check your syntax and try again.'
      : 'If you have filters applied, try adjusting them.';

  onMount(() => {
    $lastUsedNamespace = $page.params.namespace;
  });

  const refreshWorkflows = () => {
    allSelected = false;
    selectedWorkflows = [];
    $refresh = Date.now();
  };

  const handleBulkTerminate = () => {
    showBulkOperationConfirmationModal = true;
  };

  const terminateWorkflows = async () => {
    const { namespace } = $page.params;
    const jobId = await batchTerminateWorkflows({
      namespace,
      workflowExecutions: terminableWorkflows,
      reason: terminationReason,
    });

    try {
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
      variant: 'primary',
      message: `Successfully terminated ${terminableWorkflows.length} workflows.`,
    });
    selectedWorkflows = [];
    allSelected = false;
    showBulkOperationConfirmationModal = false;
    updateQueryParameters({ parameter: 'query', value: '', url: $page.url });
  };

  onDestroy(() => {
    const query = $page.url.searchParams.get('query');
    const parameters = query ? toListWorkflowParameters(query) : {};
    $workflowsSearch = { parameters, searchType };
  });

  $: terminableWorkflows = selectedWorkflows.filter(
    (workflows) => workflows.canBeTerminated,
  );
</script>

<Modal
  open={showBulkOperationConfirmationModal}
  confirmText="Terminate"
  confirmType="destructive"
  confirmDisabled={terminationReason === ''}
  on:cancelModal={() => (showBulkOperationConfirmationModal = false)}
  on:confirmModal={terminateWorkflows}
>
  <h3 slot="title">Terminate Workflows</h3>
  <svelte:fragment slot="content">
    <p class="mb-2">
      Are you sure you want to terminate <strong
        >{terminableWorkflows.length} running workflows</strong
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
    </div>
  </div>
  <div>
    <Button variant="secondary" on:click={refreshWorkflows}
      ><Icon name="retry" /></Button
    >
  </div>
</div>
<WorkflowFilters bind:searchType />
<Pagination items={$workflows} let:visibleItems>
  <WorkflowsSummaryTable
    {bulkActionsEnabled}
    updating={$updating}
    visibleWorkflows={visibleItems}
    terminableWorkflowCount={terminableWorkflows.length}
    bind:selectedWorkflows
    bind:allSelected
    on:terminateWorkflows={handleBulkTerminate}
  >
    {#each visibleItems as event}
      <WorkflowsSummaryRow
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
  </WorkflowsSummaryTable>
</Pagination>
