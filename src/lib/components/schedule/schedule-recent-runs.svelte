<script lang="ts">
  import type { ScheduleActionResult } from '$types';
  import Panel from '$lib/components/panel.svelte';
  import WorkflowStatus from '../workflow-status.svelte';
  import { formatDate } from '$lib/utilities/format-date';
  import { timeFormat } from '$lib/stores/time-format';
  import { fetchWorkflowForSchedule } from '$lib/services/workflow-service';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import { routeForEventHistory } from '$lib/utilities/route-for';
  import Link from '$lib/holocene/link.svelte';

  export let recentRuns: ScheduleActionResult[] = [];
  export let namespace: string;

  const sortRecentRuns = (recentRuns: ScheduleActionResult[]) => {
    return (
      recentRuns
        ?.sort(
          (a, b) =>
            new Date(b.actualTime as string).getTime() -
            new Date(a.actualTime as string).getTime(),
        )
        ?.slice(0, 5) ?? []
    );
  };
</script>

<Panel>
  <h2 class="mb-4 text-2xl">Recent Runs</h2>
  {#each sortRecentRuns(recentRuns) as run (run?.startWorkflowResult?.workflowId)}
    {#await fetchWorkflowForSchedule({ namespace, workflowId: decodeURIForSvelte(run.startWorkflowResult.workflowId), runId: run.startWorkflowResult.runId }, fetch) then workflow}
      <div class="row">
        <div class="w-28">
          <WorkflowStatus status={workflow.status} />
        </div>
        <div class="w-auto break-words mx-2">
          <Link
            newTab
            href={routeForEventHistory({
              workflow: run.startWorkflowResult.workflowId,
              run: run.startWorkflowResult.runId,
              namespace,
            })}
          >
            {run.startWorkflowResult.workflowId}
          </Link>
        </div>
        <div class="ml-auto">
          <p>{formatDate(run.actualTime, $timeFormat)}</p>
        </div>
      </div>
    {:catch}
      <div class="row">
        <div class="w-28" />
        <div class="w-96">
          {run.startWorkflowResult.workflowId}
        </div>
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
    @apply my-1 inline-flex w-full items-center border-b-2 border-gray-300 py-1;
  }
</style>
