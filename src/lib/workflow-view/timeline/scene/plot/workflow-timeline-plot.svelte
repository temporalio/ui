<script lang="ts">
  import { SvelteSet } from 'svelte/reactivity';

  import { colorScales } from '$lib/theme/io/themes';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';

  import {
    getPlotRowLayout,
    getVisiblePlotRowRange,
    getWorkflowName,
    getWorkflowRunRanges,
    getWorkflowTimeRange,
  } from './header-presentation';
  import { lifecycleVisuals } from './lifecycle-visuals';
  import {
    getBufferedPlotEndMs,
    getFollowAfterInteraction,
    getLiveScrollLeft,
    getViewportDuration,
    getWheelInteraction,
    type ViewportInteraction,
  } from './live-viewport';
  import { getMarkGeometry } from './mark-geometry';
  import {
    getEventDescription,
    getEventPresentation,
    getMarkPresentation,
  } from './mark-presentation';
  import { getMinimapLandmarks } from './minimap-landmarks';
  import {
    getTimeTicks,
    getTimeTickStep,
    type TimeRange,
    timeToX,
  } from './time-viewport';
  import {
    getInitialViewport,
    getInitialViewportDuration,
    getViewportScrollLeft,
    getViewportStartMs,
  } from './viewport-anchor';
  import { getWheelTimeRange } from './wheel-time-range';
  import { getWorkflowStatus } from './workflow-status';
  import type { ExecutionHistoryState } from '../../../data/execution-history/types';
  import type { QualifiedHistoryEvent } from '../../../data/history-events/types';
  import type {
    ExecutionIdentity,
    ExecutionKey,
  } from '../../../data/identity-keys';
  import { flattenPlotScene } from '../structure/flatten-plot-scene';
  import type { ExecutionScene, WorkflowScene } from '../structure/types';
  import type { TimelineEventRow } from '../timeline-rows/types';

  import WorkflowTimelineIconDefs from './workflow-timeline-icon-defs.svelte';
  import WorkflowTimelineLegend from './workflow-timeline-legend.svelte';
  import WorkflowTimelineMinimap from './workflow-timeline-minimap.svelte';

  let {
    scene,
    historyEvents,
    executionHistories,
    onrequesthistory,
  }: {
    scene: WorkflowScene | null;
    historyEvents: readonly QualifiedHistoryEvent[];
    executionHistories: readonly ExecutionHistoryState[];
    onrequesthistory: (identity: ExecutionIdentity) => void;
  } = $props();

  const AXIS_HEIGHT = 44;
  const MIN_PLOT_HEIGHT = 128;
  const ENDPOINT_INSET = 32;
  const OVERSCAN = 20;
  const MAX_WIDTH = 4_000_000;

  let scroller: HTMLDivElement;
  let scrollTop = $state(0);
  let scrollLeft = $state(0);
  let viewportWidth = $state(0);
  let viewportHeight = $state(0);
  let requestedDuration = $state<number | null>(null);
  let initialViewport = $state<TimeRange | null>(null);
  let pinned = $state(false);
  let unpinnedStartMs = $state<number | null>(null);
  let selectedRow = $state<TimelineEventRow | null>(null);
  let horizontalScrollbarPointerX: number | null = null;
  let previousPolling = false;
  let lastLiveViewport: TimeRange | null = null;
  let now = $state(Date.now());
  let reducedMotion = $state(false);
  const expandedChildKeys = new SvelteSet<string>();
  const collapsedWorkflowKeys = new SvelteSet<string>();
  const collapsedExecutionKeys = new SvelteSet<string>();
  const isChildCollapsed = (key: string): boolean =>
    key.startsWith('workflow:')
      ? collapsedWorkflowKeys.has(key)
      : !expandedChildKeys.has(key);
  const isExecutionCollapsed = (key: string): boolean =>
    collapsedExecutionKeys.has(key);
  const rows = $derived(
    scene
      ? flattenPlotScene(scene, isChildCollapsed, isExecutionCollapsed)
      : [],
  );
  const rowLayout = $derived(getPlotRowLayout(rows));
  const plotHeight = $derived(
    Math.max(MIN_PLOT_HEIGHT, AXIS_HEIGHT + rowLayout.height + 20),
  );
  const eventByKey = $derived(
    new Map(historyEvents.map((event) => [event.eventKey, event])),
  );

  const minimapLandmarks = $derived(getMinimapLandmarks(scene, historyEvents));
  const historyByKey = $derived(
    new Map(
      executionHistories.map((history) => [history.executionKey, history]),
    ),
  );
  const activeExecutionKeys = $derived(
    new Set(
      executionHistories
        .filter(
          (history) =>
            history.stream.status === 'polling' ||
            history.stream.status === 'retrying',
        )
        .map((history) => history.executionKey),
    ),
  );
  const polling = $derived(activeExecutionKeys.size > 0);
  const recordedDomain = $derived.by((): TimeRange | null => {
    if (!historyEvents.length) return null;
    let startMs = Infinity;
    let endMs = -Infinity;
    for (const event of historyEvents) {
      startMs = Math.min(startMs, event.eventTimeMs);
      endMs = Math.max(endMs, event.eventTimeMs);
    }
    return { startMs, endMs: Math.max(startMs + 1, endMs) };
  });
  const domain = $derived(
    recordedDomain
      ? {
          startMs: recordedDomain.startMs,
          endMs: polling
            ? Math.max(recordedDomain.endMs, now)
            : recordedDomain.endMs,
        }
      : null,
  );
  const plotEndMs = $derived(
    domain
      ? Math.max(
          getBufferedPlotEndMs(domain.endMs, polling && !reducedMotion),
          (unpinnedStartMs ?? initialViewport?.startMs ?? domain.startMs) +
            getViewportDuration(
              requestedDuration ?? domain.endMs - domain.startMs,
              polling,
            ),
        )
      : null,
  );
  const plotDomain = $derived(
    recordedDomain && plotEndMs !== null
      ? {
          startMs: recordedDomain.startMs,
          endMs: plotEndMs,
        }
      : null,
  );
  const plotDuration = $derived(
    plotDomain ? plotDomain.endMs - plotDomain.startMs : 1,
  );
  const domainDuration = $derived(domain ? domain.endMs - domain.startMs : 1);
  const labelWidth = $derived(
    Math.min(360, Math.max(220, viewportWidth * 0.32)),
  );
  const width = $derived(Math.max(1, viewportWidth - labelWidth));
  const initialViewportCandidate = $derived(
    getInitialViewport(historyEvents, executionHistories),
  );
  const duration = $derived(
    getViewportDuration(requestedDuration ?? domainDuration, polling),
  );
  const minimumDuration = $derived(
    getViewportDuration(1, polling, (plotDuration * width) / MAX_WIDTH),
  );
  const contentWidth = $derived(
    Math.min(MAX_WIDTH, Math.max(width, (width * plotDuration) / duration)),
  );
  const viewport = $derived.by((): TimeRange | null => {
    if (!plotDomain) return null;
    const startMs = getViewportStartMs(scrollLeft, plotDomain, contentWidth);
    return {
      startMs,
      endMs: Math.min(
        plotDomain.endMs,
        startMs + (width / contentWidth) * plotDuration,
      ),
    };
  });
  const tickStep = $derived(viewport ? getTimeTickStep(viewport, width) : 0);
  const ticks = $derived(
    viewport && plotDomain
      ? getTimeTicks(viewport, width, plotDomain.startMs)
      : [],
  );
  const visibleRange = $derived(
    getVisiblePlotRowRange(
      rowLayout.rows,
      Math.max(0, scrollTop - AXIS_HEIGHT),
      Math.max(0, scrollTop + viewportHeight - AXIS_HEIGHT),
      OVERSCAN,
    ),
  );
  const firstIndex = $derived(visibleRange.firstIndex);
  const lastIndex = $derived(visibleRange.lastIndex);
  const visibleRows = $derived(rows.slice(firstIndex, lastIndex));
  function plotX(timeMs: number, range: TimeRange, plotWidth: number): number {
    const inset = Math.min(ENDPOINT_INSET, plotWidth / 2);
    return Math.max(
      inset,
      Math.min(
        plotWidth - (polling ? 0 : inset),
        timeToX(timeMs, range, plotWidth),
      ),
    );
  }

  function endingEvent(
    row: TimelineEventRow,
  ): QualifiedHistoryEvent | undefined {
    for (const key of row.eventKeys) {
      const event = eventByKey.get(key);
      if (event?.eventId === row.endEventId) return event;
    }
    return undefined;
  }

  function workflowRowForExecution(
    execution: ExecutionScene,
  ): TimelineEventRow | undefined {
    const entry = execution.entries.find(
      (item) => item.kind === 'row' && item.row.kind === 'workflow',
    );
    return entry?.kind === 'row' ? entry.row : undefined;
  }

  function statusForExecution(execution: ExecutionScene) {
    const workflowRow = workflowRowForExecution(execution);
    return getWorkflowStatus(
      workflowRow ? endingEvent(workflowRow)?.eventType : undefined,
      historyByKey.get(execution.execution.executionKey)?.load.status,
    );
  }

  function toggleKey(keys: SvelteSet<string>, key: string): void {
    if (keys.has(key)) keys.delete(key);
    else keys.add(key);
  }

  function selectRange(
    range: TimeRange,
    interaction: ViewportInteraction,
  ): void {
    if (!domain || !scroller) return;
    const nextDuration = getViewportDuration(
      range.endMs - range.startMs,
      polling,
      minimumDuration,
    );
    pinned =
      polling &&
      getFollowAfterInteraction(
        pinned,
        interaction,
        range.startMs - (viewport?.startMs ?? range.startMs),
      );
    unpinnedStartMs = pinned ? null : range.startMs;
    requestedDuration = nextDuration;
  }

  function toggleLiveFollow(): void {
    if (!polling || !viewport) return;
    pinned = !pinned;
    unpinnedStartMs = pinned ? null : viewport.startMs;
  }

  function pauseLiveFollow(): void {
    if (!pinned || !plotDomain || !scroller) return;
    unpinnedStartMs = getViewportStartMs(
      scroller.scrollLeft,
      plotDomain,
      contentWidth,
    );
    pinned = false;
  }

  function handlePlotPointerDown(event: PointerEvent): void {
    const bounds = scroller.getBoundingClientRect();
    horizontalScrollbarPointerX =
      event.target === scroller &&
      event.clientY >= bounds.top + scroller.clientHeight &&
      event.clientX < bounds.left + scroller.clientWidth
        ? event.clientX
        : null;
  }

  function handleScrollbarPointerMove(event: PointerEvent): void {
    if (horizontalScrollbarPointerX === null) return;
    if (event.clientX < horizontalScrollbarPointerX) pauseLiveFollow();
    horizontalScrollbarPointerX = event.clientX;
  }

  function handlePlotKeydown(event: KeyboardEvent): void {
    if (event.target === scroller && event.key === 'ArrowLeft') {
      pauseLiveFollow();
    }
  }

  function handlePlotWheel(event: WheelEvent): void {
    if (!(event.metaKey || event.ctrlKey)) {
      const horizontalOffset = event.shiftKey
        ? event.deltaY || event.deltaX
        : event.deltaX;
      const horizontalPan =
        event.shiftKey ||
        getWheelInteraction(event.deltaX, event.deltaY) === 'pan';
      if (horizontalPan && horizontalOffset < 0) pauseLiveFollow();
      return;
    }
    if (!domain || !viewport) return;
    if (!event.deltaX && !event.deltaY) return;
    event.preventDefault();
    const range = getWheelTimeRange({
      deltaX: event.deltaX,
      deltaY: event.deltaY,
      deltaMode: event.deltaMode,
      trackWidth: width,
      selection: viewport,
      domain,
      minDurationMs: minimumDuration,
    });
    if (range)
      selectRange(range, getWheelInteraction(event.deltaX, event.deltaY));
  }

  $effect(() => {
    for (const item of visibleRows) {
      const execution =
        item.kind === 'execution'
          ? item.execution
          : (item.kind === 'child' || item.kind === 'workflow') &&
              isChildCollapsed(item.key)
            ? item.workflow.executions.at(-1)
            : undefined;
      if (
        execution &&
        historyByKey.get(execution.execution.executionKey)?.load.status ===
          'pending'
      ) {
        onrequesthistory(execution.execution.identity);
      }
    }
  });

  $effect(() => {
    if (!scroller || !domain || !plotDomain || !initialViewport) return;
    const startMs = unpinnedStartMs ?? initialViewport.startMs;
    const nextScrollLeft =
      polling && pinned
        ? getLiveScrollLeft(domain, plotDomain, contentWidth, width)
        : getViewportScrollLeft(startMs, plotDomain, contentWidth);
    scroller.scrollLeft = nextScrollLeft;
    scrollLeft = scroller.scrollLeft;
  });

  $effect.pre(() => {
    if (!initialViewport && initialViewportCandidate && domain) {
      initialViewport = initialViewportCandidate;
      requestedDuration = getInitialViewportDuration(
        initialViewportCandidate,
        historyEvents,
        executionHistories,
      );
      unpinnedStartMs = initialViewportCandidate.startMs;
    }
    if (polling && viewport) lastLiveViewport = viewport;
    if (previousPolling && !polling && lastLiveViewport) {
      const range = lastLiveViewport;
      requestedDuration = range.endMs - range.startMs;
      unpinnedStartMs = range.startMs;
      pinned = false;
    }
    previousPolling = polling;
  });

  $effect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion = preference.matches;
    function updatePreference() {
      reducedMotion = preference.matches;
    }
    preference.addEventListener('change', updatePreference);
    return () => preference.removeEventListener('change', updatePreference);
  });

  $effect(() => {
    if (!polling) return;
    if (reducedMotion) {
      const interval = setInterval(() => {
        now = Date.now();
      }, 1000);
      return () => clearInterval(interval);
    }
    let frame: number;
    function advanceLiveClock() {
      now = Date.now();
      frame = requestAnimationFrame(advanceLiveClock);
    }
    frame = requestAnimationFrame(advanceLiveClock);
    return () => cancelAnimationFrame(frame);
  });
