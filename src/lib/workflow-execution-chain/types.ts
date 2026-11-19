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

export type ChainStatus = 'loading' | 'ready' | 'mismatch' | 'closed';

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

export type ChainLoadResult = {
  redirectFirstRunId: string | null;
};

export type RunLookup<T> = {
  get: (runId: string) => T | undefined;
  has: (runId: string) => boolean;
};

export type ChainEvent =
  | { type: 'handOff'; runId: string }
  | { type: 'closed' }
  | { type: 'discoveryError' };

export type CardLoad =
  | { status: 'queued' }
  | { status: 'loading' }
  | { status: 'loaded' }
  | { status: 'error'; error: ChainError; retryable: boolean };

export type ControllerCallbacks = {
  onClose: (closeEvent: HistoryEvent) => void;
  onFirstEvent: () => void;
  onLivePollError: (error: ChainError) => void;
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
    callbacks: ControllerCallbacks,
  ) => WorkflowHistoryController;
};
