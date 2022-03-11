<script lang="ts" context="module">
  import type { Load } from '@sveltejs/kit';

  export const load: Load = async function ({ params, stuff }) {
    const { events, eventGroups } = stuff;
    const { eventId } = params;

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

<section>
  {#if eventGroup}
    <div class="flex flex-col w-full h-full">
      <nav class="mb-4">
        <ul class="flex gap-4 w-full items-start">
          {#each [...eventGroup.events.values()] as event}
            <li>
              <a href={event.id} class:active={event.id === eventId}>
                {event.eventType}
              </a>
            </li>
          {/each}
        </ul>
      </nav>
    </div>
  {/if}
  <EventDetails {attributes} />
</section>

<style lang="postcss">
  .active {
    @apply text-blue-700 border-b-2 border-blue-600;
  }
</style>
