<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  import { fetchAllWorkflows } from '$lib/services/workflow-service';
  import type { CombinedWorkflowExecutionsResponse } from '$lib/services/workflow-service';

  import { getSearchType } from '$lib/utilities/search-type-parameter';
  import { toListWorkflowQuery } from '$lib/utilities/query/list-workflow-query';

  const defaultQuery = toListWorkflowQuery({ timeRange: '1 day' });

  export const load: Load = async function ({ params, url }) {
    const searchType = getSearchType(url);

    if (!url.searchParams.has('query')) {
      url.searchParams.set('query', defaultQuery);
    }

    const query = url.searchParams.get('query');
    const { namespace } = params;

    return {
      props: { namespace, searchType, query },
    };
  };
</script>

<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { timeFormat } from '$lib/stores/time-format';

  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  import EmptyState from '$lib/components/empty-state.svelte';
  import Pagination from '$lib/components/pagination.svelte';
  import Badge from '$lib/components/badge.svelte';
  import WorkflowsSummaryTable from './_workflows-summary-table.svelte';
  import WorkflowsSummaryRow from './_workflows-summary-row.svelte';
  import WorkflowFilters from './_workflow-filters.svelte';
  import WorkflowsLoading from './_workflows-loading.svelte';

  export let namespace: string;
  export let searchType: 'basic' | 'advanced';
  export let query: string;

  let workflows: Eventual<CombinedWorkflowExecutionsResponse> =
    fetchAllWorkflows(namespace, {
      query,
    });

  let update = async (updatedQuery: string = query) => {
    updateQueryParameters({
      url: $page.url,
      parameter: 'query',
      value: updatedQuery,
      goto,
    });
    fetchAllWorkflows(namespace, { query: updatedQuery }).then(
      (updatedWorkflows) => {
        workflows = updatedWorkflows;
      },
    );
  };

  $: namespace && update();

  const errorMessage =
    searchType === 'advanced'
      ? 'Please check your syntax and try again.'
      : 'If you have filters applied, try adjusting them.';
</script>

<h2 class="text-2xl">Workflows <Badge type="beta">Beta</Badge></h2>
<WorkflowFilters bind:searchType bind:query {update} />
{#await workflows}
  <WorkflowsLoading />
{:then { workflows }}
  {#if workflows.length}
    <Pagination items={workflows} let:visibleItems>
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
{/await}
