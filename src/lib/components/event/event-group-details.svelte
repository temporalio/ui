<script lang="ts">
  import { isActivityTaskTimedOutEvent } from '$lib/utilities/is-event-type';
  import WorkflowStatus from '../workflow-status.svelte';

  export let eventGroup: EventGroup | null;
  export let selectedId: string;
</script>

<section class="overflow-y-scroll max-h-full p-4">
  {#if eventGroup}
    <nav class="flex flex-col mb-4">
      <ul class="gap-4 w-full items-start">
        {#each [...eventGroup.events] as [id, eventInGroup] (id)}
          <li
            on:click|preventDefault|stopPropagation={() => {
              selectedId = id;
            }}
          >
            <div class="flex gap-4">
              <span class="event-type" class:active={id === selectedId}
                >{eventInGroup.eventType} (#{id})</span
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
    @apply my-6 cursor-pointer;
  }
  .event-type:hover {
    @apply text-blue-700 underline decoration-blue-700;
  }
  .active {
    @apply text-blue-700 underline decoration-blue-700;
  }
</style>
