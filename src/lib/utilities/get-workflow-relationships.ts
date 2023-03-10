import {
  isChildWorkflowExecutionCompletedEvent,
  isWorkflowExecutionStartedEvent,
} from './is-event-type';
import { has } from './has';
import { isString } from './is';

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

export const getWorkflowRelationships = (
  workflow: WorkflowExecution | null,
  eventHistory: StartAndEndEventHistory,
  fullHistory: WorkflowEvents = [],
) => {
  const children = fullHistory.filter((event) =>
    isChildWorkflowExecutionCompletedEvent(event),
  ) as ChildWorkflowExecutionCompletedEvent[];
  const hasChildren = !!children.length;

  const hasPendingChildren = !!workflow?.pendingChildren.length;
  const parent = workflow?.parent;

  const workflowExecutionStartedEvent = eventHistory.start.find(
    isWorkflowExecutionStartedEvent,
  );

  const newExecutionRunId = getNewExecutionId(
    fullHistory.length ? fullHistory : eventHistory.end,
  );

  const firstExecutionRunId =
    workflowExecutionStartedEvent?.attributes?.firstExecutionRunId;

  const first =
    firstExecutionRunId === workflow?.runId ? undefined : firstExecutionRunId;

  const previous =
    workflowExecutionStartedEvent?.attributes?.continuedExecutionRunId;

  const hasRelationships = !!(
    parent ||
    hasChildren ||
    hasPendingChildren ||
    first ||
    previous ||
    newExecutionRunId
  );

  return {
    hasRelationships,
    hasChildren,
    children,
    hasPendingChildren,
    first,
    previous,
    parent,
    next: newExecutionRunId,
  };
};
