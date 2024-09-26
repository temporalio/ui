<script lang="ts">
  import { noop } from 'svelte/internal';

  import { page } from '$app/stores';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import type { PendingNexusOperation } from '$lib/types/events';
  import { routeForEventHistoryEvent } from '$lib/utilities/route-for';
  import { toTimeDifference } from '$lib/utilities/to-time-difference';

  import EventDetailsFull from './event-details-full.svelte';

  export let event: PendingNexusOperation;
  export let group: EventGroup | undefined = undefined;
  export let index: number;
  export let expandAll = false;
  export let active = false;
  export let onRowClick: () => void = noop;

  $: expanded = expandAll;
  $: ({ workflow, run, namespace } = $page.params);
  $: href = routeForEventHistoryEvent({
    eventId: event.scheduledEventId,
    namespace,
    workflow,
    run,
  });

  const onLinkClick = () => {
    expanded = !expanded;
    onRowClick();
  };
</script>

<tr
  class="row dense"
  id={`${event.scheduledEventId}-${index}`}
  class:expanded={expanded && !expandAll}
  class:active
  data-testid="pending-nexus-summary-row"
  on:click|stopPropagation={onLinkClick}
>
  <td class="w-10 text-left">
    <Link class="truncate px-1" data-testid="link" {href}>
      {event.scheduledEventId || ''}
    </Link>
  </td>
  <td
    class="w-full overflow-hidden text-right text-sm font-normal xl:text-left"
  >
    <div class="flex">
      <div class="flex w-full items-center gap-2">
        <Icon name="nexus" />
        <p class="font-semibold md:text-base">Pending Nexus Operation</p>
        {#if event.attempt}
          <div
            class="flex items-center gap-1 {event.attempt > 1 &&
              'surface-danger rounded px-1 py-0.5'}"
          >
            <Icon class="mr-1.5 inline" name="retry" />
            {event.attempt}
          </div>
        {/if}
      </div>
    </div>
  </td>
  <td>
    {#if event.attempt > 1}
      <div class="flex items-center gap-2 px-2">
        <p class="max-w-fit whitespace-nowrap text-right text-xs">Next Retry</p>
        <p class="flex items-center gap-0">
          <Icon class="mr-1.5 inline" name="clock" />
          {toTimeDifference({
            date: event.nextAttemptScheduleTime,
            negativeDefault: 'None',
          })}
        </p>
      </div>
    {/if}
  </td>
</tr>
{#if expanded}
  <tr class="row expanded">
    <td class="expanded-cell w-full" colspan="3">
      <EventDetailsFull {group} />
    </td>
  </tr>
{/if}

<style lang="postcss">
  .row {
    @apply flex select-none items-center text-sm no-underline;
  }

  .expanded-cell {
    @apply text-sm no-underline;
  }
</style>
