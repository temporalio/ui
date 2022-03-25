<script lang="ts" context="module">
  import type { Load } from '@sveltejs/kit';

  export const load: Load = async function ({ stuff }) {
    const { events } = stuff;

    return {
      props: { events },
    };
  };
</script>

<script lang="ts">
  import EventJson from '$lib/components/event/event-json.svelte';

  export let events: HistoryEventWithId[];
</script>

<EventJson {events} />
