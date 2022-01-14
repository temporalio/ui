<script lang="ts">
  import ToggleButton from '$lib/components/toggle-button.svelte';
  import { fetchRawEvents } from '$lib/services/events-service';
  import { faDownload } from '@fortawesome/free-solid-svg-icons';

  const exportHistory = async () => {
    const events = await fetchRawEvents({
      namespace,
      executionId: workflowId,
      runId: runId,
    });

    const content = JSON.stringify(events, null, 2);
    download(content, `${runId}/events.json`, 'text/plain');

    function download(content: string, fileName: string, contentType: string) {
      const a = document.createElement('a');
      const file = new Blob([content], { type: contentType });
      a.href = URL.createObjectURL(file);
      a.download = fileName;
      a.click();
    }
  };

  export let namespace: string;
  export let workflowId: string;
  export let runId: string;
</script>

<ToggleButton icon={faDownload} onclick={exportHistory} href="#" />
