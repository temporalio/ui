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
  routeForEventHistoryEvent,
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
  kind: 'target-execution' | 'initiated-event';
  label: string;
  value: string;
  href?: string;
};

export type SystemNexusEventDisplay = {
  displayName: string;
  hiddenFields: string[];
  extraAttributes?: Record<string, string>;
  extraLinks?: SystemNexusEventLink[];
  summaryAttribute?: { key: string; value: string };
};

export type SystemNexusContext = {
  namespace?: string;
  workflow?: string;
  run?: string;
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

  const kind = 'target-execution' as const;
  const label = translate('nexus.target-execution');
  if (!namespace) return { kind, label, value: workflow };

  const href = target.runId
    ? routeForWorkflow({ namespace, workflow, run: target.runId })
    : routeForWorkflowsWithQuery({
        namespace,
        query: `WorkflowId="${workflow}"`,
      });

  return { kind, label, value: workflow, href };
};

export const getSystemNexusEventDisplay = (
  event: WorkflowEvent,
  context: SystemNexusContext = {},
): SystemNexusEventDisplay | null => {
  const fallbackNamespace = context.namespace;

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
      // The collapsed history row leads with the signal name on the Initiated
      // event; Target Execution leads on Delivered.
      summaryAttribute: descriptor?.signalName
        ? { key: 'signalName', value: descriptor.signalName }
        : undefined,
    };
  }

  if (isNexusOperationCompletedEvent(event)) {
    const attrs = event.nexusOperationCompletedEventAttributes;
    const result = attrs?.result;
    if (!isRawPayload(result)) return null;

    const descriptor = describeNexusResponse(result as Payload);
    if (!descriptor) return null;

    const links: SystemNexusEventLink[] = [];

    const initiatedEventId =
      attrs?.scheduledEventId === undefined || attrs?.scheduledEventId === null
        ? undefined
        : String(attrs.scheduledEventId);

    if (initiatedEventId) {
      const { namespace, workflow, run } = context;
      links.push({
        kind: 'initiated-event',
        label: translate('nexus.initiated-event-id'),
        value: initiatedEventId,
        href:
          namespace && workflow && run
            ? routeForEventHistoryEvent({
                namespace,
                workflow,
                run,
                eventId: initiatedEventId,
              })
            : undefined,
      });
    }

    const target = descriptor.target ?? targetFromEventLinks(event);
    const link = target ? targetExecutionLink(target, fallbackNamespace) : null;
    if (link) links.push(link);

    return {
      displayName: `${descriptor.label} ${stateFor(event)}`,
      hiddenFields: [...HIDDEN_FIELDS, 'scheduledEventId'],
      extraLinks: links.length ? links : undefined,
    };
  }

  return null;
};
