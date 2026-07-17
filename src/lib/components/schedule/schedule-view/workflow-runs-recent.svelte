<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  import { timestamp } from '$lib/components/timestamp.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { DescribeFullSchedule } from '$lib/types/schedule';
  import { getEpochMilliseconds } from '$lib/utilities/format-time';
  import { routeForWorkflow } from '$lib/utilities/route-for';
  import { toWorkflowStatusReadable } from '$lib/utilities/screaming-enums';

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

  const sortedRecentRuns = $derived.by(() => {
    const runs = schedule?.info?.recentActions ?? [];
    return runs
      .filter(Boolean)
      .sort(
        (a, b) =>
          getEpochMilliseconds(b.actualTime) -
          getEpochMilliseconds(a.actualTime),
      )
      .slice(0, 5);
  });
</script>

{#if !sortedRecentRuns.length}
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
  <ul class={twMerge('flex flex-col gap-2', className)}>
    {#each sortedRecentRuns as run, i (run?.startWorkflowResult?.runId ?? i)}
      <li
        class="grid grid-cols-[max-content_1fr] gap-x-2 gap-y-1 border-b border-subtle py-2 sm:grid-cols-[minmax(max-content,7rem)_1fr_max-content]"
      >
        <div class="col-start-1 row-start-1 flex items-center">
          <WorkflowStatus
            status={toWorkflowStatusReadable(run.startWorkflowStatus ?? null)}
          />
        </div>

        <div
          class="col-span-2 row-start-2 flex justify-center sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:justify-start"
        >
          <Link
            href={routeForWorkflow({
              workflow: run.startWorkflowResult?.workflowId ?? '',
              run: run.startWorkflowResult?.runId ?? '',
              namespace,
            })}
          >
            {run.startWorkflowResult?.workflowId}
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
{/if}
