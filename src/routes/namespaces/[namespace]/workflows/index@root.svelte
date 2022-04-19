<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  import { fetchAllWorkflows } from '$lib/services/workflow-service';

  export const load: Load = async function ({ params, url }) {
    const isAdvancedSearch = url.searchParams.has('query');

    if (!url.searchParams.has('time-range') && !isAdvancedSearch)
      url.searchParams.set('time-range', '24 hours');

    const { namespace } = params;

    return {
      props: { namespace, isAdvancedSearch },
    };
  };
</script>

<script lang="ts">
  import WorkflowsSummaryTable from './_workflows-summary-table.svelte';
  import WorkflowsSummaryRow from './_workflows-summary-row.svelte';
  import WorkflowFilters from './_workflow-filters.svelte';
  import EmptyState from '$lib/components/empty-state.svelte';
  import Pagination from '$lib/components/pagination.svelte';
  import Badge from '$lib/components/badge.svelte';
  import WorkflowLoadingRow from './_workflow-loading-row.svelte';
  import { page } from '$app/stores';
  import { timeFormat } from '$lib/stores/time-format';

  export let namespace: string;
  export let isAdvancedSearch: boolean;

  $: workflowId = $page.url.searchParams.get('workflow-id');
  $: workflowType = $page.url.searchParams.get('workflow-type');
  $: timeRange = $page.url.searchParams.get('time-range');
  $: executionStatus = $page.url.searchParams.get('status') as WorkflowStatus;
  $: query = $page.url.searchParams.get('query');

  $: parameters = {
    workflowId,
    workflowType,
    timeRange,
    executionStatus,
    query,
  };

  $: workflows = fetchAllWorkflows(namespace, parameters, fetch);

  const errorMessage = isAdvancedSearch
    ? 'Please check your syntax and try again.'
    : 'If you have filters applied, try adjusting them.';
</script>

<h2 class="text-2xl">Workflows <Badge type="beta">Beta</Badge></h2>
<WorkflowFilters {parameters} />
{#await workflows}
  <Pagination items={[]} let:visibleItems>
    <WorkflowsSummaryTable>
      <WorkflowLoadingRow />
    </WorkflowsSummaryTable>
  </Pagination>
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
