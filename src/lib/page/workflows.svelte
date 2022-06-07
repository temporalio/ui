<script lang="ts">
  import { page } from '$app/stores';
  import { timeFormat } from '$lib/stores/time-format';
  import { workflows, loading, updating } from '$lib/stores/workflows';
  import { getSearchType } from '$lib/utilities/search-type-parameter';

  import EmptyState from '$lib/components/empty-state.svelte';
  import Pagination from '$lib/components/pagination.svelte';
  import WorkflowsSummaryTable from '$lib/components/workflow/workflows-summary-table.svelte';
  import WorkflowsSummaryRow from '$lib/components/workflow/workflows-summary-row.svelte';
  import WorkflowFilters from '$lib/components/workflow/workflow-filters.svelte';
  import WorkflowsLoading from '$lib/components/workflow/workflows-loading.svelte';

  const { namespace } = $page.params;

  let searchType: 'basic' | 'advanced' = getSearchType($page.url);
  let query = $page.url.searchParams.get('query');

  const errorMessage =
    searchType === 'advanced'
      ? 'Please check your syntax and try again.'
      : 'If you have filters applied, try adjusting them.';
</script>

<h2 class="text-2xl">Recent Workflows</h2>
<slot name="metrics" />
<WorkflowFilters bind:searchType bind:query />
{#if $loading}
  <WorkflowsLoading />
{:else if $workflows.length}
  <Pagination items={$workflows} updating={$updating} let:visibleItems>
    <WorkflowsSummaryTable>
      {#each visibleItems as event}
        <WorkflowsSummaryRow
          workflow={event}
          {namespace}
          timeFormat={$timeFormat}
        />
      {/each}
    </WorkflowsSummaryTable>
  </Pagination>
{:else}
  <EmptyState title={'No Workflows Found'} content={errorMessage} />
{/if}
