import type { DescMessage } from '@bufbuild/protobuf';

import type { Payload } from '$lib/types';
import type { WorkflowEvent } from '$lib/types/events';
import { decodeBinaryProtobuf } from '$lib/utilities/decode-binary-protobuf';
import {
  isNexusOperationCompletedEvent,
  isNexusOperationScheduledEvent,
} from '$lib/utilities/is-event-type';

import {
  initiatedEventLink,
  stateFor,
  targetExecutionLink,
  targetFromEventLinks,
} from '../shared';
import type {
  SystemNexusContext,
  SystemNexusLink,
  SystemNexusOperationDefinition,
  SystemNexusTarget,
} from '../types';
import {
  REQUEST_MESSAGE_TYPE,
  requestSchema,
  RESPONSE_MESSAGE_TYPE,
  responseSchema,
} from './schemas';

import InputRenderer from './input-renderer.svelte';

const LABEL = 'Signal With Start Workflow Execution';

const STATE_VERBS: Record<string, string> = {
  Scheduled: 'Initiated',
  Completed: 'Delivered',
  Failed: 'Failed',
  TimedOut: 'Timed Out',
  Canceled: 'Canceled',
};

const HIDDEN_FIELDS = ['endpoint', 'service', 'operation', 'requestId'];

type Decoded = Record<string, unknown>;

const getString = (v: unknown): string | undefined =>
  typeof v === 'string' && v ? v : undefined;

const decodeWith = (payload: Payload, schema: DescMessage) =>
  (decodeBinaryProtobuf(payload, schema)?.data as Decoded) ?? null;

const targetFromSignalLink = (
  signalLink: unknown,
): SystemNexusTarget | undefined => {
  if (!signalLink || typeof signalLink !== 'object') return undefined;
  const workflowEvent = (signalLink as Record<string, unknown>).workflowEvent;
  if (!workflowEvent || typeof workflowEvent !== 'object') return undefined;

  const w = workflowEvent as Record<string, unknown>;
  const eventRef = (w.eventRef ?? {}) as Record<string, unknown>;
  const target: SystemNexusTarget = {
    namespace: getString(w.namespace),
    workflowId: getString(w.workflowId),
    runId: getString(w.runId),
    eventId:
      eventRef.eventId === undefined ? undefined : String(eventRef.eventId),
  };

  // Without a workflow ID the target cannot build a link, so report nothing and
  // let the caller fall back to the event links.
  return target.workflowId ? target : undefined;
};

export const signalWithStartWorkflow: SystemNexusOperationDefinition = {
  kind: 'signal-with-start-workflow',
  operationName: 'SignalWithStartWorkflowExecution',
  requestMessageType: REQUEST_MESSAGE_TYPE,
  responseMessageType: RESPONSE_MESSAGE_TYPE,
  requestSchema,
  responseSchema,
  label: LABEL,
  stateVerbs: STATE_VERBS,
  hiddenFields: HIDDEN_FIELDS,
  timelineCategory: 'signal',
  // Synchronous: the Initiated/Delivered pair carries nearly identical fields,
  // so opening one should not open both.
  expandsIndividually: true,
  InputRenderer,

  describeInitiated: (event: WorkflowEvent, context: SystemNexusContext) => {
    if (!isNexusOperationScheduledEvent(event)) return null;
    const input = event.nexusOperationScheduledEventAttributes?.input;
    const decoded = input ? decodeWith(input as Payload, requestSchema) : null;

    const attributes: Record<string, string> = {};
    const signalName = getString(decoded?.signalName);
    const identity = getString(decoded?.identity);
    const control = getString(decoded?.control);
    if (signalName) attributes.signalName = signalName;
    if (identity) attributes.identity = identity;
    if (control) attributes.control = control;

    const workflowId = getString(decoded?.workflowId);
    const link = workflowId
      ? targetExecutionLink(
          { namespace: getString(decoded?.namespace), workflowId },
          context,
        )
      : null;

    return {
      displayName: `${LABEL} ${stateFor(event, STATE_VERBS)}`,
      hiddenFields: HIDDEN_FIELDS,
      attributes: Object.keys(attributes).length ? attributes : undefined,
      links: link ? [link] : [],
      // The collapsed row leads with the signal name here; Target Execution
      // leads on the terminal event.
      summaryAttribute: signalName
        ? { key: 'signalName', value: signalName }
        : undefined,
    };
  },

  describeTerminal: (event: WorkflowEvent, context: SystemNexusContext) => {
    if (!isNexusOperationCompletedEvent(event)) return null;
    const attrs = event.nexusOperationCompletedEventAttributes;
    const result = attrs?.result;
    if (!result) return null;

    const decoded = decodeWith(result as Payload, responseSchema);
    if (!decoded) return null;
    const links: SystemNexusLink[] = [];

    const initiatedEventId =
      attrs?.scheduledEventId === undefined || attrs?.scheduledEventId === null
        ? undefined
        : String(attrs.scheduledEventId);
    if (initiatedEventId)
      links.push(initiatedEventLink(initiatedEventId, context));

    // Newer servers put the target on the response; older ones attach it as a
    // handler link on the event instead.
    const target =
      targetFromSignalLink(decoded?.signalLink) ?? targetFromEventLinks(event);
    const link = target ? targetExecutionLink(target, context) : null;
    if (link) links.push(link);

    return {
      displayName: `${LABEL} ${stateFor(event, STATE_VERBS)}`,
      hiddenFields: [...HIDDEN_FIELDS, 'scheduledEventId'],
      links,
    };
  },
};
