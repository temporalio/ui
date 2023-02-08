import { isWorkflowExecutionStartedEvent } from './is-event-type';
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
) => {
  const hasChildren = !!workflow?.pendingChildren.length;
  const parent = workflow?.parent;

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

  const hasRelationships = !!(
    parent ||
    hasChildren ||
    first ||
    previous ||
    newExecutionRunId
  );

  return {
    hasRelationships,
    hasChildren,
    first,
    previous,
    parent,
    next: newExecutionRunId,
  };
};
