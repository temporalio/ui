import type { DownloadEventHistorySetting } from '$lib/stores/events';
import type { HistoryEvent } from '$lib/types/events';
import {
  decodeEventAttributesForExport,
  parsePayloadAttributes,
  type PotentiallyDecodable,
} from '$lib/utilities/decode-payload';
import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

export interface HistoryDownload {
  namespace: string;
  workflowId: string;
  runId: string;
  decodeSetting: DownloadEventHistorySetting;
}

interface HistoryPage {
  history?: { events?: HistoryEvent[] };
  nextPageToken?: string;
}

// ui's exportHistory and fetchRawEvents swallow request errors, so a failed
// fetch would still look like a download. These pages throw instead.
async function fetchHistoryFrom(
  route: string,
  runId: string,
  token?: string,
): Promise<HistoryEvent[]> {
  const page = await requestFromAPI<HistoryPage>(route, {
    token,
    notifyOnError: false,
    params: { 'execution.runId': runId },
  });
  const events = page?.history?.events ?? [];
  if (!page?.nextPageToken) return events;
  return [
    ...events,
    ...(await fetchHistoryFrom(route, runId, page.nextPageToken)),
  ];
}

type DecodedAttributes = Awaited<
  ReturnType<typeof decodeEventAttributesForExport>
>;

function isDecodable(
  attributes: DecodedAttributes,
): attributes is PotentiallyDecodable {
  return typeof attributes === 'object' && attributes !== null;
}

// Decoding is best effort, as in ui's export: an event that fails to decode
// is saved as fetched.
async function decodeEvent(
  event: HistoryEvent,
  decodeSetting: DownloadEventHistorySetting,
) {
  try {
    const attributes = await decodeEventAttributesForExport(
      event,
      decodeSetting,
    );
    if (!isDecodable(attributes)) return event;
    return parsePayloadAttributes(attributes, false);
  } catch {
    return event;
  }
}

// One event at a time, as ui's export does, because each event with payloads
// is its own request to the codec server.
async function decodeEvents(
  events: HistoryEvent[],
  decodeSetting: DownloadEventHistorySetting,
) {
  const decoded = [];
  for (const event of events) {
    decoded.push(await decodeEvent(event, decodeSetting));
  }
  return decoded;
}

function saveFile(content: string, fileName: string) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
  link.download = fileName;
  link.click();
}

export async function downloadHistory({
  namespace,
  workflowId,
  runId,
  decodeSetting,
}: HistoryDownload): Promise<void> {
  const route = routeForApi('events.ascending', { namespace, workflowId });
  const events = await fetchHistoryFrom(route, runId);
  const saved =
    decodeSetting === 'encoded'
      ? events
      : await decodeEvents(events, decodeSetting);
  saveFile(
    stringifyWithBigInt({ events: saved }, undefined, 2),
    `${runId}/events.json`,
  );
}
