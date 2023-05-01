import { describe, expect, it } from 'vitest';
import { getWorkflowRelationships } from './get-workflow-relationships';

import completedEvents from '$fixtures/events.completed.json';
import continuedAsNewEvents from '$fixtures/events.continued-as-new.json';
import failedEvents from '$fixtures/events.failed.json';
import timedOutEvents from '$fixtures/events.timed-out.json';
import childEvents from '$fixtures/events.children.json';

import completedWorkflow from '$fixtures/workflow.completed.json';
import continuedAsNewWorkflow from '$fixtures/workflow.continued-as-new.json';
import failedWorkflow from '$fixtures/workflow.failed.json';
import pendingChildrenWorkflow from '$fixtures/workflow.pending-children.json';
import runningWorkflow from '$fixtures/workflow.running.json';
import timedOutWorkflow from '$fixtures/workflow.timed-out.json';

describe('getWorkflowRelationships', () => {
  const completedEventHistory = {
    start: completedEvents,
    end: completedEvents,
  };
  const continuedAsNewEventHistory = {
    start: continuedAsNewEvents,
    end: continuedAsNewEvents,
  };

  it('hasChildren should return true if there are pending children', () => {
    expect(
      getWorkflowRelationships(
        pendingChildrenWorkflow,
        completedEventHistory,
        completedEvents,
      ).hasChildren,
    ).toBe(true);
  });

  it('hasChildren should return true if there are pending children and non-pending children', () => {
    expect(
      getWorkflowRelationships(
        pendingChildrenWorkflow,
        completedEventHistory,
        childEvents,
      ).hasChildren,
    ).toBe(true);
    expect(
      getWorkflowRelationships(
        pendingChildrenWorkflow,
        completedEventHistory,
        childEvents,
      ).children.length,
    ).toBe(15);
  });

  it('hasChildren should return true if there are no pending children and non-pending children', () => {
    expect(
      getWorkflowRelationships(
        runningWorkflow,
        completedEventHistory,
        childEvents,
      ).hasChildren,
    ).toBe(true);
    expect(
      getWorkflowRelationships(
        runningWorkflow,
        completedEventHistory,
        childEvents,
      ).children.length,
    ).toBe(15);
  });

  it('hasRelationships should return false if there are is not a parent, pending children, first, previous, or next', () => {
    expect(
      getWorkflowRelationships(
        runningWorkflow,
        completedEventHistory,
        completedEvents,
      ).hasChildren,
    ).toBe(false);
  });

  it('should return the firstExecutionRunId for first on a workflowExecutionStartedEvent', () => {
    const workflowExecutionStartedEvent = continuedAsNewEvents.find(
      (event) => event?.name === 'WorkflowExecutionStarted',
    );
    const firstExecutionRunId =
      workflowExecutionStartedEvent?.attributes?.firstExecutionRunId;

    expect(
      getWorkflowRelationships(
        continuedAsNewWorkflow,
        continuedAsNewEventHistory,
        completedEvents,
      ).first,
    ).toBe(firstExecutionRunId);
  });

  it('should not return the firstExecutionRunId for first on a workflowExecutionStartedEvent if the id matches the runId', () => {
    const workflowExecutionStartedEvent = continuedAsNewEvents.find(
      (event) => event?.name === 'WorkflowExecutionStarted',
    );
    const firstExecutionRunId =
      workflowExecutionStartedEvent?.attributes?.firstExecutionRunId;
    const continuedAsNewWorkflowCopy = JSON.parse(
      JSON.stringify(continuedAsNewWorkflow),
    );
    expect(
      getWorkflowRelationships(
        continuedAsNewWorkflowCopy,
        continuedAsNewEventHistory,
        completedEvents,
      ).first,
    ).toBe(firstExecutionRunId);

    continuedAsNewWorkflowCopy.runId = firstExecutionRunId;

    expect(
      getWorkflowRelationships(
        continuedAsNewWorkflowCopy,
        continuedAsNewEventHistory,
        completedEvents,
      ).first,
    ).toBe(undefined);
  });

  it('should return the continuedExecutionRunId for previous on a WorkflowExecutionStarted event', () => {
    const workflowExecutionStartedEvent = continuedAsNewEvents.find(
      (event) => event?.name === 'WorkflowExecutionStarted',
    );
    const continuedExecutionRunId =
      workflowExecutionStartedEvent?.attributes?.continuedExecutionRunId;
    expect(
      getWorkflowRelationships(
        continuedAsNewWorkflow,
        continuedAsNewEventHistory,
        completedEvents,
      ).previous,
    ).toBe(continuedExecutionRunId);
  });

  it('should return the newExecutionRunId for next on a WorkflowExecutionContinuedAsNew event', () => {
    const workflowExecutionContinuedAsNewEvent = continuedAsNewEvents.find(
      (event) => event?.name === 'WorkflowExecutionContinuedAsNew',
    );
    const newExecutionRunId =
      workflowExecutionContinuedAsNewEvent?.attributes?.newExecutionRunId;

    expect(
      getWorkflowRelationships(
        continuedAsNewWorkflow,
        continuedAsNewEventHistory,
        completedEvents,
      ).next,
    ).toBe(newExecutionRunId);
  });

  it('should return the newExecutionRunId for next on a WorkflowExecutionCompleted event', () => {
    const workflowExecutionCompletedEvent = completedEvents.find(
      (event) => event?.name === 'WorkflowExecutionCompleted',
    );
    const newExecutionRunId =
      workflowExecutionCompletedEvent?.attributes?.newExecutionRunId;

    expect(
      getWorkflowRelationships(
        completedWorkflow,
        completedEventHistory,
        completedEvents,
      ).next,
    ).toBe(newExecutionRunId);
  });

  it('should return the newExecutionRunId for next on a WorkflowExecutionTimedOut event', () => {
    const workflowExecutionCompletedEvent = timedOutEvents.find(
      (event) => event?.name === 'WorkflowExecutionTimedOut',
    );
    const newExecutionRunId =
      workflowExecutionCompletedEvent?.attributes?.newExecutionRunId;

    expect(
      getWorkflowRelationships(
        timedOutWorkflow,
        {
          start: timedOutEvents,
          end: timedOutEvents,
        },
        completedEvents,
      ).next,
    ).toBe(newExecutionRunId);
  });

  it('should return the newExecutionRunId for next on a WorkflowExecutionFailed event', () => {
    const workflowExecutionCompletedEvent = failedEvents.find(
      (event) => event?.name === 'WorkflowExecutionFailed',
    );
    const newExecutionRunId =
      workflowExecutionCompletedEvent?.attributes?.newExecutionRunId;

    expect(
      getWorkflowRelationships(
        failedWorkflow,
        {
          start: failedEvents,
          end: failedEvents,
        },
        completedEvents,
      ).next,
    ).toBe(newExecutionRunId);
  });
});
