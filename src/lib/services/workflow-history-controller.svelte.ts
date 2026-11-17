import { createContext } from 'svelte';

import type { HistoryEvent } from '$lib/types/events';
import type { NetworkError } from '$lib/types/global';
import type {
  WorkflowExecution,
  WorkflowExecutionIdentity,
} from '$lib/types/workflows';
import { getErrorMessage } from '$lib/utilities/error-message';
import { isWorkflowCloseEvent } from '$lib/utilities/is-event-type';
import { isNetworkError } from '$lib/utilities/is-network-error';
import { routeForApi } from '$lib/utilities/route-for-api';

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

type HistoryLoadSession = {
  controller: AbortController;
  livePollController: AbortController | null;
  livePollTask: Promise<void> | null;
  livePollFailed: boolean;
  lastPollToken: string;
  lastPollEventId: number;
  workflowWasRunning: boolean;
  catchingUp: boolean;
  tailStartId: number;
  pollPages: number;
  pollPausedAtPageLimit: boolean;
  finishCatchUp: () => void;
};

type WorkflowHistoryControllerOptions = {
  workflowExecutionIdentity: WorkflowExecutionIdentity;
  buffer?: GroupedEventBuffer;
  maximumPageSize?: number;
  pauseAfterPages?: number;
  liveUpdatesPaused?: boolean;
  onClose?: (closeEvent: HistoryEvent) => void;
};

export class WorkflowHistoryController {
  readonly workflowExecutionIdentity: Readonly<WorkflowExecutionIdentity>;
  readonly history: EventBufferView;

  fetchComplete = $state(false);
  latestEventId = $state(0);
  totalExpectedEvents = $state(0);
  descMinId = $state(0);
  error = $state.raw<Error | NetworkError | null>(null);
  closeEvent = $state.raw<HistoryEvent | null>(null);

  private started = $state(false);
  private disposed = false;
  private historyRequested = false;
  private historyClosed = false;
  private liveUpdatesPaused: boolean;
  private pauseHandle: PauseHandle | null = null;
  private session: HistoryLoadSession | null = null;
  private readonly buffer: GroupedEventBuffer;
  private readonly maximumPageSize: number;
  private readonly pauseAfterPages: number | undefined;
  private readonly onClose: ((closeEvent: HistoryEvent) => void) | undefined;

  constructor({
    workflowExecutionIdentity,
    buffer = createGroupedEventBuffer(),
    maximumPageSize = 1000,
    pauseAfterPages,
    liveUpdatesPaused = false,
    onClose,
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
    this.buffer = buffer;
    this.history = new EventBufferView(buffer);
    this.maximumPageSize = maximumPageSize;
    this.pauseAfterPages = pauseAfterPages;
    this.liveUpdatesPaused = liveUpdatesPaused;
    this.onClose = onClose;
  }

  get loading(): boolean {
    return this.started && !this.fetchComplete;
  }

  load(workflow: WorkflowExecution): Promise<void> {
    return this.loadHistory(workflow, { preserveHistory: false });
  }

  retry(workflow: WorkflowExecution): Promise<void> {
    return this.loadHistory(workflow, { preserveHistory: true });
  }

  private async loadHistory(
    workflow: WorkflowExecution,
    { preserveHistory }: { preserveHistory: boolean },
  ): Promise<void> {
    if (this.disposed)
      throw new Error('Cannot load a disposed workflow history.');
    this.verifyWorkflow(workflow);
    const lastPollToken = preserveHistory
      ? (this.session?.lastPollToken ?? '')
      : '';
    const lastPollEventId =
      preserveHistory && lastPollToken
        ? (this.session?.lastPollEventId ?? 0)
        : 0;
    this.stopSession();

    this.fetchComplete = false;
    this.error = null;
    this.started = true;
    if (!preserveHistory) {
      this.latestEventId = 0;
      this.totalExpectedEvents = 0;
      this.descMinId = 0;
      this.historyClosed = false;
      this.closeEvent = null;
      this.buffer.reset(parseInt(workflow.historyEvents ?? '0') || 0);
    }
    this.buffer.setPendingMetadata(
      workflow.pendingActivities ?? [],
      workflow.pendingNexusOperations ?? [],
    );

    const session: HistoryLoadSession = {
      controller: new AbortController(),
      livePollController: null,
      livePollTask: null,
      livePollFailed: false,
      lastPollToken,
      lastPollEventId,
      workflowWasRunning: workflow.isRunning,
      catchingUp: workflow.isRunning,
      tailStartId: 0,
      pollPages: 0,
      pollPausedAtPageLimit: false,
      finishCatchUp: () => {},
    };
    this.session = session;

    if (workflow.isRunning) {
      await this.loadOpenHistory(session);
      return;
    }

    try {
      await fetchBidirectional({
        ...this.workflowExecutionIdentity,
        signal: session.controller.signal,
        maximumPageSize: this.maximumPageSize,
        pauseAfterPages: this.pauseAfterPages,
        onProgress: (progress) => {
          if (!this.isCurrent(session) || session.controller.signal.aborted)
            return;
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
            !this.isCurrent(session) ||
            session.controller.signal.aborted ||
            this.historyRequested
          ) {
            handle.resume();
            return;
          }
          this.pauseHandle = handle;
        },
        onRawPage: (events) => {
          if (!this.isCurrent(session) || session.controller.signal.aborted)
            return;
          for (const event of events) this.ingestEvent(event, session);
        },
      });
      if (this.isCurrent(session)) {
        this.pauseHandle = null;
        this.fetchComplete = true;
      }
    } catch (error) {
      if (!this.isCurrent(session)) return;
      this.error =
        error instanceof Error || isNetworkError(error)
          ? error
          : new Error(getErrorMessage(error));
      session.controller.abort();
      const handle = this.pauseHandle;
      this.pauseHandle = null;
      handle?.resume();
    } finally {
      if (this.isCurrent(session)) this.started = false;
    }
  }

