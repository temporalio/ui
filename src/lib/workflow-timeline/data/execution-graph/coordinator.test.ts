import { describe, expect, it, vi } from 'vitest';

import { ExecutionGraphCoordinator } from './coordinator';
import { ExecutionGraphRepository } from './repository';
import { ExecutionHistoryRepository } from '../execution-history/repository';
import { HistoryEventRepository } from '../history-events/repository';
import { getExecutionKey } from '../identity-keys';

vi.mock('../execution-history/load-execution-history', () => ({
  loadExecutionHistory: vi.fn(() => new Promise(() => {})),
}));

describe('ExecutionGraphCoordinator', () => {
  it('loads a discovered execution when its visible row requests history', () => {
    const graph = new ExecutionGraphRepository();
    const histories = new ExecutionHistoryRepository();
    const events = new HistoryEventRepository();
    const root = {
      namespace: 'default',
      workflowId: 'root',
      runId: 'root-run',
    };
    const grandchild = {
      namespace: 'default',
      workflowId: 'grandchild',
      runId: 'grandchild-run',
    };
    graph.addExecution(grandchild);
    const coordinator = new ExecutionGraphCoordinator(graph, histories, events);

    try {
      coordinator.start(root);
      expect(
        histories.getExecutionHistory(getExecutionKey(grandchild))?.load.status,
      ).toBe('pending');

      coordinator.requestExecution(grandchild);
      expect(
        histories.getExecutionHistory(getExecutionKey(grandchild))?.load.status,
      ).toBe('loading');
      coordinator.requestExecution(grandchild);
      expect(histories.getSnapshot().length).toBe(2);
    } finally {
      coordinator.dispose();
    }
  });
});
