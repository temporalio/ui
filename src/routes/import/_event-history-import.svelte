<script lang="ts">
  import { routeForImport } from '$lib/utilities/route-for';
  import { goto } from '$app/navigation';

  import Button from '$holocene/button.svelte';
  import { toEventHistory } from '$lib/models/event-history';
  import { toaster } from '$holocene/stores/toaster';
  import { importEvents, importEventGroups } from '$lib/stores/import-events';
  import { importSettings } from './_import-settings';
  import { parseWithBigInt } from '$lib/utilities/parse-with-big-int';

  let rawEvents: HistoryEvent[] | { events: HistoryEvent[] };

  export let user: User = {};

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
        } catch (e) {
          toaster.push({ variant: 'error', message: 'Could not parse JSON' });
        }
      };
    }
  };

  const onConfirm = async () => {
    try {
      const { events, eventGroups } = await toEventHistory({
        response: Array.isArray(rawEvents) ? rawEvents : rawEvents?.events,
        namespace: importSettings.defaultNamespace,
        settings: importSettings,
        accessToken: user.accessToken,
      });
      importEvents.set(events);
      importEventGroups.set(eventGroups);
      const path = routeForImport({ importType: 'events', view: 'feed' });
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
<Button icon="file-upload" on:click={onConfirm}>Import</Button>
