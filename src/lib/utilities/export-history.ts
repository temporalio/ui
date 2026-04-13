import { get } from 'svelte/store';

import { page } from '$app/stores';

import { fetchRawEvents } from '$lib/services/events-service';
import type { DownloadEventHistorySetting } from '$lib/stores/events';
import type { HistoryEvent } from '$lib/types/events';
import type { Settings } from '$lib/types/global';

import {
  decodeEventAttributesForExport,
  decodePayloadAttributes,
} from './decode-payload';
import {
  getCodecEndpoint,
  getCodecIncludeCredentials,
  getCodecPassAccessToken,
} from './get-codec';
import { stringifyWithBigInt } from './parse-with-big-int';

const decodePayloads = async (
  event: HistoryEvent,
  settings: Settings,
  decodeSetting: DownloadEventHistorySetting,
) => {
  const endpoint = getCodecEndpoint(settings);
  const passAccessToken = getCodecPassAccessToken(settings);
  const includeCredentials = getCodecIncludeCredentials(settings);
  const settingsWithLocalConfig = {
    ...settings,
    codec: {
      ...settings?.codec,
      endpoint,
      passAccessToken,
      includeCredentials,
    },
  };

  try {
    const convertedAttributes = await decodeEventAttributesForExport(
      event,
      settingsWithLocalConfig,
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
  settings,
  decodeSetting,
}: {
  namespace: string;
  workflowId: string;
  runId: string;
  settings: Settings;
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
        const decodedEvent = await decodePayloads(
          event,
          settings,
          decodeSetting,
        );
        decodedEvents.push(decodedEvent);
      }
      download(decodedEvents, `${runId}/events.json`, 'text/plain');
    }
  } catch {
    console.error('Could not download event history');
  }
};