  private async loadOpenHistory(session: HistoryLoadSession): Promise<void> {
    const caughtUp = new Promise<void>((resolve) => {
      session.finishCatchUp = resolve;
    });
    this.startLivePoll(session);
    void this.loadTail(session);
    await caughtUp;
    if (this.isCurrent(session)) this.started = false;
  }

  private async loadTail(session: HistoryLoadSession): Promise<void> {
    try {
      const events = await fetchHistoryTail({
        ...this.workflowExecutionIdentity,
        signal: session.controller.signal,
        maximumPageSize: this.maximumPageSize,
      });
      if (!this.isCurrent(session)) return;
      const eventIds = events.map((event) => parseInt(event.eventId) || 0);
      for (const event of events) this.ingestEvent(event, session);
      session.pollPages++;
      session.tailStartId = eventIds.length ? Math.min(...eventIds) : 1;
      this.totalExpectedEvents = Math.max(
        this.totalExpectedEvents,
        ...eventIds,
      );
      this.descMinId = this.descMinId
        ? Math.min(this.descMinId, session.tailStartId)
        : session.tailStartId;
      this.checkCaughtUp(session);
      this.syncLivePoll(session);
    } catch (error) {
      if (!this.isCurrent(session)) return;
      this.error =
        error instanceof Error || isNetworkError(error)
          ? error
          : new Error(getErrorMessage(error));
      session.controller.abort();
      session.livePollFailed = true;
      session.livePollController?.abort();
      this.endCatchUp(session);
    }
  }

  private checkCaughtUp(session: HistoryLoadSession): void {
    if (!session.catchingUp || !session.tailStartId) return;
    if (session.lastPollEventId < session.tailStartId - 1) return;
    this.fetchComplete = true;
    this.endCatchUp(session);
  }

  private endCatchUp(session: HistoryLoadSession): void {
    session.catchingUp = false;
    if (session.pollPausedAtPageLimit) {
      session.pollPausedAtPageLimit = false;
      this.pauseHandle = null;
    }
    session.finishCatchUp();
  }

  private syncLivePoll(session: HistoryLoadSession): void {
    if (!this.canPoll(session)) {
      session.livePollController?.abort();
      return;
    }
    this.startLivePoll(session);
  }

  private pauseAtPageLimit(session: HistoryLoadSession): void {
    if (
      !session.catchingUp ||
      this.historyRequested ||
      this.pauseAfterPages === undefined ||
      session.pollPages < this.pauseAfterPages
    ) {
      return;
    }
    session.pollPausedAtPageLimit = true;
    this.pauseHandle = {
      resume: () => {
        session.pollPausedAtPageLimit = false;
        this.startLivePoll(session);
      },
    };
  }

