<script lang="ts">
  import {
    eventOrGroupIsFailureOrTimedOut,
    eventOrGroupIsCanceled,
    eventOrGroupIsTerminated,
  } from '$lib/models/event-groups/get-event-in-group';
  import { isLocalActivityMarkerEvent } from '$lib/utilities/is-event-type';

  export let eventGroup: EventGroup | null;
  export let selectedId: string;
  export let onGroupClick: (id: string) => void;
</script>

<div class="w-full border-gray-700 lg:w-1/3 lg:border-r-2">
  <table class="w-full table-fixed">
    {#each [...eventGroup.events].reverse() as [id, eventInGroup] (id)}
      <tr
        class="row"
        class:active={id === selectedId}
        on:click|preventDefault|stopPropagation={() => onGroupClick(id)}
      >
        <td class="cell hidden w-12 py-1 px-3 text-left xl:table-cell">
          <span class="mx-1 text-sm text-gray-500 md:text-base">{id}</span>
        </td>
        <td class="cell flex px-3 pt-1 pb-0 text-left xl:table-cell">
          <span class="mx-1 text-sm text-gray-500 md:text-base xl:hidden"
            >{id}</span
          >
          <p
            class="m-0 overflow-hidden text-ellipsis whitespace-nowrap text-sm md:text-base"
            class:failure={eventOrGroupIsFailureOrTimedOut(eventInGroup)}
            class:canceled={eventOrGroupIsCanceled(eventInGroup)}
            class:terminated={eventOrGroupIsTerminated(eventInGroup)}
          >
            {isLocalActivityMarkerEvent(eventInGroup)
              ? 'LocalActivity'
              : eventInGroup.eventType}
          </p>
        </td>
      </tr>
    {/each}
  </table>
</div>

<style lang="postcss">
  .row {
    @apply table-row;
  }
  .row:hover {
    @apply cursor-pointer bg-gradient-to-b from-blue-100 to-purple-100;
  }
  .active.row {
    @apply bg-blue-50;
  }
  .cell {
    @apply border-b-2 border-gray-700 px-3 py-1 leading-4;
  }
  .failure {
    @apply text-red-700;
  }
  .canceled {
    @apply text-yellow-700;
  }
  .terminated {
    @apply text-pink-700;
  }
</style>
