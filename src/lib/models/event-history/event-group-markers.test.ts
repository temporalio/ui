import { describe, expect, it, vi } from 'vitest';

import type { Payload } from '$lib/types';
import type { HistoryEvent } from '$lib/types/events';

import { toEventHistory } from '.';
import {
  createEventGroupLabelRegistry,
  decodeEventGroupLabel,
  decodeEventGroupNames,
  type EventGroupLabel,
  formatEventGroupName,
  formatEventGroupNames,
} from './event-group-markers';

type Markers = HistoryEvent['eventGroupMarkers'];

const labelPayload = (value: string) =>
  ({
    metadata: { encoding: btoa('json/plain') },
    data: btoa(JSON.stringify(value)),
  }) as unknown as Payload;

const toHistoryEvent = (eventId: string, eventGroupMarkers?: Markers) =>
  ({
    eventId,
    eventTime: '2026-10-06T00:00:00Z',
    eventType: 'TimerStarted',
    timerStartedEventAttributes: { timerId: eventId },
    ...(eventGroupMarkers && { eventGroupMarkers }),
  }) as unknown as HistoryEvent;

const toSourceEvent = (eventId: string, attributes: Record<string, unknown>) =>
  ({
    eventId,
    eventTime: '2026-10-06T00:00:00Z',
    ...attributes,
  }) as unknown as HistoryEvent;

const signaled = (eventId: string, signalName?: string) =>
  toSourceEvent(eventId, {
    eventType: 'WorkflowExecutionSignaled',
    workflowExecutionSignaledEventAttributes: { signalName },
  });

const updateAdmitted = (eventId: string, updateId: string, name?: string) =>
  toSourceEvent(eventId, {
    eventType: 'WorkflowExecutionUpdateAdmitted',
    workflowExecutionUpdateAdmittedEventAttributes: {
      request: { meta: { updateId }, input: { name } },
    },
  });

const updateAccepted = (eventId: string, updateId: string, name?: string) =>
  toSourceEvent(eventId, {
    eventType: 'WorkflowExecutionUpdateAccepted',
    workflowExecutionUpdateAcceptedEventAttributes: {
      protocolInstanceId: updateId,
      acceptedRequest: { meta: { updateId }, input: { name } },
    },
  });

const labelMarker = (id: string, label?: Payload) => ({
  label: { id, ...(label && { label }) },
});
const signalMarker = (eventId: string) => ({
  inboundEvent: { inboundEventId: eventId as never },
});
const updateMarker = (updateId: string) => ({
  inboundUpdate: { inboundUpdateId: updateId },
});

const resolveOne = (
  registry: ReturnType<typeof createEventGroupLabelRegistry>,
  eventId: string,
  markers: Markers,
): EventGroupLabel[] => registry.resolve(toHistoryEvent(eventId, markers))!;

