<script lang="ts">
  import { routeForEventHistoryImport } from '$lib/utilities/route-for';
  import { goto } from '$app/navigation';

  import Button from '$lib/holocene/button.svelte';
  import { toEventHistory } from '$lib/models/event-history';
  import { toaster } from '$lib/stores/toaster';
  import { importEvents, importEventGroups } from '$lib/stores/import-events';
  import { parseWithBigInt } from '$lib/utilities/parse-with-big-int';
  import { groupEvents } from '$lib/models/event-groups';
  import { page } from '$app/stores';
  import { authUser } from '$lib/stores/auth-user';
  import { lastUsedNamespace } from '$lib/stores/namespaces';

  import type { HistoryEvent } from '$lib/types/events';

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
          toaster.push({ variant: 'error', message: 'Could not parse JSON' });
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
        message: 'Could not create event history from JSON',
      });
    }
  };
</script>

<input
  class="import-input block rounded-md border border-gray-200 p-2"
  type="file"
  accept=".json"
  on:change={onFileSelect}
/>
<Button icon="file-upload" on:click={onConfirm} disabled={!fileLoaded}
  >Import</Button
>
