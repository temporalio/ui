<script lang="ts">
  import { page } from '$app/stores';
  import { timeFormat } from '$lib/stores/time-format';
  import { workflowsSearch } from '$lib/stores/workflows';

  import { getSearchType } from '$lib/utilities/search-type-parameter';
  import { toListWorkflowParameters } from '$lib/utilities/query/to-list-workflow-parameters';

  import EmptyState from '$lib/components/empty-state.svelte';
  import Pagination from '$lib/components/pagination.svelte';
  import WorkflowsSummaryTable from '$lib/components/workflow/workflows-summary-table.svelte';
  import WorkflowsSummaryRow from '$lib/components/workflow/workflows-summary-row.svelte';
  import WorkflowFilters from '$lib/components/workflow/workflow-filters.svelte';
  import WorkflowsLoading from '$lib/components/workflow/workflows-loading.svelte';
  import { onDestroy, onMount } from 'svelte';

  export let workflows: WorkflowExecution[];
  export let loading: boolean;
  export let updating: boolean;

  let searchType: 'basic' | 'advanced' = getSearchType($page.url);
  let query = $page.url.searchParams.get('query');

  const errorMessage =
    searchType === 'advanced'
      ? 'Please check your syntax and try again.'
      : 'If you have filters applied, try adjusting them.';

  onDestroy(() => {
    const parameters = query ? toListWorkflowParameters(query) : {};
    $workflowsSearch = { parameters, searchType };
  });
</script>

<h2 class="text-2xl">Recent Workflows</h2>
<WorkflowFilters bind:searchType bind:query />
{#if loading}
  <WorkflowsLoading />
{:else if workflows.length}
  <Pagination items={workflows} {updating} let:visibleItems>
    <WorkflowsSummaryTable>
      {#each visibleItems as event}
        <WorkflowsSummaryRow
          workflow={event}
          namespace={$page.params.namespace}
          timeFormat={$timeFormat}
        />
      {/each}
    </WorkflowsSummaryTable>
  </Pagination>
{:else}
  <EmptyState title={'No Workflows Found'} content={errorMessage} />
{/if}
