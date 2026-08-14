import type { Payload } from '$lib/types';
import type { WorkflowEvent } from '$lib/types/events';
import { atob } from '$lib/utilities/atob';
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

const messageTypeOf = (payload: Payload): string | null => {
  const encoding = atob(String(payload?.metadata?.encoding ?? ''));
  const messageType = atob(String(payload?.metadata?.messageType ?? ''));
  if (encoding !== 'binary/protobuf' || !messageType) return null;
  return messageType;
};

const isSystemEndpoint = (event: WorkflowEvent): boolean =>
  String(event.nexusOperationScheduledEventAttributes?.endpoint ?? '') ===
  SYSTEM_NEXUS_ENDPOINT;

/** Resolves the operation an event belongs to, or null if it is not one of ours. */
const operationFor = (
  event: WorkflowEvent,
): SystemNexusOperationDefinition | undefined => {
  if (isNexusOperationScheduledEvent(event)) {
    if (!isSystemEndpoint(event)) return undefined;
    const name = String(
      event.nexusOperationScheduledEventAttributes?.operation ?? '',
    );
    return byOperationName.get(name);
  }

  if (isNexusOperationCompletedEvent(event)) {
    const result = event.nexusOperationCompletedEventAttributes?.result;
    if (!result) return undefined;
    const messageType = messageTypeOf(result as Payload);
    return messageType ? byResponseMessageType.get(messageType) : undefined;
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

  const operation = operationFor(event);
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

/** The group label for a system Nexus operation, or null to use the default. */
export const systemNexusGroupLabel = (event: WorkflowEvent): string | null =>
  operationFor(event)?.label ?? null;

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