describe('createEventGroupLabelRegistry', () => {
  it('returns undefined when the event has no markers', () => {
    const registry = createEventGroupLabelRegistry();
    expect(registry.resolve(toHistoryEvent('1'))).toBeUndefined();
  });

  it('returns the label payload for a labeled marker', () => {
    const registry = createEventGroupLabelRegistry();
    const label = labelPayload('Checkout');
    expect(resolveOne(registry, '1', [labelMarker('group-1', label)])).toEqual([
      { key: 'label:group-1', kind: 'label', id: 'group-1', label },
    ]);
  });

  it('returns only the id when a marker never receives a label payload', () => {
    const registry = createEventGroupLabelRegistry();
    expect(resolveOne(registry, '1', [labelMarker('group-1')])).toEqual([
      { key: 'label:group-1', kind: 'label', id: 'group-1' },
    ]);
  });

  it('treats an empty label payload as missing', () => {
    const registry = createEventGroupLabelRegistry();
    expect(
      resolveOne(registry, '1', [{ label: { id: 'group-1', label: {} } }]),
    ).toEqual([{ key: 'label:group-1', kind: 'label', id: 'group-1' }]);
  });

  it('reuses the label from the first use of a marker id', () => {
    const registry = createEventGroupLabelRegistry();
    const label = labelPayload('Checkout');
    resolveOne(registry, '1', [labelMarker('group-1', label)]);
    expect(resolveOne(registry, '5', [labelMarker('group-1')])).toEqual([
      { key: 'label:group-1', kind: 'label', id: 'group-1', label },
    ]);
  });

  it('ignores label payloads on later uses of a marker id', () => {
    const registry = createEventGroupLabelRegistry();
    const first = labelPayload('First');
    resolveOne(registry, '1', [labelMarker('group-1', first)]);
    expect(
      resolveOne(registry, '5', [
        labelMarker('group-1', labelPayload('Later')),
      ]),
    ).toEqual([
      { key: 'label:group-1', kind: 'label', id: 'group-1', label: first },
    ]);
  });

  it('applies the first-use label to events resolved before it', () => {
    const registry = createEventGroupLabelRegistry();
    const first = labelPayload('First');
    const [laterGroup] = resolveOne(registry, '9', [
      labelMarker('group-1', labelPayload('Later')),
    ]);
    const [unlabeledGroup] = resolveOne(registry, '5', [
      labelMarker('group-1'),
    ]);
    resolveOne(registry, '1', [labelMarker('group-1', first)]);
    expect(laterGroup.label).toBe(first);
    expect(unlabeledGroup.label).toBe(first);
  });

  it('skips duplicate markers on an event', () => {
    const registry = createEventGroupLabelRegistry();
    expect(
      resolveOne(registry, '1', [
        labelMarker('group-1'),
        labelMarker('group-1'),
        signalMarker('3'),
        signalMarker('3'),
        updateMarker('update-1'),
        updateMarker('update-1'),
      ]).map(({ key }) => key),
    ).toEqual(['label:group-1', 'event:3', 'update:update-1']);
  });

  it('keeps explicit and implicit markers with the same id separate', () => {
    const registry = createEventGroupLabelRegistry();
    expect(
      resolveOne(registry, '1', [
        labelMarker('7'),
        signalMarker('7'),
        updateMarker('7'),
      ]).map(({ key }) => key),
    ).toEqual(['label:7', 'event:7', 'update:7']);
  });

  it('ignores markers without a variant', () => {
    const registry = createEventGroupLabelRegistry();
    expect(registry.resolve(toHistoryEvent('1', [{}]))).toBeUndefined();
  });

  describe('implicit signal markers', () => {
    it('labels a signal marker with the signal name and event id', () => {
      const registry = createEventGroupLabelRegistry();
      registry.resolve(signaled('3', 'launchHold'));
      expect(resolveOne(registry, '6', [signalMarker('3')])).toEqual([
        {
          key: 'event:3',
          kind: 'event',
          id: '3',
          name: 'launchHold',
          sourceEventType: 'WorkflowExecutionSignaled',
        },
      ]);
    });

    it('falls back to the event type when the signal has no name', () => {
      const registry = createEventGroupLabelRegistry();
      registry.resolve(signaled('3'));
      expect(
        formatEventGroupName(resolveOne(registry, '6', [signalMarker('3')])[0]),
      ).toBe('WorkflowExecutionSignaled');
    });

    it('labels a marker on the started event with its event type', () => {
      const registry = createEventGroupLabelRegistry();
      registry.resolve(
        toSourceEvent('1', {
          eventType: 'WorkflowExecutionStarted',
          workflowExecutionStartedEventAttributes: {},
        }),
      );
      expect(
        formatEventGroupName(resolveOne(registry, '5', [signalMarker('1')])[0]),
      ).toBe('WorkflowExecutionStarted');
    });

    it('leaves the display name unset until the signal event is loaded', () => {
      const registry = createEventGroupLabelRegistry();
      const [group] = resolveOne(registry, '6', [signalMarker('3')]);
      expect(group).toEqual({ key: 'event:3', kind: 'event', id: '3' });

      registry.resolve(signaled('3', 'launchHold'));
      expect(formatEventGroupName(group)).toBe('launchHold (3)');
    });
  });

  describe('implicit update markers', () => {
    it('labels an update marker with the update name and id', () => {
      const registry = createEventGroupLabelRegistry();
      registry.resolve(updateAdmitted('4', 'update-1', 'adjustOrbit'));
      expect(resolveOne(registry, '8', [updateMarker('update-1')])).toEqual([
        {
          key: 'update:update-1',
          kind: 'update',
          id: 'update-1',
          name: 'adjustOrbit',
          sourceEventType: 'WorkflowExecutionUpdateAdmitted',
        },
      ]);
    });

    it('labels an update marker from the accepted event', () => {
      const registry = createEventGroupLabelRegistry();
      registry.resolve(updateAccepted('6', 'update-1', 'adjustOrbit'));
      expect(
        formatEventGroupName(
          resolveOne(registry, '8', [updateMarker('update-1')])[0],
        ),
      ).toBe('adjustOrbit (update-1)');
    });

    it('uses the protocol instance id when the accepted request has no id', () => {
      const registry = createEventGroupLabelRegistry();
      registry.resolve(
        toSourceEvent('6', {
          eventType: 'WorkflowExecutionUpdateAccepted',
          workflowExecutionUpdateAcceptedEventAttributes: {
            protocolInstanceId: 'update-1',
            acceptedRequest: { input: { name: 'adjustOrbit' } },
          },
        }),
      );
      expect(
        formatEventGroupName(
          resolveOne(registry, '8', [updateMarker('update-1')])[0],
        ),
      ).toBe('adjustOrbit (update-1)');
    });

    it('falls back to the event type when the update has no name', () => {
      const registry = createEventGroupLabelRegistry();
      registry.resolve(updateAdmitted('4', 'update-1'));
      expect(
        formatEventGroupName(
          resolveOne(registry, '8', [updateMarker('update-1')])[0],
        ),
      ).toBe('WorkflowExecutionUpdateAdmitted');
    });

    it('keeps a named label when a later update event has no name', () => {
      const registry = createEventGroupLabelRegistry();
      registry.resolve(updateAdmitted('4', 'update-1', 'adjustOrbit'));
      registry.resolve(updateAccepted('6', 'update-1'));
      expect(
        formatEventGroupName(
          resolveOne(registry, '8', [updateMarker('update-1')])[0],
        ),
      ).toBe('adjustOrbit (update-1)');
    });

    it('replaces an event type fallback when a named update event arrives', () => {
      const registry = createEventGroupLabelRegistry();
      registry.resolve(updateAdmitted('4', 'update-1'));
      registry.resolve(updateAccepted('6', 'update-1', 'adjustOrbit'));
      expect(
        formatEventGroupName(
          resolveOne(registry, '8', [updateMarker('update-1')])[0],
        ),
      ).toBe('adjustOrbit (update-1)');
    });
  });
});

