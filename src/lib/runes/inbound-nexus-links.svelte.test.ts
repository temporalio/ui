import { describe, expect, it } from 'vitest';

import type { WorkflowEvent } from '$lib/types/events';

import {
  getInboundLinkForEvent,
  getInboundNexusLinkEvents,
} from './inbound-nexus-links.svelte';

const callbackLink = {
  callback: {
    namespace: 'default',
    execution: {
      type: 'EXECUTION_TYPE_NEXUS_OPERATION',
      businessId: 'caller-op',
      runId: 'caller-run',
    },
    requestId: 'callback-request',
  },
};

const workflowEventLink = {
  workflowEvent: {
    namespace: 'default',
    workflowId: 'caller-wf',
    runId: 'caller-run',
    eventRef: { eventId: '5' },
  },
};

const startedEvent = (links: unknown[] = []) =>
  ({
    id: '1',
    links,
    workflowExecutionStartedEventAttributes: {},
    attributes: {},
  }) as unknown as WorkflowEvent;

const updateAcceptedEvent = (id: string, links: unknown[] = []) =>
  ({
    id,
    links: [],
    workflowExecutionUpdateAcceptedEventAttributes: {
      acceptedRequest: { links },
    },
    attributes: { acceptedRequest: { links } },
  }) as unknown as WorkflowEvent;

const signaledEvent = (id: string, links: unknown[] = []) =>
  ({
    id,
    links,
    workflowExecutionSignaledEventAttributes: {},
    attributes: {},
  }) as unknown as WorkflowEvent;

describe('getInboundLinkForEvent', () => {
  it('reads a worker callback link from an accepted Update request', () => {
    expect(
      getInboundLinkForEvent(updateAcceptedEvent('8', [callbackLink])),
    ).toEqual(callbackLink);
  });

  it('reads a worker callback link from a signal', () => {
    expect(getInboundLinkForEvent(signaledEvent('6', [callbackLink]))).toEqual(
      callbackLink,
    );
  });
});

describe('getInboundNexusLinkEvents', () => {
  it('includes a workflow started by a worker callback', () => {
    const events = getInboundNexusLinkEvents([startedEvent([callbackLink])]);

    expect(events.map((event) => event.id)).toEqual(['1']);
  });

  it('includes Updates and signals sent by worker callbacks, in history order', () => {
    const events = getInboundNexusLinkEvents([
      startedEvent(),
      signaledEvent('6', [callbackLink]),
      updateAcceptedEvent('8', [callbackLink]),
    ]);

    expect(events.map((event) => event.id)).toEqual(['6', '8']);
  });

  it('leaves out Updates and signals without a worker callback link', () => {
    const events = getInboundNexusLinkEvents([
      startedEvent(),
      signaledEvent('6', [workflowEventLink]),
      updateAcceptedEvent('8', []),
      updateAcceptedEvent('9', [workflowEventLink]),
    ]);

    expect(events).toEqual([]);
  });

  it('keeps the workflow start’s Nexus caller link', () => {
    const events = getInboundNexusLinkEvents([
      startedEvent([workflowEventLink]),
    ]);

    expect(events.map((event) => event.id)).toEqual(['1']);
  });
});
