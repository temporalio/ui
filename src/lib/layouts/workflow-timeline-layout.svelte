<script lang="ts">
  import { getContext, onDestroy, onMount, tick, untrack } from 'svelte';

  import { beforeNavigate, goto } from '$app/navigation';
  import { page } from '$app/state';

  import EventHistoryLegend from '$lib/components/lines-and-dots/event-history-legend.svelte';
  import EventTypeFilter from '$lib/components/lines-and-dots/event-type-filter.svelte';
  import { getTimelineGroups } from '$lib/components/lines-and-dots/timeline-graph/classic/sort-timeline-groups';
  import ClassicTimelineGraph from '$lib/components/lines-and-dots/timeline-graph/classic/timeline-graph.svelte';
  import { Timeline as ClassicTimeline } from '$lib/components/lines-and-dots/timeline-graph/classic/timeline.svelte';
  import {
    GUTTER,
    LANE_TIME_ORIGIN_PX,
  } from '$lib/components/lines-and-dots/timeline-graph/constants';
  import TimelineChainOverview from '$lib/components/lines-and-dots/timeline-graph/timeline-chain-overview.svelte';
  import TimelineGraph from '$lib/components/lines-and-dots/timeline-graph/timeline-graph.svelte';
  import type { TimelinePerformanceStats } from '$lib/components/lines-and-dots/timeline-graph/timeline-performance';
  import {
    clampTimelineWindowDuration,
    formatTimelineWindowDuration,
    type TimelineWindowControls,
  } from '$lib/components/lines-and-dots/timeline-graph/timeline-window-controls';
  import type { Timeline } from '$lib/components/lines-and-dots/timeline-graph/timeline.svelte';
  import type {
    TimelineDisplayMode,
    TimelineViewMode,
  } from '$lib/components/lines-and-dots/timeline-graph/types';
  import WorkflowError from '$lib/components/lines-and-dots/workflow-error.svelte';
  import DownloadEventHistoryModal from '$lib/components/workflow/download-event-history-modal.svelte';
  import InputAndResults from '$lib/components/workflow/input-and-results.svelte';
  import WorkflowCallbacks from '$lib/components/workflow/workflow-callbacks.svelte';
  import {
    HISTORY_CTX,
    type HistoryContext,
  } from '$lib/contexts/history-context';
  import {
    WORKFLOW_RUN_CTX,
    type WorkflowRunContext,
  } from '$lib/contexts/workflow-run-context';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    IconAdd,
    IconArrowAscending,
    IconArrowDescending,
    IconArrowLeft,
    IconArrowRight,
    IconCollapse,
    IconDownload,
    IconHyphen,
    IconPause,
    IconPlay,
  } from '$lib/io/icon';
  import {
    getRenderableTimelineRuns,
    type TimelineGroup,
    type TimelineRun,
    toTimelineGroups,
  } from '$lib/services/chain-workflow-session';
  import { eventBuffer } from '$lib/services/grouped-event-buffer.svelte';
  import { TimelineIntervalLoader } from '$lib/services/timeline-interval-loader';
  import type { TimelineRunModel } from '$lib/services/timeline-run-model';
  import {
    appendTrustedChainTransition,
    type ChainIndexSnapshot,
    chainRunEndTimeMs,
    selectChainIndexInterval,
  } from '$lib/services/workflow-chain-index';
  import {
    loadWorkflowChainIndex,
    workflowChainIndexOverviewSegments,
    type WorkflowChainOverviewRun,
  } from '$lib/services/workflow-chain-overview';
  import { clearActives } from '$lib/stores/active-events';
  import { collapseIdleTime, eventFilterSort } from '$lib/stores/event-view';
  import { pauseLiveUpdates } from '$lib/stores/events';
  import { eventTypeFilter } from '$lib/stores/filters';
  import { workflowRun } from '$lib/stores/workflow-run';
  import type {
    WorkflowTaskFailedEvent,
    WorkflowTaskTimedOutEvent,
  } from '$lib/types/events';
  import {
    parseEventFilterParams,
    updateEventFilterParams,
  } from '$lib/utilities/event-filter-params';
  import { validTimeToDate } from '$lib/utilities/format-time';

  const historyCtx = getContext<HistoryContext>(HISTORY_CTX);
  const workflowRunCtx = getContext<WorkflowRunContext>(WORKFLOW_RUN_CTX);

  const namespace = $derived(page.params.namespace);
  const workflow = $derived($workflowRun.workflow);
  const firstEventTime = $derived(
    eventBuffer.firstEvent?.eventTime
      ? validTimeToDate(eventBuffer.firstEvent.eventTime).toISOString()
      : undefined,
  );
  const workflowId = $derived(workflow?.id || page.params.workflow);
  type ChainScopeIdentity = Readonly<{
    namespace: string;
    workflowId: string;
    firstRunId: string;
  }>;
  let chainScopeIdentity = $state.raw<ChainScopeIdentity | null>(null);
  $effect(() => {
    const scopeNamespace = namespace;
    const scopeWorkflowId = workflowId;
    const authoritativeFirstRunId = workflow?.firstExecutionRunId;
    const routeRunId = workflowRunCtx.chainRunId;
    if (!scopeWorkflowId || !routeRunId) {
      chainScopeIdentity = null;
      return;
    }
    const existing = untrack(() => chainScopeIdentity);
    const sameWorkflow =
      existing?.namespace === scopeNamespace &&
      existing.workflowId === scopeWorkflowId;
    const nextFirstRunId =
      authoritativeFirstRunId ||
      (sameWorkflow ? existing.firstRunId : routeRunId);
    if (sameWorkflow && existing.firstRunId === nextFirstRunId) {
      return;
    }
    chainScopeIdentity = Object.freeze({
      namespace: scopeNamespace,
      workflowId: scopeWorkflowId,
      firstRunId: nextFirstRunId,
    });
  });
  const firstRunId = $derived(chainScopeIdentity?.firstRunId);
  const currentRunId = $derived(workflow?.runId || page.params.run);

  const urlParams = $derived(parseEventFilterParams(page.url));
  $effect(() => {
    $eventFilterSort = urlParams.sort;
    $pauseLiveUpdates = urlParams.refresh_off;
  });

  const onAutoRefreshToggle = () => {
    setAutoRefreshPaused(!$pauseLiveUpdates);
  };

  const setAutoRefreshPaused = (paused: boolean) => {
    updateEventFilterParams(page.url, { refresh_off: paused }, goto);
  };

  const reverseSort = $derived($eventFilterSort === 'descending');
  const disableTimelineVirtualization = $derived(
    page.url.searchParams.get('timeline_virtualization') === 'off',
  );
  const instrumentTimelinePerformance = $derived(
    page.url.searchParams.get('timeline_instrumentation') === 'on',
  );
  const requestedDisplayMode = $derived(urlParams.timelineDisplayMode);
  const showGroups = $derived(urlParams.showGroups);
  const displayMode = $derived(requestedDisplayMode);
  // Lanes renders on the full-duration scale; only where the nesting is drawn
  // differs, so everything downstream of the view toggle treats it that way.
  const nestedLanes = $derived(displayMode === 'lanes');
  // The graph shell carries a 1px border the overview above it does not, so the
  // canvas's coordinate origin sits one pixel further in.
  const TIMELINE_SHELL_BORDER_PX = 1;
  const graphDisplayMode = $derived<TimelineDisplayMode>(
    displayMode === 'fixed-window' ? 'fixed-window' : 'full-duration',
  );
  const fullDurationScale = $derived(graphDisplayMode === 'full-duration');
  type IntervalRenderCommit = Readonly<{
    id: object;
    requestEpoch: number;
    chainIndexId: object;
    runs: readonly TimelineRun[];
    releases: readonly (() => void)[];
    truncated: boolean;
  }>;
  let committedInterval = $state.raw<IntervalRenderCommit | null>(null);
  const intervalTimelineRuns = $derived(
    committedInterval ? [...committedInterval.runs] : [],
  );

  const bufferGroups = $derived.by(() => {
    // The buffer owns its run identity. Never infer that identity from the
    // independently refreshed workflow model: a stale Describe response must
    // not be able to relabel one run's groups as another run.
    if (workflowRunCtx.activeBufferRunId !== workflow?.runId) return [];
    return eventBuffer.lazyGroupsWithoutWorkflowTasks;
  });

  const classicBufferGroups = $derived.by(() => {
    if (displayMode !== 'classic') return [];
    if (workflowRunCtx.activeBufferRunId !== workflow?.runId) return [];
    return eventBuffer.groupsWithoutWorkflowTasks;
  });

  const timelineRuns = $derived.by<TimelineRun[]>(() => {
    const retained = workflowRunCtx.retainedRuns.map((run) => ({
      ...run,
      active: false,
      sourceState: 'closing-unsealed' as const,
    }));
    if (!workflow) return [...intervalTimelineRuns, ...retained];
    const active: TimelineRun = {
      runId: workflow.runId,
      status: workflow.status,
      startTimeMs: Date.parse(workflow.startTime),
      endTimeMs: workflow.endTime ? Date.parse(workflow.endTime) : Date.now(),
      groups: toTimelineGroups(workflow.runId, bufferGroups),
      pointCount: bufferGroups.reduce(
        (count, group) => count + group.eventCount,
        0,
      ),
      active: true,
      sourceState: 'mutable',
    };
    const renderable = getRenderableTimelineRuns({
      retainedRuns: retained,
      activeRun: active,
      activeHistoryReady: historyCtx.fetchComplete,
    });
    const hasSealedCurrent =
      workflow.status !== 'Running' &&
      workflow.status !== 'Paused' &&
      intervalTimelineRuns.some(({ runId }) => runId === workflow.runId);
    const localRuns = hasSealedCurrent
      ? renderable.filter(({ runId }) => runId !== workflow.runId)
      : renderable;
    return [
      ...intervalTimelineRuns.filter(
        (run) => !localRuns.some(({ runId }) => runId === run.runId),
      ),
      ...localRuns,
    ];
  });

  const classicGroups = $derived(
    getTimelineGroups(
      classicBufferGroups.filter((group) =>
        $eventTypeFilter.includes(group.category),
      ),
      reverseSort,
      historyCtx.fetchComplete,
      historyCtx.descMinId,
    ),
  );

  const workflowTaskFailedError = $derived.by(() => {
    if (!historyCtx.fetchComplete) return undefined;
    return eventBuffer.workflowTaskFailedEvent as
      | WorkflowTaskFailedEvent
      | WorkflowTaskTimedOutEvent
      | undefined;
  });

  const isNotPending = $derived(
    Boolean(workflow && !workflow?.isRunning && !workflow?.isPaused),
  );

  beforeNavigate(() => {
    clearActives();
  });

  let showDownloadPrompt = $state(false);

  const onSort = () => {
    const newSort = reverseSort ? 'ascending' : 'descending';
    updateEventFilterParams(page.url, { sort: newSort }, goto);
  };

  const onDisplayMode = (timelineDisplayMode: TimelineViewMode) => {
    updateEventFilterParams(page.url, { timelineDisplayMode }, goto);
  };

  const onShowGroups = () => {
    updateEventFilterParams(page.url, { showGroups: !showGroups }, goto);
  };

  // The timeline renders in normal page flow: the page (#content-wrapper)
  // scrolls it and the controls bar sticks to the top-nav. TimelineGraph
  // virtualizes internally from the visible page band, so there's no bounded
  // scroll container, no scroll-offset bridge, and no height plumbing here.
  const estimatedTotalGroups = $derived.by(() => {
    if (historyCtx.fetchComplete) return bufferGroups.length;
    const totalEvents = historyCtx.totalExpectedEvents ?? 0;
    return Math.max(bufferGroups.length, Math.ceil(totalEvents * 0.5));
  });

  onMount(() => {
    historyCtx.resume();
  });

  let timeline = $state<Timeline | ClassicTimeline>();
  let timelineWindowControls = $state<TimelineWindowControls>();
  let timelinePerformanceStats = $state<TimelinePerformanceStats>();
  let chainIndex = $state.raw<ChainIndexSnapshot | null>(null);
  const chainOverviewSegments = $derived(
    chainIndex ? workflowChainIndexOverviewSegments(chainIndex) : [],
  );
  const chainOverviewRuns = $derived(
    chainOverviewSegments.flatMap((segment) => [...segment.runs]),
  );
  let chainOverviewLoading = $state(false);
  let chainLoadGeneration = 0;
  let chainLoadDiagnostic = $state(0);
  let chainOverviewController: AbortController | null = null;
  let inFlightChainScan: {
    key: string;
    promise: Promise<ChainIndexSnapshot | null>;
  } | null = null;
  const intervalLoader = new TimelineIntervalLoader();
  let intervalLoadGeneration = 0;
  let intervalLoading = $state(false);
  let navigationEpoch = 0;
  let navigationController: AbortController | null = null;
  let initialClosedWindowLoadKey = '';
  const timelineAtChainBeginning = $derived.by(() => {
    const chainStartTimeMs = chainOverviewRuns[0]?.startTimeMs;
    if (chainStartTimeMs === undefined || !timelineWindowControls) return false;
    return (
      timelineWindowControls.atBeginning &&
      timelineWindowControls.windowStartTimeMs <= chainStartTimeMs + 1
    );
  });

  $effect(() => {
    if (
      displayMode !== 'fixed-window' ||
      !workflow ||
      workflow.status === 'Running' ||
      workflow.status === 'Paused' ||
      !timelineWindowControls ||
      chainOverviewLoading ||
      chainOverviewRuns.length === 0
    ) {
      return;
    }
    const key = `${namespace}:${workflow.id}:${workflow.runId}:${workflow.endTime}:${workflow.historyEvents}`;
    if (key === initialClosedWindowLoadKey) return;
    initialClosedWindowLoadKey = key;
    void loadCurrentTimelineWindow().catch((error: unknown) => {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        console.error('Unable to seal the closed timeline window.', error);
      }
    });
  });

  const releaseIntervalModels = () => {
    const interval = untrack(() => committedInterval);
    for (const release of interval?.releases ?? []) release();
    committedInterval = null;
  };

  onDestroy(() => {
    chainOverviewController?.abort();
    navigationController?.abort();
    releaseIntervalModels();
    intervalLoader.dispose();
  });

  const scanChainOverview = ({
    scanNamespace,
    scanWorkflowId,
    scanFirstRunId,
    scanCurrentRunId,
    reset,
  }: {
    scanNamespace: string;
    scanWorkflowId: string;
    scanFirstRunId: string;
    scanCurrentRunId: string;
    reset: boolean;
  }): Promise<ChainIndexSnapshot | null> => {
    const key = `${scanNamespace}:${scanWorkflowId}:${scanFirstRunId}:${scanCurrentRunId}`;
    if (
      !reset &&
      inFlightChainScan?.key === key &&
      !chainOverviewController?.signal.aborted
    ) {
      return inFlightChainScan.promise;
    }
    chainOverviewController?.abort();
    const controller = new AbortController();
    chainOverviewController = controller;
    const generation = ++chainLoadGeneration;
    chainLoadDiagnostic = generation;
    if (reset) chainIndex = null;
    chainOverviewLoading = true;

    const promise = (async () => {
      try {
        const snapshot = await loadWorkflowChainIndex({
          namespace: scanNamespace,
          workflowId: scanWorkflowId,
          firstRunId: scanFirstRunId,
          currentRunId: scanCurrentRunId,
          signal: controller.signal,
          generation,
        });
        if (controller.signal.aborted || generation !== chainLoadGeneration) {
          return null;
        }
        chainIndex = snapshot;
        return snapshot;
      } catch (error: unknown) {
        if (
          !controller.signal.aborted &&
          !(error instanceof DOMException && error.name === 'AbortError')
        ) {
          console.error('Unable to load the workflow chain overview.', error);
        }
        return null;
      } finally {
        if (generation === chainLoadGeneration) {
          if (chainOverviewController === controller) {
            chainOverviewController = null;
          }
          chainOverviewLoading = false;
          if (inFlightChainScan?.key === key) inFlightChainScan = null;
        }
      }
    })();
    inFlightChainScan = { key, promise };
    return promise;
  };

  const refreshChainOverview = () => {
    if (!workflowId || !firstRunId || !currentRunId) {
      return Promise.resolve(null);
    }
    return scanChainOverview({
      scanNamespace: namespace,
      scanWorkflowId: workflowId,
      scanFirstRunId: firstRunId,
      scanCurrentRunId: currentRunId,
      reset: false,
    });
  };

  $effect(() => {
    const scanNamespace = namespace;
    const scanWorkflowId = workflowId;
    const scanFirstRunId = firstRunId;
    const chainRouteRunId = workflowRunCtx.chainRunId;
    const scanCurrentRunId = untrack(() => currentRunId);
    if (
      !scanWorkflowId ||
      !scanFirstRunId ||
      !chainRouteRunId ||
      !scanCurrentRunId
    ) {
      chainOverviewController?.abort();
      intervalLoadGeneration += 1;
      intervalLoader.abort();
      releaseIntervalModels();
      chainIndex = null;
      intervalLoading = false;
      chainOverviewLoading = false;
      return;
    }

    intervalLoadGeneration += 1;
    intervalLoader.abort();
    releaseIntervalModels();
    intervalLoading = false;
    void scanChainOverview({
      scanNamespace,
      scanWorkflowId,
      scanFirstRunId,
      scanCurrentRunId,
      reset: true,
    }).then((snapshot) => {
      if (!snapshot || !fullDurationScale) return;
      const first = snapshot.segments[0]?.runs[0];
      const last = snapshot.segments.at(-1)?.runs.at(-1);
      if (!first || !last) return;
      const endTimeMs = chainRunEndTimeMs(last, Date.now());
      void loadTimelineInterval(
        first.startTimeMs,
        Math.max(1, endTimeMs - first.startTimeMs),
        snapshot,
      );
    });

    return () => chainOverviewController?.abort();
  });

  $effect(() => {
    const currentWorkflow = workflow;
    const retainedRuns = workflowRunCtx.retainedRuns;
    if (!currentWorkflow) return;
    const existing = untrack(() => chainIndex);
    if (!existing || existing.currentRunId === currentWorkflow.runId) return;
    const predecessor = retainedRuns.find(
      (run) => run.successorRunId === currentWorkflow.runId,
    );
    if (!predecessor) return;
    chainIndex = appendTrustedChainTransition({
      index: existing,
      predecessorRunId: predecessor.runId,
      successor: {
        runId: currentWorkflow.runId,
        status: currentWorkflow.status,
        startTimeMs: Date.parse(currentWorkflow.startTime),
        end:
          currentWorkflow.status === 'Running' ||
          currentWorkflow.status === 'Paused'
            ? { kind: 'live' }
            : {
                kind: 'closed',
                timeMs: Date.parse(currentWorkflow.endTime),
              },
      },
      transition: predecessor.transitionFromPrevious ?? 'continue-as-new',
    });
  });

  const handleTimelineInit = (t: Timeline | ClassicTimeline) => {
    timeline = t;
  };

  const loadTimelineInterval = async (
    startTimeMs: number,
    durationMs = timelineWindowControls?.windowDurationMs,
    exactIndex = chainIndex,
    requestEpoch = ++navigationEpoch,
  ) => {
    if (!workflowId) return;
    const generation = ++intervalLoadGeneration;
    intervalLoader.abort();
    intervalLoading = true;

    const toTimelineGroupCollection = (
      model: TimelineRunModel,
      runEndTimeMs: number,
    ): TimelineGroup[] => {
      const target = new Array<TimelineGroup>(model.groupCount);
      // Materialization is an internal bounded LRU, not UI state.
      // eslint-disable-next-line svelte/prefer-svelte-reactivity
      const cache = new Map<number, TimelineGroup>();
      const groupAt = (ordinal: number): TimelineGroup | undefined => {
        if (ordinal < 0 || ordinal >= model.groupCount) return undefined;
        const cached = cache.get(ordinal);
        if (cached) {
          cache.delete(ordinal);
          cache.set(ordinal, cached);
          return cached;
        }
        const group = model.presentationGroups()[ordinal];
        if (!group) return undefined;
        const entry: TimelineGroup = Object.freeze({
          timelineKey: `${model.run.runId}:${group.id}`,
          runId: model.run.runId,
          ordinal,
          group,
          materialize: (value) =>
            model.materializePresentationGroup(value as typeof group),
          active: false,
          runEndTimeMs,
        });
        cache.set(ordinal, entry);
        if (cache.size > 4_096) cache.delete(cache.keys().next().value!);
        return entry;
      };
      const ordinalFor = (property: PropertyKey): number | undefined => {
        if (typeof property !== 'string' || !/^\d+$/.test(property)) {
          return undefined;
        }
        const ordinal = Number(property);
        return Number.isSafeInteger(ordinal) ? ordinal : undefined;
      };
      return new Proxy(target, {
        get(array, property, receiver) {
          const ordinal = ordinalFor(property);
          return ordinal === undefined
            ? Reflect.get(array, property, receiver)
            : groupAt(ordinal);
        },
        has(array, property) {
          const ordinal = ordinalFor(property);
          return ordinal === undefined
            ? Reflect.has(array, property)
            : ordinal >= 0 && ordinal < model.groupCount;
        },
      });
    };

    const toTimelineRun = (model: TimelineRunModel) => {
      const run = model.run;
      const groups = toTimelineGroupCollection(model, run.endTimeMs);
      return {
        runId: run.runId,
        status: run.status,
        startTimeMs: run.startTimeMs,
        endTimeMs: run.endTimeMs,
        groups,
        pointCount:
          model.statistics?.eventCount ??
          groups.reduce((count, entry) => count + entry.group.eventCount, 0),
        topologyGroups: model.topologyOrdinals?.map(
          (ordinal) => groups[ordinal],
        ),
        activeTimeRanges: model.activeTimeRanges,
        active: false,
        sourceState:
          run.status === 'Running' || run.status === 'Paused'
            ? ('closing-unsealed' as const)
            : ('sealed' as const),
        successorRunId: run.nextRunId,
      };
    };

    try {
      if (!exactIndex) return;
      const endTimeMs = startTimeMs + (durationMs ?? 0);
      const selection = selectChainIndexInterval({
        index: exactIndex,
        startTimeMs,
        endTimeMs,
        liveTimeMs: Date.now(),
      });
      const selectedSegment =
        selection.segments.find((segment) =>
          segment.runs.some(({ runId }) => runId === exactIndex.currentRunId),
        ) ?? selection.segments[0];
      if (!selectedSegment) return;
      const requestedRuns: WorkflowChainOverviewRun[] =
        selectedSegment.runs.map((run) => ({
          runId: run.runId,
          status: run.status,
          startTimeMs: run.startTimeMs,
          endTimeMs: chainRunEndTimeMs(run, Date.now()),
          nextRunId: run.successorRunId,
          transitionToNext: run.transitionToSuccessor,
        }));
      const result = await intervalLoader.load({
        namespace,
        workflowId,
        runs: requestedRuns,
        startTimeMs,
        endTimeMs,
      });
      if (
        generation !== intervalLoadGeneration ||
        requestEpoch !== navigationEpoch ||
        exactIndex.id !== chainIndex?.id
      ) {
        return;
      }
      const order = new Map(
        requestedRuns.map(({ runId }, index) => [runId, index]),
      );
      const models = [...result.models].sort(
        (left, right) =>
          (order.get(left.run.runId) ?? Number.MAX_SAFE_INTEGER) -
          (order.get(right.run.runId) ?? Number.MAX_SAFE_INTEGER),
      );
      const nextTimelineRuns: TimelineRun[] = [];
      let sliceStartedAt = performance.now();
      for (const model of models) {
        nextTimelineRuns.push(toTimelineRun(model));
        if (performance.now() - sliceStartedAt < 8) continue;
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => resolve()),
        );
        if (
          generation !== intervalLoadGeneration ||
          requestEpoch !== navigationEpoch
        ) {
          return;
        }
        sliceStartedAt = performance.now();
      }
      const previous = untrack(() => committedInterval);
      committedInterval = Object.freeze({
        id: Object.freeze({}),
        requestEpoch,
        chainIndexId: exactIndex.id,
        runs: Object.freeze(nextTimelineRuns),
        releases: Object.freeze(models.map((model) => model.retain())),
        truncated:
          selection.segments.length > 1 ||
          result.truncation.some(({ affectsSelectedWindow }) =>
            Boolean(affectsSelectedWindow),
          ),
      });
      await tick();
      for (const release of previous?.releases ?? []) release();
    } finally {
      if (generation === intervalLoadGeneration) intervalLoading = false;
    }
  };

  const loadCurrentTimelineWindow = async () => {
    await tick();
    const controls = timelineWindowControls;
    if (!controls) return;
    await loadTimelineInterval(
      controls.windowStartTimeMs,
      controls.windowDurationMs,
    );
  };

  const runTimelineWindowControl = (action: () => void) => {
    action();
    void loadCurrentTimelineWindow().catch((error: unknown) => {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        console.error('Unable to load the selected timeline interval.', error);
      }
    });
  };

  const zoomTimelineWindow = (direction: 'in' | 'out') => {
    const controls = timelineWindowControls;
    if (!controls) return;
    runTimelineWindowControl(
      direction === 'in' ? controls.zoomIn : controls.zoomOut,
    );
  };

  const moveTimelineWindow = (startTimeMs: number) => {
    timelineWindowControls?.moveToTime(startTimeMs);
    void loadTimelineInterval(startTimeMs).catch((error: unknown) => {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        console.error('Unable to load the selected timeline interval.', error);
      }
    });
  };

  const resizeTimelineWindow = ({
    startTimeMs,
    endTimeMs,
    anchor,
  }: {
    startTimeMs: number;
    endTimeMs: number;
    anchor: 'start' | 'end';
  }) => {
    const durationMs = clampTimelineWindowDuration(endTimeMs - startTimeMs);
    const resizedStartTimeMs =
      anchor === 'end' ? endTimeMs - durationMs : startTimeMs;
    timelineWindowControls?.resize(
      resizedStartTimeMs,
      resizedStartTimeMs + durationMs,
      anchor,
    );
    void loadTimelineInterval(resizedStartTimeMs, durationMs).catch(
      (error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.error('Unable to load the resized timeline interval.', error);
        }
      },
    );
  };

  const beginNavigation = () => {
    navigationController?.abort();
    navigationController = new AbortController();
    return {
      epoch: ++navigationEpoch,
      signal: navigationController.signal,
    };
  };

  const jumpTimelineToBeginning = () => {
    const request = beginNavigation();
    timelineWindowControls?.pause();
    void refreshChainOverview()
      .then(async (snapshot) => {
        if (
          !snapshot ||
          request.signal.aborted ||
          request.epoch !== navigationEpoch
        ) {
          return;
        }
        const earliestAvailable = snapshot.segments[0]?.runs[0];
        if (!earliestAvailable) return;
        await loadTimelineInterval(
          earliestAvailable.startTimeMs,
          timelineWindowControls?.windowDurationMs,
          snapshot,
          request.epoch,
        );
        if (request.signal.aborted || request.epoch !== navigationEpoch) return;
        timelineWindowControls?.moveToTime(earliestAvailable.startTimeMs);
        timelineWindowControls?.pause();
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.error('Unable to load the beginning of the timeline.', error);
        }
      });
  };

  const jumpTimelineToCurrent = () => {
    const request = beginNavigation();
    void refreshChainOverview()
      .then(async (snapshot) => {
        if (
          !snapshot ||
          request.signal.aborted ||
          request.epoch !== navigationEpoch
        ) {
          return;
        }
        const current = snapshot.segments
          .flatMap((segment) => segment.runs)
          .find(({ runId }) => runId === snapshot.currentRunId);
        if (!current) return;
        const durationMs = timelineWindowControls?.windowDurationMs ?? 1;
        const endTimeMs = chainRunEndTimeMs(current, Date.now());
        await loadTimelineInterval(
          endTimeMs - durationMs,
          durationMs,
          snapshot,
          request.epoch,
        );
        if (request.signal.aborted || request.epoch !== navigationEpoch) return;
        timelineWindowControls?.jumpToCurrent();
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.error('Unable to load the current timeline.', error);
        }
      });
  };

  const onToggleIdleTime = () => {
    if (!timeline) return;
    if (timeline.allCollapsibleSegmentsCollapsed) {
      timeline.expandAllSegments();
      $collapseIdleTime = 'off';
    } else {
      timeline.collapseAllSegments();
      $collapseIdleTime = 'on';
    }
  };
