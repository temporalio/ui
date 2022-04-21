<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  import {
    CombinedWorkflowExecutionsResponse,
    fetchAllWorkflows,
  } from '$lib/services/workflow-service';

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

  import WorkflowsSummaryTable from './_workflows-summary-table.svelte';
  import WorkflowsSummaryRow from './_workflows-summary-row.svelte';
  import WorkflowFilters from './_workflow-filters.svelte';
  import EmptyState from '$lib/components/empty-state.svelte';
  import Pagination from '$lib/components/pagination.svelte';
  import Badge from '$lib/components/badge.svelte';
  import { getSearchType } from '$lib/utilities/search-type-parameter';
  import { toListWorkflowQuery } from '$lib/utilities/query/list-workflow-query';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  export let namespace: string;
  export let searchType: 'basic' | 'advanced';
  export let query: string;

  let workflows: Eventual<CombinedWorkflowExecutionsResponse> =
    fetchAllWorkflows(namespace, {
      query,
    });

  const update = async (query: string) => {
    updateQueryParameters({
      url: $page.url,
      parameter: 'query',
      value: query,
      goto,
    });
    fetchAllWorkflows(namespace, { query }).then((updatedWorkflows) => {
      workflows = updatedWorkflows;
    });
  };

  const errorMessage =
    searchType === 'advanced'
      ? 'Please check your syntax and try again.'
      : 'If you have filters applied, try adjusting them.';
</script>

<h2 class="text-2xl">Workflows <Badge type="beta">Beta</Badge></h2>
<WorkflowFilters bind:searchType bind:query {update} />
{#await workflows}
  <p>Loading…</p>
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
