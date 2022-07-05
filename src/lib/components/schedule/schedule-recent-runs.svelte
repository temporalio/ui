<script lang="ts">
  import type { ScheduleActionResult } from '$types';
  import Panel from '$lib/components/panel.svelte';
  import WorkflowStatus from '../workflow-status.svelte';
  import { formatDate } from '$lib/utilities/format-date';
  import { timeFormat } from '$lib/stores/time-format';
  import { fetchWorkflow } from '$lib/services/workflow-service';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';
  import EmptyState from '../empty-state.svelte';

  export let recentRuns: ScheduleActionResult[] = [];
  export let namespace: string;
</script>

<Panel>
  <h2 class="mb-4 text-2xl">Recent Runs</h2>
  {#each recentRuns
    .sort((a, b) => new Date(b.actualTime) - new Date(a.actualTime))
    .slice(0, 5) as run (run.startWorkflowResult.workflowId)}
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
  {#if !recentRuns.length}
    <EmptyState title={'No Recent Runs'} />
  {/if}
</Panel>

<style lang="postcss">
  .row {
    @apply my-1 inline-flex h-10 w-full border-b-2 border-gray-300 py-1;
  }
</style>
