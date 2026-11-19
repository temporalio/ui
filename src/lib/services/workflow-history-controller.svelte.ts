import { createContext } from 'svelte';

import { isWorkflowOpen } from '$lib/models/workflow-status';
import type { HistoryEvent } from '$lib/types/events';
import type { NetworkError } from '$lib/types/global';
import type {
  WorkflowExecution,
  WorkflowExecutionIdentity,
} from '$lib/types/workflows';
import { isWorkflowCloseEvent } from '$lib/utilities/is-event-type';
import { routeForApi } from '$lib/utilities/route-for-api';
import { toError } from '$lib/utilities/to-error';

import {
  fetchBidirectional,
  fetchHistoryTail,
  type PauseHandle,
} from './fetch-bidirectional';
import {
  createGroupedEventBuffer,
  type GroupedEventBuffer,
} from './grouped-event-buffer';
import { runLivePoll } from './live-poll';

import { EventBufferView } from './grouped-event-buffer.svelte';

export const [getWorkflowHistoryController, setWorkflowHistoryController] =
  createContext<WorkflowHistoryController>();

/**
 * What the controller is doing with a Run's history.
 *
 * - `idle`: nothing loaded yet, or the controller was disposed.
 * - `loadingClosedRun`: the Run is closed, so its history is final. Pages are
 *   fetched from both ends until they meet; nothing is polled. `pauseHandle`
 *   is set while the fetch waits at `pauseAfterPages` for `resume()`.
 * - `loadingOpenRun`: the Run is open. The newest page (starting at
 *   `tailStartId`, 0 until it arrives) is fetched once while a long-poll reads
 *   forward from the first event. Loading ends when the poll reaches that page.
 * - `loadingPaused`: `loadingOpenRun` with the poll stopped at
 *   `pauseAfterPages`, until `resume()` asks for the full history. The newest
 *   page can still arrive and finish loading.
 * - `live`: all history so far is loaded; the long-poll adds new events as
 *   they happen.
 * - `liveUpdatesPaused`: all history so far is loaded, but polling is stopped
 *   by `setLiveUpdatesPaused(true)` (the run page's refresh toggle).
 * - `complete`: all history is loaded and the Run has closed; nothing more
 *   will arrive.
 * - `failed`: a fetch or poll failed. `retry()` resumes from the saved poll
 *   cursor and keeps the events loaded so far.
 */
type HistoryPhase =
  | { kind: 'idle' }
  | { kind: 'loadingClosedRun'; pauseHandle: PauseHandle | null }
  | { kind: 'loadingOpenRun'; tailStartId: number }
  | { kind: 'loadingPaused'; tailStartId: number }
  | { kind: 'live' }
  | { kind: 'liveUpdatesPaused' }
  | { kind: 'complete' }
  | { kind: 'failed'; error: Error | NetworkError };

type HistoryLoadSession = {
  fetchAbortController: AbortController;
  livePollAbortController: AbortController | null;
  livePollTask: Promise<void> | null;
  lastPollToken: string;
  lastPollEventId: number;
  pollPages: number;
  finishCatchUp: () => void;
};

type WorkflowHistoryControllerOptions = {
  workflowExecutionIdentity: WorkflowExecutionIdentity;
  buffer?: GroupedEventBuffer;
  maximumPageSize?: number;
  pauseAfterPages?: number;
  liveUpdatesPaused?: boolean;
  onClose?: (closeEvent: HistoryEvent) => void;
  onFirstEvent?: () => void;
  onLivePollError?: (error: Error | NetworkError) => void;
};

export class WorkflowHistoryController {
  readonly workflowExecutionIdentity: Readonly<WorkflowExecutionIdentity>;
  readonly history: EventBufferView;

  phase = $state.raw<HistoryPhase>({ kind: 'idle' });
  fetchComplete = $state(false);
  latestEventId = $state(0);
  totalExpectedEvents = $state(0);
  descMinId = $state(0);
  closeEvent = $state.raw<HistoryEvent | null>(null);

  private _disposed = false;
  private _historyRequested = false;
  private _firstEventReported = false;
  private _liveUpdatesPaused: boolean;
  private _session: HistoryLoadSession | null = null;
  private readonly _buffer: GroupedEventBuffer;
  private readonly _maximumPageSize: number;
  private readonly _pauseAfterPages: number | undefined;
  private readonly _onClose: ((closeEvent: HistoryEvent) => void) | undefined;
  private readonly _onFirstEvent: (() => void) | undefined;
  private readonly _onLivePollError:
    | ((error: Error | NetworkError) => void)
    | undefined;

