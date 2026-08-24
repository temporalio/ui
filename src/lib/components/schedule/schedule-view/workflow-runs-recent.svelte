<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  import WorkflowStatus from '$lib/components/execution-status.svelte';
  import { timestamp } from '$lib/components/timestamp.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    fetchRecentScheduleRunStatuses,
    toRecentScheduleRuns,
  } from '$lib/services/schedule-service';
  import type {
    DescribeFullSchedule,
    RecentScheduleRun,
  } from '$lib/types/schedule';
  import { routeForWorkflow } from '$lib/utilities/route-for';

  import WorkflowRunsEmpty from './workflow-runs-empty.svelte';

  interface Props {
    class?: string;
    namespace: string;
    schedule: DescribeFullSchedule;
    openBackfillConfirmationModal: () => void;
    openTriggerConfirmationModal: () => void;
  }

  const {
    class: className,
    namespace,
    schedule,
    openBackfillConfirmationModal,
    openTriggerConfirmationModal,
  }: Props = $props();

  const recordedRuns = $derived(toRecentScheduleRuns(schedule));
  const runsPromise = $derived(
    fetchRecentScheduleRunStatuses({
      namespace,
      scheduleId: schedule.schedule_id,
      runs: recordedRuns,
    }),
  );
</script>

{#if !recordedRuns.length}
  <WorkflowRunsEmpty
    class={className}
    title={translate('schedules.workflow-runs-empty-state-recent-title')}
    description={translate(
      'schedules.workflow-runs-empty-state-recent-description',
    )}
    {openBackfillConfirmationModal}
    {openTriggerConfirmationModal}
  />
{:else}
  {#await runsPromise}
    {@render runList(recordedRuns)}
  {:then runs}
    {@render runList(runs)}
  {:catch}
    {@render runList(recordedRuns)}
  {/await}
{/if}

{#snippet runList(runs: RecentScheduleRun[])}
  <ul class={twMerge('flex flex-col gap-2', className)}>
    {#each runs as run, i (run.runId || i)}
      <li
        class="grid grid-cols-[max-content_1fr] gap-x-2 gap-y-1 border-b border-primary py-2 sm:grid-cols-[minmax(max-content,7rem)_1fr_max-content]"
      >
        <div class="col-start-1 row-start-1 flex items-center">
          <WorkflowStatus status={run.status} />
        </div>

        <div
          class="col-span-2 row-start-2 flex justify-center sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:justify-start"
        >
          <Link
            href={routeForWorkflow({
              workflow: run.workflowId,
              run: run.runId,
              namespace,
            })}
          >
            {run.workflowId}
          </Link>
        </div>

        <p
          class="col-start-2 row-start-1 flex items-center justify-end text-end font-mono sm:col-start-3"
        >
          {$timestamp(run.actualTime)}
        </p>
      </li>
    {/each}
  </ul>
{/snippet}
