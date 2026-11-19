import { getGroupId } from '$lib/models/event-groups/get-group-id';
import type { CurrentRun } from '$lib/stores/workflow-run';
import { isSystemNexusScheduledEvent } from '$lib/system-nexus-endpoints';
import type { DescribeNamespaceResponse, EventLink } from '$lib/types';
import type {
  ChildWorkflowExecutionCanceledEvent,
  ChildWorkflowExecutionCompletedEvent,
  ChildWorkflowExecutionFailedEvent,
  ChildWorkflowExecutionTerminatedEvent,
  ChildWorkflowExecutionTimedOutEvent,
  HistoryEvent,
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

const findNewExecutionRunId = (events: WorkflowEvents): string | undefined => {
  for (const event of events) {
    if (
      has(event.attributes, 'newExecutionRunId') &&
      isString(event.attributes.newExecutionRunId)
    ) {
      return event.attributes.newExecutionRunId;
    }
  }
};

export const readSuccessorRunId = (
  closeEvent: HistoryEvent,
): string | undefined =>
  closeEvent.workflowExecutionCompletedEventAttributes?.newExecutionRunId ||
  closeEvent.workflowExecutionFailedEventAttributes?.newExecutionRunId ||
  closeEvent.workflowExecutionTimedOutEventAttributes?.newExecutionRunId ||
  closeEvent.workflowExecutionContinuedAsNewEventAttributes
    ?.newExecutionRunId ||
  undefined;

// Unknown counts as the current chain: servers before 1.25 omit firstRunId,
// and a failed describe-current leaves currentRun null.
export const belongsToCurrentChain = ({
  firstRunId,
  currentRun,
}: {
  firstRunId: string | undefined;
  currentRun: CurrentRun | null;
}): boolean => {
  if (!firstRunId || !currentRun?.firstRunId) {
    return true;
  }
  return currentRun.firstRunId === firstRunId;
};

export type LatestRunOfThisChain =
  | { kind: 'thisRun' }
  | { kind: 'unknown' }
  | { kind: 'newerChain' }
  | { kind: 'run'; runId: string };

// A Run that is open, or closed without a successor, is its chain's Latest
// Run. Otherwise the Latest Run is the Workflow ID's current Run, unless the
// Workflow ID has since started a newer chain.
export const latestRunOfThisChain = ({
  runId,
  firstRunId,
  nextRunId,
  isOpen,
  currentRun,
}: {
  runId: string;
  firstRunId: string | undefined;
  nextRunId: string | undefined;
  isOpen: boolean;
  currentRun: CurrentRun | null;
}): LatestRunOfThisChain => {
  if (isOpen || !nextRunId) {
    return { kind: 'thisRun' };
  }
  if (!currentRun) {
    return { kind: 'unknown' };
  }
  if (!belongsToCurrentChain({ firstRunId, currentRun })) {
    return { kind: 'newerChain' };
  }
  if (currentRun.runId === runId) {
    return { kind: 'thisRun' };
  }
  return { kind: 'run', runId: currentRun.runId };
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
  firstRunId: string | undefined;
  isFirstRun: boolean;
  previousRunId: string | undefined;
  parent: WorkflowIdentifier | undefined;
  parentNamespaceName: string | undefined;
  nextRunId: string | undefined;
  isMultiRunChain: boolean;
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

  const startedEvent = fullEventHistory.find(isWorkflowExecutionStartedEvent);

  const nextRunId = findNewExecutionRunId(fullEventHistory);

  const firstRunId = startedEvent?.attributes?.firstExecutionRunId ?? undefined;
  const isFirstRun = !!firstRunId && firstRunId === workflow?.runId;
  const hasEarlierFirstRun = !!firstRunId && !isFirstRun;

  const previousRunId =
    startedEvent?.attributes?.continuedExecutionRunId ?? undefined;

  let scheduleId = '';
  const temporalScheduledById =
    workflow?.searchAttributes?.indexedFields?.TemporalScheduledById;

  if (typeof temporalScheduledById === 'string') {
    scheduleId = temporalScheduledById;
  }

  const hasRelationships = !!(
    parent ||
    hasChildren ||
    hasEarlierFirstRun ||
    previousRunId ||
    nextRunId ||
    scheduleId
  );

  const relationshipCount =
    (parent ? 1 : 0) +
    (workflow?.pendingChildren?.length ?? 0) +
    children.length +
    (hasEarlierFirstRun ? 1 : 0) +
    (previousRunId ? 1 : 0) +
    (nextRunId ? 1 : 0) +
    (scheduleId ? 1 : 0);

  return {
    hasRelationships,
    hasChildren,
    children,
    firstRunId,
    isFirstRun,
    previousRunId,
    parent,
    parentNamespaceName,
    nextRunId,
    isMultiRunChain: hasEarlierFirstRun || !!nextRunId,
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
