import type { ExecutionGraphSnapshot, ExecutionNode } from './types';
import { type ExecutionKey, getExecutionKey } from '../identity-keys';

/** Maximum relationship depths whose histories should load eagerly. */
export type EagerExecutionDepths = Readonly<{
  childWorkflowDepth: number;
  continuedRunDepthBefore: number;
  continuedRunDepthAfter: number;
}>;

const defaultDepths: EagerExecutionDepths = {
  childWorkflowDepth: 1,
  continuedRunDepthBefore: 0,
  continuedRunDepthAfter: Infinity,
};

function addRelatedExecution(
  relatedExecutionsBySource: Map<ExecutionKey, ExecutionKey[]>,
  source: ExecutionKey,
  target: ExecutionKey,
): void {
  const targets = relatedExecutionsBySource.get(source) ?? [];
  targets.push(target);
  relatedExecutionsBySource.set(source, targets);
}

type Position = Readonly<{
  executionKey: ExecutionKey;
  childDepth: number;
  runsBefore: number;
  runsAfter: number;
}>;

type VisitKey = `visit:(${string})`;

function getVisitKey(
  position: Position,
  depths: EagerExecutionDepths,
): VisitKey {
  // Unbounded depths must not create new keys on every pass through a cycle.
  return `visit:(${JSON.stringify({
    executionKey: position.executionKey,
    childDepth:
      depths.childWorkflowDepth === Infinity ? null : position.childDepth,
    runsBefore:
      depths.continuedRunDepthBefore === Infinity ? null : position.runsBefore,
    runsAfter:
      depths.continuedRunDepthAfter === Infinity ? null : position.runsAfter,
  })})`;
}

/** Returns known executions eligible for eager history loading from the root. */
export function getEagerExecutions(
  graph: ExecutionGraphSnapshot,
  rootExecutionKey: ExecutionKey,
  depths: EagerExecutionDepths = defaultDepths,
): readonly ExecutionNode[] {
  const childrenByParent = new Map<ExecutionKey, ExecutionKey[]>();
  const nextByPrevious = new Map<ExecutionKey, ExecutionKey[]>();
  const previousByNext = new Map<ExecutionKey, ExecutionKey[]>();

  for (const relation of graph.relations) {
    if (relation.kind === 'child-workflow') {
      addRelatedExecution(
        childrenByParent,
        relation.parentExecutionKey,
        getExecutionKey(relation.childExecutionIdentity),
      );
    } else {
      const nextExecutionKey = getExecutionKey(relation.nextExecutionIdentity);
      addRelatedExecution(
        nextByPrevious,
        relation.previousExecutionKey,
        nextExecutionKey,
      );
      addRelatedExecution(
        previousByNext,
        nextExecutionKey,
        relation.previousExecutionKey,
      );
    }
  }

  const eligibleExecutionsByKey = new Map<ExecutionKey, ExecutionNode>();
  const visitedPositionKeys = new Set<VisitKey>();
  const positionsToVisit: Position[] = [
    {
      executionKey: rootExecutionKey,
      childDepth: 0,
      runsBefore: 0,
      runsAfter: 0,
    },
  ];

  // Iteration includes positions appended as relationships are followed.
  for (const position of positionsToVisit) {
    const visitKey = getVisitKey(position, depths);

    if (visitedPositionKeys.has(visitKey)) {
      continue;
    }

    visitedPositionKeys.add(visitKey);
    const execution = graph.executionsByKey.get(position.executionKey);

    if (!execution) {
      continue;
    }

    eligibleExecutionsByKey.set(position.executionKey, execution);

    if (position.childDepth < depths.childWorkflowDepth) {
      const childrenKeys = childrenByParent.get(position.executionKey) ?? [];

      for (const childKey of childrenKeys) {
        positionsToVisit.push({
          executionKey: childKey,
          childDepth: position.childDepth + 1,
          runsBefore: 0,
          runsAfter: 0,
        });
      }
    }

    if (position.runsAfter < depths.continuedRunDepthAfter) {
      const nextKeys = nextByPrevious.get(position.executionKey) ?? [];

      for (const nextKey of nextKeys) {
        positionsToVisit.push({
          ...position,
          executionKey: nextKey,
          runsAfter: position.runsAfter + 1,
        });
      }
    }

    if (position.runsBefore < depths.continuedRunDepthBefore) {
      const previousKeys = previousByNext.get(position.executionKey) ?? [];

      for (const previousKey of previousKeys) {
        positionsToVisit.push({
          ...position,
          executionKey: previousKey,
          runsBefore: position.runsBefore + 1,
        });
      }
    }
  }

  return Array.from(eligibleExecutionsByKey.values());
}
