<script lang="ts" context="module">
  import type { Load } from '@sveltejs/kit';

  import { getGroupForEvent } from '$lib/models/group-events';
  import { routeForEventHistory } from '$lib/utilities/route-for';
  import type { EventHistoryParameters } from '$lib/utilities/route-for';

  /**
   * Returns `true` if we're trying to view an event that has been filtered
   * out from the sidebar.
   *
   * @param event The event as determined by the route
   * @param eventGroup The event group that its a member of
   * @param stuff SvelteKit's `stuff` object
   * @param params Route parameters
   */
  const shouldRedirect = (
    event: HistoryEventWithId,
    eventGroup: CompactEventGroup,
    { matchingEvents }: Partial<App.Stuff>,
    { view }: Record<string, string>,
  ): boolean => {
    if (!matchingEvents.includes(event)) return true;
    if (view === 'compact' && !eventGroup) return true;
    return false;
  };

  export const load: Load = async function ({ params, stuff, url }) {
    const { eventId } = params;
    const { events, eventGroups } = stuff;

    const event: HistoryEventWithId = events.find(
      (event: HistoryEventWithId) => event.id === eventId,
    );

    if (!event) return { status: 404 };

    const eventGroup: CompactEventGroup = getGroupForEvent(event, eventGroups);

    if (shouldRedirect(event, eventGroup, stuff, params)) {
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

  import EventDetails from '../_event-details.svelte';
  import Link from '$lib/components/link.svelte';

  export let event: HistoryEventWithId;
  export let eventGroup: CompactEventGroup;
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

  <EventDetails {event} />
</section>
