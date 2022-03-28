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
  import UploadHistory from '$lib/components/event/event-history-upload.svelte';
  import CodeBlock from '$lib/components/code-block.svelte';
  import Link from '$lib/components/link.svelte';

  export let namespace: string;

  const formatEvent = { id: 1, '...': '...' };
  const format1 = { events: [formatEvent] };
  const format2 = [formatEvent];

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
      <h3 class="text-lg font-medium">Event History Upload</h3>
      <div class="flex gap-4">
        <UploadHistory />
      </div>
    </nav>
  </section>
  <section class="w-full md:w-1/2">
    <Link
      target="_blank"
      href="https://github.com/temporalio/api/blob/1cd0ac0bbd8e71c7bfc9fe1900c678b432e66e5b/temporal/api/history/v1/message.proto"
      ><code class="text-md font-medium"
        >type HistoryEvent = temporal.api.history.v1.IHistoryEvent</code
      ></Link
    >
    <CodeBlock content={format1} />
    <h4 class="text-md font-medium">or</h4>
    <CodeBlock content={format2} />
  </section>
</section>
