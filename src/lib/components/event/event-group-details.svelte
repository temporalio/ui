<script lang="ts">
  export let eventGroup: CompactEventGroup | null;
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
            <span class="event-type" class:active={id === selectedId}
              >{eventInGroup.eventType}</span
            >
            (#{id})
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
    @apply text-blue-700 border-b-2 border-blue-700;
  }
  .active {
    @apply text-blue-700 border-b-2 border-blue-700;
  }
</style>
