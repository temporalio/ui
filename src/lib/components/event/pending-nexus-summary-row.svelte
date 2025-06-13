<script lang="ts">
  import { page } from '$app/stores';

  import Badge from '$lib/holocene/badge.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { isCloud } from '$lib/stores/advanced-visibility';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { PendingNexusOperation } from '$lib/types/events';
  import { formatDate } from '$lib/utilities/format-date';
  import { routeForEventHistoryEvent } from '$lib/utilities/route-for';
  import { toTimeDifference } from '$lib/utilities/to-time-difference';

  import EventDetailsFull from './event-details-full.svelte';

  export let event: PendingNexusOperation;
  export let group: EventGroup | undefined = undefined;
  export let index: number;
  export let expandAll = false;
  export let active = false;
  export let onRowClick: () => void = () => {};

  $: expanded = expandAll;
  $: ({ workflow, run, namespace } = $page.params);
  $: href = routeForEventHistoryEvent({
    eventId: event.scheduledEventId,
    namespace,
    workflow,
    run,
  });

  $: eventTime = formatDate(group?.eventTime, $timeFormat, {
    relative: $relativeTime,
  });
  $: abbrEventTime = formatDate(group?.eventTime, $timeFormat, {
    relative: $relativeTime,
    abbrFormat: true,
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
  <td class="font-mono">
    <Link data-testid="link" {href}>
      {event.scheduledEventId || ''}
    </Link>
  </td>
  <td class="text-right md:hidden">
    <Copyable
      copyIconTitle={translate('common.copy-icon-title')}
      copySuccessIconTitle={translate('common.copy-success-icon-title')}
      content={abbrEventTime}
    >
      {abbrEventTime}
    </Copyable>
  </td>
  <td class="hidden text-right md:block">
    <Copyable
      copyIconTitle={translate('common.copy-icon-title')}
      copySuccessIconTitle={translate('common.copy-success-icon-title')}
      content={eventTime}
    >
      {eventTime}
    </Copyable>
  </td>
  <td
    class="w-full overflow-hidden text-right text-sm font-normal xl:text-left"
  >
    <div class="flex">
      <div class="flex w-full items-center gap-2">
        <p class="font-semibold md:text-base">
          {translate('workflows.pending-nexus-operation')}
        </p>
        {#if event.attempt}
          <Badge class="mx-1" type={event.attempt > 1 ? 'danger' : 'default'}>
            <Icon
              class="mr-1 inline {event.attempt > 1 &&
                'font-bold text-red-400'}"
              name="retry"
            />
            {translate('workflows.attempt')}
            {event.attempt}
            {#if event.attempt > 1}
              • {translate('workflows.next-retry')}
              {toTimeDifference({
                date: event.nextAttemptScheduleTime,
                negativeDefault: 'None',
              })}
            {/if}
          </Badge>
        {/if}
      </div>
    </div>
  </td>
  <td></td>
  {#if $isCloud}
    <td></td>
  {/if}
</tr>
{#if expanded}
  <tr class="w-full px-2 text-sm no-underline">
    <td class="bg-primary" colspan="5">
      <EventDetailsFull {group} />
    </td>
  </tr>
{/if}
