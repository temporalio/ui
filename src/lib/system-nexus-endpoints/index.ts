import type { Payload } from '$lib/types';
import type { WorkflowEvent } from '$lib/types/events';
import { binaryProtobufMessageType } from '$lib/utilities/decode-binary-protobuf';
import {
  isNexusOperationCompletedEvent,
  isNexusOperationScheduledEvent,
} from '$lib/utilities/is-event-type';

import { signalWithStartWorkflow } from './signal-with-start-workflow/definition';
import {
  SYSTEM_NEXUS_ENDPOINT,
  type SystemNexusContext,
  type SystemNexusInputRendererProps,
  type SystemNexusLink,
  type SystemNexusOperationDefinition,
  type SystemNexusOperationKind,
  type SystemNexusPresentation,
} from './types';

/**
 * The registry. Adding an operation means adding a directory beside this file
 * with a definition, then listing it here — host components never change.
 */
const OPERATIONS: SystemNexusOperationDefinition[] = [signalWithStartWorkflow];

const byOperationName = new Map(
  OPERATIONS.map((operation) => [operation.operationName, operation]),
);
const byResponseMessageType = new Map(
  OPERATIONS.map((operation) => [operation.responseMessageType, operation]),
);
const byRequestMessageType = new Map(
  OPERATIONS.map((operation) => [operation.requestMessageType, operation]),
);

const messageTypeOf = binaryProtobufMessageType;

/**
 * Every proto schema any registered operation can decode, keyed by message
 * type. The generic payload decoder resolves schemas through this, so the
 * registry stays the single place an operation is declared.
 */
const SCHEMAS_BY_MESSAGE_TYPE = new Map(
  OPERATIONS.flatMap((operation) => [
    [operation.requestMessageType, operation.requestSchema] as const,
    [operation.responseMessageType, operation.responseSchema] as const,
  ]),
);

export const schemaForMessageType = (messageType: string) =>
  SCHEMAS_BY_MESSAGE_TYPE.get(messageType) ?? null;

const isSystemEndpoint = (event: WorkflowEvent): boolean =>
  String(event.nexusOperationScheduledEventAttributes?.endpoint ?? '') ===
  SYSTEM_NEXUS_ENDPOINT;

/** Resolves the operation an event belongs to, or null if it is not one of ours. */
const operationForScheduled = (
  event: WorkflowEvent,
): SystemNexusOperationDefinition | undefined => {
  if (!isNexusOperationScheduledEvent(event)) return undefined;
  if (!isSystemEndpoint(event)) return undefined;
  const name = String(
    event.nexusOperationScheduledEventAttributes?.operation ?? '',
  );
  return byOperationName.get(name);
};

const operationFor = (
  event: WorkflowEvent,
  context: SystemNexusContext,
): SystemNexusOperationDefinition | undefined => {
  if (isNexusOperationScheduledEvent(event))
    return operationForScheduled(event);

  if (isNexusOperationCompletedEvent(event)) {
    const result = event.nexusOperationCompletedEventAttributes?.result;
    if (!result) return undefined;
    const messageType = messageTypeOf(result as Payload);
    const operation = messageType
      ? byResponseMessageType.get(messageType)
      : undefined;
    if (!operation) return undefined;

    // The payload's own messageType is authored by the handler, so it cannot
    // establish that this came from the system endpoint. Only the initiating
    // event can.
    const initiating = context.initiatingEvent;
    return initiating && operationForScheduled(initiating) === operation
      ? operation
      : undefined;
  }

  return undefined;
};

/**
 * Single entry point for host components: everything needed to render a system
 * Nexus event, or null to fall through to normal event rendering.
 */
export const resolveSystemNexusEvent = (
  event: WorkflowEvent | undefined,
  context: SystemNexusContext = {},
): SystemNexusPresentation | null => {
  if (!event) return null;

  const operation = operationFor(event, context);
  if (!operation) return null;

  const described = isNexusOperationScheduledEvent(event)
    ? operation.describeInitiated(event, context)
    : operation.describeTerminal(event, context);
  if (!described) return null;

  return {
    ...described,
    kind: operation.kind,
    timelineCategory: operation.timelineCategory,
    expandsIndividually: operation.expandsIndividually,
  };
};

/**
 * True when the event schedules an operation on the system endpoint. Only the
 * scheduled event carries the endpoint, so it is the anchor for deciding
 * whether the other events of an operation belong to the system endpoint.
 */
export const isSystemNexusScheduledEvent = (event: WorkflowEvent): boolean =>
  isNexusOperationScheduledEvent(event) && isSystemEndpoint(event);

/** The group label for a system Nexus operation, or null to use the default. */
export const systemNexusGroupLabel = (event: WorkflowEvent): string | null =>
  operationForScheduled(event)?.label ?? null;

/**
 * The component rendering an operation's input payload, resolved from the
 * payload's own message type. Null when the payload is not a known operation.
 */
export const systemNexusInputRenderer = (
  payload: Payload,
): SystemNexusOperationDefinition['InputRenderer'] | null => {
  const messageType = messageTypeOf(payload);
  if (!messageType) return null;
  return byRequestMessageType.get(messageType)?.InputRenderer ?? null;
};

export {
  SYSTEM_NEXUS_ENDPOINT,
  type SystemNexusContext,
  type SystemNexusInputRendererProps,
  type SystemNexusLink,
  type SystemNexusOperationKind,
  type SystemNexusPresentation,
};
