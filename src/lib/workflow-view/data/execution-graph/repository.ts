import { getExecutionRelation } from './get-execution-relation';
import type {
  ExecutionGraphRepositoryNotification,
  ExecutionGraphRepositorySubscriber,
  ExecutionGraphSnapshot,
  ExecutionNode,
  ExecutionRelation,
} from './types';
import type { QualifiedHistoryEvent } from '../history-events/types';
import {
  type ExecutionIdentity,
  type ExecutionKey,
  type ExecutionRelationKey,
  getExecutionKey,
  getExecutionRelationKey,
  getWorkflowKey,
} from '../identity-keys';

function getTargetIdentity(relation: ExecutionRelation): ExecutionIdentity {
  switch (relation.kind) {
    case 'execution-chain': {
      return relation.nextExecutionIdentity;
    }

    case 'child-workflow': {
      return relation.childExecutionIdentity;
    }
  }
}

/** Stores workflow executions and the relationships discovered between them. */
export class ExecutionGraphRepository {
  private _executionsByKey = new Map<ExecutionKey, ExecutionNode>();
  private _relationsByKey = new Map<ExecutionRelationKey, ExecutionRelation>();
  private _subscribers = new Set<ExecutionGraphRepositorySubscriber>();
  private _snapshotCache: ExecutionGraphSnapshot | null = null;

  /** Returns an execution node by its stable execution key. */
  getExecution(executionKey: ExecutionKey): ExecutionNode | undefined {
    return this._executionsByKey.get(executionKey);
  }

  /** Returns the current cached point-in-time execution graph snapshot. */
  getSnapshot(): ExecutionGraphSnapshot {
    if (this._snapshotCache) {
      return this._snapshotCache;
    }

    this._snapshotCache = {
      executionsByKey: new Map(this._executionsByKey),
      relations: [...this._relationsByKey.values()],
    };

    return this._snapshotCache;
  }

  private _addExecution(identity: ExecutionIdentity): ExecutionNode | null {
    const executionKey = getExecutionKey(identity);

    if (this._executionsByKey.has(executionKey)) {
      return null;
    }

    const execution: ExecutionNode = {
      executionKey,
      workflowKey: getWorkflowKey(identity),
      identity: { ...identity },
    };

    this._executionsByKey.set(executionKey, execution);
    this._snapshotCache = null;
    return execution;
  }

  private _addRelation(relation: ExecutionRelation): boolean {
    const relationKey = getExecutionRelationKey(relation);

    if (this._relationsByKey.has(relationKey)) {
      return false;
    }

    this._relationsByKey.set(relationKey, relation);
    this._snapshotCache = null;
    return true;
  }

  private _notifySubscribers(
    notification: ExecutionGraphRepositoryNotification,
  ): void {
    for (const subscriber of this._subscribers) {
      subscriber(notification);
    }
  }

  /**
   * Subscribe to execution graph repository notifications.
   * @param options.emitCurrentSnapshot Emit the current graph snapshot immediately after subscribing.
   * @returns Unsubscribe function.
   */
  subscribe(
    subscriber: ExecutionGraphRepositorySubscriber,
    options?: { emitCurrentSnapshot?: boolean },
  ): () => void {
    this._subscribers.add(subscriber);

    if (options?.emitCurrentSnapshot) {
      subscriber({
        type: 'EXECUTION_GRAPH_SNAPSHOT',
        graph: this.getSnapshot(),
      });
    }

    return () => {
      this._subscribers.delete(subscriber);
    };
  }

  /** Registers an execution if it is not already present. */
  addExecution(identity: ExecutionIdentity): void {
    const execution = this._addExecution(identity);

    if (execution) {
      this._notifySubscribers({
        type: 'EXECUTION_GRAPH_UPDATED',
        executions: [execution],
        relations: [],
      });
    }
  }

  /** Discovers execution nodes and relationships from qualified history events. */
  addEvents(events: readonly QualifiedHistoryEvent[]): void {
    const addedExecutions: ExecutionNode[] = [];
    const addedRelations: ExecutionRelation[] = [];

    for (const event of events) {
      const sourceExecution = this._executionsByKey.get(event.executionKey);

      if (!sourceExecution) {
        continue;
      }

      const relation = getExecutionRelation(sourceExecution.identity, event);

      if (!relation) {
        continue;
      }

      const targetExecution = this._addExecution(getTargetIdentity(relation));

      if (targetExecution) {
        addedExecutions.push(targetExecution);
      }

      if (this._addRelation(relation)) {
        addedRelations.push(relation);
      }
    }

    if (addedExecutions.length > 0 || addedRelations.length > 0) {
      this._notifySubscribers({
        type: 'EXECUTION_GRAPH_UPDATED',
        executions: addedExecutions,
        relations: addedRelations,
      });
    }
  }
}
