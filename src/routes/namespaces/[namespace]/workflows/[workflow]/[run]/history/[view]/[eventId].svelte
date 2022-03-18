<script lang="ts" context="module">
  import type { Load } from '@sveltejs/kit';

  import { getGroupForEvent } from '$lib/models/group-events';
  import { routeForEventHistory } from '$lib/utilities/route-for';
  import type { EventHistoryParameters } from '$lib/utilities/route-for';

  export const load: Load = async function ({ params, stuff, url }) {
    const { eventId } = params;
    const { events, eventGroups, matchingEvents } = stuff;

    const event: HistoryEventWithId = events.find(
      (event: HistoryEventWithId) => event.id === eventId,
    );

    const eventGroup: CompactEventGroup = getGroupForEvent(event, eventGroups);

    if (!event) return { status: 404 };

    if (!matchingEvents.includes(event)) {
      url.pathname = routeForEventHistory(params as EventHistoryParameters);

      return {
        status: 302,
        redirect: String(url),
      };
    }

    return {
      props: { event, eventGroup },
    };
  };
</script>

<script lang="ts">
  import { page } from '$app/stores';
  import { appendQueryParameters } from '$lib/utilities/append-query-parameters';

  import EventDetails from '../_event-details.svelte';

  export let event: HistoryEventWithId;
  export let eventGroup: CompactEventGroup;
</script>

<section class="overflow-y-scroll max-h-full">
  {#if eventGroup}
    <nav class="flex flex-col mb-4">
      <ul class="flex gap-4 w-full items-start">
        {#each [...eventGroup.events] as [id, eventInGroup]}
          <li>
            <a
              sveltekit:noscroll
              href={appendQueryParameters(id, $page.url.searchParams)}
              class:active={id === event.id}
              class="border-b-2 border-blue-600"
            >
              {eventInGroup.eventType}
            </a>
          </li>
        {/each}
      </ul>
    </nav>
  {/if}

  <EventDetails {event} />
</section>

<style lang="postcss">
  .active {
    @apply text-blue-700 border-b-2 border-blue-600;
  }
</style>
