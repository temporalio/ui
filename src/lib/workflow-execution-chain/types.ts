import type { RunCounts } from '$lib/models/event-history/run-counts';
import type { LazyGroup } from '$lib/services/grouped-event-buffer';
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

export type ChainLifecycle = 'following' | 'closed';

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

export type ChainResolution =
  | { kind: 'resolving' }
  | { kind: 'failed'; error: ChainError }
  | { kind: 'mismatch'; mismatch: ChainMismatch }
  | { kind: 'resolved' };

export type ChainLoadResult = {
  redirectFirstRunId: string | null;
};

export type RunBarGroup = Pick<LazyGroup, 'category' | 'isPending'>;

/**
 * What a closed Run's card keeps once its history is released: enough to
 * draw the card and to answer close-time and SDK lookups.
 */
export type RunCardSummary = {
  counts: RunCounts;
  barGroups: RunBarGroup[];
  closeEvent: HistoryEvent | null;
  sdkInfo: { sdk: string; version: string };
};

export type RunLookup<T> = {
  get: (runId: string) => T | undefined;
  has: (runId: string) => boolean;
};

export type DiscoveryStep =
  | 'walkBack'
  | 'handOff'
  | 'refresh'
  | 'finalDescribe'
  | 'closeEvent';

export type ChainEvent =
  | { type: 'handOff'; runId: string }
  | { type: 'closed' }
  | { type: 'discoveryError'; step: DiscoveryStep };

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
  fetchCloseEvent: (
    identity: WorkflowExecutionIdentity,
    signal: AbortSignal,
  ) => Promise<HistoryEvent>;
  createController: (
    identity: WorkflowExecutionIdentity,
    callbacks: ControllerCallbacks,
  ) => WorkflowHistoryController;
};
