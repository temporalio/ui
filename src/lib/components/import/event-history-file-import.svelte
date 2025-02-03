<script lang="ts">
  import { goto } from '$app/navigation';

  import Button from '$lib/holocene/button.svelte';
  import Label from '$lib/holocene/label.svelte';
  import { toaster } from '$lib/holocene/toaster/toaster.svelte';
  import { translate } from '$lib/i18n/translate';
  import { groupEvents } from '$lib/models/event-groups';
  import { toEventHistory } from '$lib/models/event-history';
  import { importEventGroups, importEvents } from '$lib/stores/import-events';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import type { HistoryEvent } from '$lib/types/events';
  import { parseWithBigInt } from '$lib/utilities/parse-with-big-int';
  import { routeForEventHistoryImport } from '$lib/utilities/route-for';

  let rawEvents: HistoryEvent[] | { events: HistoryEvent[] };
  let fileLoaded = false;

  const onFileSelect = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target?.files?.[0];
    const reader = new FileReader();
    if (file) {
      reader.readAsText(file);
      reader.onload = () => {
        try {
          const result = reader?.result?.toString() ?? '';
          rawEvents = parseWithBigInt(result);
          fileLoaded = true;
        } catch (e) {
          toaster.push({
            variant: 'error',
            message: translate('events.event-history-load-error'),
          });
          fileLoaded = false;
        }
      };
    }
  };

  const onConfirm = async () => {
    try {
      const events = await toEventHistory(
        Array.isArray(rawEvents) ? rawEvents : rawEvents?.events,
      );
      const eventGroups = groupEvents(events);
      importEvents.set(events);
      importEventGroups.set(eventGroups);
      fileLoaded = false;
      const path = routeForEventHistoryImport($lastUsedNamespace, 'feed');
      goto(path);
    } catch (e) {
      console.error(e);
      toaster.push({
        variant: 'error',
        message: translate('events.event-history-import-error'),
      });
    }
  };
</script>

<div class="flex flex-col items-start gap-2 md:flex-row md:items-center">
  <Label
    hidden
    for="import-event-history-file-upload"
    label={translate('events.import-event-history-file-upload')}
  />
  <input
    id="import-event-history-file-upload"
    class="import-input block border border-slate-200 p-2"
    type="file"
    accept=".json"
    on:change={onFileSelect}
  />
  <Button leadingIcon="file-upload" onclick={onConfirm} disabled={!fileLoaded}
    >{translate('common.import')}</Button
  >
</div>
