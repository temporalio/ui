<script lang="ts">
  import Table from '$lib/holocene/table/table.svelte';
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

<div class="w-full border-r-2 border-gray-700 lg:w-1/3">
  <Table class="w-full table-fixed pb-2">
    {#each [...eventGroup.events].reverse() as [id, eventInGroup] (id)}
      <tr
        class="row"
        class:active={id === selectedId}
        on:click|preventDefault|stopPropagation={() => onGroupClick(id)}
      >
        <td class="w-1/12" />
        <td class="table-cell w-24 text-left">
          <p class="truncate text-sm text-gray-500 md:text-base">{id}</p>
        </td>
        <td class="table-cell pr-2 text-left">
          <p
            class="truncate text-sm md:text-base"
            class:active={id === selectedId}
            class:failure={eventOrGroupIsFailureOrTimedOut(eventInGroup)}
            class:canceled={eventOrGroupIsCanceled(eventInGroup)}
            class:terminated={eventOrGroupIsTerminated(eventInGroup)}
          >
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
  .row {
    @apply table-row;
  }
  .row:hover {
    @apply cursor-pointer bg-gradient-to-b from-blue-100 to-purple-100;
  }
  .active.row {
    @apply bg-blue-50;
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