  constructor({
    workflowExecutionIdentity,
    buffer = createGroupedEventBuffer(),
    maximumPageSize = 1000,
    pauseAfterPages,
    liveUpdatesPaused = false,
    onClose,
    onFirstEvent,
    onLivePollError,
  }: WorkflowHistoryControllerOptions) {
    const { namespace, workflowId, runId } = workflowExecutionIdentity;
    if (!namespace || !workflowId || !runId) {
      throw new Error(
        'Workflow history requires a namespace, Workflow ID, and Run ID.',
      );
    }
    this.workflowExecutionIdentity = Object.freeze({
      ...workflowExecutionIdentity,
    });
    this._buffer = buffer;
    this.history = new EventBufferView(buffer);
    this._maximumPageSize = maximumPageSize;
    this._pauseAfterPages = pauseAfterPages;
    this._liveUpdatesPaused = liveUpdatesPaused;
    this._onClose = onClose;
    this._onFirstEvent = onFirstEvent;
    this._onLivePollError = onLivePollError;
  }

  get loading(): boolean {
    return (
      this.phase.kind === 'loadingClosedRun' ||
      this.phase.kind === 'loadingOpenRun' ||
      this.phase.kind === 'loadingPaused'
    );
  }

  get error(): Error | NetworkError | null {
    return this.phase.kind === 'failed' ? this.phase.error : null;
  }

  load(workflow: WorkflowExecution): Promise<void> {
    return this._loadHistory(workflow, { preserveHistory: false });
  }

  retry(workflow: WorkflowExecution): Promise<void> {
    return this._loadHistory(workflow, { preserveHistory: true });
  }

  updateWorkflow(workflow: WorkflowExecution): void {
    if (this._disposed) {
      return;
    }
    this._verifyWorkflow(workflow);
    this._buffer.setPendingMetadata(
      workflow.pendingActivities ?? [],
      workflow.pendingNexusOperations ?? [],
    );
  }

  setLiveUpdatesPaused(paused: boolean): void {
    if (this._disposed) {
      return;
    }
    this._liveUpdatesPaused = paused;
    const session = this._session;
    if (!session) {
      return;
    }
    if (paused && this.phase.kind === 'live') {
      this.phase = { kind: 'liveUpdatesPaused' };
    }
    if (!paused && this.phase.kind === 'liveUpdatesPaused') {
      this.phase = { kind: 'live' };
    }
    this._syncLivePoll(session);
  }

  resume(): void {
    if (this._disposed) {
      return;
    }
    this._historyRequested = true;
    const phase = this.phase;
    if (phase.kind === 'loadingClosedRun' && phase.pauseHandle) {
      this.phase = { kind: 'loadingClosedRun', pauseHandle: null };
      phase.pauseHandle.resume();
      return;
    }
    const session = this._session;
    if (phase.kind === 'loadingPaused' && session) {
      this.phase = { kind: 'loadingOpenRun', tailStartId: phase.tailStartId };
      this._startLivePoll(session);
    }
  }

  dispose(): void {
    if (this._disposed) {
      return;
    }
    this._disposed = true;
    this._stopSession();
    this.phase = { kind: 'idle' };
    this.history.dispose();
  }

  private async _loadHistory(
    workflow: WorkflowExecution,
    { preserveHistory }: { preserveHistory: boolean },
  ): Promise<void> {
    if (this._disposed) {
      throw new Error('Cannot load a disposed workflow history.');
    }
    this._verifyWorkflow(workflow);
    const lastPollToken = preserveHistory
      ? (this._session?.lastPollToken ?? '')
      : '';
    const lastPollEventId =
      preserveHistory && lastPollToken
        ? (this._session?.lastPollEventId ?? 0)
        : 0;
    this._stopSession();

    this.fetchComplete = false;
    if (!preserveHistory) {
      this.latestEventId = 0;
      this.totalExpectedEvents = 0;
      this.descMinId = 0;
      this.closeEvent = null;
      this._buffer.reset(parseInt(workflow.historyEvents ?? '0') || 0);
    }
    this._buffer.setPendingMetadata(
      workflow.pendingActivities ?? [],
      workflow.pendingNexusOperations ?? [],
    );

    const session: HistoryLoadSession = {
      fetchAbortController: new AbortController(),
      livePollAbortController: null,
      livePollTask: null,
      lastPollToken,
      lastPollEventId,
      pollPages: 0,
      finishCatchUp: () => {},
    };
    this._session = session;

    if (isWorkflowOpen(workflow)) {
      this.phase = { kind: 'loadingOpenRun', tailStartId: 0 };
      await this._loadOpenHistory(session);
      return;
    }

    this.phase = { kind: 'loadingClosedRun', pauseHandle: null };
    await this._loadClosedHistory(session);
  }

