import { fetchRawEvents } from '$lib/services/events-service';

export const exportHistory = async ({
  namespace,
  workflowId,
  runId,
}: {
  namespace: string;
  workflowId: string;
  runId: string;
}) => {
  const events = await fetchRawEvents({
    namespace,
    workflowId,
    runId,
    sort: 'ascending',
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
