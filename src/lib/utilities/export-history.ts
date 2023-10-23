import { get } from 'svelte/store';

import { page } from '$app/stores';

import { fetchRawEvents } from '$lib/services/events-service';
import { authUser } from '$lib/stores/auth-user';
import type { HistoryEvent } from '$lib/types/events';
import type { Settings } from '$lib/types/global';

import {
  cloneAllPotentialPayloadsWithCodec,
  decodePayloadAttributes,
} from './decode-payload';
import {
  getCodecEndpoint,
  getCodecIncludeCredentials,
  getCodecPassAccessToken,
} from './get-codec';
import { stringifyWithBigInt } from './parse-with-big-int';

const decodePayloads = async (event: HistoryEvent, settings: Settings) => {
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
    const convertedAttributes = await cloneAllPotentialPayloadsWithCodec(
      event,
      get(page).params.namespace,
      settingsWithLocalConfig,
      get(authUser).accessToken,
    );
    return decodePayloadAttributes(convertedAttributes);
  } catch (e) {
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
  decodeEventHistory,
}: {
  namespace: string;
  workflowId: string;
  runId: string;
  settings: Settings;
  decodeEventHistory: boolean;
}) => {
  try {
    const rawEvents = await fetchRawEvents({
      namespace,
      workflowId,
      runId,
      sort: 'ascending',
    });

    if (decodeEventHistory) {
      const decodedEvents = [];
      for (const event of rawEvents) {
        const decodedEvent = await decodePayloads(event, settings);
        decodedEvents.push(decodedEvent);
      }
      download(decodedEvents, `${runId}/events.json`, 'text/plain');
    } else {
      download(rawEvents, `${runId}/events.json`, 'text/plain');
    }
  } catch (e) {
    console.error('Could not download event history');
  }
};
