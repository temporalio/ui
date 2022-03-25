<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  export const load: Load = async function ({ params, url, stuff }) {
    const namespace = params.namespace;
    return {
      props: {
        namespace,
      },
    };
  };
</script>

<script lang="ts">
  import { routeForNamespace } from '$lib/utilities/route-for';
  import { goto } from '$app/navigation';

  import { uploadEvents } from '$lib/stores/uploads-events';
  import UploadHistory from '$lib/components/upload-history.svelte';

  export let namespace: string;

  $: events = $uploadEvents.events;

  $: {
    if (events && events[0]?.id) {
      const eventId = events[0]?.id ?? 1;
      const path = routeForNamespace({ namespace }) + `/upload/${eventId}`;
      goto(path);
    }
  }
</script>

<section class="flex flex-col gap-4">
  <section id="event-history">
    <nav class="flex gap-4 justify-between items-end pb-4">
      <h3 class="text-lg font-medium">Event History</h3>
      <div class="flex gap-4">
        <UploadHistory />
      </div>
    </nav>
  </section>
</section>
