<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';
  import { WorkflowExecutionAPI } from '$lib/services/workflow-execution-service';
  import {
    toWorkflowExecutions,
    WorkflowExecution,
  } from '$lib/models/workflow-execution';

  export async function load({ fetch }: LoadInput) {
    return await WorkflowExecutionAPI.getAll(fetch)
      .then(toWorkflowExecutions)
      .then((executions) => ({
        props: { executions },
      }));
  }
</script>

<script lang="ts">
  import { query } from '$lib/stores/data';
  import { isFullScreen } from '$lib/stores/full-screen';

  import WorkflowsSummaryTable from './_workflows-summary-table.svelte';
  import WorkflowsSummaryRow from './_workflows-summary-row.svelte';

  export let executions: WorkflowExecution[];

  let request = query.request('executions', WorkflowExecutionAPI.getAll, {
    format: toWorkflowExecutions,
    initialData: executions,
  });
</script>

<section class="flex items-start">
  {#if !$isFullScreen}
    <WorkflowsSummaryTable>
      <tbody slot="rows">
        {#each $request.data as workflow}
          <WorkflowsSummaryRow {workflow} />
        {/each}
      </tbody>
    </WorkflowsSummaryTable>
  {/if}
  <slot />
</section>
