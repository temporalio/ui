<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import debounce from 'just-debounce';
  import { page } from '$app/stores';
  import { timeFormat } from '$lib/stores/time-format';
  import { workflowCount, workflowsSearch } from '$lib/stores/workflows';
  import {
    refresh,
    workflows,
    loading,
    updating,
    workflowError,
  } from '$lib/stores/workflows';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import { workflowFilters, workflowSorts } from '$lib/stores/filters';

  import { getSearchType } from '$lib/utilities/search-type-parameter';
  import {
    toListWorkflowQuery,
    toListWorkflowQueryFromAdvancedFilters,
  } from '$lib/utilities/query/list-workflow-query';
  import {
    toListWorkflowAdvancedParameters,
    updateQueryParamsFromFilter,
  } from '$lib/utilities/query/to-list-workflow-advanced-parameters';

  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Pagination from '$lib/holocene/pagination.svelte';
  import WorkflowsSummaryTable from '$lib/components/workflow/workflows-summary-table.svelte';
  import WorkflowsSummaryRow from '$lib/components/workflow/workflows-summary-row.svelte';
  import NamespaceSelector from '$lib/holocene/namespace-selector.svelte';
  import Loading from '$holocene/loading.svelte';
  import PageTitle from '$lib/holocene/page-title.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$holocene/icon/icon.svelte';
  import WorkflowAdvancedSearch from '$lib/components/workflow/workflow-advanced-search.svelte';
  import TableRow from '$holocene/table/table-row.svelte';
  import WorkflowDateTime from '$lib/components/workflow/dropdown-filter/workflow-datetime-filter.svelte';

  let searchType: 'basic' | 'advanced' = getSearchType($page.url);

  const url = $page.url;

  let advancedSearch = false;
  let manualSearch = false;

  const defaultQuery = toListWorkflowQuery({ timeRange: 'All' });
  $: query = $page.url.searchParams.get('query');

  onMount(() => {
    $lastUsedNamespace = $page.params.namespace;
    $workflowFilters = toListWorkflowAdvancedParameters(query ?? defaultQuery);
  });

  $: {
    updateQueryParamsFromFilter(url, $workflowFilters, $workflowSorts);
  }

  onDestroy(() => {
    const parameters = query ? toListWorkflowAdvancedParameters(query) : {};
    $workflowsSearch = { parameters, searchType };
  });

  const errorMessage =
    searchType === 'advanced'
      ? 'Please check your syntax and try again.'
      : 'If you have filters applied, try adjusting them.';

  const refreshWorkflows = () => {
    $refresh = Date.now();
  };
</script>

<PageTitle
  title={`Workflows | ${$page.params?.namespace}`}
  url={$page.url.href}
/>
<div class="mb-2 flex justify-between">
  <div>
    <h1 class="text-2xl" data-cy="namespace-title">
      Recent Workflows
      <NamespaceSelector />
    </h1>
    <div class="flex items-center gap-2 text-sm text-gray-600">
      <p data-cy="namespace-name">
        {$page.params.namespace}
      </p>
      <div class="h-2 w-2 rounded-full bg-gray-400" />
      <p>
        {#if !$loading && !$updating}
          {#if query}
            Results {$workflowCount?.count ?? 0} of {$workflowCount?.totalCount ??
              0} workflows
          {:else}
            {$workflowCount?.totalCount ?? 0} workflows
          {/if}
        {/if}
      </p>
    </div>
  </div>
  <div>
    <Button variant="secondary" on:click={refreshWorkflows}
      ><Icon name="retry" /></Button
    >
  </div>
</div>
{#if $loading}
  <Loading />
{:else}
  <Pagination items={$workflows} let:visibleItems>
    <svelte:fragment slot="action-top-left">
      <WorkflowAdvancedSearch
        bind:manualSearch
        bind:advancedSearch
        error={$workflowError}
      />
    </svelte:fragment>
    <svelte:fragment slot="action-top-center">
      {#if !manualSearch}
        <WorkflowDateTime />
      {/if}
    </svelte:fragment>
    <WorkflowsSummaryTable updating={$updating}>
      {#each visibleItems as event}
        <WorkflowsSummaryRow
          workflow={event}
          namespace={$page.params.namespace}
          timeFormat={$timeFormat}
        />
      {:else}
        <TableRow>
          <td colspan="5">
            <EmptyState
              title={'No Workflows Found'}
              content={errorMessage}
              error={$workflowError}
            />
          </td>
        </TableRow>
      {/each}
    </WorkflowsSummaryTable>
  </Pagination>
{/if}
