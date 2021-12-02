<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';

  export async function load({ page, fetch }: LoadInput) {
    if (!page.query.has('time-range')) page.query.set('time-range', '24 hours');

    const namespace = page.params.namespace;
    const timeRange = page.query.get('time-range');

    const initialData = await fetchAllWorkflows(
      page.params.namespace,
      { timeRange },
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
  import WorkflowsEmptyState from './_workflows-empty.svelte';
  import WorkflowsLoadingState from './_workflows-loading.svelte';

  export let namespace: string;
  export let initialData: ReturnType<typeof fetchAllWorkflows>;

  $: timeRange = $page.query.get('time-range');
  $: data = initialData || fetchAllWorkflows(namespace, { timeRange });

  let timeFormat = 'relative';
</script>

<section class="flex items-start">
  <div class="w-full h-screen overflow-scroll">
    <header>
      <WorkflowFilters bind:timeFormat />
    </header>
    {#await data}
      <WorkflowsLoadingState />
    {:then { workflows }}
      {#if workflows.length}
        <WorkflowsSummaryTable>
          <tbody slot="rows">
            {#each workflows as workflow}
              <WorkflowsSummaryRow {workflow} {timeFormat} />
            {/each}
          </tbody>
        </WorkflowsSummaryTable>
      {:else}
        <WorkflowsEmptyState />
      {/if}
    {/await}
  </div>
</section>
