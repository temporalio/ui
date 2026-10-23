import type { ExecutionRelationshipsProjectionChange } from './types';
import { getChildWorkflowExecutionAssociation } from '../history-events/get-child-workflow-execution-association';
import { getNextExecutionIdentity } from '../history-events/get-next-execution-identity';
import type {
  HistoryEventId,
  NormalizedHistoryEvent,
} from '../history-events/types';
import type {
  ChildWorkflowExecutionAssociation,
  WorkflowExecutionIdentity,
} from '../workflow-execution/types';

/** Owns successor and child execution relationships derived from history. */
export class ExecutionRelationshipsProjection {
  private readonly _identity: WorkflowExecutionIdentity;
  private _nextExecutionIdentity: WorkflowExecutionIdentity | null;
  private readonly _childWorkflowExecutions: Map<
    HistoryEventId,
    ChildWorkflowExecutionAssociation
  >;

  /** Initializes empty relationship state for the current execution. */
  constructor(identity: WorkflowExecutionIdentity) {
    this._identity = identity;
    this._nextExecutionIdentity = null;
    this._childWorkflowExecutions = new Map();
  }

  /** Validates child metadata before updating relationships; only new children emit changes. */
  addEvent(
    event: NormalizedHistoryEvent,
  ): ExecutionRelationshipsProjectionChange | null {
    const childAssociation = getChildWorkflowExecutionAssociation(
      this._identity.namespace,
      event,
    );
    const nextIdentity = getNextExecutionIdentity(this._identity, event);

    if (nextIdentity) {
      this._nextExecutionIdentity = nextIdentity;
    }

    if (
      !childAssociation ||
      this._childWorkflowExecutions.has(childAssociation.headEventId)
    ) {
      return null;
    }

    this._childWorkflowExecutions.set(
      childAssociation.headEventId,
      childAssociation,
    );

    return {
      type: 'CHILD_EXECUTION_ASSOCIATION_ADDED',
      headEventId: childAssociation.headEventId,
    };
  }

  /** Returns the latest successor identity reported by history. */
  get nextExecutionIdentity(): WorkflowExecutionIdentity | null {
    return this._nextExecutionIdentity;
  }

  /** Returns a read-only view of children keyed by their lifecycle head event. */
  get childWorkflowExecutions(): ReadonlyMap<
    HistoryEventId,
    ChildWorkflowExecutionAssociation
  > {
    return this._childWorkflowExecutions;
  }
}
