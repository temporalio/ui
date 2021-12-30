<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';

  export async function load({ stuff }: LoadInput) {
    const { events } = stuff as {
      events: HistoryEventWithId[];
    };

    return {
      props: {
        events,
      },
    };
  }
</script>

<script lang="ts">
  import { page } from '$app/stores';
  import { Activities } from '$lib/models/activity';

  export let events: HistoryEventWithId[];

  const activities = new Activities(events);
  const activity = activities.get($page.params.id);
</script>

<div class="flex items-center justify-center w-full h-full">
  <p>{activity.name} (To be implemented.)</p>
</div>