</script>

{#snippet timelineMark(
  row: TimelineEventRow,
  executionKey: ExecutionKey,
  range: TimeRange,
)}
  {@const left = plotX(row.startTimeMs, range, contentWidth)}
  {@const isRunning =
    row.kind === 'workflow' &&
    executionHistories.some(
      (history) =>
        history.executionKey === executionKey &&
        (history.stream.status === 'polling' ||
          history.stream.status === 'retrying'),
    )}
  {@const right = plotX(
    isRunning ? Math.max(row.endTimeMs, now) : row.endTimeMs,
    range,
    contentWidth,
  )}
  {@const presentation = getMarkPresentation(row.kind, left, right)}
  {@const events = row.eventKeys.flatMap((key) => {
    const event = eventByKey.get(key);
    return event ? [event] : [];
  })}
  {@const geometry = getMarkGeometry(
    left,
    right,
    events.map((event) => ({
      x: plotX(event.eventTimeMs, range, contentWidth),
      eventType: event.eventType,
    })),
    { clusterDistance: 8, radius: 5 },
  )}
  {@const bounds = geometry.bounds}
  {@const finalEvent = endingEvent(row)}

  <div
    class="mark"
    class:workflow-events={presentation.isWorkflow}
    style:left={`${labelWidth + bounds.left}px`}
    style:width={`${bounds.right - bounds.left}px`}
    style:--line-color={finalEvent
      ? getEventPresentation(row.kind, finalEvent.eventType).color
      : colorScales.neutral[8]}
  >
    {#if presentation.showLine}
      <span
        class="mark-line"
        class:running={isRunning}
        style:left={`${left - bounds.left}px`}
        style:width={`${right - left}px`}
      ></span>
    {/if}
    <button
      type="button"
      class="mark-hit"
      aria-label={`View lifecycle details for ${row.label}`}
      onclick={() => (selectedRow = row)}
    ></button>

    {#each geometry.ticks as eventTick (eventTick.x)}
      {@const description = `${getEventDescription(eventTick.eventType, eventTick.count)} · View lifecycle details`}
      {@const eventPresentation = getEventPresentation(
        row.kind,
        eventTick.eventType,
      )}
      <button
        type="button"
        class="event-dot"
        class:diamond={eventPresentation.shape === 'diamond'}
        class:square={eventPresentation.shape === 'square'}
        class:compact={presentation.isCompact}
        class:outcome={eventPresentation.isOutcome}
        class:cluster={eventTick.count > 1}
        style:left={`${eventTick.x - bounds.left}px`}
        style:--event-color={eventPresentation.color}
        title={description}
        aria-label={description}
        onclick={() => (selectedRow = row)}
      ></button>
    {/each}
  </div>
{/snippet}

{#snippet summaryMark(range: TimeRange, workflow: WorkflowScene)}
  {#if plotDomain}
    {@const left = plotX(range.startMs, plotDomain, contentWidth)}
    {@const right = plotX(range.endMs, plotDomain, contentWidth)}
    {@const runs = getWorkflowRunRanges(workflow, activeExecutionKeys, now)}
    <div
      class="summary-mark"
      style:left={`${labelWidth + left}px`}
      style:width={`${Math.max(1, right - left)}px`}
    >
      {#each runs as run, index (run.executionKey)}
        {@const runLeft = plotX(run.startMs, plotDomain, contentWidth)}
        {@const runRight = plotX(run.endMs, plotDomain, contentWidth)}
        <button
          type="button"
          class="run-segment"
          class:divider={index < runs.length - 1}
          style:left={`${runLeft - left}px`}
          style:width={`${Math.max(1, runRight - runLeft)}px`}
          title={`Run ${run.runNumber} · View lifecycle details`}
          aria-label={`View lifecycle details for run ${run.runNumber} of ${workflow.executions.length}`}
          onclick={() => (selectedRow = run.row)}
        ></button>
      {/each}
    </div>
  {/if}
{/snippet}

<svelte:window
  onkeydown={handlePlotKeydown}
  onpointermove={handleScrollbarPointerMove}
  onpointerup={() => (horizontalScrollbarPointerX = null)}
  onpointercancel={() => (horizontalScrollbarPointerX = null)}
/>

<div class="timeline">
  <WorkflowTimelineIconDefs />
  <div class="timeline-tools">
    {#if polling}
      <button
        type="button"
        class="fit-timeline"
        aria-pressed={pinned}
        disabled={!initialViewport}
        onclick={toggleLiveFollow}
        >{pinned ? 'Following live' : 'Follow live'}</button
      >
    {/if}
    <button
      type="button"
      class="fit-timeline"
      disabled={!domain || !initialViewport}
      onclick={() => domain && selectRange(domain, 'zoom')}
      >Fit entire timeline</button
    >
    <div><WorkflowTimelineLegend /></div>
  </div>
  <div class="minimap-area" style:margin-left={`${labelWidth}px`}>
    <WorkflowTimelineMinimap
      {domain}
      {viewport}
      landmarks={minimapLandmarks}
      minDurationMs={minimumDuration}
      pinnedLive={polling && pinned}
      onselect={selectRange}
    />
  </div>
  <div class="plot-frame" style:max-height={`${plotHeight}px`}>
    <div
      class="scroller"
      role="region"
      aria-label="Workflow timeline plot"
      bind:this={scroller}
      bind:clientWidth={viewportWidth}
      bind:clientHeight={viewportHeight}
      onwheel={handlePlotWheel}
      onpointerdown={handlePlotPointerDown}
      onscroll={(event) => {
        const nextScrollLeft = event.currentTarget.scrollLeft;
        scrollTop = event.currentTarget.scrollTop;
        if (!pinned && plotDomain && nextScrollLeft !== scrollLeft) {
          unpinnedStartMs = getViewportStartMs(
            nextScrollLeft,
            plotDomain,
            contentWidth,
          );
        }
        scrollLeft = nextScrollLeft;
      }}
    >
      <div class="content" style:width={`${labelWidth + contentWidth}px`}>
        <div class="axis" style:height={`${AXIS_HEIGHT}px`}>
          <div class="axis-label" style:width={`${labelWidth}px`}>
            Workflow / event
          </div>
          {#if plotDomain}
            {#each ticks as time (time)}
              <span
                class="tick"
                class:origin={time === plotDomain.startMs}
                style:left={`${labelWidth + timeToX(time, plotDomain, contentWidth)}px`}
              >
                {formatDistanceAbbreviated({
                  start: new Date(plotDomain.startMs),
                  end: new Date(time),
                  includeMilliseconds: tickStep < 1000,
                }) || (tickStep < 1000 ? '0ms' : '0s')}
              </span>
            {/each}
          {/if}
        </div>
        <div class="body" style:height={`${rowLayout.height}px`}>
          {#if plotDomain}
            {#each ticks as time (time)}
              <div
                class="grid-line"
                style:left={`${labelWidth + timeToX(time, plotDomain, contentWidth)}px`}
              ></div>
            {/each}

            {#each visibleRows as item, index (item.key)}
              {@const rowIndex = firstIndex + index}
              {@const latestExecution =
                item.kind === 'child' || item.kind === 'workflow'
                  ? item.workflow.executions.at(-1)
                  : undefined}
              {@const isCollapsed =
                item.kind === 'child' || item.kind === 'workflow'
                  ? isChildCollapsed(item.key)
                  : item.kind === 'execution' && isExecutionCollapsed(item.key)}
              <div
                class="row"
                class:child={item.kind === 'child' || item.kind === 'workflow'}
                class:execution={item.kind === 'execution'}
                style:top={`${rowLayout.rows[rowIndex].top}px`}
                style:height={`${rowLayout.rows[rowIndex].height}px`}
                style:--row-depth={item.depth}
                style:--row-height={`${rowLayout.rows[rowIndex].height}px`}
              >
                <div
                  class="row-label"
                  class:child={item.kind === 'child' ||
                    item.kind === 'workflow'}
                  class:execution={item.kind === 'execution'}
                  class:continued={item.kind === 'execution' &&
                    item.continuesAsNew}
                  class:collapsed={isCollapsed}
                  style:width={`${labelWidth}px`}
                >
                  <span
                    class="hierarchy-rail"
                    title={`Level ${item.depth}`}
                    aria-hidden="true"
                  >
                    {#each [1, 2, 3, 4] as level (level)}
                      <span
                        class:visible={item.depth >= level}
                        class:active={Math.min(item.depth, 4) === level}
                        class:continues={(rows[rowIndex + 1]?.depth ?? 0) >=
                          level}
                        style:--level={level}
                      ></span>
                    {/each}
                  </span>
                  {#if item.kind === 'child' || item.kind === 'workflow'}
                    {@const workflowId =
                      item.workflow.executions[0]?.execution.identity
                        .workflowId ?? 'Child workflow'}
                    {@const workflowName = getWorkflowName(
                      item.workflow,
                      historyEvents,
                    )}
                    <button
                      type="button"
                      class="toggle"
                      aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} workflow ${workflowId}`}
                      aria-expanded={!isCollapsed}
                      onclick={() =>
                        toggleKey(
                          item.kind === 'workflow'
                            ? collapsedWorkflowKeys
                            : expandedChildKeys,
                          item.key,
                        )}>{isCollapsed ? '▸' : '▾'}</button
                    >
                    {#if latestExecution}
                      {@const status = statusForExecution(latestExecution)}
                      <span
                        class="status-dot"
                        style:--status-color={status.color}
                        title={status.label}
                        aria-label={status.label}
                      ></span>
                    {/if}
                    <svg
                      class="header-icon"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      aria-hidden="true"><use href="#wt-icon-workflow" /></svg
                    >
                    <span class="header-id">
                      <span class="header-title" title={workflowName}
                        >{workflowName}</span
                      >
                      <span class="row-text secondary-id" title={workflowId}
                        >{workflowId}</span
                      >
                    </span>
                  {:else if item.kind === 'execution'}
                    {@const runId = item.execution.execution.identity.runId}
                    {@const historyState = historyByKey.get(
                      item.execution.execution.executionKey,
                    )}
                    {#if item.hasDetails}
                      <button
                        type="button"
                        class="toggle"
                        aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} run ${runId}`}
                        aria-expanded={!isCollapsed}
                        onclick={() =>
                          toggleKey(collapsedExecutionKeys, item.key)}
                        >{isCollapsed ? '▸' : '▾'}</button
                      >
                    {:else}
                      <span class="toggle-spacer" aria-hidden="true"></span>
                    {/if}
                    {@const status = statusForExecution(item.execution)}
                    <span
                      class="status-dot"
                      style:--status-color={status.color}
                      title={status.label}
                      aria-label={status.label}
                    ></span>
                    <span class="header-id">
                      <span class="header-title run-title">
                        Run {item.runNumber} of {item.runCount}
                        {#if item.continuesAsNew}
                          <span
                            class="continuation-label"
                            title="Continues as new">↪</span
                          >
                        {/if}
                      </span>
                      <span class="row-text secondary-id" title={runId}
                        >{runId}</span
                      >
                    </span>
                    {#if historyState?.load.status === 'failed'}
                      <span
                        class="history-status failed"
                        title="History unavailable"
                        aria-label="History unavailable">!</span
                      >
                    {:else if historyState?.load.status === 'loading' || historyState?.load.status === 'pending'}
                      <span
                        class="history-status"
                        title="Loading history"
                        aria-label="Loading history">…</span
                      >
                    {/if}
                  {:else}
                    <span class="toggle-spacer"></span>
                    <svg
                      class="event-type-icon"
                      style:color={lifecycleVisuals[item.row.kind].bgColor}
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      aria-hidden="true"
                      ><use
                        href={`#wt-icon-${lifecycleVisuals[item.row.kind].icon}`}
                      /></svg
                    >
                    <button
                      type="button"
                      class="event-label row-text"
                      title={item.row.label}
                      onclick={() => (selectedRow = item.row)}
                      >{item.row.label}</button
                    >
                  {/if}
                </div>
                {#if item.kind === 'event'}
                  {@render timelineMark(
                    item.row,
                    item.executionKey,
                    plotDomain,
                  )}
                {:else if item.kind === 'execution'}
                  {@const workflowRow = workflowRowForExecution(item.execution)}
                  {#if workflowRow}
                    {@render timelineMark(
                      workflowRow,
                      item.execution.execution.executionKey,
                      plotDomain,
                    )}
                  {/if}
                {:else}
                  {@const workflowRange = getWorkflowTimeRange(
                    item.workflow,
                    activeExecutionKeys,
                    now,
                  )}
                  {#if workflowRange}
                    {@render summaryMark(workflowRange, item.workflow)}
                  {/if}
                {/if}
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </div>
  </div>
  {#if selectedRow}
    <aside class="details" aria-label="Lifecycle details">
      <div class="details-heading">
        <strong>{selectedRow.label}</strong>
        <button
          type="button"
          aria-label="Close lifecycle details"
          onclick={() => (selectedRow = null)}>Close</button
        >
      </div>
      {#each selectedRow.eventKeys as eventKey (eventKey)}
        {@const event = eventByKey.get(eventKey)}
        {#if event}
          <details>
            <summary
              >#{event.eventId}
              {event.eventType} · {new Date(
                event.eventTimeMs,
              ).toISOString()}</summary
            >
            <pre>{JSON.stringify(
                event,
                (_key, value) =>
                  typeof value === 'bigint' ? String(value) : value,
                2,
              )}</pre>
          </details>
        {/if}
      {/each}
    </aside>
  {/if}
</div>

<style>
  .timeline {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    width: 100%;

    --page-gutter: 1rem;
  }

  .timeline-tools {
    display: flex;
    align-items: center;
    justify-content: end;
    gap: 12px;
    font-size: 12px;
  }

  .fit-timeline {
    padding: 2px 6px;
    border: 0;
    border-radius: 4px;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }

  .fit-timeline:hover:not(:disabled) {
    background: var(--color-surface-secondary);
  }

  .fit-timeline:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .fit-timeline:focus-visible {
    outline: 2px solid var(--color-content-primary);
    outline-offset: 2px;
  }

  .minimap-area {
    min-width: 0;
  }

  .plot-frame {
    display: flex;
    box-sizing: border-box;
    flex: 1;
    min-height: 8rem;
    min-width: 0;
    overflow: hidden;
    border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
    border-radius: 0.5rem;
    background: var(--color-surface-primary);
    color: var(--color-content-primary);
  }

  .scroller {
    flex: 1;
    min-height: 0;
    min-width: 0;
    overflow: auto;
    overflow-x: scroll;
    scrollbar-gutter: stable;
  }

  .scroller::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  .scroller::-webkit-scrollbar-track,
  .scroller::-webkit-scrollbar-corner {
    background: var(--color-surface-primary);
  }

  .scroller::-webkit-scrollbar-thumb {
    border: 2px solid var(--color-surface-primary);
    border-radius: 999px;
    background: color-mix(
      in srgb,
      var(--color-content-primary) 30%,
      transparent
    );
  }

  .scroller::-webkit-scrollbar-thumb:hover {
    background: color-mix(
      in srgb,
      var(--color-content-primary) 45%,
      transparent
    );
  }

  @supports not selector(::-webkit-scrollbar) {
    .scroller {
      scrollbar-width: thin;
      scrollbar-color: color-mix(
          in srgb,
          var(--color-content-primary) 30%,
          transparent
        )
        var(--color-surface-primary);
    }
  }

  .content {
    position: relative;
    min-height: 100%;
    overflow-x: clip;
  }

  .axis {
    position: sticky;
    top: 0;
    z-index: 5;
    background: var(--color-surface-primary);
    border-bottom: 1px solid color-mix(in srgb, currentColor 20%, transparent);
  }

  .axis-label {
    position: sticky;
    left: 0;
    z-index: 6;
    display: flex;
    align-items: end;
    box-sizing: border-box;
    height: 100%;
    padding: 0 12px 8px;
    border-right: 1px solid color-mix(in srgb, currentColor 25%, transparent);
    background: var(--color-surface-primary);
    font-size: 12px;
    font-weight: 600;
  }

  .tick {
    position: absolute;
    bottom: 0.5rem;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    white-space: nowrap;
    transform: translateX(-50%);
  }

  .tick.origin {
    transform: translateX(4px);
  }

  .body {
    position: relative;
  }

  .grid-line {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    background: currentColor;
    opacity: 0.1;
    pointer-events: none;
  }

  .row {
    position: absolute;
    box-sizing: border-box;
    width: 100%;
    height: 32px;
  }

  .row:hover,
  .row:focus-within {
    z-index: 4;
  }

  .row-label {
    position: sticky;
    left: 0;
    z-index: 3;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    height: 100%;
    padding-left: calc(20px + min(var(--row-depth), 4) * 14px);
    padding-right: 8px;
    border-right: 1px solid color-mix(in srgb, currentColor 25%, transparent);
    background: var(--color-surface-primary);
    font-size: 12px;
  }

  .row-label.child {
    font-weight: 600;
  }

  .hierarchy-rail {
    position: absolute;
    top: 0;
    left: 8px;
    height: 100%;
    pointer-events: none;
  }

  .hierarchy-rail span {
    position: absolute;
    top: 0;
    left: calc(var(--level) * 14px);
    width: 1px;
    height: 50%;
    background: currentColor;
    opacity: 0;
  }

  .hierarchy-rail span.continues {
    height: 100%;
  }

  .hierarchy-rail span.visible {
    opacity: 0.4;
  }

  .hierarchy-rail span.active::after {
    position: absolute;
    top: calc(var(--row-height) / 2);
    left: 0;
    width: 10px;
    border-top: 1px solid currentColor;
    content: '';
  }

  .toggle,
  .toggle-spacer {
    flex: none;
    width: 22px;
    height: 22px;
    margin-right: 4px;
  }

  .toggle {
    padding: 0;
    border: 0;
    border-radius: 3px;
    background: transparent;
    color: inherit;
    cursor: pointer;
    font-size: 16px;
  }

  .toggle:hover,
  .toggle:focus-visible {
    background: color-mix(in srgb, currentColor 15%, transparent);
  }

  .row-text {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .header-icon,
  .event-type-icon {
    flex: none;
    margin-right: 6px;
    color: var(--color-action-workflow-workflow);
  }

  .header-title {
    display: block;
    overflow: hidden;
    color: var(--color-action-workflow-workflow);
    font-size: 12px;
    font-weight: 600;
    line-height: 16px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .header-title.run-title {
    color: var(--color-content-secondary);
    font-weight: 500;
  }

  .secondary-id {
    color: var(--color-content-secondary);
    font-size: 11px;
    font-weight: 400;
    line-height: 16px;
  }

  .header-id {
    position: relative;
    flex: 1;
    min-width: 0;
    height: 32px;
  }

  .header-id .row-text {
    display: block;
  }

  .status-dot {
    flex: none;
    width: 8px;
    height: 8px;
    margin-right: 6px;
    border-radius: 50%;
    background: var(--status-color);
  }

  .continuation-label {
    flex: none;
    margin-right: 4px;
    color: var(--color-content-secondary);
    font-size: 11px;
    font-weight: 400;
    white-space: nowrap;
  }

  .history-status {
    flex: none;
    margin-left: auto;
    padding-left: 4px;
    color: var(--color-content-secondary);
  }

  .history-status.failed {
    color: var(--color-content-primary);
    font-weight: 700;
  }

  .row-label:hover .event-label,
  .row-label:focus-within .event-label,
  .row-label:hover .header-id .row-text,
  .row-label:focus-within .header-id .row-text {
    position: absolute;
    left: calc(66px + min(var(--row-depth), 4) * 14px);
    width: max-content;
    max-width: min(560px, calc(100vw - 80px));
    padding: 4px 6px;
    border: 1px solid color-mix(in srgb, currentColor 25%, transparent);
    border-radius: 4px;
    background: var(--color-surface-primary);
    box-shadow: 0 2px 8px color-mix(in srgb, black 16%, transparent);
  }

  .row-label:hover .header-id .row-text,
  .row-label:focus-within .header-id .row-text {
    left: 0;
    top: 16px;
  }

  .event-label {
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    cursor: pointer;
    text-align: left;
  }

  .event-label:hover {
    text-decoration: underline;
  }

  .summary-mark {
    position: absolute;
    top: 50%;
    height: 0;
    color: var(--color-action-workflow-workflow);
  }

  .run-segment {
    position: absolute;
    top: -5px;
    height: 10px;
    box-sizing: border-box;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: currentColor;
    color: inherit;
    opacity: 0.6;
    cursor: pointer;
  }

  .run-segment:first-child {
    border-radius: 999px 0 0 999px;
  }

  .run-segment:last-child {
    border-radius: 0 999px 999px 0;
  }

  .run-segment:only-child {
    border-radius: 999px;
  }

  .run-segment.divider {
    border-right: 2px solid var(--color-surface-primary);
  }

  .run-segment:hover {
    opacity: 0.85;
  }

  .run-segment:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 3px;
  }

  .mark {
    position: absolute;
    top: 50%;
    height: 0;
  }

  .mark-line {
    position: absolute;
    top: -3px;
    width: 100%;
    height: 6px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--line-color) 45%, transparent);
  }

  .workflow-events .mark-line {
    top: -0.5px;
    height: 1px;
    background: color-mix(in srgb, currentColor 20%, transparent);
  }

  .mark-line.running {
    overflow: hidden;
    background: transparent;
  }

  .mark-line.running::after {
    position: absolute;
    inset: 0 -6px 0 0;
    background: repeating-linear-gradient(
      to right,
      var(--line-color) 0 3px,
      transparent 3px 6px
    );
    background-size: 6px 100%;
    animation: dash 1.8s linear infinite;
    will-change: transform;
    content: '';
  }

  @keyframes dash {
    to {
      transform: translateX(-6px);
    }
  }

  .event-dot {
    position: absolute;
    top: 0;
    z-index: 2;
    width: 5px;
    height: 5px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: var(--event-color);
    cursor: pointer;
    transform: translate(-50%, -50%);
  }

  .event-dot.outcome,
  .event-dot.compact {
    width: 9px;
    height: 9px;
  }

  .event-dot.diamond {
    width: 7px;
    height: 7px;
    border-radius: 1px;
    transform: translate(-50%, -50%) rotate(45deg);
  }

  .event-dot.square {
    width: 7px;
    height: 7px;
    border-radius: 1px;
  }

  .event-dot.cluster {
    box-sizing: border-box;
    width: 9px;
    height: 9px;
    border: 2px solid var(--event-color);
    background: var(--color-surface-primary);
  }

  .event-dot.cluster.diamond {
    width: 7px;
    height: 7px;
  }

  .event-dot:focus-visible {
    outline: 2px solid var(--color-content-primary);
    outline-offset: 3px;
  }

  .mark-hit {
    position: absolute;
    top: -11px;
    left: 50%;
    z-index: 1;
    width: 100%;
    min-width: 24px;
    height: 22px;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
    transform: translateX(-50%);
  }

  .mark-hit::before {
    position: absolute;
    inset: -3px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--line-color) 25%, transparent);
    opacity: 0;
    pointer-events: none;
    content: '';
  }

  .mark-hit:hover::before,
  .mark-hit:focus-visible::before {
    opacity: 1;
  }

  .mark-hit:focus-visible {
    outline: 2px solid var(--color-content-primary);
    outline-offset: 3px;
    border-radius: 999px;
  }

  .details {
    position: absolute;
    right: calc(-1 * var(--page-gutter));
    bottom: 0;
    left: calc(-1 * var(--page-gutter));
    z-index: 10;
    box-sizing: border-box;
    height: 14rem;
    overflow: auto;
    padding: 0.75rem;
    border-top: 1px solid currentColor;
    background: var(--color-surface-primary);
    box-shadow: 0 -4px 16px color-mix(in srgb, black 15%, transparent);
  }

  @media (width >= 768px) {
    .timeline {
      --page-gutter: 2rem;
    }
  }

  .details-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .details pre {
    overflow: auto;
    font-size: 0.75rem;
  }
</style>
