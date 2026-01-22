<script lang="ts">
  import Panel from '$lib/components/panel.svelte';
  import Timestamp from '$lib/components/timestamp.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchWorkflowForSchedule } from '$lib/services/workflow-service';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';
  import {
    routeForTimeline,
    routeForWorkflowsWithQuery,
  } from '$lib/utilities/route-for';

  import WorkflowStatus from '../workflow-status.svelte';

  import type { ScheduleActionResult } from '$types';

  export let recentRuns: ScheduleActionResult[] = [];
  export let namespace: string;
  export let workflowQuery: string;

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

<Panel class="w-full">
  <div class="flex justify-between">
    <h2 class="mb-4">{translate('schedules.recent-runs')}</h2>
    <Link
      href={routeForWorkflowsWithQuery({
        namespace,
        query: workflowQuery,
      })}
      icon="filter"
    >
      {translate('common.view-all-runs')}
    </Link>
  </div>
  {#each sortRecentRuns(recentRuns) as run (run?.startWorkflowResult?.workflowId)}
    {#await fetchWorkflowForSchedule({ namespace, workflowId: decodeURIForSvelte(run.startWorkflowResult.workflowId), runId: run.startWorkflowResult.runId }, fetch) then workflow}
      <div class="row">
        <div class="w-28">
          <WorkflowStatus status={workflow.status} />
        </div>
        <div class="mx-2 w-auto break-words">
          <Link
            href={routeForTimeline({
              workflow: run.startWorkflowResult.workflowId,
              run: run.startWorkflowResult.runId,
              namespace,
            })}
          >
            {run.startWorkflowResult.workflowId}
          </Link>
        </div>
        <div class="ml-auto">
          <Timestamp as="p" dateTime={run.actualTime} />
        </div>
      </div>
    {:catch}
      <div class="row">
        <div class="w-28"></div>
        <div class="w-96">
          {run.startWorkflowResult.workflowId}
        </div>
        <div class="ml-auto">
          <Timestamp as="p" dateTime={run.actualTime} />
        </div>
      </div>
    {/await}
  {/each}
  {#if !recentRuns.length}
    <EmptyState title={translate('schedules.recent-runs-empty-state-title')} />
  {/if}
</Panel>

<style lang="postcss">
  .row {
    @apply my-1 inline-flex w-full items-center border-b border-subtle py-1;
  }
</style>
