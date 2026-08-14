import { translate } from '$lib/i18n/translate';
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
  describeNexusResponse,
  type NexusTargetExecution,
} from '$lib/utilities/nexus-operation-registry';
import {
  routeForWorkflow,
  routeForWorkflowsWithQuery,
} from '$lib/utilities/route-for';

const SYSTEM_NEXUS_LABELS: Record<string, string> = {
  SignalWithStartWorkflowExecution: 'Signal With Start Workflow Execution',
};

const NEXUS_STATE_VERBS: Record<string, string> = {
  Scheduled: 'Initiated',
  Completed: 'Delivered',
};

const HIDDEN_FIELDS = ['endpoint', 'service', 'operation', 'requestId'];

export type SystemNexusEventLink = {
  label: string;
  value: string;
  href?: string;
};

export type SystemNexusEventDisplay = {
  displayName: string;
  hiddenFields: string[];
  extraAttributes?: Record<string, string>;
  extraLinks?: SystemNexusEventLink[];
};

const targetFromEventLinks = (
  event: WorkflowEvent,
): NexusTargetExecution | undefined => {
  const workflowEvent = event.links?.find(
    (link) => link?.workflowEvent,
  )?.workflowEvent;
  if (!workflowEvent) return undefined;

  return {
    namespace: workflowEvent.namespace ?? undefined,
    workflowId: workflowEvent.workflowId ?? undefined,
    runId: workflowEvent.runId ?? undefined,
    eventId:
      workflowEvent.eventRef?.eventId === undefined
        ? undefined
        : String(workflowEvent.eventRef.eventId),
  };
};

const stateFor = (event: WorkflowEvent): string => {
  const rawState = event.name.replace('NexusOperation', '');
  return NEXUS_STATE_VERBS[rawState] ?? spaceBetweenCapitalLetters(rawState);
};

const targetExecutionLink = (
  target: NexusTargetExecution,
  fallbackNamespace?: string,
): SystemNexusEventLink | null => {
  const namespace = target.namespace || fallbackNamespace;
  const workflow = target.workflowId;
  if (!workflow) return null;

  const label = translate('nexus.target-execution');
  if (!namespace) return { label, value: workflow };

  const href = target.runId
    ? routeForWorkflow({ namespace, workflow, run: target.runId })
    : routeForWorkflowsWithQuery({
        namespace,
        query: `WorkflowId="${workflow}"`,
      });

  return { label, value: workflow, href };
};

export const getSystemNexusEventDisplay = (
  event: WorkflowEvent,
  fallbackNamespace?: string,
): SystemNexusEventDisplay | null => {
  if (isNexusOperationScheduledEvent(event)) {
    const attrs = event.nexusOperationScheduledEventAttributes;
    if (String(attrs?.endpoint ?? '') !== '__temporal_system') return null;

    const op = String(attrs?.operation ?? '');
    const baseLabel = SYSTEM_NEXUS_LABELS[op];
    if (!baseLabel) return null;

    const input = attrs?.input;
    const descriptor = isRawPayload(input)
      ? describeNexusOperation(input as Payload)
      : null;

    const extraAttributes: Record<string, string> = {};
    if (descriptor?.signalName)
      extraAttributes.signalName = descriptor.signalName;
    if (descriptor?.identity) extraAttributes.identity = descriptor.identity;
    if (descriptor?.control) extraAttributes.control = descriptor.control;

    const link = descriptor?.workflowId
      ? targetExecutionLink(
          {
            namespace: descriptor.namespace,
            workflowId: descriptor.workflowId,
          },
          fallbackNamespace,
        )
      : null;

    return {
      displayName: `${baseLabel} ${stateFor(event)}`,
      hiddenFields: HIDDEN_FIELDS,
      extraAttributes: Object.keys(extraAttributes).length
        ? extraAttributes
        : undefined,
      extraLinks: link ? [link] : undefined,
    };
  }

  if (isNexusOperationCompletedEvent(event)) {
    const attrs = event.nexusOperationCompletedEventAttributes;
    const result = attrs?.result;
    if (!isRawPayload(result)) return null;

    const descriptor = describeNexusResponse(result as Payload);
    if (!descriptor) return null;

    const extraAttributes: Record<string, string> = {};
    if (
      attrs?.scheduledEventId !== undefined &&
      attrs?.scheduledEventId !== null
    )
      extraAttributes.initiatedEventId = String(attrs.scheduledEventId);

    const target = descriptor.target ?? targetFromEventLinks(event);
    const link = target ? targetExecutionLink(target, fallbackNamespace) : null;

    return {
      displayName: `${descriptor.label} ${stateFor(event)}`,
      hiddenFields: [...HIDDEN_FIELDS, 'scheduledEventId'],
      extraAttributes: Object.keys(extraAttributes).length
        ? extraAttributes
        : undefined,
      extraLinks: link ? [link] : undefined,
    };
  }

  return null;
};
