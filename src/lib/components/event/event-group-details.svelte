<script lang="ts">
  import {
    eventOrGroupIsFailureOrTimedOut,
    eventOrGroupIsCanceledOrTerminated,
  } from '$lib/models/event-groups/get-event-in-group';

  export let eventGroup: EventGroup | null;
  export let selectedId: string;
  export let onGroupClick: (id: string) => void;
</script>

<div
  class="w-full block lg:w-1/3 lg:flex flex-col max-h-full lg:border-r-2 border-gray-200 p-4"
>
  <ul class="gap-2">
    {#each [...eventGroup.events] as [id, eventInGroup] (id)}
      <li on:click|preventDefault|stopPropagation={() => onGroupClick(id)}>
        <div class="flex gap-2">
          <span class="text-gray-500 mx-1">{id}</span>
          <span
            class="event-type"
            class:active={id === selectedId}
            class:error={eventOrGroupIsFailureOrTimedOut(eventInGroup)}
            class:warning={eventOrGroupIsCanceledOrTerminated(eventInGroup)}
            >{eventInGroup.eventType}</span
          >
        </div>
      </li>
    {/each}
  </ul>
</div>

<style lang="postcss">
  li {
    @apply my-2 pl-8 cursor-pointer;
  }
  .event-type:hover {
    @apply text-blue-700 underline decoration-blue-700;
  }
  .active {
    @apply text-blue-700 underline decoration-blue-700;
  }
  .error {
    @apply text-red-700 decoration-red-700;
  }
  .warning {
    @apply text-yellow-700 decoration-yellow-700;
  }
</style>
