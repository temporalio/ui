<script lang="ts">
  import Button from '$lib/components/button.svelte';
  import { toEventHistory } from '$lib/models/event-history';
  import { notifications } from '$lib/stores/notifications';
  import { uploadEvents } from '$lib/stores/uploads-events';
  import { faFileImport } from '@fortawesome/free-solid-svg-icons';
  import Modal from './modal.svelte';

  let showFileUpload: boolean = false;
  let rawEvents: HistoryEvent[];

  const show = () => (showFileUpload = true);
  const cancel = () => (showFileUpload = false);

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
      const events = await toEventHistory(rawEvents);
      uploadEvents.set(events);
      cancel();
    } catch (e) {
      debugger;
      notifications.add('error', 'Could not create event history from JSON');
    }
  };
</script>

<Button icon={faFileImport} on:click={show}>Upload History</Button>
<Modal
  open={showFileUpload}
  confirmText="Upload"
  confirmDisabled={!rawEvents}
  on:cancelModal={cancel}
  on:confirmModal={onConfirm}
>
  <h3 slot="title">Upload JSON</h3>
  <div slot="content">
    <p>Replace workflow events with events from JSON file.</p>
    <input
      class="block w-full border border-gray-200 rounded-md p-2 mt-4"
      type="file"
      accept=".json"
      on:change={onFileSelect}
    />
  </div>
</Modal>
