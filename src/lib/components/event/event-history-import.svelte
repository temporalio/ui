<script lang="ts">
  import { routeForNamespaceImport } from '$lib/utilities/route-for';
  import { goto } from '$app/navigation';

  import Button from '$lib/components/button.svelte';
  import { toEventHistory } from '$lib/models/event-history';
  import { notifications } from '$lib/stores/notifications';
  import { importEvents } from '$lib/stores/import-events';
  import { faFileImport } from '@fortawesome/free-solid-svg-icons';

  export let namespace: string;

  let rawEvents;

  const onFileSelect = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      try {
        const result = reader.result.toString();
        rawEvents = JSON.parse(result);
      } catch (e) {
        notifications.add('error', 'Could not parse JSON');
      }
    };
  };

  const onConfirm = async () => {
    try {
      const events = await toEventHistory(rawEvents?.events ?? rawEvents);
      importEvents.set(events);
      const eventId = events[0]?.id ?? 1;
      const path = routeForNamespaceImport({ namespace, eventId });
      goto(path);
    } catch (e) {
      notifications.add('error', 'Could not create event history from JSON');
    }
  };
</script>

<input
  class="block w-full border border-gray-200 rounded-md p-2"
  type="file"
  accept=".json"
  on:change={onFileSelect}
/>
<Button icon={faFileImport} on:click={onConfirm}>Import</Button>
