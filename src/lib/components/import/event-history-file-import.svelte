<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import { groupEvents } from '$lib/models/event-groups';
  import { toEventHistory } from '$lib/models/event-history';
  import { authUser } from '$lib/stores/auth-user';
  import { importEventGroups, importEvents } from '$lib/stores/import-events';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import { toaster } from '$lib/stores/toaster';
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
    const { settings } = $page.data;
    try {
      const events = await toEventHistory({
        response: Array.isArray(rawEvents) ? rawEvents : rawEvents?.events,
        namespace: $lastUsedNamespace,
        settings,
        accessToken: $authUser.accessToken,
      });
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

<label class="sr-only" for="import-event-history-file-upload">
  {translate('events.import-event-history-file-upload')}
</label>
<input
  id="import-event-history-file-upload"
  class="import-input block rounded-md border border-gray-200 p-2"
  type="file"
  accept=".json"
  on:change={onFileSelect}
/>
<Button leadingIcon="file-upload" on:click={onConfirm} disabled={!fileLoaded}
  >{translate('common.import')}</Button
>
