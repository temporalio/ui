<script lang="ts">
  import Card from '$lib/holocene/card.svelte';
  import type { StandaloneActivity } from '$lib/pages/standalone-activity.svelte';
  import { fromSeconds } from '$lib/utilities/to-duration';

  interface Props {
    activity: StandaloneActivity;
  }

  let { activity }: Props = $props();

  const scheduleToStartValue = $derived(
    fromSeconds(activity.scheduleToStartTimeout) === ''
      ? '0 seconds'
      : fromSeconds(activity.scheduleToStartTimeout),
  );
  const scheduleToCloseValue = $derived(
    fromSeconds(activity.scheduleToCloseTimeout) === ''
      ? '0 seconds'
      : fromSeconds(activity.scheduleToCloseTimeout),
  );
  const startToCloseValue = $derived(
    fromSeconds(activity.startToCloseTimeout) === ''
      ? '-'
      : fromSeconds(activity.startToCloseTimeout),
  );
  const heartbeatValue = $derived(
    fromSeconds(activity.heartbeatTimeout) === ''
      ? '-'
      : fromSeconds(activity.heartbeatTimeout),
  );
</script>

<Card class="flex flex-col gap-4 py-5">
  <h5 class="text-xs font-semibold uppercase tracking-wide">
    Activity Timeouts
  </h5>

  <div class="grid gap-4 max-lg:grid-cols-2 lg:grid-cols-4">
    <div>
      <p class="underline underline-offset-2">Schedule to Start Timeout</p>
      <p class="text-secondary">{scheduleToStartValue}</p>
    </div>
    <div>
      <p class="underline underline-offset-2">Schedule to Close Timeout</p>
      <p class="text-secondary">{scheduleToCloseValue}</p>
      {#if activity.running && activity.scheduleToCloseSecondsLeft}
        <p class="text-secondary">
          Times out in <span class="font-semibold text-brand"
            >{activity.scheduleToCloseSecondsLeft}</span
          >
        </p>
      {/if}
    </div>
    <div>
      <p class="underline underline-offset-2">Start to Close Timeout</p>
      <p class="text-secondary">{startToCloseValue}</p>
      {#if activity.running && activity.startToCloseSecondsLeft}
        <p class="text-secondary">
          Times out in <span class="font-semibold text-brand"
            >{activity.startToCloseSecondsLeft}</span
          >
        </p>
      {/if}
    </div>
    <div>
      <p class="underline underline-offset-2">Heartbeat Timeout</p>
      <p class="text-secondary">{heartbeatValue}</p>
    </div>
  </div>
</Card>
