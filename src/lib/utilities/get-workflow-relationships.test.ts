import { describe, expect, it } from 'vitest';

import { toWorkflowExecution } from '$lib/models/workflow-execution';
import type { EventLink } from '$lib/types';
import type { WorkflowEvent, WorkflowEvents } from '$lib/types/events';

import { parseRawPayloadToJSON } from './decode-payload';
import {
  belongsToCurrentChain,
  getWorkflowNexusLinksFromHistory,
  getWorkflowRelationships,
} from './get-workflow-relationships';

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
import scheduledWorkflow from '$fixtures/workflow.scheduled.json';
import timedOutWorkflow from '$fixtures/workflow.timed-out.json';

describe('getWorkflowRelationships', () => {
  it('hasChildren should return true if there are pending children', () => {
    expect(
      getWorkflowRelationships(
        toWorkflowExecution(pendingChildrenWorkflow),
        completedEvents,
        namespaces.namespaces[0],
      ).hasChildren,
    ).toBe(true);
  });

  it('hasChildren should return true if there are pending children and non-pending children', () => {
    expect(
      getWorkflowRelationships(
        toWorkflowExecution(pendingChildrenWorkflow),
        childEvents,
        namespaces.namespaces[0],
      ).hasChildren,
    ).toBe(true);
    expect(
      getWorkflowRelationships(
        toWorkflowExecution(pendingChildrenWorkflow),
        childEvents,
        namespaces.namespaces[0],
      ).children.length,
    ).toBe(15);
  });

  it('parentNamespaceName should return the namespace name', () => {
    expect(
      getWorkflowRelationships(
        toWorkflowExecution(pendingChildrenWorkflow),
        childEvents,
        namespaces.namespaces[0],
      ).parentNamespaceName,
    ).toBe('my-namespace-name');
  });

  it('parentNamespaceName should return undefined if namespace name does not exist', () => {
    expect(
      getWorkflowRelationships(
        toWorkflowExecution(pendingChildrenWorkflow),
        childEvents,
        { namespaceInfo: {} },
      ).parentNamespaceName,
    ).toBe(undefined);
  });

  it('hasChildren should return true if there are no pending children and non-pending children', () => {
    expect(
      getWorkflowRelationships(
        toWorkflowExecution(runningWorkflow),
        childEvents,
        namespaces.namespaces[0],
      ).hasChildren,
    ).toBe(true);
    expect(
      getWorkflowRelationships(
        toWorkflowExecution(runningWorkflow),
        childEvents,
        namespaces.namespaces[0],
      ).children.length,
    ).toBe(15);
  });

  it('hasRelationships should return false if there are is not a parent, pending children, first, previous, or next', () => {
    expect(
      getWorkflowRelationships(
        toWorkflowExecution(runningWorkflow),
        completedEvents,
        namespaces.namespaces[0],
      ).hasChildren,
    ).toBe(false);
  });

  it('should return the firstExecutionRunId for firstRunId on a workflowExecutionStartedEvent', () => {
    const workflowExecutionStartedEvent = continuedAsNewEvents.find(
      (event) => event?.name === 'WorkflowExecutionStarted',
    );
    const firstExecutionRunId =
      workflowExecutionStartedEvent?.attributes?.firstExecutionRunId;

    expect(
      getWorkflowRelationships(
        toWorkflowExecution(continuedAsNewWorkflow),
        continuedAsNewEvents,
        namespaces.namespaces[0],
      ).firstRunId,
    ).toBe(firstExecutionRunId);
  });

  it('isFirstRun should be true only when the firstExecutionRunId matches the runId', () => {
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
        continuedAsNewEvents,
        namespaces.namespaces[0],
      ).isFirstRun,
    ).toBe(false);

    continuedAsNewWorkflowCopy.workflowExecutionInfo.execution.runId =
      firstExecutionRunId;

    const relationships = getWorkflowRelationships(
      toWorkflowExecution(continuedAsNewWorkflowCopy),
      continuedAsNewEvents,
      namespaces.namespaces[0],
    );
    expect(relationships.isFirstRun).toBe(true);
    expect(relationships.firstRunId).toBe(firstExecutionRunId);
  });

  it('should return the continuedExecutionRunId for previousRunId on a WorkflowExecutionStarted event', () => {
    const workflowExecutionStartedEvent = continuedAsNewEvents.find(
      (event) => event?.name === 'WorkflowExecutionStarted',
    );
    const continuedExecutionRunId =
      workflowExecutionStartedEvent?.attributes?.continuedExecutionRunId;
    expect(
      getWorkflowRelationships(
        toWorkflowExecution(continuedAsNewWorkflow),
        continuedAsNewEvents,
        namespaces.namespaces[0],
      ).previousRunId,
    ).toBe(continuedExecutionRunId);
  });

  it('should return the newExecutionRunId for nextRunId on a WorkflowExecutionContinuedAsNew event', () => {
    const workflowExecutionContinuedAsNewEvent = continuedAsNewEvents.find(
      (event) => event?.name === 'WorkflowExecutionContinuedAsNew',
    );
    const newExecutionRunId =
      workflowExecutionContinuedAsNewEvent?.attributes?.newExecutionRunId;

    expect(
      getWorkflowRelationships(
        toWorkflowExecution(continuedAsNewWorkflow),
        continuedAsNewEvents,
        namespaces.namespaces[0],
      ).nextRunId,
    ).toBe(newExecutionRunId);
  });

  it('should return the newExecutionRunId for nextRunId on a WorkflowExecutionCompleted event', () => {
    const workflowExecutionCompletedEvent = completedEvents.find(
      (event) => event?.name === 'WorkflowExecutionCompleted',
    );
    const newExecutionRunId =
      workflowExecutionCompletedEvent?.attributes?.newExecutionRunId;

    expect(
      getWorkflowRelationships(
        toWorkflowExecution(completedWorkflow),
        completedEvents,
        namespaces.namespaces[0],
      ).nextRunId,
    ).toBe(newExecutionRunId);
  });

  it('should return the newExecutionRunId for nextRunId on a WorkflowExecutionTimedOut event', () => {
    const workflowExecutionCompletedEvent = timedOutEvents.find(
      (event) => event?.name === 'WorkflowExecutionTimedOut',
    );
    const newExecutionRunId =
      workflowExecutionCompletedEvent?.attributes?.newExecutionRunId;

    expect(
      getWorkflowRelationships(
        toWorkflowExecution(timedOutWorkflow),
        timedOutEvents,
        namespaces.namespaces[0],
      ).nextRunId,
    ).toBe(newExecutionRunId);
  });

  it('should return the newExecutionRunId for nextRunId on a WorkflowExecutionFailed event', () => {
    const workflowExecutionCompletedEvent = failedEvents.find(
      (event) => event?.name === 'WorkflowExecutionFailed',
    );
    const newExecutionRunId =
      workflowExecutionCompletedEvent?.attributes?.newExecutionRunId;

    expect(
      getWorkflowRelationships(
        toWorkflowExecution(failedWorkflow),
        failedEvents,
        namespaces.namespaces[0],
      ).nextRunId,
    ).toBe(newExecutionRunId);
  });

  it('should return the decoded scheduleID for a scheduled workflows', () => {
    const workflowScheduledId = parseRawPayloadToJSON(
      scheduledWorkflow?.workflowExecutionInfo?.searchAttributes?.indexedFields
        ?.TemporalScheduledById,
    );
    expect(
      getWorkflowRelationships(
        toWorkflowExecution(scheduledWorkflow),
        completedEvents,
        namespaces.namespaces[0],
      ).scheduleId,
    ).toBe(workflowScheduledId);
  });

  it('should return empty string for a non-scheduled workflows', () => {
    expect(
      getWorkflowRelationships(
        toWorkflowExecution(completedWorkflow),
        completedEvents,
        namespaces.namespaces[0],
      ).scheduleId,
    ).toBe('');
  });

  describe('isMultiRunChain', () => {
    const firstExecutionRunId = 'dd65e55d-d058-401c-9cb6-77dd4846a98e';
    const withRunId = (runId: string) => {
      const workflow = JSON.parse(JSON.stringify(continuedAsNewWorkflow));
      workflow.workflowExecutionInfo.execution.runId = runId;
      return toWorkflowExecution(workflow);
    };
    const withoutSuccessor = continuedAsNewEvents.filter(
      (event) => event?.name !== 'WorkflowExecutionContinuedAsNew',
    );

    it('is true when the Run has a predecessor and a successor', () => {
      expect(
        getWorkflowRelationships(
          toWorkflowExecution(continuedAsNewWorkflow),
          continuedAsNewEvents,
          namespaces.namespaces[0],
        ).isMultiRunChain,
      ).toBe(true);
    });

    it('is true when the Run only has a predecessor', () => {
      expect(
        getWorkflowRelationships(
          toWorkflowExecution(continuedAsNewWorkflow),
          withoutSuccessor,
          namespaces.namespaces[0],
        ).isMultiRunChain,
      ).toBe(true);
    });

    it('is true when the first Run closes with a successor', () => {
      expect(
        getWorkflowRelationships(
          withRunId(firstExecutionRunId),
          continuedAsNewEvents,
          namespaces.namespaces[0],
        ).isMultiRunChain,
      ).toBe(true);
    });

    it('is false for a first Run with no successor', () => {
      expect(
        getWorkflowRelationships(
          withRunId(firstExecutionRunId),
          withoutSuccessor,
          namespaces.namespaces[0],
        ).isMultiRunChain,
      ).toBe(false);
    });

    it('is false for a single-Run chain whose close event has an empty newExecutionRunId', () => {
      expect(
        getWorkflowRelationships(
          toWorkflowExecution(completedWorkflow),
          completedEvents,
          namespaces.namespaces[0],
        ).isMultiRunChain,
      ).toBe(false);
    });
  });
});

