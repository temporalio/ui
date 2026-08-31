import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { EventLink } from '$lib/types';

import { fetchPartialRawEvents } from './events-service';
import {
  isSystemNexusCallerLink,
  resetSystemNexusCallerLinks,
} from './system-nexus-caller-link';

vi.mock('./events-service', () => ({
  fetchPartialRawEvents: vi.fn(),
}));

const fetchPartial = vi.mocked(fetchPartialRawEvents);

const callerLink = (
  eventId: string | number = 5,
  eventType = 'EVENT_TYPE_NEXUS_OPERATION_SCHEDULED',
): EventLink =>
  ({
    workflowEvent: {
      namespace: 'default',
      workflowId: 'caller',
      runId: 'caller-run',
      eventRef: { eventId, eventType },
    },
  }) as unknown as EventLink;

const scheduledEvent = (eventId: number, endpoint: string) =>
  ({
    eventId: String(eventId),
    nexusOperationScheduledEventAttributes: { endpoint },
  }) as never;

describe('isSystemNexusCallerLink', () => {
  beforeEach(() => {
    resetSystemNexusCallerLinks();
    fetchPartial.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should report a caller event on the system endpoint', async () => {
    fetchPartial.mockResolvedValue([scheduledEvent(5, '__temporal_system')]);

    await expect(isSystemNexusCallerLink(callerLink())).resolves.toBe(true);
  });

  it('should report a caller event on a user endpoint', async () => {
    fetchPartial.mockResolvedValue([scheduledEvent(5, 'my-endpoint')]);

    await expect(isSystemNexusCallerLink(callerLink())).resolves.toBe(false);
  });

  it('should not request anything for a caller event of another type', async () => {
    const link = callerLink(1, 'EVENT_TYPE_WORKFLOW_EXECUTION_STARTED');

    await expect(isSystemNexusCallerLink(link)).resolves.toBe(false);
    expect(fetchPartial).not.toHaveBeenCalled();
  });

  it('should not request anything for a caller event beyond the page limit', async () => {
    await expect(isSystemNexusCallerLink(callerLink(1001))).resolves.toBe(
      false,
    );
    expect(fetchPartial).not.toHaveBeenCalled();
  });

  it('should keep the link when the caller event is missing from the page', async () => {
    fetchPartial.mockResolvedValue([scheduledEvent(4, '__temporal_system')]);

    await expect(isSystemNexusCallerLink(callerLink())).resolves.toBe(false);
  });

  it('should keep the link when the caller history cannot be read', async () => {
    fetchPartial.mockRejectedValue(new Error('403'));

    await expect(isSystemNexusCallerLink(callerLink())).resolves.toBe(false);
  });

  it('should read one caller event once for repeated callers', async () => {
    fetchPartial.mockResolvedValue([scheduledEvent(5, '__temporal_system')]);

    await Promise.all([
      isSystemNexusCallerLink(callerLink()),
      isSystemNexusCallerLink(callerLink()),
    ]);

    expect(fetchPartial).toHaveBeenCalledTimes(1);
  });

  it('should request only as far as the caller event', async () => {
    fetchPartial.mockResolvedValue([scheduledEvent(7, '__temporal_system')]);

    await isSystemNexusCallerLink(callerLink(7));

    expect(fetchPartial).toHaveBeenCalledWith({
      namespace: 'default',
      workflowId: 'caller',
      runId: 'caller-run',
      sort: 'ascending',
      maximumPageSize: '7',
    });
  });
});