  private async _loadClosedHistory(session: HistoryLoadSession): Promise<void> {
    const { signal } = session.fetchAbortController;
    try {
      await fetchBidirectional({
        ...this.workflowExecutionIdentity,
        signal,
        maximumPageSize: this._maximumPageSize,
        pauseAfterPages: this._pauseAfterPages,
        onProgress: (progress) => {
          if (!this._isCurrent(session) || signal.aborted) {
            return;
          }
          this.totalExpectedEvents = Math.max(
            this.totalExpectedEvents,
            progress.totalEstimated,
          );
          if (progress.descMinId > 0) {
            this.descMinId = this.descMinId
              ? Math.min(this.descMinId, progress.descMinId)
              : progress.descMinId;
          }
        },
        onPause: (handle) => {
          if (
            !this._isCurrent(session) ||
            signal.aborted ||
            this._historyRequested
          ) {
            handle.resume();
            return;
          }
          this.phase = { kind: 'loadingClosedRun', pauseHandle: handle };
        },
        onRawPage: (events) => {
          if (!this._isCurrent(session) || signal.aborted) {
            return;
          }
          for (const event of events) {
            this._ingestEvent(event, session);
          }
        },
      });
      if (!this._isCurrent(session)) {
        return;
      }
      this.phase = { kind: 'complete' };
      this.fetchComplete = true;
    } catch (error) {
      if (!this._isCurrent(session)) {
        return;
      }
      const phase = this.phase;
      this.phase = { kind: 'failed', error: toError(error) };
      session.fetchAbortController.abort();
      if (phase.kind === 'loadingClosedRun') {
        phase.pauseHandle?.resume();
      }
    }
  }

  private async _loadOpenHistory(session: HistoryLoadSession): Promise<void> {
    const caughtUp = new Promise<void>((resolve) => {
      session.finishCatchUp = resolve;
    });
    this._startLivePoll(session);
    void this._loadTail(session);
    await caughtUp;
  }

  private async _loadTail(session: HistoryLoadSession): Promise<void> {
    try {
      const events = await fetchHistoryTail({
        ...this.workflowExecutionIdentity,
        signal: session.fetchAbortController.signal,
        maximumPageSize: this._maximumPageSize,
      });
      if (!this._isCurrent(session)) {
        return;
      }
      const eventIds = events.map((event) => parseInt(event.eventId) || 0);
      for (const event of events) {
        this._ingestEvent(event, session);
      }
      session.pollPages++;
      const tailStartId = eventIds.length ? Math.min(...eventIds) : 1;
      this.totalExpectedEvents = Math.max(
        this.totalExpectedEvents,
        ...eventIds,
      );
      this.descMinId = this.descMinId
        ? Math.min(this.descMinId, tailStartId)
        : tailStartId;
      const phase = this.phase;
      if (phase.kind === 'loadingOpenRun' || phase.kind === 'loadingPaused') {
        this.phase = { ...phase, tailStartId };
      }
      this._finishCatchUpIfCaughtUp(session);
      this._syncLivePoll(session);
    } catch (error) {
      if (!this._isCurrent(session)) {
        return;
      }
      this.phase = { kind: 'failed', error: toError(error) };
      session.fetchAbortController.abort();
      session.livePollAbortController?.abort();
      session.finishCatchUp();
    }
  }

  private _finishCatchUpIfCaughtUp(session: HistoryLoadSession): void {
    const phase = this.phase;
    if (phase.kind !== 'loadingOpenRun' && phase.kind !== 'loadingPaused') {
      return;
    }
    if (!phase.tailStartId) {
      return;
    }
    if (session.lastPollEventId < phase.tailStartId - 1) {
      return;
    }
    this.fetchComplete = true;
    this.phase = this._phaseAfterLoad();
    session.finishCatchUp();
  }

  private _phaseAfterLoad(): HistoryPhase {
    if (this.closeEvent) {
      return { kind: 'complete' };
    }
    if (this._liveUpdatesPaused) {
      return { kind: 'liveUpdatesPaused' };
    }
    return { kind: 'live' };
  }

