<script lang="ts">
  import { onMount } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { page } from '$app/state';

  import PayloadSummary from '$lib/components/payload/payload-summary.svelte';
  import { timestamp } from '$lib/components/timestamp.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import IconButton from '$lib/holocene/icon-button.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    IconChevronDown,
    IconChevronUp,
    IconPause,
    IconRetry,
  } from '$lib/io/icon';
  import { isEventGroup } from '$lib/models/event-groups';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import {
    eventOrGroupIsCanceled,
    eventOrGroupIsFailureOrTimedOut,
    eventOrGroupIsTerminated,
  } from '$lib/models/event-groups/get-event-in-group';
  import { isCloud } from '$lib/stores/advanced-visibility';
  import { resolveSystemNexusEvent } from '$lib/system-nexus-endpoints';
  import type { IterableEvent, WorkflowEvent } from '$lib/types/events';
  import { decodeLocalActivity } from '$lib/utilities/decode-local-activity';
  import { formatEventGroupDuration } from '$lib/utilities/event-group-duration';
  import { toEventLinkView } from '$lib/utilities/event-link';
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
    isWorkflowExecutionSignaledEvent,
  } from '$lib/utilities/is-event-type';
  import { routeForEventHistoryEvent } from '$lib/utilities/route-for';
  import { toTimeDifference } from '$lib/utilities/to-time-difference';

  import { eventTypeStyle } from './event-styles';
  import { CategoryIcon } from '../lines-and-dots/constants';

  import EventDetailsFull from './event-details-full.svelte';
  import EventDetailsRow from './event-details-row.svelte';
  import EventLink from './event-link.svelte';

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
    isEventGroup(event) ? event.eventList[0]?.id : event.id,
  );

  const { workflow, run, namespace } = $derived(page.params);

  const href = $derived(
    routeForEventHistoryEvent({ eventId: event.id, namespace, workflow, run }),
  );

  const attributes = $derived(formatAttributes(event));

  const currentEvent = $derived(
    isEventGroup(event)
      ? event.eventList.find((e) => e.id === selectedId)
      : event,
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
      ? formatEventGroupDuration({
          group: event,
          includeMillisecondsForUnderSecond: true,
        })
      : '',
  );

  const failure = $derived(eventOrGroupIsFailureOrTimedOut(event));
  const canceled = $derived(eventOrGroupIsCanceled(event));
  const terminated = $derived(eventOrGroupIsTerminated(event));

  const systemNexus = $derived(
    resolveSystemNexusEvent(
      isEventGroup(event) ? event.initialEvent : (event as WorkflowEvent),
      { namespace, workflow, run, initiatingEvent: group?.initialEvent },
    ),
  );

  const systemNexusSummaryLink = $derived(
    systemNexus?.links?.find((link) => link.kind === 'target-execution'),
  );

  const displayName = $derived.by(() => {
    if (isEventGroup(event)) {
      if (event.pendingActivity) return translate('workflows.pending-activity');
      if (event.pendingNexusOperation)
        return translate('workflows.pending-nexus-operation');
      return event.label;
    }
    if (isLocalActivityMarkerEvent(event))
      return translate('events.category.local-activity');
    if (systemNexus?.displayName) return systemNexus.displayName;
    return spaceBetweenCapitalLetters(event.name);
  });

  const primaryAttribute = $derived(
    !isLocalActivityMarkerEvent(event) && !systemNexus
      ? getPrimaryAttributeForEvent(
          isEventGroup(event) ? event.initialEvent : event,
        )
      : undefined,
  );

  const effectiveCategory = $derived(
    systemNexus?.timelineCategory ?? event.category,
  );

  const secondaryAttribute = $derived(
    getSecondaryAttributeForEvent(
      isEventGroup(event) ? event.lastEvent : event,
      primaryAttribute?.key ?? '',
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
      !systemNexus &&
      secondaryAttribute?.key &&
      secondaryAttribute?.key !== primaryAttribute?.key &&
      !currentEvent?.userMetadata?.summary,
  );

  const eventTime = $derived($timestamp(currentEvent?.eventTime));

  const abbrEventTime = $derived(
    $timestamp(currentEvent?.eventTime, { format: 'short' }),
  );

  const onLinkClick = (event?: MouseEvent) => {
    expanded = !expanded;
    event?.stopPropagation?.();
    onRowClick();
  };

  const detailsId = $derived(`event-details-${event.id}-${index}`);

  const handleMouseEnter = () => {
    hoveredEventId = event.id;
  };
  const handleMouseLeave = () => {
    hoveredEventId = undefined;
  };

  const hasRelatedActivities = (
    group: EventGroup | undefined,
    hoveredEventId: string | undefined,
  ) => {
    return group?.eventList?.some((e) => e.id === hoveredEventId);
  };

  onMount(async () => {
    if (isLocalActivityMarkerEvent(event)) {
      primaryLocalAttribute = await decodeLocalActivity(event);
    } else if (
      isEventGroup(event) &&
      isLocalActivityMarkerEvent(event.initialEvent)
    ) {
      primaryLocalAttribute = await decodeLocalActivity(event.initialEvent);
    }
  });

  const CategoryGlyph = $derived(CategoryIcon[effectiveCategory].Icon);
</script>

{#snippet expandButton()}
  <IconButton
    Icon={expanded ? IconChevronUp : IconChevronDown}
    label={expanded
      ? translate('events.collapse-details')
      : translate('events.expand-details')}
    aria-expanded={expanded}
    aria-controls={expanded ? detailsId : undefined}
    class="h-6 w-6"
    onclick={(e) => {
      e.stopPropagation();
      onLinkClick(e);
    }}
  />
{/snippet}

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
      <div class="flex items-center gap-1">
        {@render expandButton()}
        <div class="flex items-center gap-0.5">
          {#each event.eventList as groupEvent (groupEvent.id)}
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
      </div>
    </td>
  {:else}
    <td class="font-mono">
      <div class="flex items-center gap-1">
        {@render expandButton()}
        <Link data-testid="link" {href}>
          {event.id}
        </Link>
      </div>
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
    <p class={eventTypeStyle({ category: effectiveCategory })}>
      <CategoryGlyph
        title={CategoryIcon[effectiveCategory].title}
        class={merge(
          'mr-1 inline',
          isEventGroup(event) && event.isPending && 'animate-pulse',
        )}
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
          {@const Glyph = isPausedPendingActivity ? IconPause : IconRetry}
          <Glyph
            class={merge(
              'mr-1 inline',
              pendingAttempt > 1 && 'font-bold text-red-400',
              isPausedPendingActivity && 'font-bold text-yellow-700',
            )}
          />
          {translate('workflows.attempt')}
          {pendingAttempt}
          {#if isPendingActivity}
            / {isPendingActivity?.maximumAttempts || '∞'}
            {#if pendingAttempt > 1 && isPendingActivity?.scheduledTime}
              {@const timeDifference = toTimeDifference({
                date: isPendingActivity.scheduledTime,
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
        <div
          class="flex max-w-xl items-center gap-2 first:pt-0 last:border-b-0 md:w-auto"
        >
          <p class="whitespace-nowrap text-right text-xs">Summary</p>
          <PayloadSummary value={currentEvent.userMetadata.summary} />
        </div>
      {/if}
      {#if systemNexus?.summaryAttribute}
        <EventDetailsRow
          key={systemNexus.summaryAttribute.key}
          value={systemNexus.summaryAttribute.value}
          {attributes}
        />
      {:else if systemNexusSummaryLink}
        <EventLink
          view={systemNexusSummaryLink}
          class="max-w-xl"
          linkClass="truncate"
          labelClass="text-xs"
        />
      {:else if currentEvent?.links?.length && !systemNexus}
        {@const callerPerspective =
          isWorkflowExecutionSignaledEvent(currentEvent)}
        {@const linkView = toEventLinkView(currentEvent.links[0], {
          namespace,
          ...(callerPerspective && { perspective: 'caller' as const }),
        })}
        <EventLink
          view={callerPerspective
            ? { ...linkView, label: translate('nexus.caller-execution') }
            : linkView}
          class="max-w-xl"
          linkClass="truncate"
          labelClass="text-xs"
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
    id={detailsId}
    class="w-full text-sm no-underline"
    data-testid="event-summary-row-expanded"
  >
    <td class="!p-0" colspan={$isCloud ? 5 : 4}>
      <EventDetailsFull
        {group}
        event={currentEvent}
        groupRow={isEventGroup(event)}
      />
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
