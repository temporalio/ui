<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  export const load: Load = async function ({ params }) {
    const namespace = params.namespace;
    return {
      props: {
        namespace,
      },
    };
  };
</script>

<script lang="ts">
  import { afterNavigate } from '$app/navigation';

  import { importVisited, viewed } from '$lib/stores/import-events';
  import ImportHistory from '$lib/components/event/event-history-import.svelte';
  import CodeBlock from '$lib/components/code-block.svelte';
  import Link from '$lib/components/link.svelte';

  export let namespace: string;

  const formatEvent = '...EventHistory';
  const format1 = { events: [formatEvent] };
  const format2 = [formatEvent];

  afterNavigate(() => {
    if (!$importVisited) {
      viewed();
    }
  });
</script>

<section class="flex flex-col gap-4">
  <section id="event-history">
    <nav class="flex gap-4 justify-between items-end pb-4">
      <h3 class="text-lg font-medium">Event History Import</h3>
      <div class="flex gap-4">
        <ImportHistory {namespace} />
      </div>
    </nav>
  </section>
  <section class="w-full md:w-1/2">
    <code class="text-md font-medium bg-gray-200 p-2"
      >type HistoryEvent = temporal.api.history.v1.IHistoryEvent</code
    >
    <div class="mt-4">
      <Link
        target="_blank"
        href="https://github.com/temporalio/api/blob/1cd0ac0bbd8e71c7bfc9fe1900c678b432e66e5b/temporal/api/history/v1/message.proto"
        class="mb-8">View in Github</Link
      >
    </div>
    <h3 class="text-lg font-medium mt-8">Expected JSON format</h3>
    <CodeBlock content={format1} />
    <h4 class="text-md font-medium">or</h4>
    <CodeBlock content={format2} />
  </section>
</section>
