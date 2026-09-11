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
 * Shared so the header's tab count and the links table resolve one link once
 * between them, rather than one request each.
 */
const resolved = new Map<string, Promise<boolean>>();

const readEndpoint = async (ref: CallerEventRef): Promise<boolean> => {
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

  return (
    String(
      callerEvent?.nexusOperationScheduledEventAttributes?.endpoint ?? '',
    ) === SYSTEM_NEXUS_ENDPOINT
  );
};

/**
 * Whether an inbound link was made by an operation on the system endpoint.
 *
 * A link records which caller event points here, never which endpoint that
 * event used, and a handler workflow started through a tenant's own endpoint
 * produces a link of the same shape. Only the caller's own history can tell
 * them apart, so this reads the caller event and looks at its endpoint.
 *
 * Answers false whenever the caller cannot be read. An unreadable caller must
 * leave a genuine Nexus link on screen rather than hide it.
 */
export const isSystemNexusCallerLink = (
  link: EventLink | undefined | false,
): Promise<boolean> => {
  if (!link) return Promise.resolve(false);

  const ref = callerEventRef(link);
  if (!ref) return Promise.resolve(false);

  const key = cacheKey(ref);
  const pending = resolved.get(key);
  if (pending) return pending;

  const request = readEndpoint(ref).catch(() => false);
  resolved.set(key, request);
  return request;
};

/** Clears the shared cache. For tests. */
export const resetSystemNexusCallerLinks = () => {
  resolved.clear();
};
