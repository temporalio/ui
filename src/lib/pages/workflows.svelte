<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { page } from '$app/stores';
  import { timeFormat } from '$lib/stores/time-format';
  import { workflowsSearchParams } from '$lib/stores/workflows';
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
  import Icon from '$lib/holocene/icon/icon.svelte';
  import WorkflowFilters from '$lib/components/workflow/workflow-filters.svelte';
  import { getSearchType } from '$lib/utilities/search-type-parameter';
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
    $workflowsSearchParams = $page.url.searchParams.toString();
  });
</script>

<header class="mb-2 flex justify-between">
  <div>
    <h1 class="text-2xl" data-testid="namespace-title">Recent Workflows</h1>
    <div class="flex items-center gap-2 text-sm">
      <p data-testid="namespace-name">
        {$page.params.namespace}
      </p>
    </div>
  </div>
  <div>
    <button
      aria-label="retry workflows"
      class="cursor-pointer rounded-full p-1 hover:bg-gray-900 hover:text-white"
      on:click={refreshWorkflows}
    >
      <Icon name="retry" class="h-8 w-8" />
    </button>
  </div>
</header>
<WorkflowFilters bind:searchType />
<Pagination items={$workflows} let:visibleItems aria-label="recent workflows">
  <WorkflowsSummaryTable updating={$updating}>
    {#each visibleItems as event}
      <WorkflowsSummaryRow
        workflow={event}
        namespace={$page.params.namespace}
        timeFormat={$timeFormat}
      />
    {:else}
      <tr>
        <td colspan="5" class="xl:hidden">
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
        <td colspan="7" class="hidden xl:table-cell">
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
      </tr>
    {/each}
  </WorkflowsSummaryTable>
</Pagination>
