<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';
  import type { CombinedWorkflowExecutionsResponse } from '$lib/services/workflow-service';

  import { fetchAllWorkflows } from '$lib/services/workflow-service';

  export const load: Load = async function ({ params, url }) {
    const isAdvancedSearch = url.searchParams.has('query');

    if (!url.searchParams.has('time-range') && !isAdvancedSearch)
      url.searchParams.set('time-range', '24 hours');

    const namespace = params.namespace;
    const workflowId = url.searchParams.get('workflow-id');
    const workflowType = url.searchParams.get('workflow-type');
    const timeRange = url.searchParams.get('time-range');
    const executionStatus = url.searchParams.get('status') as WorkflowStatus;
    const query = url.searchParams.get('query');

    const parameters: ValidWorkflowParameters = {
      workflowId,
      workflowType,
      timeRange,
      executionStatus,
      query,
    };

    const workflows = await fetchAllWorkflows(namespace, parameters, fetch);

    return {
      props: { workflows, isAdvancedSearch },
    };
  };
</script>

<script lang="ts">
  import WorkflowsSummaryTable from './_workflows-summary-table.svelte';
  import WorkflowsSummaryRow from './_workflows-summary-row.svelte';
  import WorkflowFilters from './_workflow-filters.svelte';
  import EmptyState from '$lib/components/empty-state.svelte';
  import WorkflowsLoadingState from './_workflows-loading.svelte';
  import Pagination from '$lib/components/pagination.svelte';
  import Badge from '$lib/components/badge.svelte';

  export let workflows: CombinedWorkflowExecutionsResponse;
  export let isAdvancedSearch: boolean;

  let timeFormat: TimeFormat = 'UTC';

  const errorMessage = isAdvancedSearch
    ? 'Please check your syntax and try again.'
    : 'If you have filters applied, try adjusting them.';
</script>

<h2 class="text-2xl">Workflows <Badge type="beta">Beta</Badge></h2>
<WorkflowFilters bind:timeFormat />
{#await workflows}
  <WorkflowsLoadingState />
{:then { workflows }}
  {#if workflows.length}
    <Pagination items={workflows} let:visibleItems>
      <WorkflowsSummaryTable>
        {#each visibleItems as event}
          <WorkflowsSummaryRow workflow={event} {timeFormat} />
        {/each}
      </WorkflowsSummaryTable>
    </Pagination>
  {:else}
    <EmptyState title={'No Workflows Found'} content={errorMessage} />
  {/if}
{/await}
