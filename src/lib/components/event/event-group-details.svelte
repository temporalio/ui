<script lang="ts">
  import { page } from '$app/stores';

  import EventDetails from '$lib/components/event/event-details.svelte';
  import Link from '$lib/components/link.svelte';

  export let event: HistoryEventWithId;
  export let eventGroup: CompactEventGroup | null;
</script>

<section class="overflow-y-scroll max-h-full">
  {#if eventGroup}
    <nav class="flex flex-col mb-4">
      <ul class="flex gap-4 w-full items-start">
        {#each [...eventGroup.events] as [id, eventInGroup] (id)}
          <li>
            <Link
              sveltekit:noscroll
              href={id + $page.url.search}
              active={id === event.id}
            >
              {eventInGroup.eventType}
            </Link>
          </li>
        {/each}
      </ul>
    </nav>
  {/if}
</section>
