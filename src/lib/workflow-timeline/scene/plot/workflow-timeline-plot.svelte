<script lang="ts">
  import { SvelteSet } from 'svelte/reactivity';

  import { tick, untrack } from 'svelte';

  import { colorScales } from '$lib/theme/io/themes';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';

  import {
    getPlotRowLayout,
    getVisiblePlotRowRange,
    getWorkflowName,
    getWorkflowTimeRange,
  } from './header-presentation';
  import { lifecycleVisuals } from './lifecycle-visuals';
  import { getMarkGeometry } from './mark-geometry';
  import {
    getEventPresentation,
    getMarkPresentation,
  } from './mark-presentation';
  import { getLineColor } from './mark-visuals';
  import { getMinimapLandmarks } from './minimap-landmarks';
  import { getTimeTicks, type TimeRange, timeToX } from './time-viewport';
  import { getWheelTimeRange } from './wheel-time-range';
  import { getWorkflowStatus } from './workflow-status';
  import type { ExecutionHistoryState } from '../../data/execution-history/types';
  import type { QualifiedHistoryEvent } from '../../data/history-events/types';
  import type {
    ExecutionIdentity,
    ExecutionKey,
  } from '../../data/identity-keys';
  import { flattenPlotScene } from '../structure/flatten-plot-scene';
  import type { ExecutionScene, WorkflowScene } from '../structure/types';
  import type { TimelineEventRow } from '../timeline-rows/types';

  import WorkflowTimelineIconDefs from './workflow-timeline-icon-defs.svelte';
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
  let initialLiveDuration = $state<number | null>(null);
  let pinned = $state(true);
  let unpinnedStartMs = $state<number | null>(null);
  let selectedRow = $state<TimelineEventRow | null>(null);
  let previousPolling = false;
  let lastLiveViewport: TimeRange | null = null;
  let now = $state(Date.now());
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
  const eventTimes = $derived(historyEvents.map((event) => event.eventTimeMs));
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
  const domain = $derived.by((): TimeRange | null => {
    if (!historyEvents.length) return null;
    let startMs = Infinity;
    let endMs = -Infinity;
    for (const event of historyEvents) {
      startMs = Math.min(startMs, event.eventTimeMs);
      endMs = Math.max(endMs, event.eventTimeMs);
    }
    return { startMs, endMs: Math.max(startMs + 1, polling ? now : endMs) };
  });
  const domainDuration = $derived(domain ? domain.endMs - domain.startMs : 1);
  const labelWidth = $derived(
    Math.min(360, Math.max(220, viewportWidth * 0.32)),
  );
  const width = $derived(Math.max(1, viewportWidth - labelWidth));
  const defaultDuration = $derived(
    polling
      ? Math.min(
          domainDuration,
          initialLiveDuration ??
            Math.max(60_000, Math.min(3_600_000, domainDuration / 4)),
        )
      : domainDuration,
  );
  const duration = $derived(
    Math.min(domainDuration, requestedDuration ?? defaultDuration),
  );
  const contentWidth = $derived(
    Math.min(MAX_WIDTH, Math.max(width, (width * domainDuration) / duration)),
  );
  const viewport = $derived.by((): TimeRange | null => {
    if (!domain) return null;
    const startMs =
      domain.startMs + (scrollLeft / contentWidth) * domainDuration;
    return {
      startMs,
      endMs: Math.min(
        domain.endMs,
        startMs + (width / contentWidth) * domainDuration,
      ),
    };
  });
  const ticks = $derived(viewport ? getTimeTicks(viewport, width) : []);
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
      Math.min(plotWidth - inset, timeToX(timeMs, range, plotWidth)),
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

  function selectRange(range: TimeRange): void {
    if (!domain || !scroller) return;
    const nextDuration = Math.max(
      1,
      (domainDuration * width) / MAX_WIDTH,
      range.endMs - range.startMs,
    );
    pinned = polling && range.endMs >= domain.endMs - 1;
    unpinnedStartMs = pinned ? null : range.startMs;
    requestedDuration = nextDuration;
    void tick().then(() => {
      if (!scroller || !domain) return;
      scroller.scrollLeft = Math.max(
        0,
        timeToX(range.startMs, domain, contentWidth),
      );
    });
  }

  function handlePlotWheel(event: WheelEvent): void {
    if (!(event.metaKey || event.ctrlKey) || !domain || !viewport) return;
    if (!event.deltaX && !event.deltaY) return;
    event.preventDefault();
    const range = getWheelTimeRange({
      deltaX: event.deltaX,
      deltaY: event.deltaY,
      deltaMode: event.deltaMode,
      trackWidth: width,
      selection: viewport,
      domain,
      minDurationMs: (domainDuration * width) / MAX_WIDTH,
      pinnedLive: polling && pinned,
    });
    if (range) selectRange(range);
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
    if (!scroller || !domain) return;
    if (polling && pinned) {
      scroller.scrollLeft = Math.max(0, contentWidth - width);
    } else {
      const startMs = untrack(() => unpinnedStartMs);
      if (startMs !== null) {
        scroller.scrollLeft = Math.max(
          0,
          timeToX(startMs, domain, contentWidth),
        );
      }
    }
  });

  $effect.pre(() => {
    if (polling && domain && initialLiveDuration === null) {
      initialLiveDuration = Math.max(
        60_000,
        Math.min(3_600_000, domainDuration / 4),
      );
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
    if (!polling) return;
    const interval = setInterval(() => {
      now = Date.now();
    }, 1000);
    return () => clearInterval(interval);
  });
</script>

{#snippet timelineMark(
  row: TimelineEventRow,
  executionKey: ExecutionKey,
  range: TimeRange,
)}
  {@const visual = lifecycleVisuals[row.kind]}
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

  <div
    class="mark"
    class:workflow-events={presentation.isWorkflow}
    style:left={`${labelWidth + bounds.left}px`}
    style:width={`${bounds.right - bounds.left}px`}
    style:--line-color={isRunning
      ? colorScales.blue[9]
      : getLineColor(endingEvent(row)?.eventType, visual.bgColor)}
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
      {@const description =
        eventTick.count > 1
          ? `${eventTick.count} events · ${eventTick.eventType} · View lifecycle details`
          : `${eventTick.eventType} · View lifecycle details`}
      {@const eventPresentation = getEventPresentation(
        row.kind,
        eventTick.eventType,
      )}
      <button
        type="button"
        class="event-dot"
        class:point={presentation.isPoint}
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

