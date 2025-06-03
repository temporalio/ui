<script lang="ts">
  import { fade, slide } from 'svelte/transition';

  import { page } from '$app/stores';

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
  import { authUser } from '$lib/stores/auth-user';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { IterableEvent } from '$lib/types/events';
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
    getPrimaryAttributeForEvent,
    getSecondaryAttributeForEvent,
  } from '$lib/utilities/get-single-attribute-for-event';
  import {
    isActivityTaskStartedEvent,
    isLocalActivityMarkerEvent,
  } from '$lib/utilities/is-event-type';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
  import { routeForEventHistoryEvent } from '$lib/utilities/route-for';
  import { toTimeDifference } from '$lib/utilities/to-time-difference';

  import EventDetailsFull from './event-details-full.svelte';
  import EventDetailsRow from './event-details-row.svelte';
  import EventLink from './event-link.svelte';
  import MetadataDecoder from './metadata-decoder.svelte';

  let primaryLocalAttribute: SummaryAttribute | undefined;

  export let event: IterableEvent;
  export let group: EventGroup | undefined = undefined;
  export let initialItem: IterableEvent | undefined;
  export let index = 0;
  export let compact = false;
  export let expanded = false;
  export let typedError = false;
  export let active = false;
  export let onRowClick: () => void = () => {};

  $: codecSettings = {
    ...$page.data.settings,
    codec: {
      ...$page.data.settings?.codec,
      endpoint: getCodecEndpoint($page.data.settings),
      passAccessToken: getCodecPassAccessToken($page.data.settings),
      includeCredentials: getCodecIncludeCredentials($page.data.settings),
    },
  };

  $: selectedId = isEventGroup(event)
    ? Array.from(event.events.keys()).shift()
    : event.id;

  $: ({ workflow, run, namespace } = $page.params);
  $: href = routeForEventHistoryEvent({
    eventId: event.id,
    namespace,
    workflow,
    run,
  });
  $: attributes = formatAttributes(event);

  $: currentEvent = isEventGroup(event) ? event.events.get(selectedId) : event;
  $: elapsedTime = formatDistanceAbbreviated({
    start: initialItem?.eventTime,
    end: isEventGroup(event)
      ? event.initialEvent?.eventTime
      : currentEvent.eventTime,
    includeMillisecondsForUnderSecond: true,
  });

  $: duration = isEventGroup(event)
    ? formatDistanceAbbreviated({
        start: event.initialEvent?.eventTime,
        end: event.lastEvent?.eventTime,
        includeMillisecondsForUnderSecond: true,
      })
    : '';

  const onLinkClick = () => {
    expanded = !expanded;
    onRowClick();
  };

  $: failure = eventOrGroupIsFailureOrTimedOut(event);
  $: canceled = eventOrGroupIsCanceled(event);
  $: terminated = eventOrGroupIsTerminated(event);

  $: displayName = isEventGroup(event)
    ? event.label
    : isLocalActivityMarkerEvent(event)
      ? 'Local Activity'
      : spaceBetweenCapitalLetters(event.name);

  $: primaryAttribute = getPrimaryAttributeForEvent(
    isEventGroup(event) ? event.initialEvent : event,
  );
  $: primaryLocalAttribute = isLocalActivityMarkerEvent(event)
    ? getPrimaryAttributeForEvent(
        isEventGroup(event) ? event.initialEvent : event,
      )
    : undefined;
  $: secondaryAttribute = getSecondaryAttributeForEvent(
    isEventGroup(event) ? event.lastEvent : event,
    primaryAttribute?.key,
  );
  $: hasPendingActivity = isEventGroup(event) && event?.pendingActivity;
  $: pendingAttempt =
    isEventGroup(event) &&
    event.isPending &&
    (event?.pendingActivity?.attempt || event?.pendingNexusOperation?.attempt);
  $: nonPendingActivityAttempt =
    isEventGroup(event) &&
    !event.isPending &&
    event.eventList.find(isActivityTaskStartedEvent)?.attributes?.attempt;
  $: showSecondaryAttribute =
    compact &&
    secondaryAttribute?.key &&
    secondaryAttribute?.key !== primaryAttribute?.key &&
    !currentEvent?.userMetadata?.summary;
  $: eventTime = formatDate(currentEvent?.eventTime, $timeFormat, {
    relative: $relativeTime,
  });
  $: abbrEventTime = formatDate(currentEvent?.eventTime, $timeFormat, {
    relative: $relativeTime,
    abbrFormat: true,
  });

  $: if (isLocalActivityMarkerEvent(event)) {
    decodeLocalActivity();
  }

  async function decodeLocalActivity() {
    try {
      const converted = await cloneAllPotentialPayloadsWithCodec(
        event.attributes,
        $page.params.namespace,
        codecSettings,
        $authUser.accessToken,
      );

      const decoded = decodePayloadAttributes(converted) as {
        activityType?: { name?: unknown };
      };

      if (decoded.activityType?.name) {
        primaryLocalAttribute = {
          key: 'Activity Type',
          value: stringifyWithBigInt(decoded.activityType.name),
        };
      }
    } catch (err) {
      console.error('Failed to decode local activity type:', err);
    }
  }

  $: {
    console.log('event', event);
    console.log('currentEvent', currentEvent);
    console.log('primaryLocalAttribute', primaryLocalAttribute);
    console.log('secondaryAttribute', secondaryAttribute);
    console.log('primaryAttribute', primaryAttribute);
  }
</script>

<tr
  class="dense flex select-none items-center gap-4 px-2 text-sm no-underline"
  class:border={failure || canceled || terminated}
  class:border-danger={failure}
  class:border-warning={canceled}
  class:border-pink-700={terminated}
  class:typedError
  class:expanded
  class:active
  id={`${event.id}-${index}`}
  data-eventid={event.id}
  data-testid="event-summary-row"
  on:click|stopPropagation={onLinkClick}
>
  {#if isEventGroup(event)}
    <td class="w-24 min-w-fit font-mono">
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
  <td class="hidden text-right md:block">
    <Tooltip
      hide={(isEventGroup(event) && !duration) || !elapsedTime}
      text={isEventGroup(event) ? `Duration: ${duration}` : `+${elapsedTime}`}
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
  <td class="truncate md:min-w-fit">
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
    class="hidden w-full items-center gap-2 text-right text-sm font-normal md:flex xl:text-left"
  >
    {#if pendingAttempt}
      <div
        class="flex items-center gap-1 {pendingAttempt > 1 &&
          'surface-retry px-1 py-0.5'}"
      >
        <Icon class="mr-1.5 inline" name="retry" />
        {translate('workflows.attempt')}
        {pendingAttempt}
        {#if hasPendingActivity}
          / {hasPendingActivity.maximumAttempts || '∞'}
          {#if pendingAttempt > 1}
            • {translate('workflows.next-retry')}
            {toTimeDifference({
              date: hasPendingActivity.scheduledTime,
              negativeDefault: 'None',
            })}
          {/if}
        {/if}
      </div>
    {/if}
    {#if !primaryLocalAttribute && primaryAttribute?.key}
      <EventDetailsRow {...primaryAttribute} {attributes} />
    {/if}
    {#if primaryLocalAttribute}
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
  </td>
</tr>
{#if expanded}
  <tr
    in:fade
    out:slide={{ duration: 175 }}
    class:typedError
    class="expanded flex select-none items-center gap-4 px-2 text-sm no-underline"
  >
    <td class="w-full text-sm no-underline" class:border-b-0={typedError}>
      <EventDetailsFull {group} event={currentEvent} />
    </td>
  </tr>
{/if}
