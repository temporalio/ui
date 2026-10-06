import { getWorkflowExecutionKeyFromIdentity } from './workflow-execution/get-key-from-identity';
import type {
  WorkflowExecutionIdentity,
  WorkflowExecutionKey,
} from './workflow-execution/types';
import { WorkflowExecution } from './workflow-execution/workflow-execution';
import { getWorkflowExecutionChainKeyFromIdentity } from './workflow-execution-chain/get-key-from-identity';
import { groupWorkflowExecutionsIntoChains } from './workflow-execution-chain/group-executions-into-chains';
import type {
  WorkflowExecutionChain,
  WorkflowExecutionChainKey,
} from './workflow-execution-chain/types';

export class Workflows {
  private _executions = new Map<WorkflowExecutionKey, WorkflowExecution>();
  private _subscribers = new Set<() => void>();

  /** Returns a stored execution or discovers it before registration. */
  async getOrCreateExecution(
    identity: WorkflowExecutionIdentity,
    signal?: AbortSignal,
  ): Promise<WorkflowExecution> {
    const key = getWorkflowExecutionKeyFromIdentity(identity);

    const storedExecution = this._executions.get(key);

    if (storedExecution) {
      return storedExecution;
    }

    const newExecution = await WorkflowExecution.discover(identity, signal);
    const registeredExecution = this._executions.get(key);

    if (registeredExecution) {
      return registeredExecution;
    }

    this._executions.set(key, newExecution);
    this._notifySubscribers();

    return newExecution;
  }

  /** Discovers predecessors and returns executions in oldest-to-selected order.
   * The selectedExecution is the last item in the list but does not count towards the max. */
  async discoverPreviousExecutions(
    selectedExecution: WorkflowExecution,
    maxPreviousExecutions: number,
    signal?: AbortSignal,
  ): Promise<readonly WorkflowExecution[]> {
    signal?.throwIfAborted();

    if (!Number.isInteger(maxPreviousExecutions) || maxPreviousExecutions < 0) {
      throw new RangeError(
        'maxPreviousExecutions must be a non-negative integer',
      );
    }

    let currentExecution = selectedExecution;
    const executions = new Map<WorkflowExecutionKey, WorkflowExecution>([
      [currentExecution.key, currentExecution],
    ]);

    const chainIdentityKey = getWorkflowExecutionChainKeyFromIdentity(
      selectedExecution.executionChainIdentity,
    );

    while (
      currentExecution.previousExecutionIdentity &&
      executions.size - 1 < maxPreviousExecutions
    ) {
      signal?.throwIfAborted();

      const prevExecution = await this.getOrCreateExecution(
        currentExecution.previousExecutionIdentity,
        signal,
      );

      signal?.throwIfAborted();

      const prevExecutionChainIdentityKey =
        getWorkflowExecutionChainKeyFromIdentity(
          prevExecution.executionChainIdentity,
        );

      if (chainIdentityKey !== prevExecutionChainIdentityKey) {
        throw new Error(
          `Predecessor ${prevExecution.key} belongs to a different execution chain`,
        );
      }

      if (executions.has(prevExecution.key)) {
        throw new Error(
          `Execution chain contains a cycle at ${prevExecution.key}`,
        );
      }

      executions.set(prevExecution.key, prevExecution);
      currentExecution = prevExecution;
    }

    return Array.from(executions.values()).reverse();
  }

  /** Discovers at most maxNextExecutions successors using latest-event metadata.
   * Returns selected-to-newest order without waiting for future executions. */
  async discoverNextExecutions(
    selectedExecution: WorkflowExecution,
    maxNextExecutions: number,
    signal?: AbortSignal,
  ): Promise<readonly WorkflowExecution[]> {
    signal?.throwIfAborted();

    if (!Number.isInteger(maxNextExecutions) || maxNextExecutions < 0) {
      throw new RangeError('maxNextExecutions must be a non-negative integer');
    }

    let currentExecution = selectedExecution;
    const executions = new Map<WorkflowExecutionKey, WorkflowExecution>([
      [currentExecution.key, currentExecution],
    ]);

    const chainIdentityKey = getWorkflowExecutionChainKeyFromIdentity(
      selectedExecution.executionChainIdentity,
    );

    while (executions.size - 1 < maxNextExecutions) {
      signal?.throwIfAborted();

      if (
        !currentExecution.nextExecutionIdentity &&
        !currentExecution.isTerminal
      ) {
        await currentExecution.loadLatestEvent(signal);
      }

      signal?.throwIfAborted();

      const nextIdentity = currentExecution.nextExecutionIdentity;
      if (!nextIdentity) {
        break;
      }

      const nextExecution = await this.getOrCreateExecution(
        nextIdentity,
        signal,
      );

      signal?.throwIfAborted();

      const nextExecutionChainIdentityKey =
        getWorkflowExecutionChainKeyFromIdentity(
          nextExecution.executionChainIdentity,
        );

      if (chainIdentityKey !== nextExecutionChainIdentityKey) {
        throw new Error(
          `Successor ${nextExecution.key} belongs to a different execution chain`,
        );
      }

      if (executions.has(nextExecution.key)) {
        throw new Error(
          `Execution chain contains a cycle at ${nextExecution.key}`,
        );
      }

      executions.set(nextExecution.key, nextExecution);
      currentExecution = nextExecution;
    }

    return Array.from(executions.values());
  }

  /** Returns known executions grouped into chains and ordered by start time. */
  get executionChains(): ReadonlyMap<
    WorkflowExecutionChainKey,
    WorkflowExecutionChain
  > {
    return groupWorkflowExecutionsIntoChains(this._executions.values());
  }

  /** Observes registration of newly discovered executions. */
  subscribe(handler: () => void): () => void {
    this._subscribers.add(handler);

    return () => {
      this._subscribers.delete(handler);
    };
  }

  private _notifySubscribers(): void {
    for (const subscriber of this._subscribers) {
      subscriber();
    }
  }
}
