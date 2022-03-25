<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  export const load: Load = async function ({ stuff }) {
    const { events } = stuff;

    return {
      props: {
        events,
      },
    };
  };
</script>

<script lang="ts">
  import FullEvent from '$lib/components/event/event-full.svelte';

  export let events: HistoryEventWithId[];
</script>

<FullEvent {events} />
