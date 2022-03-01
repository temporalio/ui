<script lang="ts" context="module">
  import type { Load } from '@sveltejs/kit';

  export const load: Load = async function ({ params, stuff }) {
    const { events } = stuff;
    const { id } = params;

    const event: HistoryEventWithId = events.find(
      (event: HistoryEventWithId) => event.id === id,
    );

    if (!event) {
      return { status: 404 };
    }

    return {
      props: { attributes: event.attributes },
    };
  };
</script>

<script lang="ts">
  import EventDetails from '$lib/components/event-details.svelte';

  export let attributes: EventAttribute;
</script>

<EventDetails {attributes} />
