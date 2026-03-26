<script lang="ts">
  import Card from '$lib/holocene/card.svelte';
  import type { StandaloneActivity } from '$lib/pages/standalone-activity.svelte';
  import { formatSecondsAbbreviated } from '$lib/utilities/format-time';
  import { fromScreamingEnum } from '$lib/utilities/screaming-enums';

  import { timestamp } from '../timestamp.svelte';

  interface Props {
    activity: StandaloneActivity;
  }

  let { activity }: Props = $props();
</script>

<Card class="flex flex-col gap-4 pt-5">
  <div>
    <h5 class="text-xs font-semibold uppercase tracking-wide">
      Upcoming Attempts
    </h5>
    {#if !activity.maximumAttempts}
      <span class="text-xs text-secondary"
        >(only showing the next 50 attempts)</span
      >
    {/if}
  </div>

  {#if activity.nextAttemptScheduleTime}
    <div class="flex items-center">
      <span class="text-sm">Next retry in:</span>
      <span class="ml-1 font-bold text-brand"
        >{activity.nextRetrySecondsLeft}</span
      >
    </div>
  {/if}

  <div class="flex h-full max-h-[20rem] flex-col gap-1 overflow-auto">
    {#each activity.upcomingAttempts as entry (entry.attempt)}
      {@const isCurrent = entry.attempt === activity.currentAttempt}
      <div
        class="flex items-center gap-2 rounded px-2 py-1 {isCurrent
          ? 'bg-subtle'
          : ''}"
      >
        {#if isCurrent && activity.runState === 'PENDING_ACTIVITY_STATE_STARTED'}
          <svg
            class="h-3 w-3 shrink-0 animate-spin text-secondary"
            viewBox="0 0 16 16"
            fill="none"
          >
            <circle
              cx="8"
              cy="8"
              r="6"
              stroke="currentColor"
              stroke-width="2"
              stroke-dasharray="2 2"
            />
          </svg>
        {:else if isCurrent}
          <span class="h-3 w-3 shrink-0 rounded-full bg-brand"></span>
        {:else}
          <span class="h-3 w-3 shrink-0 rounded-full bg-subtle"></span>
        {/if}
        <span class="text-sm font-medium">Attempt {entry.attempt}</span>
        <span class="text-xs text-secondary">
          wait {formatSecondsAbbreviated(entry.waitSeconds, false)}
        </span>
        {#if isCurrent}
          <span class="text-xs font-semibold">
            {fromScreamingEnum(activity.runState, 'PendingActivityState')}
          </span>
        {/if}
        <span class="ml-auto text-right text-xs text-secondary">
          {$timestamp(entry.runAt)}
        </span>
      </div>
    {:else}
      <div class="h-full w-full flex items-center justify-center">
        <p class="text-subtle font-medium">No upcoming attempts</p>
      </div>
    {/each}
  </div>
</Card>