describe('formatEventGroupName', () => {
  it('combines the source name and id', () => {
    expect(
      formatEventGroupName({
        key: 'event:3',
        kind: 'event',
        id: '3',
        name: 'launchHold',
        sourceEventType: 'WorkflowExecutionSignaled',
      }),
    ).toBe('launchHold (3)');
  });

  it('uses the source event type when there is no name', () => {
    expect(
      formatEventGroupName({
        key: 'update:update-1',
        kind: 'update',
        id: 'update-1',
        sourceEventType: 'WorkflowExecutionUpdateAccepted',
      }),
    ).toBe('WorkflowExecutionUpdateAccepted');
  });

  it('uses the id for an inbound event whose source is not loaded', () => {
    expect(
      formatEventGroupName({ key: 'event:3', kind: 'event', id: '3' }),
    ).toBe('3');
  });

  it('uses the id for an inbound update whose source is not loaded', () => {
    expect(
      formatEventGroupName({
        key: 'update:update-1',
        kind: 'update',
        id: 'update-1',
      }),
    ).toBe('update-1');
  });

  it('uses the id for an explicit marker', () => {
    expect(
      formatEventGroupName({
        key: 'label:group-1',
        kind: 'label',
        id: 'group-1',
      }),
    ).toBe('group-1');
  });
});