  updateWorkflow(workflow: WorkflowExecution): void {
    if (this.disposed) return;
    this.verifyWorkflow(workflow);
    this.buffer.setPendingMetadata(
      workflow.pendingActivities ?? [],
      workflow.pendingNexusOperations ?? [],
    );
    const session = this.session;
    if (!session) return;
    session.workflowWasRunning ||= workflow.isRunning;
    this.startLivePoll(session);
  }

  setLiveUpdatesPaused(paused: boolean): void {
    if (this.disposed) return;
    this.liveUpdatesPaused = paused;
    const session = this.session;
    if (!session) return;
    if (paused) {
      if (!session.catchingUp) session.livePollController?.abort();
      return;
    }
    this.startLivePoll(session);
  }

  resume(): void {
    if (this.disposed) return;
    this.historyRequested = true;
    const handle = this.pauseHandle;
    this.pauseHandle = null;
    handle?.resume();
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.started = false;
    this.stopSession();
    this.history.dispose();
  }

  private verifyWorkflow(workflow: WorkflowExecution): void {
    if (
      workflow.id !== this.workflowExecutionIdentity.workflowId ||
      workflow.runId !== this.workflowExecutionIdentity.runId
    ) {
      throw new Error('Workflow does not match this history controller.');
    }
  }

  private isCurrent(session: HistoryLoadSession): boolean {
    return !this.disposed && this.session === session;
  }

  private canPoll(session: HistoryLoadSession): boolean {
    return (
      this.isCurrent(session) &&
      !session.pollPausedAtPageLimit &&
      !session.livePollFailed &&
      (session.catchingUp ||
        (!this.liveUpdatesPaused &&
          session.workflowWasRunning &&
          !this.historyClosed))
    );
  }

  private ingestEvent(
    event: HistoryEvent,
    session: HistoryLoadSession,
  ): boolean {
    if (!this.isCurrent(session)) return false;
    const isNew = this.buffer.ingestHistoryEvent(event);
    this.latestEventId = Math.max(
      this.latestEventId,
      parseInt(event.eventId) || 0,
    );
    if (isWorkflowCloseEvent(event)) {
      this.historyClosed = true;
      this.closeEvent = event;
      if (!session.catchingUp) session.livePollController?.abort();
      this.onClose?.(event);
    }
    return isNew;
  }

  private startLivePoll(session: HistoryLoadSession): void {
    if (!this.canPoll(session) || session.livePollTask) return;
    const controller = new AbortController();
    session.livePollController = controller;
    session.livePollTask = runLivePoll({
      route: routeForApi('events.ascending', this.workflowExecutionIdentity),
      runId: this.workflowExecutionIdentity.runId,
      startToken: session.lastPollToken,
      maximumPageSize: this.maximumPageSize,
      signal: controller.signal,
      shouldRetryError: () => !session.catchingUp,
      onEvent: (event) => {
        if (controller.signal.aborted) return false;
        const isNew = this.ingestEvent(event, session);
        session.lastPollEventId = Math.max(
          session.lastPollEventId,
          parseInt(event.eventId) || 0,
        );
        this.checkCaughtUp(session);
        return isNew;
      },
      onToken: (token) => {
        if (!this.isCurrent(session) || controller.signal.aborted) return;
        session.lastPollToken = token;
        session.pollPages++;
        this.pauseAtPageLimit(session);
        this.syncLivePoll(session);
      },
    })
      .then(() => {
        if (!this.isCurrent(session) || controller.signal.aborted) return;
        this.historyClosed = true;
      })
      .catch((error) => {
        if (!this.isCurrent(session) || controller.signal.aborted) return;
        this.error =
          error instanceof Error || isNetworkError(error)
            ? error
            : new Error(getErrorMessage(error));
        session.livePollFailed = true;
        controller.abort();
        this.endCatchUp(session);
      })
      .finally(() => {
        session.livePollTask = null;
        session.livePollController = null;
        if (controller.signal.aborted) this.startLivePoll(session);
      });
  }

  private stopSession(): void {
    const session = this.session;
    this.session = null;
    session?.controller.abort();
    session?.livePollController?.abort();
    session?.finishCatchUp();
    const handle = this.pauseHandle;
    this.pauseHandle = null;
    handle?.resume();
  }
}
