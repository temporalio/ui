<script lang="ts" context="module">
  import type { Load } from '@sveltejs/kit';

  export const load: Load = async function ({ params, stuff }) {
    const { eventId } = params;
    const { events, eventGroups } = stuff;

    const event: HistoryEventWithId = events.find(
      (event: HistoryEventWithId) => event.id === eventId,
    );

    const eventGroup: CompactEventGroup = getGroupForEvent(event, eventGroups);

    if (!event) {
      return { status: 404 };
    }

    return {
      props: { attributes: event.attributes, eventGroup, eventId },
    };
  };
</script>

<script lang="ts">
  import EventDetails from '$lib/components/event-details.svelte';
  import { getGroupForEvent } from '$lib/models/group-events';

  export let attributes: EventAttribute;
  export let eventGroup: CompactEventGroup;
  export let eventId: string;
</script>

<section class="overflow-y-scroll max-h-full">
  {#if eventGroup}
    <nav class="flex flex-col mb-4">
      <ul class="flex gap-4 w-full items-start">
        {#each [...eventGroup.events.values()] as event}
          <li>
            <a
              sveltekit:noscroll
              href={event.id}
              class:active={event.id === eventId}
              class="border-b-2 border-blue-600"
            >
              {event.eventType}
            </a>
          </li>
        {/each}
      </ul>
    </nav>
  {/if}
  <EventDetails {attributes} />
</section>

<style lang="postcss">
  .active {
    @apply text-blue-700 border-b-2 border-blue-600;
  }
</style>
