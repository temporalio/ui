<script lang="ts">
  import { eventShowElapsed, eventFilterSort } from '$lib/stores/event-view';
  import { timeFormat } from '$lib/stores/time-format';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';

  import { isEventGroup } from '$lib/models/event-groups';

  export let event: IterableEvent;
  export let visibleItems: IterableEvent[];
  export let initialItem: IterableEvent | undefined;

  $: initialEvent = isEventGroup(event) ? event.initialEvent : event;
  $: lastEvent = isEventGroup(event) ? event.lastEvent : event;
  $: descending = $eventFilterSort === 'descending';
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
      timeDiffChange = timeDiff ? `(${descending ? '-' : '+'}${timeDiff})` : '';
    }
  }
</script>

<p
  class="break-word leading-0 w-[100px] truncate text-center md:whitespace-normal md:text-[11px]"
>
  {#if showElapsedTimeDiff}
    {formatDistanceAbbreviated({
      start: initialItem.eventTime,
      end: initialEvent.eventTime,
    })}
    {timeDiffChange}
  {:else}
    {formatDate(initialEvent?.eventTime, $timeFormat)}
  {/if}
</p>

<style lang="postcss">
  .row {
    @apply w-full flex-wrap items-center rounded-xl border-gray-900 pl-8 pr-2 text-sm no-underline xl:py-3 xl:text-base;
  }

  .secondary {
    @apply mt-4 flex flex-col gap-2;
  }

  .expanded.row {
    @apply bg-gray-50;
  }

  .dot {
    @apply h-4 w-4 rounded-full border-3 border-gray-900 bg-white;
  }

  .subgroup-dot {
    @apply h-3 w-3 rounded-full border-2 border-gray-900 bg-white;
  }

  .dot.failure {
    @apply bg-red-500;
  }

  .failure p {
    @apply text-red-700;
  }

  .dot.canceled {
    @apply bg-yellow-300;
  }

  .canceled p {
    @apply text-yellow-700;
  }

  .dot.terminated {
    @apply bg-pink-500;
  }

  .terminated p {
    @apply text-pink-700;
  }

  .expanded-cell {
    @apply table-cell w-full flex-wrap text-sm no-underline xl:text-base;
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

  .active {
    @apply z-50 cursor-pointer bg-gradient-to-br from-blue-100 to-purple-100 bg-fixed;
  }
</style>
