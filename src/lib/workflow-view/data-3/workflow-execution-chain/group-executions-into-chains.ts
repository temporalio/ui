import { getWorkflowExecutionChainKeyFromIdentity } from './get-key-from-identity';
import type {
  WorkflowExecutionChain,
  WorkflowExecutionChainIdentity,
  WorkflowExecutionChainKey,
} from './types';
import { compareWorkflowExecutionsByStartTime } from '../workflow-execution/compare-by-start-time';
import type { WorkflowExecution } from '../workflow-execution/workflow-execution';

/** Groups known executions by chain identity and orders them by start time. */
export function groupWorkflowExecutionsIntoChains(
  executions: Iterable<WorkflowExecution>,
): ReadonlyMap<WorkflowExecutionChainKey, WorkflowExecutionChain> {
  const chainMap = new Map<
    WorkflowExecutionChainKey,
    {
      identity: WorkflowExecutionChainIdentity;
      executions: WorkflowExecution[];
    }
  >();

  for (const execution of executions) {
    const chainKey = getWorkflowExecutionChainKeyFromIdentity(
      execution.executionChainIdentity,
    );

    const existing = chainMap.get(chainKey);

    if (existing) {
      existing.executions.push(execution);
      continue;
    }

    chainMap.set(chainKey, {
      identity: execution.executionChainIdentity,
      executions: [execution],
    });
  }

  for (const chain of chainMap.values()) {
    chain.executions.sort(compareWorkflowExecutionsByStartTime);
  }

  return chainMap;
}
