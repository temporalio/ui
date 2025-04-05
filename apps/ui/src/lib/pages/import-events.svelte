<script lang="ts">
  import HistoryImport from '$lib/components/import/event-history-file-import.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

  const format1 = { events: 'HistoryEvent[]' };
  const format2 = 'HistoryEvent[]';
</script>

<section class="flex flex-col gap-4">
  <nav
    id="event-history"
    class="block items-center justify-between gap-4 pb-4 lg:flex"
    aria-label={translate('events.import-event-history')}
  >
    <h1 data-testid="import-event-history">
      {translate('events.import-event-history')}
    </h1>
    <div class="flex gap-4">
      <HistoryImport />
    </div>
  </nav>
  <div class="w-full md:w-1/2">
    <code class="md:text-md font-mono text-sm leading-8"
      >type HistoryEvent = temporal.api.history.v1.IHistoryEvent</code
    >
    <div class="mt-4">
      <Link
        newTab
        href="https://github.com/temporalio/api/blob/1cd0ac0bbd8e71c7bfc9fe1900c678b432e66e5b/temporal/api/history/v1/message.proto"
        class="mb-8">{translate('events.api-history-link')}</Link
      >
    </div>
    <h2 class="mt-8">
      {translate('events.history-expected-formats')}
    </h2>
    <div class="h-40 text-center">
      <CodeBlock
        content={stringifyWithBigInt(format1)}
        inline
        copyIconTitle={translate('common.copy-icon-title')}
        copySuccessIconTitle={translate('common.copy-success-icon-title')}
      />
      <CodeBlock
        content={stringifyWithBigInt(format2)}
        inline
        copyIconTitle={translate('common.copy-icon-title')}
        copySuccessIconTitle={translate('common.copy-success-icon-title')}
      />
    </div>
  </div>
</section>
