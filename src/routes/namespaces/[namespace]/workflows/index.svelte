<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';

  export async function load({ page, fetch }: LoadInput) {
    if (!page.query.has('time-range')) page.query.set('time-range', '24 hours');

    const namespace = page.params.namespace;
    const workflowId = page.query.get('workflow-id');
    const workflowType = page.query.get('workflow-type');
    const timeRange = page.query.get('time-range');
    const status = page.query.get('status') as WorkflowStatus;

    const initialData = await fetchAllWorkflows(
      namespace,
      { workflowId, workflowType, timeRange, status },
      fetch,
    );

    return {
      props: { initialData, namespace },
    };
  }
</script>

<script lang="ts">
  import { page } from '$app/stores';
  import { fetchAllWorkflows } from '$lib/services/workflow-service';

  import WorkflowsSummaryTable from './_workflows-summary-table.svelte';
  import WorkflowsSummaryRow from './_workflows-summary-row.svelte';
  import WorkflowFilters from './_workflow-filters.svelte';
  import EmptyState from '$lib/components/empty-state.svelte';
  import WorkflowsLoadingState from './_workflows-loading.svelte';
  import VirtualList from '@sveltejs/svelte-virtual-list';

  export let namespace: string;
  export let initialData: ReturnType<typeof fetchAllWorkflows>;

  $: timeRange = $page.query.get('time-range');
  $: data = initialData || fetchAllWorkflows(namespace, { timeRange });

  let timeFormat = 'relative';
</script>

<h2 class="text-2xl">Workflows</h2>
<WorkflowFilters bind:timeFormat />
{#await data}
  <WorkflowsLoadingState />
{:then { workflows }}
  {#if workflows.length}
    <WorkflowsSummaryTable>
      <VirtualList items={workflows} let:item>
        <WorkflowsSummaryRow workflow={item} {timeFormat} />
      </VirtualList>
    </WorkflowsSummaryTable>
  {:else}
    <EmptyState
      title={'Workflows'}
      content={'If you have filters applied, try adjusting them.'}
    />
  {/if}
{/await}
