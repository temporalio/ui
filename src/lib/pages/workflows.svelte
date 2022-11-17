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

  let searchType: 'basic' | 'advanced' = getSearchType($page.url);

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
  <WorkflowsSummaryTable updating={$updating}>
    {#each visibleItems as event}
      <WorkflowsSummaryRow
        workflow={event}
        namespace={$page.params.namespace}
        timeFormat={$timeFormat}
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
