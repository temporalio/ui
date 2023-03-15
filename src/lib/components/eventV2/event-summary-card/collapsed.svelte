<script lang="ts">
  import { eventShowElapsed } from '$lib/stores/event-view';
  import { timeFormat } from '$lib/stores/time-format';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';

  import { isEventGroup } from '$lib/models/event-groups';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import Details from './details.svelte';
  import {
    eventGroupDisplayName,
    getAttributePayloads,
  } from '../event-detail-keys';
  import EventClassification from './event-classification.svelte';

  export let event: IterableEvent;
  export let events: IterableEvent[];
  export let firstEvent: IterableEvent | undefined = undefined;
  export let expanded = false;
  export let showClassification = false;

  $: initialEvent = isEventGroup(event) ? event.initialEvent : event;
  $: lastEvent = isEventGroup(event) ? event.lastEvent : event;
  $: showElapsed = $eventShowElapsed === 'true';
  $: showElapsedTimeDiff =
    showElapsed && firstEvent && event.id !== firstEvent.id;

  $: timeDiffChange = '';
  $: {
    const currentIndex = events.indexOf(event);
    const previousItem = events[currentIndex - 1];
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

  $: payloadAttributes = getAttributePayloads(event.attributes);
</script>

<div
  class="flex w-full cursor-pointer flex-col justify-between gap-2 md:flex-row"
>
  <div class="flex items-center gap-4">
    <p>{initialEvent.id}</p>
    <div class="flex items-center gap-2">
      <p
        class="event-name truncate text-sm font-semibold md:text-base xl:text-lg"
      >
        {eventGroupDisplayName(event)}
      </p>
      {#if showClassification}
        <EventClassification classification={lastEvent.classification} />
      {/if}
    </div>
  </div>
  <div class="flex items-center justify-end gap-2 md:justify-start">
    {#if payloadAttributes.length}
      <Icon name="json" class="rounded bg-gray-900 px-1 text-white" />
    {/if}
    <Details {event} primary />
    <Icon name={expanded ? 'chevron-up' : 'chevron-down'} class="w-4" />
  </div>
</div>
<div
  class="break-word leading-0 truncate text-left text-sm text-gray-700 md:whitespace-normal"
>
  {#if showElapsedTimeDiff}
    {formatDistanceAbbreviated({
      start: firstEvent.eventTime,
      end: initialEvent.eventTime,
    })}
    {timeDiffChange}
  {:else}
    {formatDate(initialEvent?.eventTime, $timeFormat)}
  {/if}
</div>