{#snippet summaryMark(
  range: TimeRange,
  row: TimelineEventRow | undefined,
  workflow: boolean,
)}
  {#if domain}
    {@const left = plotX(range.startMs, domain, contentWidth)}
    {@const right = plotX(range.endMs, domain, contentWidth)}
    <div
      class="summary-mark"
      class:workflow
      style:left={`${labelWidth + left}px`}
      style:width={`${Math.max(1, right - left)}px`}
    >
      <span class="summary-line"></span>
      {#if row}
        <button
          type="button"
          class="mark-hit"
          aria-label={workflow ? 'View latest run details' : 'View run details'}
          onclick={() => (selectedRow = row)}
        ></button>
      {/if}
    </div>
  {/if}
{/snippet}

<div class="timeline">
  <WorkflowTimelineIconDefs />
  <div class="minimap-area" style:margin-left={`${labelWidth}px`}>
    <WorkflowTimelineMinimap
      {domain}
      {viewport}
      {eventTimes}
      landmarks={minimapLandmarks}
      minDurationMs={(domainDuration * width) / MAX_WIDTH}
      pinnedLive={polling && pinned}
      onselect={selectRange}
    />
  </div>
  <div
    class="scroller"
    style:max-height={`${plotHeight}px`}
    role="region"
    aria-label="Workflow timeline plot"
    bind:this={scroller}
    bind:clientWidth={viewportWidth}
    bind:clientHeight={viewportHeight}
    onwheel={handlePlotWheel}
    onscroll={(event) => {
      scrollTop = event.currentTarget.scrollTop;
      scrollLeft = event.currentTarget.scrollLeft;
      if (polling) {
        const remaining =
          event.currentTarget.scrollWidth -
          event.currentTarget.clientWidth -
          scrollLeft;
        if (remaining > 40) {
          pinned = false;
          unpinnedStartMs = viewport?.startMs ?? null;
        } else if (remaining < 8) {
          pinned = true;
          unpinnedStartMs = null;
        } else if (!pinned) {
          unpinnedStartMs = viewport?.startMs ?? null;
        }
      }
    }}
  >
    <div class="content" style:width={`${labelWidth + contentWidth}px`}>
      <div class="axis" style:height={`${AXIS_HEIGHT}px`}>
        <div class="axis-label" style:width={`${labelWidth}px`}>
          Workflow / event
        </div>
        {#if domain}
          {#each ticks as time (time)}
            <span
              class="tick"
              style:left={`${labelWidth + timeToX(time, domain, contentWidth)}px`}
            >
              {formatDistanceAbbreviated({
                start: new Date(domain.startMs),
                end: new Date(time),
                includeMilliseconds: viewport
                  ? viewport.endMs - viewport.startMs < 10_000
                  : false,
              }) || '0s'}
            </span>
          {/each}
        {/if}
      </div>
      <div class="body" style:height={`${rowLayout.height}px`}>
        {#if domain}
          {#each ticks as time (time)}
            <div
              class="grid-line"
              style:left={`${labelWidth + timeToX(time, domain, contentWidth)}px`}
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
                class:child={item.kind === 'child' || item.kind === 'workflow'}
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
                  <button
                    type="button"
                    class="toggle"
                    aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} run ${runId}`}
                    aria-expanded={!isCollapsed}
                    onclick={() => toggleKey(collapsedExecutionKeys, item.key)}
                    >{isCollapsed ? '▸' : '▾'}</button
                  >
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
                {@render timelineMark(item.row, item.executionKey, domain)}
              {:else if item.kind === 'execution'}
                {@const workflowRow = workflowRowForExecution(item.execution)}
                {#if workflowRow}
                  {@render summaryMark(
                    {
                      startMs: workflowRow.startTimeMs,
                      endMs: activeExecutionKeys.has(
                        item.execution.execution.executionKey,
                      )
                        ? Math.max(workflowRow.endTimeMs, now)
                        : workflowRow.endTimeMs,
                    },
                    workflowRow,
                    false,
                  )}
                {/if}
              {:else}
                {@const workflowRange = getWorkflowTimeRange(
                  item.workflow,
                  activeExecutionKeys,
                  now,
                )}
                {#if workflowRange}
                  {@render summaryMark(
                    workflowRange,
                    latestExecution
                      ? workflowRowForExecution(latestExecution)
                      : undefined,
                    true,
                  )}
                {/if}
              {/if}
            </div>
          {/each}
        {/if}
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

  .minimap-area {
    min-width: 0;
  }

  .scroller {
    box-sizing: border-box;
    flex: 1;
    min-height: 8rem;
    min-width: 0;
    overflow: auto;
    border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
    border-radius: 0.5rem;
    background: var(--color-surface-primary);
    color: var(--color-content-primary);
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

  .summary-line {
    position: absolute;
    width: 100%;
    border-top: 1px solid currentColor;
  }

  .summary-line::before,
  .summary-line::after {
    position: absolute;
    top: -4px;
    height: 7px;
    border-left: 1px solid currentColor;
    content: '';
  }

  .summary-line::before {
    left: 0;
  }

  .summary-line::after {
    right: 0;
  }

  .summary-mark.workflow .summary-line {
    top: -5px;
    height: 10px;
    border: 0;
    border-radius: 999px;
    background: currentColor;
    opacity: 0.6;
  }

  .summary-mark.workflow .summary-line::before,
  .summary-mark.workflow .summary-line::after {
    display: none;
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

  .event-dot.cluster {
    width: 7px;
    height: 7px;
  }

  .event-dot.outcome,
  .event-dot.compact {
    width: 9px;
    height: 9px;
  }

  .event-dot.point {
    width: 7px;
    height: 7px;
    border-radius: 1px;
    transform: translate(-50%, -50%) rotate(45deg);
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
