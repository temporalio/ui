import { translate } from '$lib/i18n/translate';
import type { WorkflowEvent } from '$lib/types/events';
import { spaceBetweenCapitalLetters } from '$lib/utilities/format-camel-case';
import {
  routeForEventHistoryEvent,
  routeForWorkflow,
  routeForWorkflowsWithQuery,
} from '$lib/utilities/route-for';

import type {
  SystemNexusContext,
  SystemNexusLink,
  SystemNexusTarget,
} from './types';

/**
 * Escapes a value for use inside a double-quoted visibility query literal.
 * Workflow IDs reach here from a decoded payload authored by the caller, so an
 * unescaped quote would close the literal and change the query.
 */
export const escapeQueryValue = (value: string): string =>
  value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

/** Remaps a Nexus event-name suffix (Scheduled, Completed, Failed) to a verb. */
export const stateFor = (
  event: WorkflowEvent,
  stateVerbs: Record<string, string>,
): string => {
  const rawState = event.name.replace('NexusOperation', '');
  return stateVerbs[rawState] ?? spaceBetweenCapitalLetters(rawState);
};

/** Reads a target execution off an event's Nexus links. */
export const targetFromEventLinks = (
  event: WorkflowEvent,
): SystemNexusTarget | undefined => {
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

/**
 * Links to the target execution. With a run id this resolves to that exact run;
 * without one — the initiating event, where the run may not exist yet — it falls
 * back to a workflow-id search.
 */
export const targetExecutionLink = (
  target: SystemNexusTarget,
  context: SystemNexusContext,
): SystemNexusLink | null => {
  const namespace = target.namespace || context.namespace;
  const workflow = target.workflowId;
  if (!workflow) return null;

  const kind = 'target-execution' as const;
  const label = translate('nexus.target-execution');
  if (!namespace) return { kind, label, value: workflow };

  const href = target.runId
    ? routeForWorkflow({ namespace, workflow, run: target.runId })
    : routeForWorkflowsWithQuery({
        namespace,
        query: `WorkflowId="${escapeQueryValue(workflow)}"`,
      });

  return { kind, label, value: workflow, href };
};

/** Links back to the event that initiated the operation, in this same history. */
export const initiatedEventLink = (
  eventId: string,
  context: SystemNexusContext,
): SystemNexusLink => {
  const { namespace, workflow, run } = context;

  return {
    kind: 'initiated-event',
    label: translate('nexus.initiated-event-id'),
    value: eventId,
    href:
      namespace && workflow && run
        ? routeForEventHistoryEvent({ namespace, workflow, run, eventId })
        : undefined,
  };
};
