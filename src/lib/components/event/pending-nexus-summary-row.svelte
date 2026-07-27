<script lang="ts">
  import { page } from '$app/stores';

  import { timestamp } from '$lib/components/timestamp.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { isCloud } from '$lib/stores/advanced-visibility';
  import type { PendingNexusOperation } from '$lib/types/events';
  import { routeForEventHistoryEvent } from '$lib/utilities/route-for';
  import { toTimeDifference } from '$lib/utilities/to-time-difference';

  import { eventTypeStyle } from './event-styles';
  import { CategoryIcon } from '../lines-and-dots/constants';

  import EventDetailsFull from './event-details-full.svelte';

  interface Props {
    event: PendingNexusOperation;
    group: EventGroup | undefined;
    index: number;
    expanded?: boolean;
    onRowClick?: () => void;
  }

  const {
    event,
    group,
    index,
    expanded: expandedProp = false,
    onRowClick = () => {},
  }: Props = $props();

  let expanded = $state(expandedProp);
  let { workflow, run, namespace } = $derived($page.params);
  let href = $derived(
    routeForEventHistoryEvent({
      eventId: String(event.scheduledEventId),
      namespace,
      workflow,
      run,
    }),
  );

  let eventTime = $derived($timestamp(group?.eventTime));

  let abbrEventTime = $derived(
    $timestamp(group?.eventTime, { format: 'short' }),
  );

  const onLinkClick = (e: Event) => {
    e.stopPropagation();
    expanded = !expanded;
    onRowClick();
  };
</script>

<tr
  class="hover:cursor-pointer"
  id={`${event.scheduledEventId}-${index}`}
  data-testid="pending-nexus-summary-row"
  onclick={onLinkClick}
>
  <td class="font-mono">
    <Link data-testid="link" {href}>
      {event.scheduledEventId || ''}
    </Link>
  </td>
  <td class="table-cell text-right md:hidden">
    {#if abbrEventTime}
      <Copyable
        copyIconTitle={translate('common.copy-icon-title')}
        copySuccessIconTitle={translate('common.copy-success-icon-title')}
        content={abbrEventTime}
      >
        {abbrEventTime}
      </Copyable>
    {/if}
  </td>
  <td class="hidden text-right md:table-cell">
    {#if eventTime}
      <Copyable
        copyIconTitle={translate('common.copy-icon-title')}
        copySuccessIconTitle={translate('common.copy-success-icon-title')}
        content={eventTime}
      >
        {eventTime}
      </Copyable>
    {/if}
  </td>
  <td
    class="w-full overflow-hidden text-right text-sm font-normal xl:text-left"
  >
    <div class="flex">
      <div class="flex w-full items-center gap-2">
        <p class={eventTypeStyle({ category: 'nexus' })}>
          <Icon
            name={CategoryIcon['nexus'].name}
            title={CategoryIcon['nexus'].title}
            class="mr-1 inline animate-pulse"
          />
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
              {@const timeDifference = toTimeDifference({
                date: event.nextAttemptScheduleTime,
                negativeDefault: '',
              })}
              {#if timeDifference}
                • {translate('workflows.next-retry')}
                {timeDifference}
              {/if}
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
    <td class="!p-0" colspan={$isCloud ? 5 : 4}>
      <EventDetailsFull {group} />
    </td>
  </tr>
{/if}
