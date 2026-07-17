<script lang="ts">
  import { confirmationModal } from '$lib/stores/schedules';
  import type { DescribeFullSchedule } from '$lib/types/schedule';

  import { parseOverlapPolicy } from '../utilities/get-form-schedule-defaults';

  import BackfillScheduleModal from './backfill-schedule-modal.svelte';
  import DeleteScheduleModal from './delete-schedule-modal.svelte';
  import PauseScheduleModal from './pause-schedule-modal.svelte';
  import TriggerScheduleModal from './trigger-schedule-modal.svelte';

  interface Props {
    schedule: DescribeFullSchedule;
    namespace: string;
    scheduleId: string;
  }

  let { schedule, namespace, scheduleId }: Props = $props();

  // We are conditionally rendering each modal in order to reset modal state on open/close
  const scheduleOverlapPolicy = $derived(
    parseOverlapPolicy(schedule?.schedule?.policies?.overlapPolicy),
  );
</script>

{#if $confirmationModal === 'pause'}
  <PauseScheduleModal
    {scheduleId}
    {namespace}
    isSchedulePaused={schedule?.schedule?.state?.paused ?? undefined}
  />
{:else if $confirmationModal === 'trigger'}
  <TriggerScheduleModal {scheduleId} {namespace} {scheduleOverlapPolicy} />
{:else if $confirmationModal === 'backfill'}
  <BackfillScheduleModal
    {scheduleId}
    {namespace}
    {scheduleOverlapPolicy}
    timezoneName={schedule?.schedule?.spec?.timezoneName ?? undefined}
  />
{:else if $confirmationModal === 'delete'}
  <DeleteScheduleModal {scheduleId} {namespace} />
{/if}
