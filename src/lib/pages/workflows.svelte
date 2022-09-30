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

  import { getSearchType } from '$lib/utilities/search-type-parameter';
  import { toListWorkflowParameters } from '$lib/utilities/query/to-list-workflow-parameters';

  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Pagination from '$lib/holocene/pagination.svelte';
  import WorkflowsSummaryTable from '$lib/components/workflow/workflows-summary-table.svelte';
  import WorkflowsSummaryRow from '$lib/components/workflow/workflows-summary-row.svelte';
  import WorkflowFilters from '$lib/components/workflow/workflow-filters.svelte';
  import NamespaceSelector from '$lib/holocene/namespace-selector.svelte';
  import Loading from '$holocene/loading.svelte';
  import PageTitle from '$lib/holocene/page-title.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$holocene/icon/icon.svelte';
  import Select from '$lib/holocene/select/simple-select.svelte';
  import Option from '$lib/holocene/select/simple-option.svelte';
  import WorkflowAdvancedFilters from '$lib/components/workflow/workflow-advanced-filters.svelte';
  import WorkflowAdvancedSearch from '$lib/components/workflow/workflow-advanced-search.svelte';
  import TableRow from '$holocene/table/table-row.svelte';
  import WorkflowDateTime from '$lib/components/workflow/workflow-datetime-filter.svelte';

  let searchType: 'basic' | 'advanced' = getSearchType($page.url);

  let filters = [];
  let sorts = [];
  let datetimeFilter = [];
  let manualSearch = false;

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

  const onFilterChange = (filter: {
    label: string;
    value: string;
    type: SearchAttributesValue;
  }) => {
    const conditionals = {
      Keyword: '=',
      Int: '=',
      Datetime: 'In Last',
    };
    filters = [
      {
        filterType: filter.type,
        value: '',
        operator: '',
        parenthesis: '',
        conditional: conditionals[filter.type],
      },
    ];
  };
</script>

<PageTitle
  title={`Workflows | ${$page.params?.namespace}`}
  url={$page.url.href}
/>
<div class="flex justify-between mb-2">
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
<!-- <WorkflowAdvancedFilters bind:filters bind:sorts /> -->
{#if $loading}
  <Loading />
{:else}
  <Pagination items={$workflows} updating={$updating} let:visibleItems>
    <svelte:fragment slot="action-top-left">
      <WorkflowAdvancedSearch
        bind:manualSearch
        bind:filters
        {sorts}
        error={$workflowError}
      />
    </svelte:fragment>
    <svelte:fragment slot="action-top-center">
      {#if !manualSearch}
        <WorkflowDateTime bind:datetimeFilter />
      {/if}
    </svelte:fragment>
    <WorkflowsSummaryTable
      updating={$updating}
      {datetimeFilter}
      bind:filters
      bind:sorts
    >
      {#each visibleItems as event}
        <WorkflowsSummaryRow
          workflow={event}
          namespace={$page.params.namespace}
          timeFormat={$timeFormat}
        />
      {:else}
        <TableRow>
          <td colspan="5">
            <EmptyState title={'No Workflows Found'} content={errorMessage} />
          </td>
        </TableRow>
      {/each}
    </WorkflowsSummaryTable>
  </Pagination>
{/if}
