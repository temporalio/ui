<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';
  import { routeForWorkflows } from '$lib/utilities/route-for';

  export const load: Load = async function ({ params, fetch }) {
    const url = routeForWorkflows({
      namespace: params.namespace,
      endpoint: 'workflows.json',
    });
    const { namespace, workflows, isAdvancedSearch } = await fetch(url).then(
      (r) => r.json(),
    );

    return {
      props: { namespace, workflows, isAdvancedSearch },
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
  import type { CombinedWorkflowExecutionsResponse } from '$lib/services/workflow-service';

  export let namespace: string;
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
          <WorkflowsSummaryRow workflow={event} {namespace} {timeFormat} />
        {/each}
      </WorkflowsSummaryTable>
    </Pagination>
  {:else}
    <EmptyState title={'No Workflows Found'} content={errorMessage} />
  {/if}
{/await}
