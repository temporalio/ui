<script lang="ts">
  import { isActivityTaskTimedOutEvent } from '$lib/utilities/is-event-type';
  import WorkflowStatus from '../workflow-status.svelte';

  export let eventGroup: EventGroup | null;
  export let selectedId: string;
</script>

<section class="overflow-y-scroll max-h-full p-4 pl-12">
  {#if eventGroup}
    <nav class="flex flex-col mb-4">
      <ul class="gap-2 w-full items-start">
        {#each [...eventGroup.events] as [id, eventInGroup] (id)}
          <li
            on:click|preventDefault|stopPropagation={() => {
              selectedId = id;
            }}
          >
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
    </nav>
  {/if}
</section>

<style lang="postcss">
  li {
    @apply my-2 cursor-pointer;
  }
  .event-type:hover {
    @apply text-blue-700 underline decoration-blue-700;
  }
  .active {
    @apply text-blue-700 underline decoration-blue-700;
  }
</style>
