import type { Payload } from '$lib/types';
import type { HistoryEvent } from '$lib/types/events';
import { decodePayloadAndParseDataToJSON } from '$lib/utilities/decode-payload';
import { toEventNameReadable } from '$lib/utilities/screaming-enums';

const eventGroupKinds = ['label', 'event', 'update'] as const;

export type EventGroupKind = (typeof eventGroupKinds)[number];

export type EventGroupKey = `${EventGroupKind}:${string}`;

type InboundSourceDetails = {
  name?: string;
  sourceEventType?: string;
};

export type EventGroupLabel = InboundSourceDetails & {
  key: EventGroupKey;
  kind: EventGroupKind;
  id: string;
  label?: Payload;
};

export type EventGroupLabelRegistry = {
  resolve: (historyEvent: HistoryEvent) => EventGroupLabel[] | undefined;
};

type InboundSource = {
  kind: Exclude<EventGroupKind, 'label'>;
  id: string;
  name?: string;
};

const hasPayloadContent = (
  payload: Payload | null | undefined,
): payload is Payload =>
  Boolean(payload?.data || Object.keys(payload?.metadata ?? {}).length);

const nonEmptyString = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value) return value;

  return undefined;
};

export const toEventGroupKey = (
  kind: EventGroupKind,
  id: string,
): EventGroupKey => `${kind}:${id}`;

export const isEventGroupKey = (value: string): value is EventGroupKey =>
  eventGroupKinds.some((kind) => value.startsWith(`${kind}:`));

const getInboundSource = (
  historyEvent: HistoryEvent,
  eventId: string,
): InboundSource | undefined => {
  if (historyEvent.workflowExecutionStartedEventAttributes) {
    return {
      kind: 'event',
      id: eventId,
    };
  }

  const signaled = historyEvent.workflowExecutionSignaledEventAttributes;
  if (signaled) {
    return {
      kind: 'event',
      id: eventId,
      name: nonEmptyString(signaled.signalName),
    };
  }

  const admitted =
    historyEvent.workflowExecutionUpdateAdmittedEventAttributes?.request;
  const admittedUpdateId = nonEmptyString(admitted?.meta?.updateId);
  if (admittedUpdateId) {
    return {
      kind: 'update',
      id: admittedUpdateId,
      name: nonEmptyString(admitted?.input?.name),
    };
  }

  const accepted = historyEvent.workflowExecutionUpdateAcceptedEventAttributes;
  const acceptedUpdateId =
    nonEmptyString(accepted?.acceptedRequest?.meta?.updateId) ??
    nonEmptyString(accepted?.protocolInstanceId);
  if (acceptedUpdateId) {
    return {
      kind: 'update',
      id: acceptedUpdateId,
      name: nonEmptyString(accepted?.acceptedRequest?.input?.name),
    };
  }
};

export const createEventGroupLabelRegistry = (): EventGroupLabelRegistry => {
  const entries = new Map<EventGroupKey, EventGroupLabel>();
  const pendingSources = new Map<EventGroupKey, InboundSourceDetails>();

  const getOrCreateGroupLabel = (
    kind: EventGroupKind,
    id: string,
  ): EventGroupLabel => {
    const key = toEventGroupKey(kind, id);
    let entry = entries.get(key);
    if (!entry) {
      entry = { key, kind, id, ...pendingSources.get(key) };
      pendingSources.delete(key);
      entries.set(key, entry);
    }
    return entry;
  };

  const indexInboundSource = (
    { kind, id, name }: InboundSource,
    eventType: string,
  ) => {
    const key = toEventGroupKey(kind, id);
    let details = entries.get(key) ?? pendingSources.get(key);
    if (!details) {
      details = {};
      pendingSources.set(key, details);
    }
    if (name) details.name = name;
    details.sourceEventType ??= eventType;
  };

  const resolve = (
    historyEvent: HistoryEvent,
  ): EventGroupLabel[] | undefined => {
    const eventId = String(historyEvent.eventId);
    const source = getInboundSource(historyEvent, eventId);
    if (source) {
      indexInboundSource(source, toEventNameReadable(historyEvent.eventType));
    }

    const markers = historyEvent.eventGroupMarkers;
    if (!markers?.length) return;

    const resolved = new Set<EventGroupLabel>();

    for (const marker of markers) {
      const labelId = nonEmptyString(marker?.label?.id);
      if (labelId) {
        const entry = getOrCreateGroupLabel('label', labelId);
        const payload = marker.label?.label;
        if (!entry.label && hasPayloadContent(payload)) entry.label = payload;
        resolved.add(entry);
        continue;
      }

      const inboundEventId = marker?.inboundEvent?.inboundEventId;
      if (inboundEventId !== undefined && inboundEventId !== null) {
        resolved.add(getOrCreateGroupLabel('event', String(inboundEventId)));
        continue;
      }

      const inboundUpdateId = nonEmptyString(
        marker?.inboundUpdate?.inboundUpdateId,
      );
      if (inboundUpdateId)
        resolved.add(getOrCreateGroupLabel('update', inboundUpdateId));
    }

    return resolved.size ? [...resolved] : undefined;
  };

  return { resolve };
};

export const formatEventGroupName = ({
  id,
  name,
  sourceEventType,
}: EventGroupLabel): string => {
  if (name) return `${name} (${id})`;
  return sourceEventType ?? id;
};

const decodedLabels = new WeakMap<Payload, Promise<string | undefined>>();

export const decodeEventGroupLabel = async (
  group: EventGroupLabel,
  decode: (
    payload: Payload,
  ) => Promise<unknown> = decodePayloadAndParseDataToJSON,
): Promise<string> => {
  const payload = group.label;
  if (!payload) return formatEventGroupName(group);

  let decoded = decodedLabels.get(payload);
  if (!decoded) {
    decoded = decode(payload).then(nonEmptyString, () => undefined);
    decodedLabels.set(payload, decoded);
  }

  const label = await decoded;
  if (label === undefined && decodedLabels.get(payload) === decoded) {
    decodedLabels.delete(payload);
  }
  return label ?? formatEventGroupName(group);
};

const eventGroupNameSeparator = ', ';

export const formatEventGroupNames = (groups: EventGroupLabel[]): string =>
  groups
    .map((group) => formatEventGroupName(group))
    .join(eventGroupNameSeparator);

export const decodeEventGroupNames = async (
  groups: EventGroupLabel[],
): Promise<string> => {
  const names = await Promise.all(
    groups.map((group) => decodeEventGroupLabel(group)),
  );
  return names.join(eventGroupNameSeparator);
};
