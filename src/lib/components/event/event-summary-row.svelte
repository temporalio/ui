<script lang="ts">
  import { onMount } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { page } from '$app/state';

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
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type {
    IterableEvent,
    Payload,
    WorkflowEvent,
  } from '$lib/types/events';
  import {
    cloneAllPotentialPayloadsWithCodec,
    decodePayloadAttributes,
  } from '$lib/utilities/decode-payload';
  import { spaceBetweenCapitalLetters } from '$lib/utilities/format-camel-case';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatAttributes } from '$lib/utilities/format-event-attributes';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import {
    getCodecEndpoint,
    getCodecIncludeCredentials,
    getCodecPassAccessToken,
  } from '$lib/utilities/get-codec';
  import type { SummaryAttribute } from '$lib/utilities/get-single-attribute-for-event';
  import {
    formatSummaryValue,
    getActivityType,
    getPrimaryAttributeForEvent,
    getSecondaryAttributeForEvent,
  } from '$lib/utilities/get-single-attribute-for-event';
  import {
    isActivityTaskStartedEvent,
    isLocalActivityMarkerEvent,
  } from '$lib/utilities/is-event-type';
  import { routeForEventHistoryEvent } from '$lib/utilities/route-for';
  import { toTimeDifference } from '$lib/utilities/to-time-difference';

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

  type DecodedLocalActivity = {
    details?: {
      data?: {
        payloads?: Payload[];
      };
    };
  };

  const decodeLocalActivity = async (
    event,
  ): Promise<SummaryAttribute | undefined> => {
    const settings = {
      ...page.data.settings,
      codec: {
        ...page.data.settings?.codec,
        endpoint: getCodecEndpoint(page.data.settings),
        passAccessToken: getCodecPassAccessToken(page.data.settings),
        includeCredentials: getCodecIncludeCredentials(page.data.settings),
      },
    };
    const accessToken = $authUser.accessToken;
    const namespace = page.params.namespace;
    try {
      const convertedAttributes = await cloneAllPotentialPayloadsWithCodec(
        event.attributes,
        namespace,
        settings,
        accessToken,
      );
      const payloads = (event.markerRecordedEventAttributes?.details?.data
        ?.payloads ||
        event.markerRecordedEventAttributes?.details?.type?.payloads ||
        []) as unknown as Payload[];

      if (!payloads?.length) return;
      const decodedAttributes = decodePayloadAttributes(
        convertedAttributes,
      ) as DecodedLocalActivity;
      const payload = decodedAttributes?.details?.data?.payloads?.[0];
      const activityType = getActivityType(payload);
      if (activityType) {
        return formatSummaryValue('ActivityType', activityType);
      }
    } catch (err) {
      console.error('Failed to decode local activity type:', err);
    }
    return;
  };

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
        ? 'Local Activity'
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

  const hasPendingActivity = $derived(
    isEventGroup(event) && event?.pendingActivity,
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

  const eventTime = $derived(
    formatDate(currentEvent?.eventTime, $timeFormat, {
      relative: $relativeTime,
    }),
  );

  const abbrEventTime = $derived(
    formatDate(currentEvent?.eventTime, $timeFormat, {
      relative: $relativeTime,
      abbrFormat: true,
    }),
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
      primaryLocalAttribute = await decodeLocalActivity(event);
    } else if (
      isEventGroup(event) &&
      isLocalActivityMarkerEvent(event.initialEvent)
    ) {
      primaryLocalAttribute = await decodeLocalActivity(event.initialEvent);
    }
  });
</script>

<tr
  class="hover:cursor-pointer"
  class:border={failure || canceled || terminated}
  class:border-danger={failure}
  class:border-warning={canceled}
  class:border-pink-700={terminated}
  id={`${event.id}-${index}`}
  data-eventid={event.id}
  data-testid="event-summary-row"
  onmouseenter={handleMouseEnter}
  onmouseleave={handleMouseLeave}
  class:active={hasRelatedActivities(group, hoveredEventId)}
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
    <p
      class="whitespace-nowrap font-semibold md:text-base"
      class:text-danger={failure}
      class:text-pink-700={terminated}
      class:text-warning={canceled}
    >
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
          type={hasPendingActivity.paused
            ? 'warning'
            : pendingAttempt > 1
              ? 'danger'
              : 'default'}
        >
          <Icon
            class={merge(
              'mr-1 inline',
              pendingAttempt > 1 && 'font-bold text-red-400',
              hasPendingActivity.paused && 'font-bold text-yellow-700',
            )}
            name={hasPendingActivity.paused ? 'pause' : 'retry'}
          />
          {translate('workflows.attempt')}
          {pendingAttempt}
          {#if hasPendingActivity}
            / {hasPendingActivity.maximumAttempts || '∞'}
            {#if pendingAttempt > 1}
              {@const timeDifference = toTimeDifference({
                date: hasPendingActivity.scheduledTime,
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
  <tr class="w-full text-sm no-underline">
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
