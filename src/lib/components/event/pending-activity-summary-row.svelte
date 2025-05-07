<script lang="ts">
  import { page } from '$app/stores';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import type { PendingActivity } from '$lib/types/events';
  import { routeForEventHistoryEvent } from '$lib/utilities/route-for';
  import { toTimeDifference } from '$lib/utilities/to-time-difference';

  import EventDetailsFull from './event-details-full.svelte';
  import EventDetailsRow from './event-details-row.svelte';

  export let event: PendingActivity;
  export let group: EventGroup | undefined = undefined;
  export let index: number;
  export let expandAll = false;
  export let active = false;
  export let onRowClick: () => void = () => {};

  $: expanded = expandAll;
  $: ({ workflow, run, namespace } = $page.params);
  $: href = routeForEventHistoryEvent({
    eventId: group?.id,
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
  id={`${event.id}-${index}`}
  class:expanded={expanded && !expandAll}
  class:active
  data-testid="pending-activity-summary-row"
  on:click|stopPropagation={onLinkClick}
>
  <td class="font-mono">
    {#if group?.id}
      <Link data-testid="link" {href}>
        {group.id}
      </Link>
    {:else}
      {event.id}
    {/if}
  </td>
  <td></td>
  <td class="">
    <p class="truncate font-semibold md:text-base">Pending Activity</p>
  </td>
  <td class="w-full overflow-hidden text-right font-normal xl:text-left">
    <div class="flex items-center gap-1">
      <div
        class="flex items-center gap-1 {event.attempt > 1 &&
          'surface-retry px-1 py-0.5'}"
      >
        <Icon class="mr-1.5 inline" name="retry" />
        {translate('workflows.attempt')}
        {event.attempt} / {event.maximumAttempts || '∞'}
        {#if event.attempt > 1}
          • {translate('workflows.next-retry')}
          {toTimeDifference({
            date: event.scheduledTime,
            negativeDefault: 'None',
          })}
        {/if}
      </div>
      <EventDetailsRow
        key="activityType"
        value={event.activityType}
        showKey
        attributes={event}
      />
    </div>
  </td>
</tr>
{#if expanded}
  <tr class="w-full px-2 text-sm no-underline">
    <td class="bg-primary" colspan="5">
      <EventDetailsFull {group} />
    </td>
  </tr>
{/if}
