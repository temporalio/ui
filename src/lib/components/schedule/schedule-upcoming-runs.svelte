<script lang="ts">
  import Timestamp from '$lib/components/timestamp.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import { translate } from '$lib/i18n/translate';

  import type { DescribeScheduleResponse } from '$types';

  type Props = {
    schedule: DescribeScheduleResponse;
  };

  let { schedule }: Props = $props();
  const futureRuns = $derived(schedule?.info?.futureActionTimes);
</script>

{#each futureRuns.slice(0, 5) as run}
  <div
    class="my-1.5 inline-flex w-full justify-start border-b border-subtle py-1 font-mono"
  >
    <Timestamp as="p" dateTime={run} />
  </div>
{:else}
  <EmptyState title={translate('schedules.upcoming-runs-empty-state-title')} />
{/each}