describe('getWorkflowNexusLinksFromHistory', () => {
  const link = (workflowId: string): EventLink =>
    ({
      workflowEvent: {
        namespace: 'default',
        workflowId,
        runId: 'run-id',
        eventRef: { eventId: '1' },
      },
    }) as unknown as EventLink;

  const scheduled = (id: string, endpoint: string): WorkflowEvent =>
    ({
      id,
      category: 'nexus',
      name: 'NexusOperationScheduled',
      nexusOperationScheduledEventAttributes: {
        endpoint,
        service: 'temporal.api.workflowservice.v1.WorkflowService',
        operation: 'SignalWithStartWorkflowExecution',
      },
      links: [link(`scheduled-${id}`)],
    }) as unknown as WorkflowEvent;

  const completed = (id: string, scheduledEventId: string): WorkflowEvent =>
    ({
      id,
      category: 'nexus',
      name: 'NexusOperationCompleted',
      nexusOperationCompletedEventAttributes: { scheduledEventId },
      links: [link(`completed-${id}`)],
    }) as unknown as WorkflowEvent;

  it('should return the links of an operation on a user endpoint', () => {
    const history = [
      scheduled('5', 'my-endpoint'),
      completed('6', '5'),
    ] as WorkflowEvents;

    expect(getWorkflowNexusLinksFromHistory(history)).toHaveLength(2);
  });

  it('should drop the links of an operation on the system endpoint', () => {
    const history = [
      scheduled('5', '__temporal_system'),
      completed('6', '5'),
    ] as WorkflowEvents;

    expect(getWorkflowNexusLinksFromHistory(history)).toHaveLength(0);
  });

  it('should keep user endpoint links when a system operation is present', () => {
    const history = [
      scheduled('5', '__temporal_system'),
      completed('6', '5'),
      scheduled('7', 'my-endpoint'),
      completed('8', '7'),
    ] as WorkflowEvents;

    expect(getWorkflowNexusLinksFromHistory(history)).toEqual([
      link('scheduled-7'),
      link('completed-8'),
    ]);
  });
});

describe('belongsToCurrentChain', () => {
  const currentRun = {
    runId: 'run-c',
    firstRunId: 'run-a',
    status: 'Running' as const,
  };

  it('is true when the current Run shares the first Run ID', () => {
    expect(belongsToCurrentChain({ firstRunId: 'run-a', currentRun })).toBe(
      true,
    );
  });

  it('is false when the Workflow ID was reused', () => {
    expect(belongsToCurrentChain({ firstRunId: 'run-x', currentRun })).toBe(
      false,
    );
  });

  it('is true while the current Run is unknown', () => {
    expect(
      belongsToCurrentChain({ firstRunId: 'run-x', currentRun: null }),
    ).toBe(true);
  });

  it('is true when the server omits the first Run ID', () => {
    expect(
      belongsToCurrentChain({
        firstRunId: 'run-x',
        currentRun: { ...currentRun, firstRunId: undefined },
      }),
    ).toBe(true);
  });

  it('is true when this Run has no first Run ID yet', () => {
    expect(belongsToCurrentChain({ firstRunId: undefined, currentRun })).toBe(
      true,
    );
  });
});
