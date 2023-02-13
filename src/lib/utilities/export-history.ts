import { fetchAllEvents, fetchRawEvents } from '$lib/services/events-service';
import { stringifyWithBigInt } from './parse-with-big-int';

export const exportHistory = async ({
  namespace,
  workflowId,
  runId,
  decodeJSON,
  settings,
  accessToken,
}: {
  namespace: string;
  workflowId: string;
  runId: string;
  decodeJSON: boolean;
  settings?: Settings;
  accessToken?: string;
}) => {
  const events = decodeJSON
    ? await fetchAllEvents({
        namespace,
        workflowId,
        runId,
        settings,
        accessToken,
        sort: 'ascending',
      })
    : await fetchRawEvents({
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
