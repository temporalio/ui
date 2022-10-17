<script lang="ts">
  import { fetchRawEvents } from '$lib/services/events-service';
  import Button from '$holocene/button.svelte';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

  export let namespace: string;
  export let workflowId: string;
  export let runId: string;

  const exportHistory = async () => {
    const events = await fetchRawEvents({
      namespace,
      workflowId,
      runId,
      sort: 'ascending',
    });

    const content = stringifyWithBigInt({ events }, null, 2);
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

<Button variant="secondary" icon="download" on:click={exportHistory}
  ><span class="hidden md:inline">Download</span></Button
>
