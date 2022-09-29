<script lang="ts">
  import HistoryImport from '../_event-history-import.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { user } from '$lib/stores/auth-user';

  const formatEvent = 'EventHistory';
  const format1 = { events: [formatEvent] };
  const format2 = [formatEvent];
</script>

<section class="flex flex-col gap-4">
  <section id="event-history">
    <nav class="block items-center justify-between gap-4 pb-4 lg:flex">
      <h3 class="text-lg font-medium">Event History Import</h3>
      <div class="flex gap-4">
        <HistoryImport {user} />
      </div>
    </nav>
  </section>
  <section class="w-full md:w-1/2">
    <code class="text-md bg-gray-200 p-2 font-medium"
      >type HistoryEvent = temporal.api.history.v1.IHistoryEvent</code
    >
    <div class="mt-4">
      <Link
        target="_blank"
        href="https://github.com/temporalio/api/blob/1cd0ac0bbd8e71c7bfc9fe1900c678b432e66e5b/temporal/api/history/v1/message.proto"
        class="mb-8">View in Github</Link
      >
    </div>
    <h3 class="mt-8 text-lg font-medium">Expected JSON format</h3>
    <CodeBlock content={format1} />
    <h4 class="text-md font-medium">or</h4>
    <CodeBlock content={format2} />
  </section>
</section>
