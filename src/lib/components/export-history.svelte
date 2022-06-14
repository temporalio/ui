<script lang="ts">
  import { fetchRawEvents } from '$lib/services/events-service';
  import Button from './button.svelte';

  export let namespace: string;
  export let workflowId: string;
  export let runId: string;

  const exportHistory = async () => {
    const events = await fetchRawEvents({
      namespace,
      workflowId,
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

<Button secondary icon="download" on:click={exportHistory}
  ><span class="hidden md:inline">Download</span></Button
>
