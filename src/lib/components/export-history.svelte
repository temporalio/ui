<script lang="ts">
  import { page } from '$app/stores';

  import ToggleButton from '$lib/components/toggle-button.svelte';
  import { fetchRawEvents } from '$lib/services/events-service';
  import { faDownload } from '@fortawesome/free-solid-svg-icons';

  const { workflow: executionId, run: runId, namespace } = $page.params;

  const exportHistory = async () => {
    const events = await fetchRawEvents({
      namespace,
      executionId,
      runId,
    });

    const content = JSON.stringify({ events }, null, 2);
    download(content, `${runId}/events.json`, 'text/plain');

    function download(content: string, fileName: string, contentType: string) {
      const a = document.createElement('a');
      const file = new Blob([content], { type: contentType });
      a.href = URL.createObjectURL(file);
      a.download = fileName;
      a.click();
    }
  };
</script>

<ToggleButton icon={faDownload} on:click={exportHistory} />
