<script lang="ts">
  import { routeForImport } from '$lib/utilities/route-for';
  import { goto } from '$app/navigation';

  import Button from '$lib/components/button.svelte';
  import { toEventHistory } from '$lib/models/event-history';
  import { notifications } from '$lib/stores/notifications';
  import { importEvents, importEventGroups } from '$lib/stores/import-events';
  import { faFileImport } from '@fortawesome/free-solid-svg-icons';
  import { importSettings } from './_import-settings';

  let rawEvents: HistoryEvent[] | { events: HistoryEvent[] };

  const onFileSelect = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target?.files?.[0];
    const reader = new FileReader();
    if (file) {
      reader.readAsText(file);
      reader.onload = () => {
        try {
          const result = reader?.result?.toString() ?? '';
          rawEvents = JSON.parse(result);
        } catch (e) {
          notifications.add('error', 'Could not parse JSON');
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
      });
      importEvents.set(events);
      importEventGroups.set(eventGroups);
      const path = routeForImport({ importType: 'events', view: 'feed' });
      goto(path);
    } catch (e) {
      console.error(e);
      notifications.add('error', 'Could not create event history from JSON');
    }
  };
</script>

<input
  class="import-input block rounded-md border border-gray-200 p-2"
  type="file"
  accept=".json"
  on:change={onFileSelect}
/>
<Button icon={faFileImport} on:click={onConfirm}>Import</Button>
