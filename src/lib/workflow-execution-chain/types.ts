import type { WorkflowHistoryController } from '$lib/services/workflow-history-controller.svelte';
import type { HistoryEvent } from '$lib/types/events';
import type { NetworkError } from '$lib/types/global';
import type {
  WorkflowExecution,
  WorkflowExecutionIdentity,
} from '$lib/types/workflows';

export type WorkflowExecutionChainIdentity = {
  namespace: string;
  workflowId: string;
  firstRunId: string;
};

export type ChainRun = {
  runId: string;
  workflow: WorkflowExecution;
  startedEvent: HistoryEvent;
};

export type ChainStatus =
  | 'loading'
  | 'ready'
  | 'mismatch'
  | 'closed'
  | 'discoveryError';

export type ChainBoundary = 'chainStart' | 'retention' | null;

export type ChainError = NetworkError | Error;

export type FirstRunState =
  | { status: 'loading' }
  | { status: 'found'; workflow: WorkflowExecution }
  | { status: 'notFound' }
  | { status: 'failed'; error: ChainError };

export type ChainMismatch = {
  reason: 'workflowIdReused' | 'routeChainNotFound';
  currentFirstRunId: string;
};

export type DescribeParameters = {
  namespace: string;
  workflowId: string;
  runId?: string;
};

export type ChainClient = {
  describe: (
    parameters: DescribeParameters,
    signal: AbortSignal,
  ) => Promise<WorkflowExecution>;
  fetchStartedEvent: (
    identity: WorkflowExecutionIdentity,
    signal: AbortSignal,
  ) => Promise<HistoryEvent>;
  createController: (
    identity: WorkflowExecutionIdentity,
    options: { onClose: (closeEvent: HistoryEvent) => void },
  ) => WorkflowHistoryController;
};
