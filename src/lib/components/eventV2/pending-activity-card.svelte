<script lang="ts">
  import Badge from '$lib/holocene/badge.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';

  import { workflowRun } from '$lib/stores/workflow-run';

  import { formatDate } from '$lib/utilities/format-date';
  import Card from './event-summary-card/card.svelte';
  import PendingActivityDetails from './pending-activity-details.svelte';

  export let event: PendingActivity;

  $: ({ workflow } = $workflowRun);

  $: canceled = ['Terminated', 'TimedOut', 'Canceled', 'Completed'].includes(
    workflow?.status,
  );
  $: failed = event.attempt > 1;
</script>

<Card {event} events={[]} pending let:expanded>
  <div class="primary flex w-full cursor-pointer justify-between">
    <div class="flex items-center gap-4">
      <div class="rounded-xl border-2 border-gray-900 bg-lightBlue py-1 px-2">
        In progress
      </div>
      <div class="flex items-center">
        <p class="event-name truncate text-sm font-semibold md:text-base">
          {event.activityType}
        </p>
      </div>
    </div>
    <div class="flex gap-2">
      {#if canceled}
        <Tooltip bottom text="Pending activities have been canceled.">
          <Badge type="warning" class="py-0"><Icon name="canceled" /></Badge>
        </Tooltip>
      {:else}
        <Badge type={failed ? 'error' : 'default'}>
          {#if failed}
            <Icon name="retry" />
          {/if}
          {event.attempt}
        </Badge>
      {/if}
      <Icon name={expanded ? 'chevron-up' : 'chevron-down'} class="w-4" />
    </div>
  </div>
  <p
    class="break-word leading-0 truncate text-left md:whitespace-normal md:text-[12px]"
  >
    {formatDate(event.lastHeartbeatTime, 'relative')}
  </p>
  {#if expanded}
    <div class="p-2">
      <PendingActivityDetails {event} />
    </div>
  {/if}
</Card>
