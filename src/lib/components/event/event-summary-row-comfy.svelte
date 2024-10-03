<script lang="ts">
  import { noop } from 'svelte/internal';
  import { fade, slide } from 'svelte/transition';

  import { page } from '$app/stores';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { isEventGroup } from '$lib/models/event-groups';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import {
    eventOrGroupIsCanceled,
    eventOrGroupIsFailureOrTimedOut,
    eventOrGroupIsTerminated,
  } from '$lib/models/event-groups/get-event-in-group';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { IterableEvent } from '$lib/types/events';
  import { spaceBetweenCapitalLetters } from '$lib/utilities/format-camel-case';
  import { formatDate } from '$lib/utilities/format-date';
  import { isLocalActivityMarkerEvent } from '$lib/utilities/is-event-type';
  import { routeForEventHistoryEvent } from '$lib/utilities/route-for';

  import EventDetailsFull from './event-details-full.svelte';

  export let event: IterableEvent;
  export let group: EventGroup | undefined = undefined;
  export let initialItem: IterableEvent | undefined = undefined;
  export let index = 0;
  export let compact = false;
  export let expandAll = false;
  export let typedError = false;
  export let active = false;
  export let onRowClick: () => void = noop;

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
  $: expanded = expandAll;

  $: currentEvent = isEventGroup(event) ? event.events.get(selectedId) : event;

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

  $: hasPendingActivity = isEventGroup(event) && event?.pendingActivity;
  $: pendingAttempt =
    isEventGroup(event) &&
    event.isPending &&
    (event?.pendingActivity?.attempt || event?.pendingNexusOperation?.attempt);
</script>

<tr
  class="row dense"
  id={`${event.id}-${index}`}
  class:expanded={expanded && !expandAll}
  class:active
  class:failure
  class:canceled
  class:terminated
  class:typedError
  data-testid="event-summary-row"
  on:click|stopPropagation={onLinkClick}
>
  <td class="w-full overflow-hidden text-right font-normal xl:text-left">
    <div class="flex w-full items-center gap-2 px-2">
      <p class="text-lg">
        {formatDate(currentEvent?.eventTime, $timeFormat, {
          relative: $relativeTime,
        })}
      </p>
      <p class="event-name max-w-fit whitespace-nowrap text-xl font-semibold">
        {displayName}
      </p>
      <div class="flex w-full gap-4 truncate">
        {#if pendingAttempt}
          <div
            class="flex items-center gap-1 {pendingAttempt > 1 &&
              'surface-danger rounded px-1 py-0.5'}"
          >
            <Icon class="mr-1.5 inline" name="retry" />
            {pendingAttempt}
            {#if hasPendingActivity}
              / {hasPendingActivity.maximumAttempts || '∞'}
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </td>
  {#if isEventGroup(event)}
    <td class="w-auto text-left">
      <div class="flex items-center gap-0.5 px-4">
        {#each event.eventList as groupEvent}
          <Link
            class="truncate"
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
    <td class="text-right">
      <Link class="px-4" data-testid="link" {href}>
        {event.id}
      </Link>
    </td>
  {/if}
</tr>
{#if expanded}
  <tr
    in:fade
    out:slide={{ duration: 175 }}
    class:typedError
    class="row expanded"
  >
    <td class="expanded-cell w-full" colspan="3">
      <EventDetailsFull {group} event={currentEvent} />
    </td>
  </tr>
{/if}

<style lang="postcss">
  .row {
    @apply flex select-none items-center no-underline;
  }

  .failure {
    @apply border-2 border-danger;
  }

  .failure .event-name {
    @apply text-danger;
  }

  .canceled {
    @apply border-2 border-warning;
  }

  .canceled .event-name {
    @apply text-warning;
  }

  .terminated {
    @apply border-2 border-pink-700;
  }

  .terminated .event-name {
    @apply text-pink-700;
  }

  .expanded-cell {
    @apply text-sm no-underline;
  }

  .typedError .expanded-cell {
    @apply border-b-0;
  }

  .row.typedError {
    @apply rounded-lg;

    &.expanded {
      @apply rounded-b-none;
    }
  }
</style>
