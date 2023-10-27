import type { EventSortOrder } from '$lib/stores/event-view';
import type { DescribeNamespaceResponse } from '$lib/types';
import type {
  ChildWorkflowExecutionCanceledEvent,
  ChildWorkflowExecutionCompletedEvent,
  ChildWorkflowExecutionFailedEvent,
  ChildWorkflowExecutionStartedEvent,
  ChildWorkflowExecutionTerminatedEvent,
  ChildWorkflowExecutionTimedOutEvent,
  WorkflowEvent,
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
  isChildWorkflowExecutionStartedEvent,
  isChildWorkflowExecutionTerminatedEvent,
  isChildWorkflowExecutionTimedOutEvent,
  isWorkflowExecutionStartedEvent,
} from './is-event-type';
import type { StartAndEndEventHistory } from '../stores/events';

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

export type ChildWorkflowEvent =
  | ChildWorkflowExecutionCompletedEvent
  | ChildWorkflowExecutionFailedEvent
  | ChildWorkflowExecutionCanceledEvent
  | ChildWorkflowExecutionTimedOutEvent
  | ChildWorkflowExecutionTerminatedEvent
  | ChildWorkflowExecutionStartedEvent;

export const isChildWorkflowClosedEvent = (event: WorkflowEvent) => {
  return (
    isChildWorkflowExecutionCompletedEvent(event) ||
    isChildWorkflowExecutionFailedEvent(event) ||
    isChildWorkflowExecutionCanceledEvent(event) ||
    isChildWorkflowExecutionTimedOutEvent(event) ||
    isChildWorkflowExecutionTerminatedEvent(event)
  );
};

const areCorrespondingEvents = (a: ChildWorkflowEvent, b: ChildWorkflowEvent) =>
  a.attributes.workflowExecution.workflowId ===
    b.attributes.workflowExecution.workflowId &&
  a.attributes.workflowExecution.runId === b.attributes.workflowExecution.runId;

export const getChildren = (
  events: WorkflowEvents,
  sort: EventSortOrder,
): ChildWorkflowEvent[] => {
  const children = [];
  const startedChildren = [];

  for (const event of events) {
    if (isChildWorkflowExecutionStartedEvent(event)) {
      startedChildren.push(event);
    } else if (isChildWorkflowClosedEvent(event)) {
      children.push(event);
    }
  }

  const orphanedChildStartEvents = startedChildren.filter(
    (child) => !children.some((c) => areCorrespondingEvents(child, c)),
  );

  return sort === 'ascending'
    ? [...orphanedChildStartEvents, ...children]
    : [...children, ...orphanedChildStartEvents];
};

type WorkflowRelationships = {
  hasRelationships: boolean;
  hasChildren: boolean;
  children: ChildWorkflowEvent[];
  first: string | undefined;
  previous: string | undefined;
  parent: WorkflowIdentifier | undefined;
  parentNamespaceName: string | undefined;
  next: string | undefined;
  scheduleId: string | undefined;
};

export const getWorkflowRelationships = (
  workflow: WorkflowExecution | null,
  eventHistory: StartAndEndEventHistory,
  fullEventHistory: WorkflowEvents,
  namespaces: DescribeNamespaceResponse[],
  sort: EventSortOrder = 'ascending',
): WorkflowRelationships => {
  const children = getChildren(fullEventHistory, sort) as ChildWorkflowEvent[];
  const hasChildren = !!workflow?.pendingChildren.length || !!children.length;
  const parent = workflow?.parent;

  const parentNamespaceName = namespaces?.find((namespace) => {
    return namespace.namespaceInfo.id === workflow.parentNamespaceId;
  })?.namespaceInfo?.name;

  const workflowExecutionStartedEvent = eventHistory.start.find(
    isWorkflowExecutionStartedEvent,
  );

  const newExecutionRunId = getNewExecutionId(eventHistory.end);

  const firstExecutionRunId =
    workflowExecutionStartedEvent?.attributes?.firstExecutionRunId;

  const first =
    firstExecutionRunId === workflow?.runId ? undefined : firstExecutionRunId;

  const previous =
    workflowExecutionStartedEvent?.attributes?.continuedExecutionRunId;

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
  };
};
