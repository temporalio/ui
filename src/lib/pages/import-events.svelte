<script lang="ts">
  import HistoryImport from '$lib/components/import/event-history-file-import.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Link from '$lib/holocene/link.svelte';

  const format1 = { events: 'HistoryEvent[]' };
  const format2 = 'HistoryEvent[]';
</script>

<section class="flex flex-col gap-4">
  <nav
    id="event-history"
    class="block items-center justify-between gap-4 pb-4 lg:flex"
    aria-label="import event history"
  >
    <h1 class="text-lg font-medium" data-testid="import-event-history">
      Import Event History
    </h1>
    <div class="flex gap-4">
      <HistoryImport />
    </div>
  </nav>
  <div class="w-full md:w-1/2">
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
    <h3 class="mt-8 text-lg font-medium">Expected JSON formats</h3>
    <div class="h-40 text-center">
      <CodeBlock content={format1} inline />
      <CodeBlock content={format2} inline />
    </div>
  </div>
</section>
