import { getEagerExecutions } from './get-eager-executions';
import type {
  ExecutionGraphSnapshot,
  ExecutionNode,
} from '../execution-graph/types';
import type { ExecutionHistoryState } from '../execution-history/types';
import type { ExecutionKey } from '../identity-keys';

/** Executions eligible for discovery, full-history loading, and live polling. */
export type ExecutionWorkPlan = Readonly<{
  discover: readonly ExecutionNode[];
  load: readonly ExecutionNode[];
  poll: readonly ExecutionNode[];
}>;

/** Graph, history state, and selection settings used to determine execution work. */
export type ExecutionWorkPlanInput = Readonly<{
  graph: ExecutionGraphSnapshot;
  histories: readonly ExecutionHistoryState[];
  rootExecutionKey: ExecutionKey;
  requestedExecutionKeys: ReadonlySet<ExecutionKey>;
  terminalExecutionKeys: ReadonlySet<ExecutionKey>;
  autoRefreshEnabled: boolean;
}>;

/** Computes eligible execution work without starting requests or mutating repositories. */
export function getExecutionWorkPlan({
  graph,
  histories,
  rootExecutionKey,
  requestedExecutionKeys,
  terminalExecutionKeys,
  autoRefreshEnabled,
}: ExecutionWorkPlanInput): ExecutionWorkPlan {
  const historiesByKey = new Map(
    histories.map((history) => [history.executionKey, history]),
  );
  const loadCandidates = new Map(
    getEagerExecutions(graph, rootExecutionKey).map((execution) => [
      execution.executionKey,
      execution,
    ]),
  );

  for (const key of requestedExecutionKeys) {
    const execution = graph.executionsByKey.get(key);
    if (execution) loadCandidates.set(key, execution);
  }

  const discoveryCandidates = new Map<ExecutionKey, ExecutionNode>();
  for (const seed of [rootExecutionKey, ...requestedExecutionKeys]) {
    for (const execution of getEagerExecutions(graph, seed, {
      childWorkflowDepth: 1,
      continuedRunDepthBefore: Infinity,
      continuedRunDepthAfter: Infinity,
    })) {
      discoveryCandidates.set(execution.executionKey, execution);
    }
  }

  const load = [...loadCandidates.values()].filter(
    (execution) =>
      historiesByKey.get(execution.executionKey)?.load.status === 'pending',
  );
  const discover = [...discoveryCandidates.values()].filter((execution) => {
    const history = historiesByKey.get(execution.executionKey);
    return (
      history?.discovery.status === 'pending' &&
      history.load.status !== 'loading' &&
      history.load.status !== 'loaded'
    );
  });
  const poll = autoRefreshEnabled
    ? [...loadCandidates.values()].filter(
        (execution) =>
          historiesByKey.get(execution.executionKey)?.load.status ===
            'loaded' && !terminalExecutionKeys.has(execution.executionKey),
      )
    : [];

  return { discover, load, poll };
}
