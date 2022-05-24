<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  import { getSearchType } from '$lib/utilities/search-type-parameter';
  import { toListWorkflowQuery } from '$lib/utilities/query/list-workflow-query';

  const defaultQuery = toListWorkflowQuery({ timeRange: '1 day' });

  export const load: Load = async function ({ params, url }) {
    if (!url.searchParams.has('query')) {
      url.searchParams.set('query', defaultQuery);
    }

    const { namespace } = params;

    return {
      props: { namespace },
    };
  };
</script>

<script lang="ts">
  import { page } from '$app/stores';
  import { timeFormat } from '$lib/stores/time-format';
  import { workflows, loading, updating } from '$lib/stores/workflows';

  import EmptyState from '$lib/components/empty-state.svelte';
  import Pagination from '$lib/components/pagination.svelte';
  import WorkflowsSummaryTable from './_workflows-summary-table.svelte';
  import WorkflowsSummaryRow from './_workflows-summary-row.svelte';
  import WorkflowFilters from './_workflow-filters.svelte';
  import WorkflowsLoading from './_workflows-loading.svelte';

  export let namespace: string;

  let searchType: 'basic' | 'advanced' = getSearchType($page.url);
  let query = $page.url.searchParams.get('query');

  const errorMessage =
    searchType === 'advanced'
      ? 'Please check your syntax and try again.'
      : 'If you have filters applied, try adjusting them.';
</script>

<h2 class="text-2xl">Recent Workflows</h2>
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
