<script>import { fetchRawEvents } from '../services/events-service';
import Button from '$holocene/button.svelte';
export let namespace;
export let workflowId;
export let runId;
const exportHistory = async () => {
    const events = await fetchRawEvents({
        namespace,
        workflowId,
        runId,
        sort: 'ascending',
    });
    const content = JSON.stringify({ events }, null, 2);
    download(content, `${runId}/events.json`, 'text/plain');
    function download(content, fileName, contentType) {
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
