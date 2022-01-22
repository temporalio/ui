<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';

  export async function load({ page, fetch }: LoadInput) {
    if (!page.query.has('time-range')) page.query.set('time-range', '24 hours');

    const validPages = ['workflows', 'archival'];

    let workflowFetch = fetchAllWorkflows;

    if (page.params.workflows === 'archival') {
      workflowFetch = fetchAllArchivedWorkflows;
    }

    if (!validPages.includes(page.params.workflows)) {
      return {
        status: 404,
        error: new Error(`${page.params.workflows} Not a valid page`),
      };
    }

    const namespace = page.params.namespace;
    const workflowId = page.query.get('workflow-id');
    const workflowType = page.query.get('workflow-type');
    const timeRange = page.query.get('time-range');
    const executionStatus = page.query.get('status') as WorkflowStatus;

    const parameters: FilterParameters = {
      workflowId,
      workflowType,
      timeRange,
      executionStatus,
    };

    const initialData = await workflowFetch(namespace, parameters, fetch);

    return {
      props: { initialData, namespace, parameters },
    };
  }
</script>

<script lang="ts">
  import VirtualList from '@sveltejs/svelte-virtual-list';

  import {
    fetchAllWorkflows,
    fetchAllArchivedWorkflows,
  } from '$lib/services/workflow-service';
  import { refreshable } from '$lib/stores/refreshable';
  import { page } from '$app/stores';

  let workflowFetch = fetchAllWorkflows;

  if ($page.params.workflows === 'archival') {
    workflowFetch = fetchAllArchivedWorkflows;
  }
  import WorkflowsSummaryTable from './_workflows-summary-table.svelte';
  import WorkflowsSummaryRow from './_workflows-summary-row.svelte';
  import WorkflowFilters from './_workflow-filters.svelte';
  import EmptyState from '$lib/components/empty-state.svelte';
  import WorkflowsLoadingState from './_workflows-loading.svelte';

  export let namespace: string;
  export let initialData: ReturnType<typeof fetchAllWorkflows>;
  export let parameters: FilterParameters;

  let timeFormat: TimeFormat = 'UTC';

  $: data = refreshable(
    () => workflowFetch(namespace, parameters),
    initialData,
  );
</script>

<h2 class="text-2xl">Workflows</h2>
<WorkflowFilters bind:timeFormat />
{#await $data}
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
      title={'No Workflows Found'}
      content={'If you have filters applied, try adjusting them.'}
    />
  {/if}
{/await}
