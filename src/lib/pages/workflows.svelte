<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import debounce from 'just-debounce';
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
  import { workflowFilters, workflowSorts } from '$lib/stores/filters';
  import { searchAttributes } from '$lib/stores/search-attributes';

  import { getSearchType } from '$lib/utilities/search-type-parameter';
  import {
    toListWorkflowQuery,
    toListWorkflowQueryFromAdvancedFilters,
  } from '$lib/utilities/query/list-workflow-query';
  import { toListWorkflowAdvancedParameters } from '$lib/utilities/query/to-list-workflow-advanced-parameters';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

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
  import type {
    WorkflowFilter,
    WorkflowSort,
  } from '$lib/models/workflow-filters';

  let searchType: 'basic' | 'advanced' = getSearchType($page.url);

  let advancedSearch = false;
  let manualSearch = false;
  let initialFetch = true;

  const defaultQuery = toListWorkflowQuery({ timeRange: 'All' });
  $: query = $page.url.searchParams.get('query');

  $: {
    if (initialFetch && $searchAttributes) {
      $workflowFilters = toListWorkflowAdvancedParameters(
        query ?? defaultQuery,
        $searchAttributes,
      );
      initialFetch = false;
    }
  }

  const combineDropdownFilters = (filters: WorkflowFilter[]) => {
    const statusFilters = filters.filter(
      (f) => f.attribute === 'ExecutionStatus' && f.value,
    );
    const idFilter = filters.filter(
      (f) => f.attribute === 'WorkflowId' && f.value,
    );
    const typeFilter = filters.filter(
      (f) => f.attribute === 'WorkflowType' && f.value,
    );
    const startTimeFilter = filters.filter(
      (f) => f.attribute === 'StartTime' && f.value,
    );

    const activeFilters = [
      statusFilters,
      idFilter,
      typeFilter,
      startTimeFilter,
    ].filter((f) => f.length);

    activeFilters.forEach((filter, index) => {
      if (filter.length && activeFilters[index + 1]?.length) {
        filter[filter.length - 1].operator = 'AND';
      } else if (filter.length && !activeFilters[index + 1]?.length) {
        filter[filter.length - 1].operator = '';
      }
    });

    return [...statusFilters, ...idFilter, ...typeFilter, ...startTimeFilter];
  };

  const handleParameterChange = debounce(
    (filters: WorkflowFilter[], sorts: WorkflowSort[]) => {
      const allFilters = combineDropdownFilters(filters);
      query = toListWorkflowQueryFromAdvancedFilters(allFilters, sorts);
      updateQueryParameters({
        url: $page.url,
        parameter: 'query',
        value: query,
        allowEmpty: true,
      });
    },
    300,
  );

  $: {
    handleParameterChange($workflowFilters, $workflowSorts);
  }

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
    const parameters = query
      ? toListWorkflowAdvancedParameters(query, $searchAttributes)
      : {};
    $workflowsSearch = { parameters, searchType };
  });
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
    <p class="text-sm text-gray-600" data-cy="namespace-name">
      {$page.params.namespace}
    </p>
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
