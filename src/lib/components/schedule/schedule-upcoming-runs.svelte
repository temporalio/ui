<script lang="ts">
  import Timestamp from '$lib/components/timestamp.svelte';

  import ScheduleNoRuns from './schedule-no-runs.svelte';

  import type { DescribeScheduleResponse } from '$types';

  type Props = {
    schedule: DescribeScheduleResponse;
    triggerConfirmation: () => void;
    backfillConfirmation: () => void;
  };

  let { schedule, triggerConfirmation, backfillConfirmation }: Props = $props();
  const futureRuns = $derived(schedule?.info?.futureActionTimes ?? []);
</script>

{#each futureRuns.slice(0, 5) as run}
  <div
    class="my-1.5 inline-flex w-full justify-start border-b border-subtle py-1 font-mono"
  >
    <Timestamp as="p" dateTime={run} />
  </div>
{:else}
  <ScheduleNoRuns {triggerConfirmation} {backfillConfirmation} />
{/each}
