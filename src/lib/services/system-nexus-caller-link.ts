import { fetchPartialRawEvents } from '$lib/services/events-service';
import { SYSTEM_NEXUS_ENDPOINT } from '$lib/system-nexus-endpoints';
import type { EventLink } from '$lib/types';

const NEXUS_OPERATION_SCHEDULED = 'EVENT_TYPE_NEXUS_OPERATION_SCHEDULED';

/**
 * The history page this resolver is willing to read to reach the caller event.
 * The API returns the first N events, so reaching event N costs N events. A
 * caller event beyond this is left unresolved rather than paid for.
 */
const MAXIMUM_CALLER_EVENT_ID = 1000;

type CallerEventRef = {
  namespace: string;
  workflowId: string;
  runId: string;
  eventId: number;
};

const callerEventRef = (link: EventLink): CallerEventRef | null => {
  const workflowEvent = link?.workflowEvent;
  if (!workflowEvent) return null;

  // Only a Nexus operation can have been scheduled on the system endpoint, so
  // any other caller event is answered without a request.
  if (String(workflowEvent.eventRef?.eventType) !== NEXUS_OPERATION_SCHEDULED) {
    return null;
  }

  const { namespace, workflowId, runId } = workflowEvent;
  const eventId = Number(workflowEvent.eventRef?.eventId);
  if (!namespace || !workflowId || !runId) return null;
  if (!Number.isInteger(eventId) || eventId < 1) return null;
  if (eventId > MAXIMUM_CALLER_EVENT_ID) return null;

  return { namespace, workflowId, runId, eventId };
};

const cacheKey = ({ namespace, workflowId, runId, eventId }: CallerEventRef) =>
  `${namespace}/${workflowId}/${runId}/${eventId}`;

/**
 * Shared so each caller event is read once, however often the links table
 * renders.
 */
const resolved = new Map<string, Promise<string | null>>();

const readOperation = async (ref: CallerEventRef): Promise<string | null> => {
  const events = await fetchPartialRawEvents({
    namespace: ref.namespace,
    workflowId: ref.workflowId,
    runId: ref.runId,
    sort: 'ascending',
    maximumPageSize: String(ref.eventId),
  });

  const callerEvent = events.find(
    (event) => Number(event.eventId) === ref.eventId,
  );

  const attributes = callerEvent?.nexusOperationScheduledEventAttributes;
  if (String(attributes?.endpoint ?? '') !== SYSTEM_NEXUS_ENDPOINT) return null;
  return attributes?.operation || null;
};

/**
 * The system operation that made an inbound link, or null when the link was
 * made by a tenant's own endpoint or the caller cannot be read.
 *
 * A link records which caller event points here, never which endpoint that
 * event used, and a handler workflow started through a tenant's own endpoint
 * produces a link of the same shape. Only the caller's own history can tell
 * them apart, so this reads the caller event and looks at its endpoint.
 */
export const systemNexusCallerOperation = (
  link: EventLink | undefined | false,
): Promise<string | null> => {
  if (!link) return Promise.resolve(null);

  const ref = callerEventRef(link);
  if (!ref) return Promise.resolve(null);

  const key = cacheKey(ref);
  const pending = resolved.get(key);
  if (pending) return pending;

  const request = readOperation(ref).catch(() => null);
  resolved.set(key, request);
  return request;
};

/** Clears the shared cache. For tests. */
export const resetSystemNexusCallerLinks = () => {
  resolved.clear();
};
