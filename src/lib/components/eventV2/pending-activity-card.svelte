<script lang="ts">
  import Badge from '$lib/holocene/badge.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';

  import { workflowRun } from '$lib/stores/workflow-run';

  import { formatDate } from '$lib/utilities/format-date';
  import Card from './event-summary-card/card.svelte';
  import PendingActivityDetails from './pending-activity-details.svelte';

  export let event: PendingActivity;
  export let expandAll = false;

  $: expanded = expandAll || false;

  $: ({ workflow } = $workflowRun);

  $: canceled = ['Terminated', 'TimedOut', 'Canceled', 'Completed'].includes(
    workflow?.status,
  );
  $: failed = event.attempt > 1;
</script>

<Card {event} events={[]} pending>
  <div class="primary flex w-full cursor-pointer justify-between">
    <div class="flex items-center gap-4" />
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
  <PendingActivityDetails {event} />
</Card>
