import type { WorkflowHistoryController } from '$lib/services/workflow-history-controller.svelte';
import type { ValidTime } from '$lib/utilities/format-time';

import { client as defaultClient } from './chain-client';
import type {
  CardLoad,
  ChainBoundary,
  ChainClient,
  ChainEvent,
  ChainLoadResult,
  ChainResolution,
  ChainRun,
  ChainStatus,
  FirstRunState,
  RunLookup,
  WorkflowExecutionChainIdentity,
} from './types';

import { CardLoader } from './card-loader.svelte';
import { type ChainContext, createChainContext } from './chain-context.svelte';
import { ChainLoader } from './chain-loader.svelte';
import { ChainWindow } from './chain-window.svelte';
import { LatestRunFollower } from './latest-run-follower.svelte';

export { REFRESH_INTERVAL_MS } from './latest-run-follower.svelte';

/**
 * A Workflow Execution chain: the Runs linked by continue-as-new, retry and
 * cron, loaded from the Latest Run backwards and followed live. The only
 * export of the chain model; it builds the parts below and wires them
 * together, and its public API is what the page, header and strip use.
 */
export class WorkflowExecutionChain {
  readonly identity: Readonly<WorkflowExecutionChainIdentity>;
  private readonly _context: ChainContext;
  private readonly _loader: ChainLoader;
  private readonly _window: ChainWindow;
  private readonly _follower: LatestRunFollower;
  private readonly _cards: CardLoader;

  constructor(
    identity: WorkflowExecutionChainIdentity,
    client: ChainClient = defaultClient,
  ) {
    const { namespace, workflowId, firstRunId } = identity;
    if (!namespace || !workflowId || !firstRunId) {
      throw new Error(
        'Workflow execution chain requires a namespace, Workflow ID, and first Run ID.',
      );
    }
    this.identity = { namespace, workflowId, firstRunId };
    this._context = createChainContext(this.identity, client);
    this._cards = new CardLoader(this._context, (runId, closeEvent) =>
      this._follower.handleClose(runId, closeEvent),
    );
    this._window = new ChainWindow(this._context, (runId) =>
      this._cards.enqueue(runId),
    );
    this._follower = new LatestRunFollower(this._context, {
      handedOff: (runId) => {
        this._window.append(runId);
        this._cards.latestRunChanged(runId);
      },
      workflowUpdated: (runId, workflow) =>
        this._cards.updateWorkflow(runId, workflow),
      closeEventOf: (runId) => this._cards.controllers.get(runId)?.closeEvent,
    });
    this._loader = new ChainLoader(this._context, (latestRun) =>
      this._startChain(latestRun),
    );
  }

  get resolution(): ChainResolution {
    return this._loader.resolution;
  }

  get status(): ChainStatus {
    const { kind } = this._loader.resolution;
    if (kind === 'mismatch') {
      return 'mismatch';
    }
    if (kind !== 'resolved') {
      return 'loading';
    }
    return this._follower.lifecycle === 'closed' ? 'closed' : 'ready';
  }

  get firstRun(): FirstRunState {
    return this._loader.firstRun;
  }

  get runs(): ChainRun[] {
    return this._window.runs;
  }

  get boundary(): ChainBoundary {
    return this._window.boundary;
  }

  get walking(): boolean {
    return this._window.walking;
  }

  get latestRunId(): string | null {
    return this._follower.latestRunId;
  }

  get pendingSuccessorRunId(): string | null {
    return this._follower.pendingSuccessorRunId;
  }

  get controllers(): RunLookup<WorkflowHistoryController> {
    return this._cards.controllers;
  }

  get cardLoads(): RunLookup<CardLoad> {
    return this._cards.cardLoads;
  }

  get failedOlderRunId(): string | null {
    return this._context.failures.runIdOf('walkBack');
  }

  get failedSuccessorRunId(): string | null {
    return this._context.failures.runIdOf('handOff');
  }

  get nextRunCheckFailed(): boolean {
    return this._context.failures.has('closeEvent');
  }

  isStatusStale(runId: string): boolean {
    const { failures } = this._context;
    return (
      failures.hasRun('refresh', runId) ||
      failures.hasRun('finalDescribe', runId)
    );
  }

  get closeTime(): ValidTime | undefined {
    const latestRunId = this._follower.latestRunId;
    if (this.status !== 'closed' || !latestRunId) {
      return undefined;
    }
    return (
      this._context.records.get(latestRunId)?.run?.workflow.endTime ||
      this._cards.controllers.get(latestRunId)?.closeEvent?.eventTime ||
      undefined
    );
  }

  subscribe(listener: (event: ChainEvent) => void): () => void {
    return this._context.subscribe(listener);
  }

  load(): Promise<ChainLoadResult> {
    return this._loader.load();
  }

  loadOlder(onRunAdded?: (runId: string) => void): Promise<void> {
    return this._window.loadOlder(onRunAdded);
  }

  prioritizeRun(runId: string | null): void {
    this._cards.prioritizeRun(runId);
  }

  cardLoadOf(runId: string): CardLoad {
    return this._cards.cardLoadOf(runId);
  }

  retryCard(runId: string): void {
    this._cards.retryCard(runId);
  }

  retryOlderRun(): void {
    this._context.failures.retry('walkBack');
  }

  retrySuccessorRun(): void {
    this._context.failures.retry('handOff');
  }

  retryNextRunCheck(): void {
    this._context.failures.retry('closeEvent');
  }

  retryStatus(runId: string): void {
    const { failures } = this._context;
    failures.retryRun('refresh', runId);
    failures.retryRun('finalDescribe', runId);
  }

  dispose(): void {
    if (this._context.disposed) {
      return;
    }
    this._context.dispose();
    this._cards.dispose();
    this._follower.dispose();
  }

  private _startChain(latestRun: ChainRun): void {
    this._window.seed(latestRun.runId);
    this._follower.start(latestRun);
    this._cards.latestRunChanged(latestRun.runId);
    void this._window.loadInitialRuns();
  }
}
