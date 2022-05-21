<script lang="ts">
  import Panel from '$lib/components/panel.svelte';
  import WorkflowStatus from '../workflow-status.svelte';
  import { formatDate } from '$lib/utilities/format-date';
  import { timeFormat } from '$lib/stores/time-format';

  export let recentRuns = [];
</script>

<Panel>
  <h2 class="text-2xl mb-4">Recent Runs</h2>
  {#each recentRuns as run (run.startWorkflowResult.workflowId)}
    <div class="row">
      <div class="w-28">
        <WorkflowStatus status={run.status} />
      </div>
      <div class="w-96">{run.startWorkflowResult.workflowId}</div>
      <div class="ml-auto">
        <p>{formatDate(run.actualTime, $timeFormat)}</p>
      </div>
    </div>
  {/each}
</Panel>

<style lang="postcss">
  .row {
    @apply inline-flex border-b-2 border-gray-300 my-1 py-1 w-full;
  }
  .cell {
    @apply text-left;
  }
</style>