</script>

<InputAndResults />
<div class="flex flex-col gap-2">
  {#if workflowTaskFailedError}
    <WorkflowError
      error={workflowTaskFailedError}
      pendingTask={workflow?.pendingWorkflowTask}
    />
  {/if}
  {#if workflow?.callbacks?.length}
    <WorkflowCallbacks callbacks={workflow.callbacks} />
  {/if}
</div>

<!--
  Wrapper: single flex child so the parent's gap-4 only applies once (above
  this block). The controls bar sticks below the top-nav while the page scrolls
  the timeline past it; the timeline virtualizes itself from the visible page band.
-->
<div
  data-chain-load-generation={chainLoadDiagnostic}
  data-chain-first-run-id={firstRunId}
  data-chain-current-run-id={currentRunId}
  data-chain-route-run-id={workflowRunCtx.chainRunId}
>
  <div
    class="sticky top-0 z-[11] flex flex-wrap items-center justify-between gap-2 bg-background-primary pb-2 text-primary md:top-[var(--top-nav-height)] md:pt-2 xl:gap-8"
  >
    <div class="flex items-center gap-2">
      <h2>{translate('workflows.timeline-tab')}</h2>
      <EventHistoryLegend />
    </div>
    <div class="flex w-full flex-wrap items-center justify-end gap-2 xl:w-auto">
      <ToggleButtons
        role="group"
        aria-label={translate('workflows.timeline-view')}
      >
        <ToggleButton
          active={displayMode === 'full-duration'}
          data-testid="timeline-full-duration"
          onclick={() => onDisplayMode('full-duration')}
          size="sm"
        >
          {translate('workflows.timeline-full-duration')}
        </ToggleButton>
        <ToggleButton
          active={displayMode === 'fixed-window'}
          data-testid="timeline-fixed-window"
          onclick={() => onDisplayMode('fixed-window')}
          size="sm"
        >
          {translate('workflows.timeline-sliding-window')}
        </ToggleButton>
        <ToggleButton
          active={displayMode === 'lanes'}
          data-testid="timeline-lanes"
          onclick={() => onDisplayMode('lanes')}
          size="sm"
        >
          {translate('workflows.timeline-lanes')}
        </ToggleButton>
        <ToggleButton
          active={displayMode === 'classic'}
          data-testid="timeline-classic"
          onclick={() => onDisplayMode('classic')}
          size="sm"
        >
          {translate('workflows.timeline-classic')}
        </ToggleButton>
      </ToggleButtons>
      {#if displayMode !== 'classic'}
        <ToggleButtons>
          <ToggleButton
            active={showGroups}
            data-testid="timeline-show-groups"
            onclick={onShowGroups}
            size="sm"
          >
            {translate('workflows.timeline-show-groups')}
          </ToggleButton>
        </ToggleButtons>
      {/if}
      {#if displayMode === 'fixed-window' && timelineWindowControls}
        <ToggleButtons
          role="group"
          aria-label={translate('workflows.timeline-zoom-controls')}
          data-testid="timeline-zoom-controls"
        >
          <ToggleButton
            LeadingIcon={IconHyphen}
            aria-label={translate('workflows.timeline-zoom-out')}
            title={translate('workflows.timeline-zoom-out')}
            disabled={!timelineWindowControls.canZoomOut}
            data-testid="timeline-zoom-out"
            onclick={() => zoomTimelineWindow('out')}
            size="sm"
          >
            <span class="sr-only"
              >{translate('workflows.timeline-zoom-out')}</span
            >
          </ToggleButton>
          <span
            class="flex min-w-12 items-center justify-center border-y border-primary px-2 text-xs font-medium tabular-nums text-secondary"
            aria-live="polite"
            aria-label={translate('workflows.timeline-window-duration')}
            data-testid="timeline-window-duration"
          >
            {formatTimelineWindowDuration(
              timelineWindowControls.windowDurationMs,
            )}
          </span>
          <ToggleButton
            LeadingIcon={IconAdd}
            aria-label={translate('workflows.timeline-zoom-in')}
            title={translate('workflows.timeline-zoom-in')}
            disabled={!timelineWindowControls.canZoomIn}
            data-testid="timeline-zoom-in"
            onclick={() => zoomTimelineWindow('in')}
            size="sm"
          >
            <span class="sr-only"
              >{translate('workflows.timeline-zoom-in')}</span
            >
          </ToggleButton>
        </ToggleButtons>
        <ToggleButtons
          role="group"
          aria-label={translate('workflows.timeline-window-controls')}
          data-testid="sliding-window-controls"
        >
          <ToggleButton
            LeadingIcon={IconArrowLeft}
            disabled={chainOverviewLoading || timelineAtChainBeginning}
            data-testid="timeline-window-beginning"
            onclick={jumpTimelineToBeginning}
            size="sm"
          >
            {translate('workflows.timeline-jump-beginning')}
          </ToggleButton>
          <ToggleButton
            LeadingIcon={timelineWindowControls.mode === 'paused'
              ? IconPlay
              : IconPause}
            active={timelineWindowControls.mode === 'paused' &&
              !timelineWindowControls.atCurrent}
            disabled={timelineWindowControls.mode === 'paused' &&
              timelineWindowControls.atCurrent}
            data-testid="timeline-window-playback"
            onclick={timelineWindowControls.mode === 'paused'
              ? timelineWindowControls.resume
              : timelineWindowControls.pause}
            size="sm"
          >
            {timelineWindowControls.mode === 'paused'
              ? translate('workflows.timeline-resume')
              : translate('workflows.timeline-pause')}
          </ToggleButton>
          <ToggleButton
            LeadingIcon={IconArrowRight}
            disabled={timelineWindowControls.atCurrent}
            data-testid="timeline-window-current"
            onclick={jumpTimelineToCurrent}
            size="sm"
          >
            {translate(
              isNotPending
                ? 'workflows.timeline-jump-end'
                : 'workflows.timeline-jump-current',
            )}
          </ToggleButton>
        </ToggleButtons>
      {/if}
      <ToggleButtons>
        <ToggleButton
          LeadingIcon={reverseSort ? IconArrowDescending : IconArrowAscending}
          data-testid="timeline-sort"
          onclick={onSort}
          size="sm"
          variant="tertiary"
        >
          {reverseSort ? 'Descending' : 'Ascending'}
        </ToggleButton>
        <ToggleButton
          LeadingIcon={IconCollapse}
          data-testid="toggle-idle-time"
          loading={!historyCtx.fetchComplete}
          disabled={!historyCtx.fetchComplete ||
            !timeline?.hasCollapsibleSegments}
          onclick={onToggleIdleTime}
          size="sm"
          variant="tertiary"
        >
          {timeline?.allCollapsibleSegmentsCollapsed
            ? translate('workflows.show-idle-time')
            : translate('workflows.hide-idle-time')}
        </ToggleButton>
        <EventTypeFilter compact={false} />
      </ToggleButtons>
      <ToggleButtons>
        <ToggleButton
          disabled={isNotPending}
          data-testid="pause"
          size="sm"
          variant="tertiary"
          onclick={onAutoRefreshToggle}
        >
          <span
            class="h-1.5 w-1.5 rounded-full {$pauseLiveUpdates || isNotPending
              ? 'bg-content-tertiary'
              : 'bg-content-static-success'}"
          ></span>
          {$pauseLiveUpdates || isNotPending
            ? translate('workflows.auto-refresh-off')
            : translate('workflows.auto-refresh-on')}
        </ToggleButton>
        <ToggleButton
          data-testid="download"
          LeadingIcon={IconDownload}
          size="sm"
          variant="tertiary"
          onclick={() => (showDownloadPrompt = true)}
        >
          {translate('common.download')}
        </ToggleButton>
      </ToggleButtons>
    </div>
  </div>

  <!--
  Timeline in page flow: it's a tall element the page scrolls, and it
  virtualizes itself from the visible page band (no bounded scroll container,
  no scroll-offset bridge).
-->
  {#if workflow}
    {#if displayMode !== 'classic'}
      <TimelineChainOverview
        segments={chainOverviewSegments}
        loading={chainOverviewLoading}
        leadingInsetPx={nestedLanes
          ? LANE_TIME_ORIGIN_PX + TIMELINE_SHELL_BORDER_PX
          : 0}
        trailingInsetPx={nestedLanes ? GUTTER : 0}
        windowStartTimeMs={displayMode === 'fixed-window'
          ? timelineWindowControls?.windowStartTimeMs
          : undefined}
        windowEndTimeMs={displayMode === 'fixed-window'
          ? timelineWindowControls?.windowEndTimeMs
          : undefined}
        windowDurationMs={displayMode === 'fixed-window'
          ? timelineWindowControls?.windowDurationMs
          : undefined}
        windowMode={displayMode === 'fixed-window'
          ? timelineWindowControls?.mode
          : undefined}
        onWindowMove={displayMode === 'fixed-window'
          ? moveTimelineWindow
          : undefined}
        onWindowResize={displayMode === 'fixed-window'
          ? resizeTimelineWindow
          : undefined}
      />
      {#if instrumentTimelinePerformance}
        <div
          class="flex flex-wrap items-center gap-x-3 gap-y-1 border-x border-b border-primary px-3 py-1 text-xs tabular-nums text-secondary"
          data-testid="timeline-performance-stats"
        >
          <span>
            Rows {timelinePerformanceStats?.mountedRows ?? 0} mounted / {timelinePerformanceStats?.logicalRows ??
              0} total
          </span>
          <span>Lines {timelinePerformanceStats?.renderedLines ?? 0}</span>
          <span>DOM {timelinePerformanceStats?.renderedElements ?? 0}</span>
          <span>
            Update {(timelinePerformanceStats?.updateMs ?? 0).toFixed(1)} ms · p95
            {(timelinePerformanceStats?.p95UpdateMs ?? 0).toFixed(1)} ms
          </span>
        </div>
      {/if}
    {/if}
    {#if displayMode === 'classic'}
      <ClassicTimelineGraph
        {workflow}
        groups={classicGroups}
        {reverseSort}
        loading={!historyCtx.fetchComplete}
        totalExpectedEvents={estimatedTotalGroups}
        descMinId={historyCtx.descMinId}
        error={Boolean(workflowTaskFailedError)}
        onTimelineInit={handleTimelineInit}
      />
    {:else}
      <TimelineGraph
        {namespace}
        displayMode={graphDisplayMode}
        nesting={nestedLanes ? 'gutter' : 'canvas'}
        {showGroups}
        {workflow}
        groups={bufferGroups}
        {reverseSort}
        disableVirtualization={disableTimelineVirtualization}
        instrumentPerformance={instrumentTimelinePerformance}
        modelLoading={intervalLoading}
        sceneGeneration={committedInterval?.id}
        chainIndexId={chainIndex?.id}
        loading={!historyCtx.fetchComplete}
        totalExpectedEvents={estimatedTotalGroups}
        descMinId={historyCtx.descMinId}
        {firstEventTime}
        error={Boolean(workflowTaskFailedError)}
        onTimelineInit={handleTimelineInit}
        onRetentionWindow={workflowRunCtx.pruneRetainedRuns}
        rowHeightRetentionScopeId={workflowRunCtx.following
          ? workflowRunCtx.chainRunId
          : workflow.runId}
        knownChainStartRunId={workflowRunCtx.chainRunId}
        chainStartTimeMs={fullDurationScale
          ? chainOverviewRuns[0]?.startTimeMs
          : undefined}
        bind:windowControls={timelineWindowControls}
        bind:performanceStats={timelinePerformanceStats}
        {timelineRuns}
      />
    {/if}
    {#if workflowRunCtx.truncation?.affectsVisibleInterval || committedInterval?.truncated}
      <p class="mt-2 text-sm text-tertiary" role="status">
        {translate('workflows.chained-timeline-truncated')}
      </p>
    {/if}
  {/if}
</div>
<!-- end wrapper -->

{#if workflow}
  <DownloadEventHistoryModal
    bind:open={showDownloadPrompt}
    {namespace}
    workflowId={workflow.id}
    runId={workflow.runId}
  />
{/if}
