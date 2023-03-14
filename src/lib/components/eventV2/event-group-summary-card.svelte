<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';

  import { eventShowElapsed } from '$lib/stores/event-view';
  import { timeFormat } from '$lib/stores/time-format';
  import { format } from '$lib/utilities/format-camel-case';

  import {
    eventOrGroupIsFailureOrTimedOut,
    eventOrGroupIsCanceled,
    eventOrGroupIsTerminated,
  } from '$lib/models/event-groups/get-event-in-group';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';

  import { isLocalActivityMarkerEvent } from '$lib/utilities/is-event-type';
  import { noop } from 'svelte/internal';
  import { isEventGroup } from '$lib/models/event-groups';
  import EventCard from './event-card.svelte';
  import EventGroupDetails from './event-group-details.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import {
    getCodeBlockValue,
    getStackTrace,
  } from '$lib/utilities/get-single-attribute-for-event';
  import { getAttributePayloads } from './event-detail-keys';
  import EventGroupTimestamp from './event-group-timestamp.svelte';
  import PendingActivityCard from './pending-activity-card.svelte';

  export let event: IterableEvent;
  export let visibleItems: IterableEvent[];
  export let initialItem: IterableEvent | undefined;
  export let isSubGroup = false;
  export let expandAll = false;
  export let typedError = false;
  export let active = false;
  export let removeTail = false;
  export let onRowClick: () => void = noop;

  $: expanded = expandAll || active;

  $: initialEvent = isEventGroup(event) ? event.initialEvent : event;
  $: lastEvent = isEventGroup(event) ? event.lastEvent : event;
  $: showElapsed = $eventShowElapsed === 'true';
  $: showElapsedTimeDiff =
    showElapsed && initialItem && event.id !== initialItem.id;

  $: timeDiffChange = '';
  $: {
    const currentIndex = visibleItems.indexOf(event);
    const previousItem = visibleItems[currentIndex - 1];
    if (previousItem) {
      const timeDiff = formatDistanceAbbreviated({
        start: isEventGroup(previousItem)
          ? previousItem?.initialEvent?.eventTime
          : previousItem?.eventTime,
        end: lastEvent?.eventTime,
      });
      timeDiffChange = timeDiff ? `(+${timeDiff})` : '';
    }
  }

  const onLinkClick = () => {
    expanded = !expanded;
    onRowClick();
  };

  $: failure = eventOrGroupIsFailureOrTimedOut(event);
  $: canceled = eventOrGroupIsCanceled(event);
  $: terminated = eventOrGroupIsTerminated(event);
  $: hasGroupEvents = isEventGroup(event) && event?.eventList?.length > 1;
  $: payloadAttributes = getAttributePayloads(event.attributes);
  $: pendingActivity = isEventGroup(event) && event?.pendingActivity;

  const getEventGroupName = (event: IterableEvent) => {
    if (isEventGroup(event)) {
      if (isLocalActivityMarkerEvent(event.lastEvent)) return 'LocalActivity';
      return event.lastEvent.name;
    } else {
      return event.name;
    }
  };
</script>

<div class="flex gap-2">
  <EventGroupTimestamp
    {event}
    {removeTail}
    pending={Boolean(pendingActivity)}
  />
  <div class="h-full w-full pt-2">
    {#if pendingActivity}
      <PendingActivityCard event={pendingActivity} />
    {/if}
    <EventCard thick={hasGroupEvents} {expanded}>
      <div
        class="row"
        id={lastEvent.id}
        class:expanded={expanded && !expandAll}
        aria-expanded={expanded || expandAll}
        class:typedError
        data-testid="event-summary-row"
        on:click|stopPropagation={onLinkClick}
        on:keydown={onLinkClick}
      >
        <div
          class="flex w-full cursor-pointer flex-col justify-between gap-2 md:flex-row"
        >
          <div class="flex items-center gap-4">
            <p>{lastEvent.id}</p>
            <div
              class="flex items-center gap-2"
              class:failure
              class:canceled
              class:terminated
            >
              <p
                class="event-name truncate text-sm font-semibold md:text-base xl:{isSubGroup
                  ? 'text-base'
                  : 'text-lg'}"
              >
                {getEventGroupName(event)}
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            {#if payloadAttributes.length}
              <Icon name="json" class="rounded bg-gray-900 px-1 text-white" />
            {/if}
            <EventGroupDetails {event} primary />
            <Icon name={expanded ? 'chevron-up' : 'chevron-down'} class="w-4" />
          </div>
        </div>
        <p
          class="break-word leading-0 truncate text-left text-sm text-gray-700 md:whitespace-normal"
        >
          {#if showElapsedTimeDiff}
            {formatDistanceAbbreviated({
              start: initialItem.eventTime,
              end: initialEvent.eventTime,
            })}
            {timeDiffChange}
          {:else}
            {formatDate(lastEvent?.eventTime, $timeFormat)}
          {/if}
        </p>
        {#if expanded && isEventGroup(event) && hasGroupEvents}
          <div class="secondary">
            {#each event?.eventList.reverse() ?? [] as groupEvent, index}
              <svelte:self
                event={groupEvent}
                {visibleItems}
                {initialItem}
                removeTail={index ===
                  (event?.eventList.reverse() ?? []).length - 1}
              />
            {/each}
          </div>
        {/if}
      </div>
      {#if expanded && !hasGroupEvents}
        <div class="p-2">
          {#each payloadAttributes as attribute}
            {@const codeBlockValue = getCodeBlockValue(attribute.value)}
            {@const stackTrace = getStackTrace(codeBlockValue)}
            <div class:code-with-stack-trace={stackTrace}>
              <div class="flex flex-col {stackTrace ? 'lg:w-1/2' : ''}">
                <p class="text-sm">{format(attribute.key)}</p>
                <CodeBlock
                  content={codeBlockValue}
                  class="h-auto {stackTrace ? 'mb-2' : ''}"
                />
              </div>
              {#if stackTrace}
                <div class="flex flex-col lg:w-1/2">
                  <p class="text-sm">Stack trace</p>
                  <CodeBlock
                    content={stackTrace}
                    class="mb-2 h-full lg:pr-2"
                    language="text"
                  />
                </div>
              {/if}
            </div>
          {/each}
          <EventGroupDetails event={lastEvent} />
        </div>
      {/if}
    </EventCard>
    <slot name="subgroups" />
  </div>
</div>

<style lang="postcss">
  .row {
    @apply w-full flex-wrap items-center rounded-xl border-gray-900 py-2 pl-8 pr-2 text-sm no-underline xl:text-base;
  }

  .secondary {
    @apply mt-2 flex flex-col;
  }

  .failure p {
    @apply text-red-700;
  }

  .canceled p {
    @apply text-yellow-700;
  }

  .terminated p {
    @apply text-pink-700;
  }

  .row.typedError {
    @apply rounded-lg;

    &.expanded {
      @apply rounded-b-none;
    }
  }
</style>
