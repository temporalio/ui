<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  import { timestamp } from '$lib/components/timestamp.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { DescribeFullSchedule } from '$lib/types/schedule';
  import { getMilliseconds } from '$lib/utilities/format-time';

  import WorkflowRunsEmpty from './workflow-runs-empty.svelte';

  interface Props {
    class?: string;
    schedule: DescribeFullSchedule;
    workflowQuery: string;
    openBackfillConfirmationModal: () => void;
    openTriggerConfirmationModal: () => void;
  }

  const {
    class: className,
    schedule,
    openBackfillConfirmationModal,
    openTriggerConfirmationModal,
  }: Props = $props();

  const sortedUpcomingRuns = $derived.by(() => {
    const runs = schedule?.info?.futureActionTimes ?? [];
    return runs
      .filter(Boolean)
      .sort((a, b) => getMilliseconds(a) - getMilliseconds(b))
      .slice(0, 5);
  });
</script>

{#if !sortedUpcomingRuns.length}
  <WorkflowRunsEmpty
    title={translate('schedules.workflow-runs-empty-state-upcoming-title')}
    description={translate(
      'schedules.workflow-runs-empty-state-upcoming-description',
    )}
    {openBackfillConfirmationModal}
    {openTriggerConfirmationModal}
  />
{:else}
  <ul class={twMerge('flex flex-col gap-2', className)}>
    {#each sortedUpcomingRuns as run (run)}
      <li class="gap-y-1 border-b border-subtle py-2 font-mono">
        {$timestamp(run)}
      </li>
    {/each}
  </ul>
{/if}
