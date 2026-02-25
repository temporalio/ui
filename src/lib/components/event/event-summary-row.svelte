<script lang="ts">
  import { onMount } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { page } from '$app/state';

  import { timestamp } from '$lib/components/timestamp.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { isEventGroup } from '$lib/models/event-groups';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import {
    eventOrGroupIsCanceled,
    eventOrGroupIsFailureOrTimedOut,
    eventOrGroupIsTerminated,
  } from '$lib/models/event-groups/get-event-in-group';
  import { isCloud } from '$lib/stores/advanced-visibility';
  import { authUser } from '$lib/stores/auth-user';
  import type { IterableEvent, WorkflowEvent } from '$lib/types/events';
  import { decodeLocalActivity } from '$lib/utilities/decode-local-activity';
  import { spaceBetweenCapitalLetters } from '$lib/utilities/format-camel-case';
  import { formatAttributes } from '$lib/utilities/format-event-attributes';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import type { SummaryAttribute } from '$lib/utilities/get-single-attribute-for-event';
  import {
    getPrimaryAttributeForEvent,
    getSecondaryAttributeForEvent,
  } from '$lib/utilities/get-single-attribute-for-event';
  import {
    isActivityTaskStartedEvent,
    isLocalActivityMarkerEvent,
  } from '$lib/utilities/is-event-type';
  import { routeForEventHistoryEvent } from '$lib/utilities/route-for';
  import { toTimeDifference } from '$lib/utilities/to-time-difference';

  import { eventTypeStyle } from './event-styles';
  import { CategoryIcon } from '../lines-and-dots/constants';

  import EventDetailsFull from './event-details-full.svelte';
  import EventDetailsRow from './event-details-row.svelte';
  import EventLink from './event-link.svelte';
  import MetadataDecoder from './metadata-decoder.svelte';

  interface Props {
    event: IterableEvent;
    group: EventGroup | undefined;
    initialItem: WorkflowEvent;
    index: number;
    compact?: boolean;
    expanded?: boolean;
    hoveredEventId?: string | undefined;
    onRowClick?: () => void;
  }

  let {
    event,
    group,
    initialItem,
    index,
    compact = false,
    expanded: expandedProp = false,
    onRowClick = () => {},
    hoveredEventId = $bindable(),
  }: Props = $props();

  let expanded = $state(expandedProp);
  let primaryLocalAttribute = $state<SummaryAttribute | undefined>(undefined);

  const selectedId = $derived(
    isEventGroup(event) ? Array.from(event.events.keys()).shift() : event.id,
  );

  const { workflow, run, namespace } = $derived(page.params);

  const href = $derived(
    routeForEventHistoryEvent({ eventId: event.id, namespace, workflow, run }),
  );

  const attributes = $derived(formatAttributes(event));

  const currentEvent = $derived(
    isEventGroup(event) ? event.events.get(selectedId) : event,
  );

  const elapsedTime = $derived(
    formatDistanceAbbreviated({
      start: initialItem?.eventTime,
      end: isEventGroup(currentEvent)
        ? currentEvent.initialEvent?.eventTime
        : currentEvent?.eventTime,
      includeMillisecondsForUnderSecond: true,
    }),
  );

  const duration = $derived(
    isEventGroup(event)
      ? formatDistanceAbbreviated({
          start: event.initialEvent?.eventTime,
          end: event.lastEvent?.eventTime,
          includeMillisecondsForUnderSecond: true,
        })
      : '',
  );

  const failure = $derived(eventOrGroupIsFailureOrTimedOut(event));
  const canceled = $derived(eventOrGroupIsCanceled(event));
  const terminated = $derived(eventOrGroupIsTerminated(event));

  const displayName = $derived(
    isEventGroup(event)
      ? event.label
      : isLocalActivityMarkerEvent(event)
        ? translate('events.category.local-activity')
        : spaceBetweenCapitalLetters(event.name),
  );

  const primaryAttribute = $derived(
    !isLocalActivityMarkerEvent(event)
      ? getPrimaryAttributeForEvent(
          isEventGroup(event) ? event.initialEvent : event,
        )
      : undefined,
  );

  const secondaryAttribute = $derived(
    getSecondaryAttributeForEvent(
      isEventGroup(event) ? event.lastEvent : event,
      primaryAttribute?.key,
    ),
  );

  const isPendingActivity = $derived(
    isEventGroup(event) && event?.pendingActivity,
  );
  const isPausedPendingActivity = $derived(
    isPendingActivity && isPendingActivity?.paused,
  );

  const pendingAttempt = $derived(
    isEventGroup(event) &&
      event.isPending &&
      (event?.pendingActivity?.attempt ||
        event?.pendingNexusOperation?.attempt),
  );

  const nonPendingActivityAttempt = $derived(
    isEventGroup(event) &&
      !event.isPending &&
      event.eventList.find(isActivityTaskStartedEvent)?.attributes?.attempt,
  );

  const showSecondaryAttribute = $derived(
    compact &&
      secondaryAttribute?.key &&
      secondaryAttribute?.key !== primaryAttribute?.key &&
      !currentEvent?.userMetadata?.summary,
  );

  const eventTime = $derived($timestamp(currentEvent?.eventTime));

  const abbrEventTime = $derived(
    $timestamp(currentEvent?.eventTime, { format: 'short' }),
  );

  const onLinkClick = (event) => {
    expanded = !expanded;
    event.stopPropagation();
    onRowClick();
  };
  const handleMouseEnter = () => {
    hoveredEventId = event.id;
  };
  const handleMouseLeave = () => {
    hoveredEventId = undefined;
  };

  let hasRelatedActivities = (group, hoveredEventId) => {
    return group?.eventIds?.has(hoveredEventId);
  };

  onMount(async () => {
    if (isLocalActivityMarkerEvent(event)) {
      primaryLocalAttribute = await decodeLocalActivity(event, {
        namespace: page.params.namespace,
        settings: page.data.settings,
        accessToken: $authUser.accessToken,
      });
    } else if (
      isEventGroup(event) &&
      isLocalActivityMarkerEvent(event.initialEvent)
    ) {
      primaryLocalAttribute = await decodeLocalActivity(event.initialEvent, {
        namespace: page.params.namespace,
        settings: page.data.settings,
        accessToken: $authUser.accessToken,
      });
    }
  });
