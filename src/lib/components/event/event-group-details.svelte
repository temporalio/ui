<script lang="ts">
  import { isActivityTaskTimedOutEvent } from '$lib/utilities/is-event-type';
  import WorkflowStatus from '../workflow-status.svelte';

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
          <span class="event-type" class:active={id === selectedId}
            >{eventInGroup.eventType}</span
          >
          {#if isActivityTaskTimedOutEvent(eventInGroup)}
            <WorkflowStatus status="TimedOut" />
          {/if}
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
</style>
