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
  import { timeFormat } from '$lib/stores/time-format';
  // import { workflows, loading, updating } from '$lib/stores/workflows';

  import EmptyState from '$lib/components/empty-state.svelte';
  import Pagination from '$lib/components/pagination.svelte';
  import Badge from '$lib/components/badge.svelte';
  import WorkflowsSummaryTable from './_workflows-summary-table.svelte';
  import WorkflowsSummaryRow from './_workflows-summary-row.svelte';
  import WorkflowFilters from './_workflow-filters.svelte';
  import WorkflowsLoading from './_workflows-loading.svelte';
  import { page } from '$app/stores';
  import { query } from 'svelte-apollo';
  import { gql } from '../../../../gql';
  import type {
    WorkflowsQuery,
    WorkflowsQueryVariables,
  } from '../../../../gql/graphql';

  const WORKFLOWS_QUERY = gql(/* GraphQL */ `
    query Workflows($input: WorkflowsInput) {
      workflows(input: $input) {
        nodes {
          id
          runId
          type
          status
          isRunning
          taskQueue
          historyLength
          startTime
          executionTime
          closeTime
          parent {
            id
            runId
          }
          parentNamespace
          memo
          searchAttributes
          stateTransitionCount
        }
        nextPageToken
      }
    }
  `);

  const workflows = query<WorkflowsQuery, WorkflowsQueryVariables>(
    WORKFLOWS_QUERY,
    {
      // show data that's in cache and also send query to server to get fresh results
      fetchPolicy: 'cache-and-network',
      // after the initial query, poll every 2 seconds to get fresh results
      pollInterval: 2000,
    },
  );

  export let namespace: string;

  let searchType: 'basic' | 'advanced' = getSearchType($page.url);
  // let filter = $page.url.searchParams.get('query');

  const errorMessage =
    searchType === 'advanced'
      ? 'Please check your syntax and try again.'
      : 'If you have filters applied, try adjusting them.';
</script>

<h2 class="text-2xl">Recent Workflows <Badge type="beta">Beta</Badge></h2>
<!-- <WorkflowFilters bind:searchType bind:query /> -->

{#if $workflows.loading}
  <WorkflowsLoading />
{:else if $workflows.error}
  Error: {$workflows.error.message}
{:else if !$workflows.data.workflows.nodes.length}
  <EmptyState title={'No Workflows Found'} content={errorMessage} />
{:else}
  <div>
    Results:
    <ul>
      {#each $workflows.data.workflows.nodes as workflow}
        <li>
          {workflow.id} - {workflow.type} - {workflow.status} - {workflow.startTime}
        </li>
      {/each}
    </ul>
  </div>
{/if}

<!-- {#if $loading}
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
{/if} -->
