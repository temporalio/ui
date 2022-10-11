<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
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

  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';

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

  $: query = $page.url.searchParams.get('query');

  $: {
    if (query) {
      $workflowsSearch = query;
    }
  }

  onMount(() => {
    $lastUsedNamespace = $page.params.namespace;
    if (query) {
      $workflowFilters = toListWorkflowFilters(query);
    }
  });

  const errorMessage =
    'If you have filters applied, try adjusting them. Otherwise please check your syntax and try again.';

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
      <WorkflowAdvancedSearch />
    </svelte:fragment>
    <svelte:fragment slot="action-top-center">
      <WorkflowDateTime />
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
