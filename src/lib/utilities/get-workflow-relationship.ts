import type { WorkflowRunWithWorkers } from '../stores/workflow-run';
import type { StartAndEndEventHistory } from '../stores/events';
import { isWorkflowExecutionStartedEvent } from './is-event-type';
import { has } from './has';
import { isString } from './is';

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

export const getWorkflowRelationship = (
  workflowRun: WorkflowRunWithWorkers,
  eventHistory: StartAndEndEventHistory,
) => {
  const hasChildren = !!workflowRun.workflow?.pendingChildren.length;
  const parent = workflowRun.workflow?.parent;

  const workflowExecutionStartedEvent = eventHistory.start.find(
    isWorkflowExecutionStartedEvent,
  );

  const newExecutionRunId = getNewExecutionId(eventHistory.end);

  const firstExecutionRunId =
    workflowExecutionStartedEvent?.attributes?.firstExecutionRunId;

  const first =
    firstExecutionRunId === workflowRun.workflow?.runId
      ? undefined
      : firstExecutionRunId;

  const previous =
    workflowExecutionStartedEvent?.attributes?.continuedExecutionRunId;

  const next = newExecutionRunId;
  const hasRelationships = parent || hasChildren || first || previous || next;

  return { hasRelationships, hasChildren, first, previous, parent, next };
};
