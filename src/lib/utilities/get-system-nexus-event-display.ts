import type { Payload } from '$lib/types';
import type { WorkflowEvent } from '$lib/types/events';
import { isRawPayload } from '$lib/utilities/decode-payload';
import { spaceBetweenCapitalLetters } from '$lib/utilities/format-camel-case';
import {
  isNexusOperationCompletedEvent,
  isNexusOperationScheduledEvent,
} from '$lib/utilities/is-event-type';
import {
  describeNexusOperation,
  getSystemNexusLabelFromResponsePayload,
} from '$lib/utilities/nexus-operation-registry';

const SYSTEM_NEXUS_LABELS: Record<string, string> = {
  SignalWithStartWorkflowExecution: 'Signal With Start Workflow Execution',
};

const NEXUS_STATE_VERBS: Record<string, string> = {
  Scheduled: 'Initiated',
  Completed: 'Delivered',
};

const HIDDEN_FIELDS = ['endpoint', 'service', 'operation', 'requestId'];

export type SystemNexusEventDisplay = {
  displayName: string;
  hiddenFields: string[];
  extraAttributes?: Record<string, string>;
};

export const getSystemNexusEventDisplay = (
  event: WorkflowEvent,
): SystemNexusEventDisplay | null => {
  if (isNexusOperationScheduledEvent(event)) {
    const attrs = event.nexusOperationScheduledEventAttributes;
    if (String(attrs.endpoint ?? '') !== '__temporal_system') return null;

    const op = String(attrs.operation ?? '');
    const baseLabel = SYSTEM_NEXUS_LABELS[op];
    if (!baseLabel) return null;

    const rawState = event.name.replace('NexusOperation', '');
    const state =
      NEXUS_STATE_VERBS[rawState] ?? spaceBetweenCapitalLetters(rawState);

    const input = attrs.input;
    const descriptor = isRawPayload(input)
      ? describeNexusOperation(input as Payload)
      : null;

    const extraAttributes: Record<string, string> = {};
    if (descriptor?.workflowId)
      extraAttributes.workflowId = descriptor.workflowId;
    if (descriptor?.signalName)
      extraAttributes.signalName = descriptor.signalName;

    return {
      displayName: `${baseLabel} ${state}`,
      hiddenFields: HIDDEN_FIELDS,
      extraAttributes: Object.keys(extraAttributes).length
        ? extraAttributes
        : undefined,
    };
  }

  if (isNexusOperationCompletedEvent(event)) {
    const result = event.nexusOperationCompletedEventAttributes.result;
    if (!isRawPayload(result)) return null;

    const baseLabel = getSystemNexusLabelFromResponsePayload(result as Payload);
    if (!baseLabel) return null;

    const rawState = event.name.replace('NexusOperation', '');
    const state =
      NEXUS_STATE_VERBS[rawState] ?? spaceBetweenCapitalLetters(rawState);

    return {
      displayName: `${baseLabel} ${state}`,
      hiddenFields: HIDDEN_FIELDS,
    };
  }

  return null;
};
