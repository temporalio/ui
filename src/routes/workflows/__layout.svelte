<script lang="ts">
  import { isFullScreen } from '$lib/stores/full-screen';
  import { workflowExecutions } from '$lib/stores/workflow-executions';

  import WorkflowsSummaryTable from './_workflows-summary-table.svelte';
  import WorkflowsSummaryRow from './_workflows-summary-row.svelte';
</script>

<section class="flex items-start">
  {#if !$isFullScreen}
    <WorkflowsSummaryTable>
      <tbody slot="rows">
        {#each $workflowExecutions as workflow}
          <WorkflowsSummaryRow {workflow} />
        {/each}
      </tbody>
    </WorkflowsSummaryTable>
  {/if}
  <slot />
</section>
