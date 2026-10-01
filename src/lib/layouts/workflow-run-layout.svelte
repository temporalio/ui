<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onMount, setContext, untrack } from 'svelte';

  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import WorkflowError from '$lib/components/workflow/workflow-error.svelte';
  import {
    HISTORY_CTX,
    type HistoryContext,
  } from '$lib/contexts/history-context';
  import {
    WORKFLOW_RUN_CTX,
    type WorkflowRunContext,
  } from '$lib/contexts/workflow-run-context';
  import Button from '$lib/holocene/button.svelte';
  import CopyButton from '$lib/holocene/copyable/button.svelte';
  import SkeletonWorkflow from '$lib/holocene/skeleton/workflow.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowHeader from '$lib/layouts/workflow-header.svelte';
  import {
    type ChainTransition,
    type ChainTruncationState,
    getPredecessorFromEvents,
    getSuccessorFromEvents,
    limitRetainedRuns,
    type RetainedTimelineRun,
    retainRunsWithinWindow,
    toTimelineGroups,
  } from '$lib/services/chain-workflow-session';
  import {
    fetchPartialRawEvents,
    throttleRefresh,
  } from '$lib/services/events-service';
  import type { PauseHandle } from '$lib/services/fetch-bidirectional';
  import { fetchBidirectional } from '$lib/services/fetch-bidirectional';
  import {
    createGroupedEventBuffer,
    getEventArray,
    getGroupArray,
    ingestHistoryEvent,
    replaceActiveBuffer,
    setPendingMetadata,
  } from '$lib/services/grouped-event-buffer';
  import { eventBuffer } from '$lib/services/grouped-event-buffer.svelte';
  import { runLivePoll } from '$lib/services/live-poll';
  import { getPollers } from '$lib/services/pollers-service';
  import { getWorkflowMetadata } from '$lib/services/query-service';
  import { fetchWorkerCount } from '$lib/services/worker-service';
  import {
    fetchLatestWorkflowExecutionIdentity,
    fetchWorkflow,
  } from '$lib/services/workflow-service';
  import { resetLastDataEncoderSuccess } from '$lib/stores/data-encoder-config';
  import { eventFilterSort, type EventSortOrder } from '$lib/stores/event-view';
  import {
    fullEventHistory,
    pauseLiveUpdates,
    timelineEvents,
  } from '$lib/stores/events';
  import { workerCountEnabled } from '$lib/stores/workers';
  import {
    initialWorkflowRun,
    refresh,
    type RefreshAction,
    workflowRun,
  } from '$lib/stores/workflow-run';
  import type { NetworkError } from '$lib/types/global';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';
  import { decodePayloadAndParseDataToJSON } from '$lib/utilities/decode-payload';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';
  import {
    FOLLOW_CONTINUES_PARAM,
    isFollowingContinues,
  } from '$lib/utilities/route-for';
  import { routeForApi } from '$lib/utilities/route-for-api';
  import { shouldRefetchWorkflowRun } from '$lib/utilities/should-refetch-workflow-run';

  interface Props {
    children: Snippet;
    headerSnippet?: Snippet;
  }

  let { children, headerSnippet = undefined }: Props = $props();

  let namespace = $derived(page.params.namespace);
  let workflowId = $derived(page.params.workflow);
  let chainRunId = $derived(page.params.run);
  let requestedFollowing = $derived(isFollowingContinues(page.url));
  let routeSessionKey = $derived(
    `${namespace}|${workflowId}|${chainRunId}|${requestedFollowing}`,
  );
  let activeRunId = $state('');
  let loadingRunId = $state('');
  let activeBufferRunId = $state('');
  let following = $state(false);
  let staging = $state(false);
  let retainedRuns = $state.raw<RetainedTimelineRun[]>([]);
  let truncation = $state<ChainTruncationState | null>(null);
  let pendingRetainedRun: RetainedTimelineRun | null = null;
  let backfillSourceRunId = '';
  let loadGeneration = 0;
  let showJson = $derived(page.url.searchParams.has('json'));
  let workerHeartbeatsEnabled = $derived(
    !!page.data?.namespace?.namespaceInfo?.capabilities?.workerHeartbeats,
  );
  let workerCountEnabledForNamespace = $derived(
    workerHeartbeatsEnabled && $workerCountEnabled,
  );
  let fullJson = $derived({
    ...$workflowRun,
    eventHistory: eventBuffer.events,
  });

  let workflowError: NetworkError | null = $state(null);
  let workflowRunController: AbortController;
  let refreshInterval: ReturnType<typeof setInterval> | null = null;
  let livePollingController: AbortController | null = null;

  let fetchComplete = $state(false);
  let latestEventId = $state(0);
  let totalExpectedEvents = $state(0);
  let descMinId = $state(0);

  let _pauseHandle: PauseHandle | null = null;
  // Sticky for this layout instance. Timeline/history consumers can mount
  // before a route reset or before the bidirectional fetch reaches its preview
  // pause, so treating resume as a one-shot loses the demand signal and leaves
  // the fetch paused forever after its first two pages.
  let _resumeRequested = false;
  let _lastPollToken = '';
  let _pollPaused = false;
  let _refetchSeq = 0;

  const ctx: HistoryContext = {
    get fetchComplete() {
      return fetchComplete;
    },
    get latestEventId() {
      return latestEventId;
    },
    get totalExpectedEvents() {
      return totalExpectedEvents;
    },
    get descMinId() {
      return descMinId;
    },
    resume() {
      _resumeRequested = true;
      if (_pauseHandle) {
        const h = _pauseHandle;
        _pauseHandle = null;
        h.resume();
      }
    },
  };

  setContext(HISTORY_CTX, ctx);

  const navigateWorkflowMode = async (runId: string, follow: boolean) => {
    const url = new URL(page.url);
    const segments = url.pathname.split('/');
    const workflowsIndex = segments.lastIndexOf('workflows');
    if (workflowsIndex >= 0 && segments.length > workflowsIndex + 2) {
      segments[workflowsIndex + 2] = encodeURIComponent(runId);
      url.pathname = segments.join('/');
    }
    if (follow) url.searchParams.set(FOLLOW_CONTINUES_PARAM, 'on');
    else url.searchParams.delete(FOLLOW_CONTINUES_PARAM);
    await goto(`${url.pathname}${url.search}`, { replaceState: true });
  };

  const workflowRunCtx: WorkflowRunContext = {
    get chainRunId() {
      return chainRunId;
    },
    get activeRunId() {
      return activeRunId;
    },
    get activeBufferRunId() {
      return activeBufferRunId;
    },
    get following() {
      return following;
    },
    get staging() {
      return staging;
    },
    get retainedRuns() {
      return retainedRuns;
    },
    get truncation() {
      return truncation;
    },
    pruneRetainedRuns(window) {
      const pruned = retainRunsWithinWindow(retainedRuns, window);
      const changed =
        pruned.length !== retainedRuns.length ||
        pruned.some(
          (run, index) =>
            run.runId !== retainedRuns[index]?.runId ||
            run.groups.length !== retainedRuns[index]?.groups.length,
        );
      if (changed) retainedRuns = pruned;
    },
    async enableFollowing() {
      const current = $workflowRun.workflow;
      if (!current || (!current.isRunning && !current.isPaused)) return;
      const { identity, error } = await fetchLatestWorkflowExecutionIdentity({
        namespace,
        workflowId,
      });
      if (error || !identity?.firstExecutionRunId) {
        workflowError =
          error ??
          ({
            message: 'Unable to resolve the workflow chain.',
          } as NetworkError);
        return;
      }
      await navigateWorkflowMode(identity.firstExecutionRunId, true);
    },
    async disableFollowing() {
      staging = false;
      pendingRetainedRun = null;
      retainedRuns = [];
      truncation = null;
      await navigateWorkflowMode(activeRunId, false);
    },
    pinnedRunUrl() {
      const url = new URL(page.url);
      const segments = url.pathname.split('/');
      const workflowsIndex = segments.lastIndexOf('workflows');
      if (workflowsIndex >= 0 && segments.length > workflowsIndex + 2) {
        segments[workflowsIndex + 2] = encodeURIComponent(activeRunId);
        url.pathname = segments.join('/');
      }
      url.searchParams.delete(FOLLOW_CONTINUES_PARAM);
      return `${url.pathname}${url.search}`;
    },
  };

  setContext(WORKFLOW_RUN_CTX, workflowRunCtx);

  const { copy, copied } = copyToClipboard();

  const handleCopy = (e: Event) => {
    copy(e, stringifyWithBigInt(fullJson));
  };

  const decodeWorkflowUserMetadata = async (workflow: WorkflowExecution) => {
    const userMetadata = { summary: '', details: '' };
    try {
      if (workflow?.summary) {
        const decodedSummary = await decodePayloadAndParseDataToJSON(
          workflow.summary,
        );
        if (typeof decodedSummary === 'string') {
          userMetadata.summary = decodedSummary;
        }
      }
      if (workflow?.details) {
        const decodedDetails = await decodePayloadAndParseDataToJSON(
          workflow.details,
        );
        if (typeof decodedDetails === 'string') {
          userMetadata.details = decodedDetails;
        }
      }
    } catch (e) {
      console.error('Error decoding user metadata', e);
    }
    return userMetadata;
  };

  const startLivePoll = (
    ns: string,
    wfId: string,
    rId: string,
    startToken: string,
  ) => {
    livePollingController?.abort();
    livePollingController = new AbortController();
    runLivePoll({
      route: routeForApi('events.ascending', {
        namespace: ns,
        workflowId: wfId,
      }),
      runId: rId,
      startToken,
      signal: livePollingController.signal,
      onEvent: (ev) => {
        const isNew = ingestHistoryEvent(ev);
        if (isNew)
          latestEventId = Math.max(latestEventId, parseInt(ev.eventId));
        return isNew;
      },
    }).then((lastToken) => {
      _lastPollToken = lastToken;
    });
  };

  const cancelStagedRun = (runId: string): boolean => {
    if (pendingRetainedRun?.successorRunId !== runId) return false;
    const sourceRunId = pendingRetainedRun.runId;
    pendingRetainedRun = null;
    staging = false;
    loadingRunId = sourceRunId;
    return true;
  };

  const getWorkflowAndEventHistory = async (
    ns: string,
    wfId: string,
    rId: string,
  ) => {
    const generation = ++loadGeneration;
    const { workflow, error } = await fetchWorkflow({
      namespace: ns,
      workflowId: wfId,
      runId: rId,
    });

    if (generation !== loadGeneration || rId !== loadingRunId) return;

    if (error) {
      if (!cancelStagedRun(rId)) workflowError = error;
      return;
    }

    if (!workflow) return;

    const userMetadata = await decodeWorkflowUserMetadata(workflow);

    const { taskQueue } = workflow;
    const workers = await getPollers({ queue: taskQueue!, namespace: ns });

    if (generation !== loadGeneration || rId !== loadingRunId) return;

    const stagingController = new AbortController();
    const nextBuffer = createGroupedEventBuffer();

    const historySize = parseInt(workflow.historyEvents ?? '0') || 0;
    nextBuffer.reset(historySize);
    let committed = false;
    let stagedChainRunId = workflow.firstExecutionRunId;
    let stagedLatestEventId = 0;
    let stagedTotalExpectedEvents = 0;
    let stagedDescMinId = 0;

    const commitStagedRun = () => {
      if (committed) return true;
      if (generation !== loadGeneration || rId !== loadingRunId) {
        stagingController.abort();
        return false;
      }
      if (following && pendingRetainedRun && stagedChainRunId !== chainRunId) {
        const sourceRunId = pendingRetainedRun.runId;
        pendingRetainedRun = null;
        staging = false;
        loadingRunId = sourceRunId;
        stagingController.abort();
        workflowError = {
          message: 'The next run does not belong to this workflow chain.',
        } as NetworkError;
        return false;
      }
      abortAll();
      workflowRunController = stagingController;
      replaceActiveBuffer(nextBuffer);
      activeBufferRunId = rId;
      latestEventId = stagedLatestEventId;
      totalExpectedEvents = stagedTotalExpectedEvents;
      descMinId = stagedDescMinId;
      fetchComplete = false;
      _pauseHandle = null;
      $workflowRun = {
        ...initialWorkflowRun,
        workflow,
        workers,
        workersLoaded: true,
        userMetadata,
      };
      activeRunId = rId;
      if (pendingRetainedRun?.successorRunId === rId) {
        const limited = limitRetainedRuns([
          ...retainedRuns,
          pendingRetainedRun,
        ]);
        retainedRuns = limited.runs;
        truncation = limited.truncation ?? truncation;
        pendingRetainedRun = null;
      }
      $fullEventHistory = nextBuffer.getEventArray();
      committed = true;
      staging = false;

      const onWorkersRoute = page.url.pathname.endsWith('/workers');
      if (workerCountEnabledForNamespace && taskQueue && !onWorkersRoute) {
        fetchWorkerCount(
          { namespace: ns, query: `TaskQueue="${taskQueue}"` },
          (input, init) =>
            fetch(input, { ...init, signal: stagingController.signal }),
        ).then(({ count }) => {
          if (
            !stagingController.signal.aborted &&
            rId === activeRunId &&
            count !== undefined
          ) {
            $workflowRun.workerCount = count;
          }
        });
      }

      if (following && retainedRuns.length === 0) {
        void backfillPredecessors(rId, nextBuffer.getEventArray(), generation);
      }

      if (workflow.isRunning && !$pauseLiveUpdates) {
        startLivePoll(ns, wfId, rId, '');
      }
      if (workflow.isRunning && workers?.pollers?.length) {
        getWorkflowMetadata(
          { namespace: ns, workflow: { id: wfId, runId: rId } },
          stagingController.signal,
        ).then((metadata) => {
          if (
            generation === loadGeneration &&
            rId === activeRunId &&
            rId === activeBufferRunId
          ) {
            $workflowRun.metadata = metadata;
          }
        });
      }
      return true;
    };

    const historyPath = page.url.pathname;
    const routeNeedsCompleteHistory =
      historyPath.endsWith('/timeline') || historyPath.includes('/history');

    fetchBidirectional({
      namespace: ns,
      workflowId: wfId,
      runId: rId,
      signal: stagingController.signal,
      maximumPageSize: 1000,
      // Summary-style tabs only need the two bookend pages. Timeline and
      // history cannot function over that preview: scrolling reaches the
      // synthetic middle gap while the real fetch remains paused.
      pauseAfterPages: routeNeedsCompleteHistory ? undefined : 2,
      onProgress: (p) => {
        if (p.totalEstimated) stagedTotalExpectedEvents = p.totalEstimated;
        if (p.descMinId) stagedDescMinId = p.descMinId;
      },
      onPause: (handle) => {
        if (!commitStagedRun()) return;
        if (_resumeRequested) {
          handle.resume();
        } else {
          _pauseHandle = handle;
        }
      },
      onRawPage: (events, isAscending) => {
        for (const event of events) {
          if (isAscending && event.eventType === 'WorkflowExecutionStarted') {
            const firstExecutionRunId =
              event.workflowExecutionStartedEventAttributes
                ?.firstExecutionRunId;
            if (typeof firstExecutionRunId === 'string') {
              stagedChainRunId = firstExecutionRunId;
            }
          }
          nextBuffer.ingestHistoryEvent(event);
          const id = parseInt(event.eventId);
          if (id > stagedLatestEventId) stagedLatestEventId = id;
        }
        if (events.length && committed) {
          latestEventId = stagedLatestEventId;
        }
      },
    })
      .then(() => {
        if (!commitStagedRun()) return;
        nextBuffer.setPendingMetadata(
          workflow.pendingActivities ?? [],
          workflow.pendingNexusOperations ?? [],
        );
        fetchComplete = true;
        if (following && retainedRuns.length === 0) {
          void backfillPredecessors(
            rId,
            nextBuffer.getEventArray(),
            generation,
          );
        }
      })
      .catch((e: unknown) => {
        if (
          generation === loadGeneration &&
          rId === loadingRunId &&
          e instanceof Error &&
          e.name !== 'AbortError'
        ) {
          if (!cancelStagedRun(rId)) {
            workflowError = { message: e.message } as NetworkError;
          }
        }
      });
  };

  const getOnlyWorkflowWithPendingActivities = async (
    refreshAction: RefreshAction,
    pause: boolean,
  ) => {
    const shouldFetch = shouldRefetchWorkflowRun({
      refresh: refreshAction,
      pauseLiveUpdates: pause,
      isRunning: $workflowRun?.workflow?.isRunning,
    });
    if (!shouldFetch) return;

    // The 10s poll and an action's refetch overlap, so a poll that started
    // before a mutation can resolve after it and write back a pre-mutation
    // snapshot. Only the newest request for the current run may land.
    const seq = ++_refetchSeq;
    const ns = namespace;
    const wfId = workflowId;
    const refreshGeneration = loadGeneration;
    const refreshRunId = activeRunId;
    if (!refreshRunId || refreshRunId !== activeBufferRunId) return;

    const { workflow, error } = await fetchWorkflow({
      namespace: ns,
      workflowId: wfId,
      runId: refreshRunId,
    });

    if (seq !== _refetchSeq) return;
    if (ns !== namespace || wfId !== workflowId) return;
    // Following a chain moves the active run on; a response for a run that is
    // no longer the one on screen must not land either.
    if (
      refreshGeneration !== loadGeneration ||
      refreshRunId !== activeRunId ||
      refreshRunId !== activeBufferRunId
    ) {
      return;
    }

    if (error) {
      workflowError = error;
      return;
    }
    if (workflow && workflow.runId !== refreshRunId) return;
    $workflowRun.workflow = workflow ?? null;

    if (
      following &&
      !pause &&
      workflow &&
      !workflow.isRunning &&
      !workflow.isPaused
    ) {
      await stageNextRun();
    }
  };

  const stageNextRun = async (
    successorRunId?: string,
    transitionFromPrevious?: ChainTransition,
    transitionTimeMs?: number,
  ) => {
    if (staging || !following || $pauseLiveUpdates) return;
    staging = true;
    const sourceRunId = activeRunId;
    let sourceWorkflow = $workflowRun.workflow;
    if (!sourceWorkflow || sourceWorkflow.runId !== sourceRunId) {
      staging = false;
      return;
    }

    const refreshedSource = await fetchWorkflow({
      namespace,
      workflowId,
      runId: sourceRunId,
    });
    if (!following || activeRunId !== sourceRunId) {
      staging = false;
      return;
    }
    if (refreshedSource.workflow) sourceWorkflow = refreshedSource.workflow;

    let nextRunId = successorRunId;
    if (!nextRunId) {
      const { identity: latest, error } =
        await fetchLatestWorkflowExecutionIdentity({
          namespace,
          workflowId,
        });
      if (
        error ||
        !latest ||
        latest.runId === sourceRunId ||
        latest.firstExecutionRunId !== chainRunId
      ) {
        staging = false;
        return;
      }
      nextRunId = latest.runId;
    }

    if (
      !following ||
      activeRunId !== sourceRunId ||
      !nextRunId ||
      nextRunId === sourceRunId
    ) {
      staging = false;
      return;
    }

    const retained: RetainedTimelineRun = {
      runId: sourceWorkflow.runId,
      status: sourceWorkflow.status,
      startTimeMs: Date.parse(sourceWorkflow.startTime),
      endTimeMs:
        transitionTimeMs || Date.parse(sourceWorkflow.endTime) || Date.now(),
      groups: toTimelineGroups(
        sourceWorkflow.runId,
        getGroupArray({ excludeWorkflowTasks: true }),
      ),
      successorRunId: nextRunId,
      transitionFromPrevious,
    };
    pendingRetainedRun = retained;

    loadingRunId = nextRunId;
  };

  const backfillPredecessors = async (
    sourceRunId: string,
    sourceEvents: ReturnType<typeof getEventArray>,
    generation: number,
  ) => {
    let successorRunId = sourceRunId;
    let predecessorRunId = getPredecessorFromEvents(sourceEvents);
    if (!predecessorRunId || backfillSourceRunId === sourceRunId) return;
    backfillSourceRunId = sourceRunId;
    const backfilled: RetainedTimelineRun[] = [];

    for (let hop = 0; predecessorRunId && hop < 5; hop += 1) {
      if (
        !following ||
        activeRunId !== sourceRunId ||
        generation !== loadGeneration
      ) {
        return;
      }

      const runId = predecessorRunId;
      const [{ workflow }, ascending, descending] = await Promise.all([
        fetchWorkflow({ namespace, workflowId, runId }),
        fetchPartialRawEvents({
          namespace,
          workflowId,
          runId,
          sort: 'ascending',
          maximumPageSize: '1000',
        }),
        fetchPartialRawEvents({
          namespace,
          workflowId,
          runId,
          sort: 'descending',
          maximumPageSize: '1000',
        }),
      ]);

      if (
        !workflow ||
        (workflow.firstExecutionRunId &&
          workflow.firstExecutionRunId !== chainRunId)
      ) {
        break;
      }

      const buffer = createGroupedEventBuffer();
      buffer.reset(parseInt(workflow.historyEvents ?? '0') || 0);
      for (const event of ascending) buffer.ingestHistoryEvent(event);
      for (const event of descending) buffer.ingestHistoryEvent(event);
      const events = buffer.getEventArray();
      const startedAttributes = events.find(
        (event) => event.eventType === 'WorkflowExecutionStarted',
      )?.attributes as Record<string, unknown> | undefined;
      const reportedChainId = startedAttributes?.firstExecutionRunId;
      if (reportedChainId !== chainRunId) break;

      predecessorRunId = getPredecessorFromEvents(events);
      backfilled.unshift({
        runId,
        status: workflow.status,
        startTimeMs: Date.parse(workflow.startTime),
        endTimeMs: Date.parse(workflow.endTime) || Date.now(),
        groups: toTimelineGroups(
          runId,
          buffer.getGroupArray({ excludeWorkflowTasks: true }),
        ),
        predecessorRunId: predecessorRunId ?? undefined,
        successorRunId,
      });
      successorRunId = runId;
    }

    if (
      backfilled.length &&
      following &&
      activeRunId === sourceRunId &&
      generation === loadGeneration
    ) {
      const limited = limitRetainedRuns([...backfilled, ...retainedRuns]);
      retainedRuns = limited.runs;
      truncation = limited.truncation ?? truncation;
    }
  };

  const abortAll = () => {
    if (workflowRunController) workflowRunController.abort();
    livePollingController?.abort();
    livePollingController = null;
  };

  $effect(() => {
    setPendingMetadata(
      $workflowRun.workflow?.pendingActivities ?? [],
      $workflowRun.workflow?.pendingNexusOperations ?? [],
    );
  });

  $effect(() => {
    const events = eventBuffer.events;
    $fullEventHistory = events;
    if (following && !$pauseLiveUpdates && !staging) {
      const successor = getSuccessorFromEvents(events);
      if (successor) {
        void stageNextRun(
          successor.runId,
          successor.transition,
          successor.timeMs,
        );
      }
    }
  });

  const clearWorkflowData = () => {
    loadGeneration += 1;
    $timelineEvents = null;
    $workflowRun = initialWorkflowRun;
    $fullEventHistory = [];
    workflowError = null;
    fetchComplete = false;
    latestEventId = 0;
    totalExpectedEvents = 0;
    descMinId = 0;
    _pauseHandle = null;
    _lastPollToken = '';
    _pollPaused = false;
    staging = false;
    pendingRetainedRun = null;
    loadingRunId = '';
    activeBufferRunId = '';
    backfillSourceRunId = '';
    _refetchSeq++;
    abortAll();
    resetLastDataEncoderSuccess();
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = null;
  };

  $effect(() => {
    routeSessionKey;
    const ns = namespace;
    const wfId = workflowId;
    const canonicalRunId = chainRunId;
    const shouldFollow = requestedFollowing;
    untrack(() => {
      clearWorkflowData();
      const generation = loadGeneration;
      retainedRuns = [];
      truncation = null;
      following = shouldFollow;
      if (!shouldFollow) {
        activeRunId = canonicalRunId;
        loadingRunId = canonicalRunId;
        return;
      }

      const resolveFollowingRoute = async () => {
        const { workflow: routedWorkflow, error: routedError } =
          await fetchWorkflow({
            namespace: ns,
            workflowId: wfId,
            runId: canonicalRunId,
          });
        if (generation !== loadGeneration) return;
        if (routedError || !routedWorkflow) {
          workflowError =
            routedError ??
            ({
              message: 'Unable to resolve the workflow run.',
            } as NetworkError);
          return;
        }

        const routedFirstRunId = routedWorkflow.firstExecutionRunId;
        if (routedFirstRunId && routedFirstRunId !== canonicalRunId) {
          await navigateWorkflowMode(routedFirstRunId, true);
          return;
        }

        const { identity, error } = await fetchLatestWorkflowExecutionIdentity({
          namespace: ns,
          workflowId: wfId,
        });
        if (generation !== loadGeneration) return;

        if (
          !routedFirstRunId &&
          identity?.runId === canonicalRunId &&
          identity.firstExecutionRunId !== canonicalRunId
        ) {
          await navigateWorkflowMode(identity.firstExecutionRunId, true);
          return;
        }

        if (error || identity?.firstExecutionRunId !== canonicalRunId) {
          workflowError =
            error ??
            ({
              message:
                'This URL does not identify the latest workflow execution chain.',
            } as NetworkError);
          return;
        }
        activeRunId = identity.runId;
        loadingRunId = identity.runId;
      };

      void resolveFollowingRoute();
    });
  });

  $effect(() => {
    const ns = namespace;
    const wfId = workflowId;
    const rId = loadingRunId;
    if (!rId) return;
    untrack(() => {
      getWorkflowAndEventHistory(ns, wfId, rId);
    });
  });

  $effect(() => {
    const refreshValue = $refresh;
    const pause = $pauseLiveUpdates;
    untrack(() => {
      getOnlyWorkflowWithPendingActivities(refreshValue, pause);
    });
  });

  // Stop the live poll when the user pauses auto-refresh, and resume it from
  // the last cursor when they unpause. This avoids holding an open server
  // connection and accumulating events in liveGroups during a pause.
  $effect(() => {
    const paused = $pauseLiveUpdates;
    untrack(() => {
      if (paused && livePollingController) {
        _pollPaused = true;
        livePollingController.abort();
        livePollingController = null;
      } else if (!paused && _pollPaused && $workflowRun.workflow?.isRunning) {
        _pollPaused = false;
        startLivePoll(namespace, workflowId, activeRunId, _lastPollToken);
      }
    });
  });

  onMount(() => {
    const sort = page.url.searchParams.get('sort');
    if (sort) $eventFilterSort = sort as EventSortOrder;
    refreshInterval = setInterval(() => {
      throttleRefresh();
    }, 10000);

    return () => {
      clearWorkflowData();
    };
  });
</script>

{#if showJson}
  <div
    class="relative h-auto whitespace-break-spaces break-words bg-surface-primary p-4"
  >
    <CopyButton
      copyIconTitle={translate('common.copy-icon-title')}
      copySuccessIconTitle={translate('common.copy-success-icon-title')}
      class="absolute right-1 top-1"
      onclick={handleCopy}
      copied={$copied}
    />
    {stringifyWithBigInt(fullJson, undefined, 2)}
  </div>
{:else if workflowError}
  <WorkflowError error={workflowError} />
  {#if following}
    <Button
      variant="secondary"
      onclick={() => workflowRunCtx.disableFollowing()}
    >
      {translate('workflows.open-pinned-run')}
    </Button>
  {/if}
{:else if !$workflowRun.workflow}
  <SkeletonWorkflow />
{:else}
  <WorkflowHeader {headerSnippet} />
  {@render children()}
{/if}
