<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';

  export async function load({ stuff, page }: LoadInput) {
    const { events } = stuff as {
      events: HistoryEventWithId[];
    };

    return {
      props: {
        event: events.find((event) => event.id === page.params.eventId),
      },
    };
  }
</script>

<script lang="ts">
  import EventDetails from '$lib/components/event-details.svelte';

  export let event: HistoryEventWithId;
</script>

<EventDetails attributes={event.attributes} />
