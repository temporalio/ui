<script context="module" lang="ts">
  import { WorkflowExecutionAPI } from '$lib/services/workflow-execution-service';
  import type { LoadInput } from '@sveltejs/kit';

  export async function load({ fetch }: LoadInput) {
    const { executions } = await WorkflowExecutionAPI.getAll(fetch);

    return {
      props: {
        executions,
      },
    };
  }
</script>

<script lang="ts">
  import type { WorkflowExecutionInfo } from '$types/temporal/api/workflow/v1/message';

  import { isFullScreen } from '$lib/stores/full-screen';
  import { WorkflowExecution } from '$lib/models/workflow-execution';

  import WorkflowsSummaryTable from './_workflows-summary-table.svelte';
  import WorkflowsSummaryRow from './_workflows-summary-row.svelte';

  export let executions: WorkflowExecutionInfo[];

  $: workflowExecutions = executions.map(
    (workflowExecutionInfo) => new WorkflowExecution({ workflowExecutionInfo }),
  );
</script>

<section class="flex items-start">
  {#if !$isFullScreen}
    <WorkflowsSummaryTable>
      <tbody slot="rows">
        {#each workflowExecutions as workflow}
          <WorkflowsSummaryRow {workflow} />
        {/each}
      </tbody>
    </WorkflowsSummaryTable>
  {/if}
  <slot />
</section>
