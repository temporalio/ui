<script lang="ts">
  //   import VirtualList from '@sveltejs/svelte-virtual-list';

  //   import { fetchAllWorkflows } from '$lib/services/workflow-service';
  //   import { refreshable } from '$lib/stores/refreshable';

  import WorkflowsSummaryTable from '../workflows/_workflows-summary-table.svelte';
  import WorkflowsSummaryRow from '../workflows/_workflows-summary-row.svelte';
  import WorkflowFilters from '../workflows/_workflow-filters.svelte';
  //   import EmptyState from '$lib/components/empty-state.svelte';
  import WorkflowsLoadingState from '../workflows/_workflows-loading.svelte';
  import EmptyState from '$lib/components/empty-state.svelte';

  export let namespace: string;
  //   export let initialData: ReturnType<typeof fetchAllWorkflows>;
  export let parameters: FilterParameters;

  let timeFormat: TimeFormat = 'UTC';

  //   $: data = refreshable(
  //     () => fetchAllWorkflows(namespace, parameters),
  //     initialData,
  //   );
</script>

<WorkflowFilters bind:timeFormat />

<WorkflowsSummaryTable>
  <!-- <WorkflowsLoadingState /> -->
  <!-- <VirtualList items={workflows} let:item> -->
  <!-- <WorkflowsSummaryRow workflow={item} {timeFormat} /> -->
  <!-- </VirtualList> -->

  <EmptyState
    title={'No Workflows Found'}
    content={'If you have filters applied, try adjusting them.'}
  />
</WorkflowsSummaryTable>
