<script lang="ts">
  import Button from '$lib/components/button.svelte';
  import { toEventHistory } from '$lib/models/event-history';
  import { notifications } from '$lib/stores/notifications';
  import { uploadEvents } from '$lib/stores/uploads-events';
  import { faFileImport, faIcons } from '@fortawesome/free-solid-svg-icons';

  let rawEvents: HistoryEvent[] | { events: HistoryEvent[] };

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
      uploadEvents.set(events);
    } catch (e) {
      notifications.add('error', 'Could not create event history from JSON');
    }
  };
</script>

<Button icon={faFileImport} on:click={onConfirm}>Upload</Button>
<input
  class="block w-full border border-gray-200 rounded-md p-2"
  type="file"
  accept=".json"
  on:change={onFileSelect}
/>
