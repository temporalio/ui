<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  import { timestamp } from '$lib/components/timestamp.svelte';
  import { translate } from '$lib/i18n/translate';
  import { toUpcomingScheduleRuns } from '$lib/services/schedule-service';
  import type { DescribeFullSchedule } from '$lib/types/schedule';

  import WorkflowRunsEmpty from './workflow-runs-empty.svelte';

  interface Props {
    class?: string;
    schedule: DescribeFullSchedule;
    openBackfillConfirmationModal: () => void;
    openTriggerConfirmationModal: () => void;
  }

  const {
    class: className,
    schedule,
    openBackfillConfirmationModal,
    openTriggerConfirmationModal,
  }: Props = $props();

  const sortedUpcomingRuns = $derived(toUpcomingScheduleRuns(schedule));
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
    {#each sortedUpcomingRuns as run, i (i)}
      <li class="gap-y-1 border-b border-primary py-2 font-mono">
        {$timestamp(run)}
      </li>
    {/each}
  </ul>
{/if}
