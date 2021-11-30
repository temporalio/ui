<script lang="ts">
  import { namespace } from '$lib/stores/namespace';
  import { createWorkflowStore } from '$lib/stores/workflows';

  import WorkflowsSummaryTable from './_workflows-summary-table.svelte';
  import WorkflowsSummaryRow from './_workflows-summary-row.svelte';
  import WorkflowFilters from './_workflow-filters.svelte';
  import WorkflowPagination from './_workflow-pagination.svelte';
  import WorkflowsEmptyState from './_workflows-empty.svelte';
  import Loading from '$lib/components/loading.svelte';

  $: ({ workflows, loading, updating } = createWorkflowStore($namespace));

  let timeFormat = 'relative';
  let currentPage = 0;
  let executionsPerPage = 50;

  $: maximumPage = Math.ceil($workflows.length / executionsPerPage);

  $: visibleWorkflows = $workflows.slice(
    currentPage * executionsPerPage,
    currentPage * executionsPerPage + executionsPerPage,
  );

  $: {
    if (currentPage > maximumPage) currentPage = maximumPage - 1;
  }
</script>

<section class="flex items-start">
  <div class="w-full h-screen overflow-scroll">
    <header>
      <WorkflowFilters bind:timeFormat />
      <WorkflowPagination bind:currentPage {maximumPage} />
    </header>
    <Loading loading={$loading} updating={$updating} />
    <WorkflowsSummaryTable>
      <tbody slot="rows">
        {#each visibleWorkflows as workflow}
          <WorkflowsSummaryRow {workflow} {timeFormat} />
        {:else}
          <WorkflowsEmptyState />
        {/each}
      </tbody>
    </WorkflowsSummaryTable>
  </div>
</section>
