import { fetchRawEvents } from '$lib/services/events-service';
import type { DownloadEventHistorySetting } from '$lib/stores/events';
import type { HistoryEvent } from '$lib/types/events';

import {
  decodeEventAttributesForExport,
  decodePayloadAttributes,
} from './decode-payload';
import { stringifyWithBigInt } from './parse-with-big-int';

const decodePayloads = async (
  event: HistoryEvent,
  decodeSetting: DownloadEventHistorySetting,
) => {
  try {
    const convertedAttributes = await decodeEventAttributesForExport(
      event,
      decodeSetting,
    );

    return decodePayloadAttributes(convertedAttributes, false);
  } catch {
    return event;
  }
};

function download(
  events: HistoryEvent[],
  fileName: string,
  contentType: string,
) {
  const content = stringifyWithBigInt({ events }, null, 2);
  const a = document.createElement('a');
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}

export const exportHistory = async ({
  namespace,
  workflowId,
  runId,
  decodeSetting,
}: {
  namespace: string;
  workflowId: string;
  runId: string;
  decodeSetting: DownloadEventHistorySetting;
}) => {
  try {
    const rawEvents = await fetchRawEvents({
      namespace,
      workflowId,
      runId,
      sort: 'ascending',
    });

    if (decodeSetting === 'encoded') {
      download(rawEvents, `${runId}/events.json`, 'text/plain');
    } else {
      const decodedEvents = [];
      for (const event of rawEvents) {
        const decodedEvent = await decodePayloads(event, decodeSetting);
        decodedEvents.push(decodedEvent);
      }
      download(decodedEvents, `${runId}/events.json`, 'text/plain');
    }
  } catch {
    console.error('Could not download event history');
  }
};
