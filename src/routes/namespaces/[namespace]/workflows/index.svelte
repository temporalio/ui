<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';
  import { fetchAllWorkflows } from '$lib/services/workflow-service';
  import { toWorkflowExecutions } from '$lib/models/workflow-execution';

  export async function load({ fetch, page }: LoadInput) {
    const { namespace } = page.params;

    const response = fetchAllWorkflows(namespace, {}, fetch);
    const workflows = await response.then(toWorkflowExecutions);
    const { nextPageTokens } = await response;

    return {
      props: {
        workflows,
        nextPageTokens,
      },
    };
  }
</script>

<script lang="ts">
  import type { WorkflowExecution } from '$lib/models/workflow-execution';

  import WorkflowsSummaryTable from './_workflows-summary-table.svelte';
  import WorkflowsSummaryRow from './_workflows-summary-row.svelte';
  import WorkflowFilters from './_workflow-filters.svelte';
  import WorkflowsEmptyState from './_workflows-empty.svelte';

  export let workflows: WorkflowExecution[];

  let timeFormat = 'relative';
</script>

<section class="flex items-start">
  <div class="w-full h-screen overflow-scroll">
    <header>
      <WorkflowFilters bind:timeFormat />
    </header>
    <WorkflowsSummaryTable>
      <tbody slot="rows">
        {#each workflows as workflow}
          <WorkflowsSummaryRow {workflow} {timeFormat} />
        {:else}
          <WorkflowsEmptyState />
        {/each}
      </tbody>
    </WorkflowsSummaryTable>
  </div>
</section>
