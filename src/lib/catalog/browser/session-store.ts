import { get, type Readable, writable } from 'svelte/store';

import {
  logLaunchOutcome,
  logLaunchRequested,
  logObservationPaused,
  logObservationTerminal,
} from './execution-log';
import type { BrowserCatalogDescriptor, JsonValue } from './types';
import {
  type AcceptedLaunchOutcome,
  createAttemptIdentity,
  type ExecutionTerminalStatus,
  type LaunchOutcome,
  type LaunchReference,
  type LaunchTarget,
  type WorkbenchHost,
} from './workbench-host';

export type CatalogSessionState =
  | 'execution-terminal'
  | 'launch-rejected'
  | 'launch-uncertain'
  | 'observation-paused'
  | 'observing'
  | 'starting'
  | 'stopped';

export type CatalogSession = {
  id: string;
  createdAt: number;
  exampleId: string;
  exampleTitle: string;
  input: JsonValue;
  startOptions: JsonValue;
  reference: LaunchReference;
  targetFingerprint: string;
  outcome?: LaunchOutcome;
  state: CatalogSessionState;
  snapshot?: JsonValue;
  continuation?: JsonValue;
  terminalStatus?: ExecutionTerminalStatus;
  error?: string;
};

export type CatalogSessionStoreValue = {
  sessions: readonly CatalogSession[];
};

export type CatalogEditorDraft = {
  inputEditor: string;
  startOptionsEditor: string;
};

export type CatalogSessionStartRequest = {
  descriptor: BrowserCatalogDescriptor;
  input: JsonValue;
  startOptions: JsonValue;
  /**
   * Pins the execution id the attempt will use. Callers that show the id before
   * a run pass the value they displayed so the run matches what was on screen.
   */
  executionId?: string;
};

export type CatalogSessionStore = Readable<CatalogSessionStoreValue> & {
  start: (
    request: CatalogSessionStartRequest,
  ) => Promise<CatalogSession | undefined>;
  getDraft: (exampleId: string) => CatalogEditorDraft | undefined;
  setDraft: (exampleId: string, draft: CatalogEditorDraft) => void;
  getSessions: () => readonly CatalogSession[];
  latest: (
    exampleId: string,
    target: BrowserCatalogDescriptor['execution'] | LaunchTarget,
  ) => CatalogSession | undefined;
  pause: (attemptId: string) => void;
  resume: (attemptId: string) => void;
  stop: (attemptId: string) => void;
  reset: () => void;
  dispose: () => void;
};

type SessionStoreOptions = {
  createId?: () => string;
  now?: () => number;
  startAllowed?: (descriptor: BrowserCatalogDescriptor) => boolean;
};

const cloneJson = <T extends JsonValue>(value: T): T => structuredClone(value);

const cloneReference = (reference: LaunchReference): LaunchReference => ({
  exampleId: reference.exampleId,
  kind: reference.kind,
  attempt: { ...reference.attempt },
  target: { ...reference.target },
  ...(reference.runId === undefined ? {} : { runId: reference.runId }),
});

const cloneAcceptedReference = (
  reference: AcceptedLaunchOutcome['reference'],
): AcceptedLaunchOutcome['reference'] => ({
  ...cloneReference(reference),
  runId: reference.runId,
});

const targetFingerprint = (
  target: Pick<LaunchTarget, 'targetId' | 'namespace' | 'taskQueue'>,
) => `${target.targetId}:${target.namespace}:${target.taskQueue}`;

export const catalogTargetFingerprint = targetFingerprint;

const isAbortError = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'name' in error &&
  error.name === 'AbortError';

/**
 * Keeps catalog launches alive for one catalog refresh. It deliberately
 * has no persistence: callers create a fresh store when the catalog host refreshes.
 */
