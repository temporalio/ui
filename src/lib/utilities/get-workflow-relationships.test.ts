import { describe, expect, it } from 'vitest';

import { toWorkflowExecution } from '$lib/models/workflow-execution';

import { getWorkflowRelationships } from './get-workflow-relationships';

import childEvents from '$fixtures/events.children.json';
import completedEvents from '$fixtures/events.completed.json';
import continuedAsNewEvents from '$fixtures/events.continued-as-new.json';
import failedEvents from '$fixtures/events.failed.json';
import timedOutEvents from '$fixtures/events.timed-out.json';
import namespaces from '$fixtures/namespaces.json';
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
        toWorkflowExecution(pendingChildrenWorkflow),
        completedEventHistory,
        completedEvents,
        namespaces.namespaces,
      ).hasChildren,
    ).toBe(true);
  });

  it('hasChildren should return true if there are pending children and non-pending children', () => {
    expect(
      getWorkflowRelationships(
        toWorkflowExecution(pendingChildrenWorkflow),
        completedEventHistory,
        childEvents,
        namespaces.namespaces,
      ).hasChildren,
    ).toBe(true);
    expect(
      getWorkflowRelationships(
        toWorkflowExecution(pendingChildrenWorkflow),
        completedEventHistory,
        childEvents,
        namespaces.namespaces,
      ).children.length,
    ).toBe(15);
  });

  it('parentNamespaceName should return undefined if parentNamespaceId does not match namespaces list', () => {
    expect(
      getWorkflowRelationships(
        toWorkflowExecution(pendingChildrenWorkflow),
        completedEventHistory,
        childEvents,
        namespaces.namespaces,
      ).parentNamespaceName,
    ).toBe(undefined);
  });

  it('hasChildren should return true if there are no pending children and non-pending children', () => {
    expect(
      getWorkflowRelationships(
        toWorkflowExecution(runningWorkflow),
        completedEventHistory,
        childEvents,
        namespaces.namespaces,
      ).hasChildren,
    ).toBe(true);
    expect(
      getWorkflowRelationships(
        toWorkflowExecution(runningWorkflow),
        completedEventHistory,
        childEvents,
        namespaces.namespaces,
      ).children.length,
    ).toBe(15);
  });

  it('hasRelationships should return false if there are is not a parent, pending children, first, previous, or next', () => {
    expect(
      getWorkflowRelationships(
        toWorkflowExecution(runningWorkflow),
        completedEventHistory,
        completedEvents,
        namespaces.namespaces,
      ).hasChildren,
    ).toBe(false);
  });

  it('parentNamespaceName should return namespace name if parentNamespaceId does match namespaces list', () => {
    expect(
      getWorkflowRelationships(
        toWorkflowExecution(runningWorkflow),
        completedEventHistory,
        completedEvents,
        namespaces.namespaces,
      ).parentNamespaceName,
    ).toBe('canary');
  });

  it('should return the firstExecutionRunId for first on a workflowExecutionStartedEvent', () => {
    const workflowExecutionStartedEvent = continuedAsNewEvents.find(
      (event) => event?.name === 'WorkflowExecutionStarted',
    );
    const firstExecutionRunId =
      workflowExecutionStartedEvent?.attributes?.firstExecutionRunId;

    expect(
      getWorkflowRelationships(
        toWorkflowExecution(continuedAsNewWorkflow),
        continuedAsNewEventHistory,
        completedEvents,
        namespaces.namespaces,
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
        toWorkflowExecution(continuedAsNewWorkflowCopy),
        continuedAsNewEventHistory,
        completedEvents,
        namespaces.namespaces,
      ).first,
    ).toBe(firstExecutionRunId);

    continuedAsNewWorkflowCopy.workflowExecutionInfo.execution.runId =
      firstExecutionRunId;

    expect(
      getWorkflowRelationships(
        toWorkflowExecution(continuedAsNewWorkflowCopy),
        continuedAsNewEventHistory,
        completedEvents,
        namespaces.namespaces,
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
        toWorkflowExecution(continuedAsNewWorkflow),
        continuedAsNewEventHistory,
        completedEvents,
        namespaces.namespaces,
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
        toWorkflowExecution(continuedAsNewWorkflow),
        continuedAsNewEventHistory,
        completedEvents,
        namespaces.namespaces,
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
        toWorkflowExecution(completedWorkflow),
        completedEventHistory,
        completedEvents,
        namespaces.namespaces,
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
        toWorkflowExecution(timedOutWorkflow),
        {
          start: timedOutEvents,
          end: timedOutEvents,
        },
        completedEvents,
        namespaces.namespaces,
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
        toWorkflowExecution(failedWorkflow),
        {
          start: failedEvents,
          end: failedEvents,
        },
        completedEvents,
        namespaces.namespaces,
      ).next,
    ).toBe(newExecutionRunId);
  });
});
