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

import { fetchBidirectional, type PauseHandle } from './fetch-bidirectional';
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
  workflowWasRunning: boolean;
};

type WorkflowHistoryControllerOptions = {
  workflowExecutionIdentity: WorkflowExecutionIdentity;
  buffer?: GroupedEventBuffer;
  maximumPageSize?: number;
  pauseAfterPages?: number;
  liveUpdatesPaused?: boolean;
};

export class WorkflowHistoryController {
  readonly workflowExecutionIdentity: Readonly<WorkflowExecutionIdentity>;
  readonly history: EventBufferView;

  fetchComplete = $state(false);
  latestEventId = $state(0);
  totalExpectedEvents = $state(0);
  descMinId = $state(0);
  error = $state.raw<Error | NetworkError | null>(null);

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

  constructor({
    workflowExecutionIdentity,
    buffer = createGroupedEventBuffer(),
    maximumPageSize = 1000,
    pauseAfterPages,
    liveUpdatesPaused = false,
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
    this.stopSession();

    this.fetchComplete = false;
    this.error = null;
    this.started = true;
    if (!preserveHistory) {
      this.latestEventId = 0;
      this.totalExpectedEvents = 0;
      this.descMinId = 0;
      this.historyClosed = false;
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
      workflowWasRunning: workflow.isRunning,
    };
    this.session = session;
    this.startLivePoll(session);

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
      session.livePollController?.abort();
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
      !this.liveUpdatesPaused &&
      !session.livePollFailed &&
      session.workflowWasRunning &&
      !this.historyClosed
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
      session.livePollController?.abort();
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
      signal: controller.signal,
      onEvent: (event) => {
        if (controller.signal.aborted) return false;
        return this.ingestEvent(event, session);
      },
      onToken: (token) => {
        if (this.isCurrent(session) && !controller.signal.aborted) {
          session.lastPollToken = token;
        }
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
    const handle = this.pauseHandle;
    this.pauseHandle = null;
    handle?.resume();
  }
}
