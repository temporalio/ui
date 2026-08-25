import { getGroupId } from '$lib/models/event-groups/get-group-id';
import { isSystemNexusScheduledEvent } from '$lib/system-nexus-endpoints';
import type { DescribeNamespaceResponse, EventLink } from '$lib/types';
import type {
  ChildWorkflowExecutionCanceledEvent,
  ChildWorkflowExecutionCompletedEvent,
  ChildWorkflowExecutionFailedEvent,
  ChildWorkflowExecutionTerminatedEvent,
  ChildWorkflowExecutionTimedOutEvent,
  IterableEvent,
  WorkflowEvents,
} from '$lib/types/events';
import type { WorkflowExecution } from '$lib/types/workflows';
import type { WorkflowIdentifier } from '$lib/types/workflows';

import { has } from './has';
import { isString } from './is';
import {
  isChildWorkflowExecutionCanceledEvent,
  isChildWorkflowExecutionCompletedEvent,
  isChildWorkflowExecutionFailedEvent,
  isChildWorkflowExecutionTerminatedEvent,
  isChildWorkflowExecutionTimedOutEvent,
  isWorkflowExecutionStartedEvent,
} from './is-event-type';

const getNewExecutionId = (events: WorkflowEvents): string | undefined => {
  for (const event of events) {
    if (
      has(event.attributes, 'newExecutionRunId') &&
      isString(event.attributes.newExecutionRunId)
    ) {
      return event.attributes.newExecutionRunId;
    }
  }
};

export type ChildWorkflowClosedEvent =
  | ChildWorkflowExecutionCompletedEvent
  | ChildWorkflowExecutionFailedEvent
  | ChildWorkflowExecutionCanceledEvent
  | ChildWorkflowExecutionTimedOutEvent
  | ChildWorkflowExecutionTerminatedEvent;

export const isChildWorkflowClosedEvent = (
  event: IterableEvent,
): event is ChildWorkflowClosedEvent => {
  return (
    isChildWorkflowExecutionCompletedEvent(event) ||
    isChildWorkflowExecutionFailedEvent(event) ||
    isChildWorkflowExecutionCanceledEvent(event) ||
    isChildWorkflowExecutionTimedOutEvent(event) ||
    isChildWorkflowExecutionTerminatedEvent(event)
  );
};

type WorkflowRelationships = {
  hasRelationships: boolean;
  hasChildren: boolean;
  children: ChildWorkflowClosedEvent[];
  first: string | undefined;
  previous: string | undefined;
  parent: WorkflowIdentifier | undefined;
  parentNamespaceName: string | undefined;
  next: string | undefined;
  scheduleId: string | undefined;
  relationshipCount: number;
};

export const getWorkflowRelationships = (
  workflow: WorkflowExecution | null,
  fullEventHistory: WorkflowEvents,
  namespace: DescribeNamespaceResponse,
): WorkflowRelationships => {
  const children = fullEventHistory.filter((event) =>
    isChildWorkflowClosedEvent(event),
  ) as ChildWorkflowClosedEvent[];
  const hasChildren = !!workflow?.pendingChildren.length || !!children.length;
  const parent = workflow?.parent;
  const parentNamespaceName = namespace.namespaceInfo?.name ?? undefined;

  const workflowExecutionStartedEvent = fullEventHistory.find(
    isWorkflowExecutionStartedEvent,
  );

  const newExecutionRunId = getNewExecutionId(fullEventHistory);

  const firstExecutionRunId =
    workflowExecutionStartedEvent?.attributes?.firstExecutionRunId;

  const first =
    firstExecutionRunId === workflow?.runId
      ? undefined
      : (firstExecutionRunId ?? undefined);

  const previous =
    workflowExecutionStartedEvent?.attributes?.continuedExecutionRunId ??
    undefined;

  let scheduleId = '';
  const temporalScheduledById =
    workflow?.searchAttributes?.indexedFields?.TemporalScheduledById;

  if (typeof temporalScheduledById === 'string') {
    scheduleId = temporalScheduledById;
  }

  const hasRelationships = !!(
    parent ||
    hasChildren ||
    first ||
    previous ||
    newExecutionRunId ||
    scheduleId
  );

  const relationshipCount =
    (parent ? 1 : 0) +
    (workflow?.pendingChildren?.length ?? 0) +
    children.length +
    (first ? 1 : 0) +
    (previous ? 1 : 0) +
    (newExecutionRunId ? 1 : 0) +
    (scheduleId ? 1 : 0);

  return {
    hasRelationships,
    hasChildren,
    children,
    first,
    previous,
    parent,
    parentNamespaceName,
    next: newExecutionRunId,
    scheduleId,
    relationshipCount,
  };
};

export const getWorkflowNexusLinksFromHistory = (
  history: WorkflowEvents,
): EventLink[] => {
  try {
    // Operations on the system endpoint are an internal transport, not a Nexus
    // operation the user started. Their links do not belong in the list.
    const systemOperationIds = new Set(
      history
        .filter((event) => isSystemNexusScheduledEvent(event))
        .map((event) => event.id),
    );
    const links = new Set<EventLink>();
    for (const event of history) {
      if (event.category !== 'nexus') continue;
      if (!event.links?.length) continue;
      if (systemOperationIds.has(getGroupId(event))) continue;

      for (const link of event.links) {
        links.add(link);
      }
    }

    return Array.from(links);
  } catch {
    return [];
  }
};
