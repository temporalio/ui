<script lang="ts">
  import {
    eventOrGroupIsFailureOrTimedOut,
    eventOrGroupIsCanceled,
    eventOrGroupIsTerminated,
  } from '$lib/models/event-groups/get-event-in-group';
  import { isLocalActivityMarkerEvent } from '$lib/utilities/is-event-type';
  import Table from '$lib/holocene/table/table.svelte';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';

  export let eventGroup: EventGroup;
  export let selectedId: string;
  export let onGroupClick: (id: string) => void;
</script>

<div class="w-full border-gray-700 lg:w-1/3 lg:border-r-2">
  <Table class="w-full table-fixed pb-2" variant="simple">
    {#each [...eventGroup.events].reverse() as [id, eventInGroup] (id)}
      <tr
        class="row"
        class:active={id === selectedId}
        class:failure={eventOrGroupIsFailureOrTimedOut(eventInGroup)}
        class:canceled={eventOrGroupIsCanceled(eventInGroup)}
        class:terminated={eventOrGroupIsTerminated(eventInGroup)}
        on:click|preventDefault|stopPropagation={() => onGroupClick(id)}
      >
        <td class="w-1/12" />
        <td class="w-24">
          <p class="truncate text-sm text-gray-500 md:text-base">{id}</p>
        </td>
        <td>
          <p class="event-type truncate text-sm md:text-base">
            {isLocalActivityMarkerEvent(eventInGroup)
              ? 'LocalActivity'
              : eventInGroup.eventType}
          </p>
        </td>
        <td />
      </tr>
    {/each}
  </Table>
</div>

<style lang="postcss">
  .row:hover {
    @apply cursor-pointer bg-gradient-to-br from-blue-100 to-purple-100 bg-fixed;
  }

  .active {
    @apply bg-blue-50;
  }

  .failure {
    @apply bg-red-50;
  }

  .failure .event-type {
    @apply text-red-700;
  }

  .canceled {
    @apply bg-yellow-50;
  }

  .canceled .event-type {
    @apply text-yellow-700;
  }

  .terminated {
    @apply bg-pink-50;
  }

  .terminated .event-type {
    @apply text-pink-700;
  }

  .failure:hover,
  .active.canceled {
    @apply bg-gradient-to-br from-red-100 to-red-200 bg-fixed;
  }

  .canceled:hover,
  .active.canceled {
    @apply bg-gradient-to-br from-yellow-100 to-yellow-200 bg-fixed;
  }

  .terminated:hover,
  .active.terminated {
    @apply bg-gradient-to-br from-pink-100 to-pink-200 bg-fixed;
  }
</style>