describe('formatEventGroupNames', () => {
  it('joins the fallback names with commas', () => {
    expect(
      formatEventGroupNames([
        { key: 'label:group-1', kind: 'label', id: 'group-1' },
        { key: 'event:3', kind: 'event', id: '3' },
        {
          key: 'update:update-1',
          kind: 'update',
          id: 'update-1',
          name: 'adjustOrbit',
        },
      ]),
    ).toBe('group-1, 3, adjustOrbit (update-1)');
  });
});

describe('decodeEventGroupNames', () => {
  it('joins the decoded names with commas in marker order', async () => {
    expect(
      await decodeEventGroupNames([
        { key: 'event:3', kind: 'event', id: '3', name: 'launchHold' },
        { key: 'label:group-1', kind: 'label', id: 'group-1' },
      ]),
    ).toBe('launchHold (3), group-1');
  });
});

describe('toEventHistory event groups', () => {
  it('resolves explicit and implicit markers across a history', () => {
    const label = labelPayload('Checkout');
    const [first, , second, third, , fifth] = toEventHistory([
      toHistoryEvent('1', [labelMarker('group-1', label)]),
      signaled('2', 'launchHold'),
      toHistoryEvent('3', [labelMarker('group-1'), labelMarker('group-2')]),
      toHistoryEvent('4'),
      updateAccepted('5', 'update-1', 'adjustOrbit'),
      toHistoryEvent('6', [signalMarker('2'), updateMarker('update-1')]),
    ]);

    expect(first.eventGroups).toEqual([
      { key: 'label:group-1', kind: 'label', id: 'group-1', label },
    ]);
    expect(second.eventGroups).toEqual([
      { key: 'label:group-1', kind: 'label', id: 'group-1', label },
      { key: 'label:group-2', kind: 'label', id: 'group-2' },
    ]);
    expect(third).not.toHaveProperty('eventGroups');
    expect(fifth.eventGroups?.map(formatEventGroupName)).toEqual([
      'launchHold (2)',
      'adjustOrbit (update-1)',
    ]);
  });
});