export const createCatalogSessionStore = (
  host: WorkbenchHost,
  {
    createId,
    now = Date.now,
    startAllowed = () => true,
  }: SessionStoreOptions = {},
): CatalogSessionStore => {
  let disposed = false;
  let sessions: CatalogSession[] = [];
  const drafts = new Map<string, CatalogEditorDraft>();
  const launchControllers = new Map<string, AbortController>();
  const observationControllers = new Map<string, AbortController>();
  const store = writable<CatalogSessionStoreValue>({ sessions });

  const publish = () => store.set({ sessions: [...sessions] });
  const find = (attemptId: string) =>
    sessions.find((session) => session.id === attemptId);
  const update = (
    attemptId: string,
    change: (session: CatalogSession) => CatalogSession,
  ) => {
    if (disposed) return;
    let changed = false;
    sessions = sessions.map((session) => {
      if (session.id !== attemptId) return session;
      changed = true;
      return change(session);
    });
    if (changed) publish();
  };

  const observe = async (attemptId: string, controller: AbortController) => {
    const session = find(attemptId);

    if (disposed || !session || session.outcome?.status !== 'accepted') return;
    const reference = cloneAcceptedReference(session.outcome.reference);
    let snapshot = session.snapshot;
    let continuation = session.continuation;

    update(attemptId, (current) => ({
      ...current,
      error: undefined,
      state: 'observing',
    }));

    try {
      while (!disposed && !controller.signal.aborted) {
        const observation = await host.observe(
          {
            reference,
            ...(continuation === undefined ? {} : { continuation }),
          },
          controller.signal,
        );
        if (disposed || observationControllers.get(attemptId) !== controller) {
          return;
        }

        snapshot = cloneJson(observation.snapshot);
        if (observation.state === 'terminal') {
          logObservationTerminal(reference, observation.status);
          observationControllers.delete(attemptId);
          update(attemptId, (current) => ({
            ...current,
            snapshot,
            terminalStatus: observation.status,
            state: 'execution-terminal',
          }));
          return;
        }

        continuation = cloneJson(observation.continuation);
        update(attemptId, (current) => ({
          ...current,
          snapshot,
          continuation,
          state: 'observing',
        }));
      }
    } catch (error) {
      if (
        disposed ||
        controller.signal.aborted ||
        isAbortError(error) ||
        observationControllers.get(attemptId) !== controller
      ) {
        return;
      }

      logObservationPaused(reference);
      observationControllers.delete(attemptId);
      update(attemptId, (current) => ({
        ...current,
        snapshot,
        continuation,
        error: 'Observation paused. Resume to keep checking this execution.',
        state: 'observation-paused',
      }));
    }
  };

  const start: CatalogSessionStore['start'] = async ({
    descriptor,
    input,
    startOptions,
    executionId,
  }) => {
    if (disposed || !startAllowed(descriptor)) return;

    const generated = createAttemptIdentity(createId);
    const attempt = executionId ? { ...generated, executionId } : generated;
    const reference = {
      exampleId: descriptor.id,
      kind: descriptor.execution.kind,
      attempt: { ...attempt },
      target: {
        targetId: descriptor.execution.targetId,
        namespace: descriptor.execution.namespace,
        taskQueue: descriptor.execution.taskQueue,
      },
    } satisfies LaunchReference;
    const session: CatalogSession = {
      id: attempt.attemptId,
      createdAt: now(),
      exampleId: descriptor.id,
      exampleTitle: descriptor.title,
      input: cloneJson(input),
      startOptions: cloneJson(startOptions),
      reference: cloneReference(reference),
      targetFingerprint: targetFingerprint(reference.target),
      state: 'starting',
    };
    const controller = new AbortController();

    launchControllers.set(session.id, controller);
    sessions = [session, ...sessions];
    publish();
    logLaunchRequested(reference);

    try {
      const outcome = await host.start(
        {
          exampleId: descriptor.id,
          attempt: { ...attempt },
          input: cloneJson(session.input),
          startOptions: cloneJson(session.startOptions),
        },
        controller.signal,
      );
      if (disposed || launchControllers.get(session.id) !== controller) return;

      launchControllers.delete(session.id);
      logLaunchOutcome(outcome);
      const outcomeReference = cloneReference(outcome.reference);
      const state =
        outcome.status === 'accepted'
          ? 'observing'
          : outcome.status === 'rejected'
            ? 'launch-rejected'
            : 'launch-uncertain';
      update(session.id, (current) => ({
        ...current,
        outcome,
        reference: outcomeReference,
        state,
      }));

      const current = find(session.id);
      if (outcome.status === 'accepted' && current?.state === 'observing') {
        const observationController = new AbortController();
        observationControllers.set(session.id, observationController);
        void observe(session.id, observationController);
      }
      return find(session.id);
    } catch (error) {
      if (disposed || launchControllers.get(session.id) !== controller) return;

      launchControllers.delete(session.id);
      if (controller.signal.aborted || isAbortError(error))
        return find(session.id);

      const rejected = {
        status: 'rejected' as const,
        reason: 'unable-to-start' as const,
        reference,
      };
      logLaunchOutcome(rejected);
      update(session.id, (current) => ({
        ...current,
        error: 'Unable to start this execution.',
        state: 'launch-rejected',
      }));
      return find(session.id);
    }
  };

  const pause = (attemptId: string) => {
    const controller = observationControllers.get(attemptId);
    const session = find(attemptId);
    if (!session || !controller) return;

    observationControllers.delete(attemptId);
    controller.abort();
    update(attemptId, (current) => ({
      ...current,
      state: 'observation-paused',
    }));
  };

  const resume = (attemptId: string) => {
    const session = find(attemptId);
    if (
      disposed ||
      !session ||
      session.state !== 'observation-paused' ||
      session.outcome?.status !== 'accepted'
    ) {
      return;
    }

    const controller = new AbortController();
    observationControllers.set(attemptId, controller);
    void observe(attemptId, controller);
  };

  const stop = (attemptId: string) => {
    const session = find(attemptId);
    if (!session) return;

    launchControllers.get(attemptId)?.abort();
    observationControllers.get(attemptId)?.abort();
    launchControllers.delete(attemptId);
    observationControllers.delete(attemptId);
    update(attemptId, (current) => ({ ...current, state: 'stopped' }));
  };

  const abortInFlight = () => {
    for (const controller of launchControllers.values()) controller.abort();
    for (const controller of observationControllers.values())
      controller.abort();
    launchControllers.clear();
    observationControllers.clear();
  };

  return {
    subscribe: store.subscribe,
    start,
    getDraft: (exampleId) => drafts.get(exampleId),
    setDraft: (exampleId, draft) => {
      drafts.set(exampleId, { ...draft });
    },
    getSessions: () => get(store).sessions,
    latest: (exampleId, target) => {
      const fingerprint = targetFingerprint(target);
      return get(store).sessions.find(
        (session) =>
          session.exampleId === exampleId &&
          session.targetFingerprint === fingerprint,
      );
    },
    pause,
    resume,
    stop,
    reset: () => {
      if (disposed) return;
      abortInFlight();
      sessions = [];
      drafts.clear();
      publish();
    },
    dispose: () => {
      if (disposed) return;
      disposed = true;
      abortInFlight();
    },
  };
};
