<script lang="ts">
  import { SvelteSet } from 'svelte/reactivity';

  import { tick, untrack } from 'svelte';

  import { colorScales } from '$lib/theme/io/themes';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';

  import { lifecycleVisuals } from './lifecycle-visuals';
  import { getMarkBounds, getNodeAnchorX } from './mark-geometry';
  import { getLineColor, getMarkColors } from './mark-visuals';
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

  const ROW_HEIGHT = 32;
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
  const collapsedExecutionKeys = new SvelteSet<string>();
  const isChildCollapsed = (key: string): boolean =>
    !expandedChildKeys.has(key);
  const isExecutionCollapsed = (key: string): boolean =>
    collapsedExecutionKeys.has(key);
  const rows = $derived(
    scene
      ? flattenPlotScene(scene, isChildCollapsed, isExecutionCollapsed)
      : [],
  );
  const plotHeight = $derived(
    Math.max(MIN_PLOT_HEIGHT, AXIS_HEIGHT + rows.length * ROW_HEIGHT + 20),
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
  const polling = $derived(
    executionHistories.some(
      (history) =>
        history.stream.status === 'polling' ||
        history.stream.status === 'retrying',
    ),
  );
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
    Math.min(300, Math.max(180, viewportWidth * 0.38)),
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
  const firstIndex = $derived(
    Math.max(
      0,
      Math.floor(Math.max(0, scrollTop - AXIS_HEIGHT) / ROW_HEIGHT) - OVERSCAN,
    ),
  );
  const lastIndex = $derived(
    Math.min(
      rows.length,
      Math.ceil((scrollTop + viewportHeight) / ROW_HEIGHT) + OVERSCAN,
    ),
  );
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
          : item.kind === 'child' && isChildCollapsed(item.key)
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
  {@const bounds = getMarkBounds(left, right)}

  <div
    class="mark"
    style:left={`${labelWidth + bounds.left}px`}
    style:width={`${bounds.right - bounds.left}px`}
    style:--line-color={isRunning
      ? colorScales.blue[9]
      : getLineColor(endingEvent(row)?.eventType, visual.bgColor)}
  >
    {#if right > left || row.kind === 'workflow'}
      <span class="mark-line" class:running={isRunning}></span>
    {/if}
    <button
      type="button"
      class="mark-hit"
      aria-label={`View lifecycle details for ${row.label}`}
      onclick={() => (selectedRow = row)}
    ></button>

    {#each row.eventKeys as eventKey (eventKey)}
      {@const event = eventByKey.get(eventKey)}
      {#if event}
        {@const colors = getMarkColors(event.eventType)}
        {@const isStart =
          event.eventId === row.startEventId &&
          event.eventId !== row.endEventId}
        {@const isEnd =
          event.eventId === row.endEventId &&
          event.eventId !== row.startEventId}
        <span
          class="node"
          class:start={isStart}
          class:end={isEnd}
          style:left={`${getNodeAnchorX(plotX(event.eventTimeMs, range, contentWidth), bounds, isStart || isEnd) - bounds.left}px`}
          style:--node-color={colors.fill}
          style:--node-stroke={colors.stroke}
          title={event.eventType}
          ><svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true"
            ><use href={`#wt-icon-${visual.icon}`} /></svg
          ></span
        >
      {/if}
    {/each}
  </div>
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
      <div class="body" style:height={`${rows.length * ROW_HEIGHT}px`}>
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
              item.kind === 'child'
                ? item.workflow.executions.at(-1)
                : undefined}
            {@const isCollapsed =
              item.kind === 'child'
                ? isChildCollapsed(item.key)
                : item.kind === 'execution' && isExecutionCollapsed(item.key)}
            <div
              class="row"
              class:child={item.kind === 'child'}
              class:execution={item.kind === 'execution'}
              style:top={`${rowIndex * ROW_HEIGHT}px`}
              style:--row-depth={item.depth}
            >
              <div
                class="row-label"
                class:child={item.kind === 'child'}
                class:execution={item.kind === 'execution'}
                class:continued={item.kind === 'execution' &&
                  item.continuesAsNew}
                class:collapsed={isCollapsed}
                style:width={`${item.kind === 'event' || isCollapsed ? labelWidth : viewportWidth}px`}
              >
                <span
                  class="hierarchy-rail"
                  title={`Level ${item.depth}`}
                  aria-hidden="true"
                >
                  {#each [1, 2, 3, 4] as level (level)}
                    <span
                      class:visible={item.depth >= level}
                      class:active={item.depth === level}
                      class:continues={(rows[rowIndex + 1]?.depth ?? 0) >=
                        level}
                      style:--level={level}
                    ></span>
                  {/each}
                </span>
                {#if item.kind === 'child'}
                  {@const workflowId =
                    item.workflow.executions[0]?.execution.identity
                      .workflowId ?? 'Child workflow'}
                  <button
                    type="button"
                    class="toggle"
                    aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} child workflow ${workflowId}`}
                    aria-expanded={!isCollapsed}
                    onclick={() => toggleKey(expandedChildKeys, item.key)}
                    >{isCollapsed ? '▸' : '▾'}</button
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
                  <span class="header-type child-type"
                    ><svg
                      width="12"
                      height="12"
                      viewBox="0 0 16 16"
                      aria-hidden="true"><use href="#wt-icon-workflow" /></svg
                    >Child</span
                  >
                  <span class="header-id"
                    ><span class="row-text" title={workflowId}
                      >{workflowId}</span
                    ></span
                  >
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
                  {#if item.continuesAsNew}
                    <span class="continuation-label" title="Continues as new"
                      >Continued</span
                    >
                  {/if}
                  <span class="header-type"
                    ><svg
                      width="12"
                      height="12"
                      viewBox="0 0 16 16"
                      aria-hidden="true"
                      ><use href="#wt-icon-relationship" /></svg
                    >Run</span
                  >
                  <span class="header-id"
                    ><span class="row-text" title={runId}>{runId}</span></span
                  >
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
              {:else if item.kind === 'execution' && isCollapsed}
                {@const workflowRow = workflowRowForExecution(item.execution)}
                {#if workflowRow}
                  {@render timelineMark(
                    workflowRow,
                    item.execution.execution.executionKey,
                    domain,
                  )}
                {/if}
              {:else if item.kind === 'child' && isCollapsed && latestExecution}
                {@const workflowRow = workflowRowForExecution(latestExecution)}
                {#if workflowRow}
                  {@render timelineMark(
                    workflowRow,
                    latestExecution.execution.executionKey,
                    domain,
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
    opacity: 0.18;
    pointer-events: none;
  }

  .row {
    position: absolute;
    box-sizing: border-box;
    width: 100%;
    height: 32px;
  }

  .row.child,
  .row.execution {
    border-top: 1px solid color-mix(in srgb, currentColor 22%, transparent);
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
    border-bottom: 1px solid color-mix(in srgb, currentColor 10%, transparent);
    background: var(--color-surface-primary);
    box-shadow: inset 2px 0 color-mix(in srgb, currentColor 35%, transparent);
    font-size: 12px;
  }

  .row-label.child {
    border-right: 0;
    border-bottom: 0;
    background: color-mix(
      in srgb,
      currentColor 3%,
      var(--color-surface-primary)
    );
    font-weight: 600;
  }

  .row-label.child.collapsed,
  .row-label.execution.collapsed {
    border-right: 1px solid color-mix(in srgb, currentColor 25%, transparent);
  }

  .row-label.execution {
    border-right: 0;
    border-bottom: 0;
    background: color-mix(
      in srgb,
      currentColor 3%,
      var(--color-surface-primary)
    );
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
    top: 16px;
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

  .header-type {
    display: inline-flex;
    flex: none;
    align-items: center;
    gap: 3px;
    margin-right: 6px;
    color: var(--color-content-secondary);
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
  }

  .header-type.child-type {
    color: var(--color-content-primary);
  }

  .header-id {
    position: relative;
    flex: 1;
    min-width: 0;
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
    left: calc(46px + min(var(--row-depth), 4) * 14px);
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
    top: 50%;
    transform: translateY(-50%);
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

  .mark {
    position: absolute;
    top: 50%;
    height: 0;
  }

  .mark-line {
    position: absolute;
    top: -9px;
    width: 100%;
    height: 18px;
    border-radius: 999px;
    background: var(--line-color, var(--color-action-workflow-workflow));
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

  .node {
    position: absolute;
    top: -10px;
    z-index: 2;
    display: grid;
    place-items: center;
    width: 20px;
    height: 20px;
    box-sizing: border-box;
    border: 2px solid var(--node-stroke, var(--color-content-primary));
    border-radius: 4px;
    background: var(--node-color);
    color: black;
    pointer-events: none;
    transform: translateX(-50%);
  }

  .node.start {
    transform: none;
  }

  .node.end {
    transform: translateX(-100%);
  }

  .mark-hit {
    position: absolute;
    top: -11px;
    left: 0;
    z-index: 1;
    width: 100%;
    min-width: 24px;
    height: 22px;
    border: 0;
    background: transparent;
    cursor: pointer;
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