</script>

<tr
  class={merge(
    'hover:cursor-pointer',
    failure && '!bg-red-400/40 hover:!bg-red-400/60',
    canceled && '!bg-yellow-400/30 hover:!bg-yellow-400/50',
    terminated && '!bg-pink-700/30 hover:!bg-pink-700/50',
    hasRelatedActivities(group, hoveredEventId) && 'active',
  )}
  id={`${event.id}-${index}`}
  data-eventid={event.id}
  data-testid="event-summary-row"
  onmouseenter={handleMouseEnter}
  onmouseleave={handleMouseLeave}
  onclick={onLinkClick}
>
  {#if isEventGroup(event)}
    <td class="font-mono">
      <div class="flex items-center gap-0.5">
        {#each event.eventList as groupEvent}
          <Link
            data-testid="link"
            href={routeForEventHistoryEvent({
              eventId: groupEvent.id,
              namespace,
              workflow,
              run,
            })}
          >
            {groupEvent.id}
          </Link>
        {/each}
      </div>
    </td>
  {:else}
    <td class="font-mono">
      <Link data-testid="link" {href}>
        {event.id}
      </Link>
    </td>
  {/if}
  <td class="text-right md:hidden">
    <Tooltip
      hide={(isEventGroup(event) && !duration) || !elapsedTime}
      text={isEventGroup(event) ? `Duration: ${duration}` : `+${elapsedTime}`}
      class="block"
      bottom
    >
      <Copyable
        copyIconTitle={translate('common.copy-icon-title')}
        copySuccessIconTitle={translate('common.copy-success-icon-title')}
        content={abbrEventTime}
      >
        {abbrEventTime}
      </Copyable>
    </Tooltip>
  </td>
  <td class="hidden text-right md:table-cell">
    <Tooltip
      hide={(isEventGroup(event) && !duration) || !elapsedTime}
      text={isEventGroup(event) ? `Duration: ${duration}` : `+${elapsedTime}`}
      class="block"
      bottom
    >
      <Copyable
        copyIconTitle={translate('common.copy-icon-title')}
        copySuccessIconTitle={translate('common.copy-success-icon-title')}
        content={eventTime}
      >
        {eventTime}
      </Copyable>
    </Tooltip>
  </td>
  <td class="truncate">
    <p class={eventTypeStyle({ category: event.category })}>
      <Icon
        name={CategoryIcon[event.category].name}
        title={CategoryIcon[event.category].title}
        class="mr-1 inline"
      />
      {displayName}
    </p>
  </td>
  <td
    class="w-full items-center gap-2 text-right text-sm font-normal xl:text-left"
  >
    <div class="flex items-center gap-2">
      {#if pendingAttempt}
        <Badge
          class="mr-1"
          type={isPausedPendingActivity
            ? 'warning'
            : pendingAttempt > 1
              ? 'danger'
              : 'default'}
        >
          <Icon
            class={merge(
              'mr-1 inline',
              pendingAttempt > 1 && 'font-bold text-red-400',
              isPausedPendingActivity && 'font-bold text-yellow-700',
            )}
            name={isPausedPendingActivity ? 'pause' : 'retry'}
          />
          {translate('workflows.attempt')}
          {pendingAttempt}
          {#if isPendingActivity}
            / {isPendingActivity?.maximumAttempts || '∞'}
            {#if pendingAttempt > 1}
              {@const timeDifference = toTimeDifference({
                date: isPendingActivity?.scheduledTime,
                negativeDefault: '',
              })}
              {#if timeDifference}
                • {translate('workflows.next-retry')}
                {timeDifference}
              {/if}
            {/if}
          {/if}
        </Badge>
      {/if}
      {#if !primaryLocalAttribute && primaryAttribute?.key}
        <EventDetailsRow {...primaryAttribute} {attributes} />
      {/if}
      {#if primaryLocalAttribute && primaryLocalAttribute.key}
        <EventDetailsRow {...primaryLocalAttribute} {attributes} />
      {/if}
      {#if currentEvent?.userMetadata?.summary}
        <MetadataDecoder
          value={currentEvent.userMetadata.summary}
          let:decodedValue
        >
          {#if decodedValue}
            <div
              class="flex max-w-xl items-center gap-2 first:pt-0 last:border-b-0 md:w-auto"
            >
              <p class="whitespace-nowrap text-right text-xs">Summary</p>
              <Badge type="secondary" class="block select-none truncate">
                {decodedValue}
              </Badge>
            </div>
          {/if}
        </MetadataDecoder>
      {/if}
      {#if currentEvent?.links?.length}
        <EventLink
          link={currentEvent.links[0]}
          class="max-w-xl"
          linkClass="truncate"
        />
      {/if}
      {#if nonPendingActivityAttempt}
        <EventDetailsRow
          key="attempt"
          value={nonPendingActivityAttempt.toString()}
          {attributes}
        />
      {/if}
      {#if showSecondaryAttribute}
        <EventDetailsRow {...secondaryAttribute} {attributes} />
      {/if}
    </div>
  </td>
  {#if $isCloud}
    <td>
      <div class="flex justify-center gap-0.5">
        {#if event.billableActions}
          <Tooltip
            text={translate('workflows.estimated-billable-actions')}
            topRight
          >
            <Badge type="subtle" class="text-bold shrink-0 gap-1 px-1.5">
              {event.billableActions}
            </Badge>
          </Tooltip>
        {/if}
      </div>
    </td>
  {/if}
</tr>
{#if expanded}
  <tr
    class="w-full text-sm no-underline"
    data-testid="event-summary-row-expanded"
  >
    <td class="!p-0" colspan={$isCloud ? 5 : 4}>
      <EventDetailsFull {group} event={currentEvent} />
    </td>
  </tr>
{/if}

<style lang="postcss">
  tr[data-testid='event-summary-row'].active {
    @apply surface-table-related-hover;
  }

  tr[data-testid='event-summary-row'].active:hover {
    @apply surface-table-header;
  }
</style>