  private _pauseAtPageLimit(session: HistoryLoadSession): void {
    const phase = this.phase;
    if (
      phase.kind !== 'loadingOpenRun' ||
      this._historyRequested ||
      this._pauseAfterPages === undefined ||
      session.pollPages < this._pauseAfterPages
    ) {
      return;
    }
    this.phase = {
      kind: 'loadingPaused',
      tailStartId: phase.tailStartId,
    };
  }

  private _verifyWorkflow(workflow: WorkflowExecution): void {
    if (
      workflow.id !== this.workflowExecutionIdentity.workflowId ||
      workflow.runId !== this.workflowExecutionIdentity.runId
    ) {
      throw new Error('Workflow does not match this history controller.');
    }
  }

  private _isCurrent(session: HistoryLoadSession): boolean {
    return !this._disposed && this._session === session;
  }

  private _canPoll(session: HistoryLoadSession): boolean {
    if (!this._isCurrent(session)) {
      return false;
    }
    switch (this.phase.kind) {
      case 'loadingOpenRun':
      case 'live':
        return true;
      default:
        return false;
    }
  }

  private _ingestEvent(
    event: HistoryEvent,
    session: HistoryLoadSession,
  ): boolean {
    if (!this._isCurrent(session)) {
      return false;
    }
    const isNew = this._buffer.ingestHistoryEvent(event);
    this.latestEventId = Math.max(
      this.latestEventId,
      parseInt(event.eventId) || 0,
    );
    if (isNew) {
      this._reportFirstEvent();
    }
    if (isWorkflowCloseEvent(event)) {
      this._handleCloseEvent(event, session);
    }
    return isNew;
  }

  private _reportFirstEvent(): void {
    if (this._firstEventReported) {
      return;
    }
    if (this._buffer.getLazyGroups().length === 0) {
      return;
    }
    this._firstEventReported = true;
    this._onFirstEvent?.();
  }

  private _handleCloseEvent(
    event: HistoryEvent,
    session: HistoryLoadSession,
  ): void {
    if (this.phase.kind === 'live' || this.phase.kind === 'liveUpdatesPaused') {
      this.phase = { kind: 'complete' };
    }
    this._syncLivePoll(session);
    if (this.closeEvent) {
      return;
    }
    this.closeEvent = event;
    this._onClose?.(event);
  }

  private _syncLivePoll(session: HistoryLoadSession): void {
    if (!this._canPoll(session)) {
      session.livePollAbortController?.abort();
      return;
    }
    this._startLivePoll(session);
  }

  private _startLivePoll(session: HistoryLoadSession): void {
    if (!this._canPoll(session) || session.livePollTask) {
      return;
    }
    const abortController = new AbortController();
    session.livePollAbortController = abortController;
    session.livePollTask = runLivePoll({
      route: routeForApi('events.ascending', this.workflowExecutionIdentity),
      runId: this.workflowExecutionIdentity.runId,
      startToken: session.lastPollToken,
      maximumPageSize: this._maximumPageSize,
      signal: abortController.signal,
      shouldRetryError: () => this.phase.kind !== 'loadingOpenRun',
      onEvent: (event) => {
        if (abortController.signal.aborted) {
          return false;
        }
        const isNew = this._ingestEvent(event, session);
        session.lastPollEventId = Math.max(
          session.lastPollEventId,
          parseInt(event.eventId) || 0,
        );
        this._finishCatchUpIfCaughtUp(session);
        return isNew;
      },
      onToken: (token) => {
        if (!this._isCurrent(session) || abortController.signal.aborted) {
          return;
        }
        session.lastPollToken = token;
        session.pollPages++;
        this._pauseAtPageLimit(session);
        this._syncLivePoll(session);
      },
    })
      .catch((error) => {
        if (!this._isCurrent(session) || abortController.signal.aborted) {
          return;
        }
        const pollError = toError(error);
        this.phase = { kind: 'failed', error: pollError };
        abortController.abort();
        session.finishCatchUp();
        this._onLivePollError?.(pollError);
      })
      .finally(() => {
        session.livePollTask = null;
        session.livePollAbortController = null;
        if (abortController.signal.aborted) {
          this._startLivePoll(session);
        }
      });
  }

  private _stopSession(): void {
    const session = this._session;
    this._session = null;
    session?.fetchAbortController.abort();
    session?.livePollAbortController?.abort();
    session?.finishCatchUp();
    const phase = this.phase;
    if (phase.kind === 'loadingClosedRun') {
      phase.pauseHandle?.resume();
    }
  }
}
