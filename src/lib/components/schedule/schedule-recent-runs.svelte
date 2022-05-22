<script lang="ts">
  import Panel from '$lib/components/panel.svelte';
  import WorkflowStatus from '../workflow-status.svelte';
  import { formatDate } from '$lib/utilities/format-date';
  import { timeFormat } from '$lib/stores/time-format';
  import { fetchWorkflow } from '$lib/services/workflow-service';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';

  export let recentRuns = [];
  export let namespace: string;
</script>

<Panel>
  <h2 class="text-2xl mb-4">Recent Runs</h2>
  {#each recentRuns.sort((a, b) => new Date(b.actualTime) - new Date(a.actualTime)) as run (run.startWorkflowResult.workflowId)}
    {#await fetchWorkflow({ namespace, workflowId: decodeURIForSvelte(run.startWorkflowResult.workflowId), runId: run.startWorkflowResult.runId }, fetch) then workflow}
      <div class="row">
        <div class="w-28">
          <WorkflowStatus status={workflow.status} />
        </div>
        <div class="w-96">{run.startWorkflowResult.workflowId}</div>
        <div class="ml-auto">
          <p>{formatDate(run.actualTime, $timeFormat)}</p>
        </div>
      </div>
    {/await}
  {/each}
</Panel>

<style lang="postcss">
  .row {
    @apply inline-flex border-b-2 border-gray-300 my-1 py-1 w-full h-10;
  }
  .cell {
    @apply text-left;
  }
</style>