describe('decodeEventGroupLabel', () => {
  it('returns the id when there is no label payload', async () => {
    const decode = vi.fn();
    expect(
      await decodeEventGroupLabel(
        { key: 'label:group-1', kind: 'label', id: 'group-1' },
        decode,
      ),
    ).toBe('group-1');
    expect(decode).not.toHaveBeenCalled();
  });

  it('returns the display name for an implicit marker', async () => {
    const decode = vi.fn();
    expect(
      await decodeEventGroupLabel(
        {
          key: 'event:3',
          kind: 'event',
          id: '3',
          name: 'launchHold',
          sourceEventType: 'WorkflowExecutionSignaled',
        },
        decode,
      ),
    ).toBe('launchHold (3)');
    expect(decode).not.toHaveBeenCalled();
  });

  it('returns the decoded label', async () => {
    const decode = vi.fn().mockResolvedValue('Checkout');
    expect(
      await decodeEventGroupLabel(
        {
          key: 'label:group-1',
          kind: 'label',
          id: 'group-1',
          label: labelPayload('Checkout'),
        },
        decode,
      ),
    ).toBe('Checkout');
  });

  it('returns the id when the label does not decode to a string', async () => {
    const decode = vi.fn().mockResolvedValue({ name: 'Checkout' });
    expect(
      await decodeEventGroupLabel(
        {
          key: 'label:group-1',
          kind: 'label',
          id: 'group-1',
          label: labelPayload('Checkout'),
        },
        decode,
      ),
    ).toBe('group-1');
  });

  it('returns the id when decoding rejects', async () => {
    const decode = vi.fn().mockRejectedValue(new Error('codec unavailable'));
    expect(
      await decodeEventGroupLabel(
        {
          key: 'label:group-1',
          kind: 'label',
          id: 'group-1',
          label: labelPayload('Checkout'),
        },
        decode,
      ),
    ).toBe('group-1');
  });

  it('decodes again after the codec returns the payload undecoded', async () => {
    const group: EventGroupLabel = {
      key: 'label:group-1',
      kind: 'label',
      id: 'group-1',
      label: labelPayload('Checkout'),
    };
    const decode = vi
      .fn()
      .mockResolvedValueOnce(group.label)
      .mockResolvedValueOnce('Checkout');

    expect(await decodeEventGroupLabel(group, decode)).toBe('group-1');
    expect(await decodeEventGroupLabel(group, decode)).toBe('Checkout');
    expect(decode).toHaveBeenCalledTimes(2);
  });

  it('decodes a shared label once across events', async () => {
    const registry = createEventGroupLabelRegistry();
    const [first] = resolveOne(registry, '1', [
      labelMarker('group-1', labelPayload('Checkout')),
    ]);
    const [second] = resolveOne(registry, '2', [labelMarker('group-1')]);
    const decode = vi.fn().mockResolvedValue('Checkout');

    const results = await Promise.all([
      decodeEventGroupLabel(first, decode),
      decodeEventGroupLabel(second, decode),
    ]);

    expect(results).toEqual(['Checkout', 'Checkout']);
    expect(decode).toHaveBeenCalledTimes(1);
  });

  it('reuses a decoded label when the history is rebuilt', async () => {
    const label = labelPayload('Checkout');
    const toHistory = () =>
      toEventHistory([toHistoryEvent('1', [labelMarker('group-1', label)])]);
    const [firstBuild] = toHistory();
    const [secondBuild] = toHistory();
    const decode = vi.fn().mockResolvedValue('Checkout');

    expect(firstBuild.eventGroups?.[0]).not.toBe(secondBuild.eventGroups?.[0]);
    expect(
      await decodeEventGroupLabel(firstBuild.eventGroups![0], decode),
    ).toBe('Checkout');
    expect(
      await decodeEventGroupLabel(secondBuild.eventGroups![0], decode),
    ).toBe('Checkout');
    expect(decode).toHaveBeenCalledTimes(1);
  });

  it('does not reuse a decoded label for a separate payload with the same content', async () => {
    const decode = vi.fn().mockResolvedValue('Checkout');
    const group = (): EventGroupLabel => ({
      key: 'label:group-1',
      kind: 'label',
      id: 'group-1',
      label: labelPayload('Checkout'),
    });

    await decodeEventGroupLabel(group(), decode);
    await decodeEventGroupLabel(group(), decode);

    expect(decode).toHaveBeenCalledTimes(2);
  });

  it('falls back to each group id for a shared undecodable payload', async () => {
    const label = labelPayload('Checkout');
    const decode = vi.fn().mockResolvedValue(label);

    const results = await Promise.all([
      decodeEventGroupLabel(
        { key: 'label:group-1', kind: 'label', id: 'group-1', label },
        decode,
      ),
      decodeEventGroupLabel(
        { key: 'label:group-2', kind: 'label', id: 'group-2', label },
        decode,
      ),
    ]);

    expect(results).toEqual(['group-1', 'group-2']);
  });

  it('decodes again when an earlier label replaces the payload', async () => {
    const registry = createEventGroupLabelRegistry();
    const [group] = resolveOne(registry, '5', [
      labelMarker('group-1', labelPayload('Later')),
    ]);
    const decode = vi
      .fn()
      .mockResolvedValueOnce('Later')
      .mockResolvedValueOnce('First');

    expect(await decodeEventGroupLabel(group, decode)).toBe('Later');
    resolveOne(registry, '1', [labelMarker('group-1', labelPayload('First'))]);
    expect(await decodeEventGroupLabel(group, decode)).toBe('First');
  });
});
