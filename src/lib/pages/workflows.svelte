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
  import SelectableTable from '$lib/holocene/table/selectable-table.svelte';
  import NamespaceSelector from '$lib/holocene/namespace-selector.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$holocene/icon/icon.svelte';
  import TableRow from '$holocene/table/table-row.svelte';
  import WorkflowFilters from '$lib/components/workflow/workflow-filters.svelte';
  import { getSearchType } from '$lib/utilities/search-type-parameter';
  import { toListWorkflowParameters } from '$lib/utilities/query/to-list-workflow-parameters';
  import Loading from '$lib/holocene/loading.svelte';
  import { batchTerminateWorkflows } from '$lib/services/terminate-service';
  import SelectableTableRow from '$lib/holocene/table/selectable-table-row.svelte';
  import BulkActionButton from '$lib/holocene/table/bulk-action-button.svelte';

  let searchType: 'basic' | 'advanced' = getSearchType($page.url);
  let selectedWorkflows: WorkflowExecution[] = [];

  const errorMessage =
    searchType === 'advanced'
      ? 'Please check your syntax and try again.'
      : 'If you have filters applied, try adjusting them.';

  onMount(() => {
    $lastUsedNamespace = $page.params.namespace;
  });

  const refreshWorkflows = () => {
    $refresh = Date.now();
  };

  const handleSelectWorkflow = (event: CustomEvent<WorkflowExecution[]>) => {
    selectedWorkflows = event.detail;
  };

  const terminateWorkflows = () => {
    batchTerminateWorkflows({
      namespace: $page.params.namespace,
      query: $page.url.searchParams.get('query'),
      reason: 'Batch Terminate',
    });
  };

  onDestroy(() => {
    const query = $page.url.searchParams.get('query');
    const parameters = query ? toListWorkflowParameters(query) : {};
    $workflowsSearch = { parameters, searchType };
  });
</script>

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
  <SelectableTable
    items={visibleItems}
    updating={$updating}
    on:change={handleSelectWorkflow}
  >
    <svelte:fragment slot="default-headers">
      <th class="hidden w-48 md:table-cell">Status</th>
      <th class="hidden md:table-cell md:w-60 xl:w-auto">Workflow ID</th>
      <th class="hidden md:table-cell md:w-60 xl:w-80">Type</th>
      <th class="hidden xl:table-cell xl:w-60">Start</th>
      <th class="hidden xl:table-cell xl:w-60">End</th>
      <th class="table-cell md:hidden" colspan="3">Summary</th>
    </svelte:fragment>
    <svelte:fragment slot="bulk-action-headers">
      <th class="hidden w-48 md:table-cell">
        <BulkActionButton on:click={terminateWorkflows}
          >Terminate</BulkActionButton
        >
      </th>
      <th class="hidden md:table-cell md:w-60 xl:w-auto" />
      <th class="hidden md:table-cell md:w-60 xl:w-80" />
      <th class="hidden xl:table-cell xl:w-60" />
      <th class="hidden xl:table-cell xl:w-60" />
      <th class="table-cell md:hidden" colspan="3" />
    </svelte:fragment>
    {#each visibleItems as event}
      <WorkflowsSummaryRow
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
  </SelectableTable>
</Pagination>
