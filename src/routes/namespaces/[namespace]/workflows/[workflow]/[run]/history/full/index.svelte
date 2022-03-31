<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  import { getEventsInCategory } from '$lib/models/event-history/get-event-categorization';

  export const load: Load = async function ({ stuff, url }) {
    const category = url.searchParams.get('category');

    const events = getEventsInCategory(stuff.events, category);

    return {
      props: {
        events,
      },
    };
  };
</script>

<script lang="ts">
  import FullEvent from '$lib/components/event/view/event-full.svelte';

  export let events: HistoryEventWithId[];
</script>

<FullEvent {events} />
