<script lang="ts">
  import { tick, untrack } from 'svelte';

  import { colorScales } from '$lib/theme/io/themes';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';

  import { lifecycleVisuals } from './lifecycle-visuals';
  import {
    getMarkBounds,
    getNodeAnchorX,
    getNodeBounds,
    type MarkBounds,
  } from './mark-geometry';
  import { getLineColor, getMarkColors } from './mark-visuals';
  import { getTimeTicks, type TimeRange, timeToX } from './time-viewport';
  import { getWheelTimeRange } from './wheel-time-range';
  import type { ExecutionHistoryState } from '../../data/execution-history/types';
  import type { QualifiedHistoryEvent } from '../../data/history-events/types';
  import { flattenPlotScene } from '../structure/flatten-plot-scene';
  import type { ExecutionScene, WorkflowScene } from '../structure/types';
  import type { TimelineEventRow } from '../timeline-rows/types';

  import WorkflowTimelineIconDefs from './workflow-timeline-icon-defs.svelte';
  import WorkflowTimelineMarkLabel from './workflow-timeline-mark-label.svelte';
  import WorkflowTimelineMinimap from './workflow-timeline-minimap.svelte';

  let {
    scene,
    historyEvents,
    executionHistories,
  }: {
    scene: WorkflowScene | null;
    historyEvents: readonly QualifiedHistoryEvent[];
    executionHistories: readonly ExecutionHistoryState[];
  } = $props();

  const ROW_HEIGHT = 32;
  const AXIS_HEIGHT = 44;
  const ENDPOINT_INSET = 32;
  const BOX_PADDING = 24;
  const BOX_BOTTOM_PADDING = 12;
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
  const rows = $derived(scene ? flattenPlotScene(scene) : []);
  const eventByKey = $derived(
    new Map(historyEvents.map((event) => [event.eventKey, event])),
  );
  const eventTimes = $derived(historyEvents.map((event) => event.eventTimeMs));
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
  const width = $derived(Math.max(1, viewportWidth));
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

  const boxes = $derived.by(() => {
    if (!domain) return [];
    return rows.flatMap((item, index) => {
      if (item.kind !== 'execution') return [];
      const ranges = [executionRange(item.execution)].filter(
        (range) => range !== null,
      );
      if (!ranges.length) return [];
      const startMs = Math.min(...ranges.map((range) => range.startMs));
      const endMs = Math.max(...ranges.map((range) => range.endMs));
      let endIndex = index + 1;
      while (endIndex < rows.length && rows[endIndex].depth > item.depth)
        endIndex++;
      return [
        {
          key: item.key,
          startX: plotX(startMs, domain, contentWidth),
          endX: plotX(endMs, domain, contentWidth),
          top: index * ROW_HEIGHT - ROW_HEIGHT / 2,
          depth: item.depth,
          height:
            (endIndex - index) * ROW_HEIGHT +
            ROW_HEIGHT / 2 -
            4 +
            BOX_BOTTOM_PADDING,
          label: `Run ${item.execution.execution.identity.runId.slice(0, 8)}…`,
          title: item.execution.execution.identity.runId,
        },
      ];
    });
  });

  function executionRange(execution: ExecutionScene): TimeRange | null {
    const ranges = execution.entries
      .filter((entry) => entry.kind === 'row')
      .map((entry) => entry.row);
    if (!ranges.length) return null;
    const startMs = Math.min(...ranges.map((row) => row.startTimeMs));
    const endMs = Math.max(...ranges.map((row) => row.endTimeMs));
    const isRunning = executionHistories.some(
      (history) =>
        history.executionKey === execution.execution.executionKey &&
        (history.stream.status === 'polling' ||
          history.stream.status === 'retrying'),
    );
    return { startMs, endMs: isRunning ? Math.max(endMs, now) : endMs };
  }

  function getRowNodeBounds(
    row: TimelineEventRow,
    mark: MarkBounds,
    range: TimeRange,
  ): readonly MarkBounds[] {
    return row.eventKeys.flatMap((key) => {
      const event = eventByKey.get(key);
      if (!event) return [];
      const alignment =
        row.startEventId !== row.endEventId &&
        event.eventId === row.startEventId
          ? 'start'
          : row.startEventId !== row.endEventId &&
              event.eventId === row.endEventId
            ? 'end'
            : 'center';
      return [
        getNodeBounds(
          plotX(event.eventTimeMs, range, contentWidth),
          mark,
          alignment,
        ),
      ];
    });
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

<div class="timeline">
  <WorkflowTimelineIconDefs />
  <WorkflowTimelineMinimap
    {domain}
    {viewport}
    {eventTimes}
    minDurationMs={(domainDuration * width) / MAX_WIDTH}
    pinnedLive={polling && pinned}
    onselect={selectRange}
  />
  <div
    class="scroller"
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
    <div class="content" style:width={`${contentWidth}px`}>
      <div class="axis" style:height={`${AXIS_HEIGHT}px`}>
        {#if domain}
          {#each ticks as time (time)}
            <span
              class="tick"
              style:left={`${timeToX(time, domain, contentWidth)}px`}
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
      <div
        class="body"
        style:height={`${rows.length * ROW_HEIGHT + BOX_BOTTOM_PADDING}px`}
        style:min-height={`${Math.max(0, viewportHeight - AXIS_HEIGHT)}px`}
      >
        {#if domain}
          {#each ticks as time (time)}
            <div
              class="grid-line"
              style:left={`${timeToX(time, domain, contentWidth)}px`}
            ></div>
          {/each}
          {#each boxes as box (box.key)}
            {#if box.top + box.height >= scrollTop - AXIS_HEIGHT - OVERSCAN * ROW_HEIGHT && box.top <= scrollTop + viewportHeight}
              <div
                class="group-box"
                style:left={`${Math.max(0, box.startX - BOX_PADDING)}px`}
                style:width={`${Math.max(1, Math.min(contentWidth, box.endX + BOX_PADDING) - Math.max(0, box.startX - BOX_PADDING))}px`}
                style:top={`${box.top}px`}
                style:height={`${box.height}px`}
                style:--group-depth={box.depth}
              >
                <span class="group-label" title={box.title}>{box.label}</span>
              </div>
            {/if}
          {/each}
          {#each visibleRows as item, index (item.key)}
            {@const rowIndex = firstIndex + index}
            {#if item.kind !== 'gap'}
              <div
                class="row"
                style:top={`${rowIndex * ROW_HEIGHT}px`}
                style:--row-depth={item.depth}
              >
                {#if item.kind === 'execution'}
                  {@const executionKey = item.execution.execution.executionKey}
                  {@const historyState = executionHistories.find(
                    (history) => history.executionKey === executionKey,
                  )}
                  {@const isRunning = executionHistories.some(
                    (history) =>
                      history.executionKey === executionKey &&
                      (history.stream.status === 'polling' ||
                        history.stream.status === 'retrying'),
                  )}
                  {@const executionRow = item.execution.entries.find(
                    (entry) =>
                      entry.kind === 'row' && entry.row.kind === 'workflow',
                  )}
                  {#if executionRow?.kind === 'row'}
                    {@const left = plotX(
                      executionRow.row.startTimeMs,
                      domain,
                      contentWidth,
                    )}
                    {@const right = plotX(
                      isRunning
                        ? Math.max(executionRow.row.endTimeMs, now)
                        : executionRow.row.endTimeMs,
                      domain,
                      contentWidth,
                    )}
                    {@const bounds = getMarkBounds(left, right)}
                    <div
                      class="mark"
                      style:left={`${bounds.left}px`}
                      style:width={`${bounds.right - bounds.left}px`}
                      style:--line-color={isRunning
                        ? colorScales.blue[9]
                        : getLineColor(
                            endingEvent(executionRow.row)?.eventType,
                            lifecycleVisuals.workflow.bgColor,
                          )}
                    >
                      <span class="mark-line" class:running={isRunning}></span>
                      <button
                        type="button"
                        class="mark-hit"
                        aria-label={`View lifecycle details for run ${item.execution.execution.identity.runId}`}
                        onclick={() => (selectedRow = executionRow.row)}
                      ></button>

                      {#each executionRow.row.eventKeys as eventKey (eventKey)}
                        {@const event = eventByKey.get(eventKey)}
                        {#if event}
                          {@const colors = getMarkColors(event.eventType)}
                          {@const isStart =
                            event.eventId === executionRow.row.startEventId &&
                            event.eventId !== executionRow.row.endEventId}
                          {@const isEnd =
                            event.eventId === executionRow.row.endEventId &&
                            event.eventId !== executionRow.row.startEventId}
                          <span
                            class="node"
                            class:start={isStart}
                            class:end={isEnd}
                            style:left={`${getNodeAnchorX(plotX(event.eventTimeMs, domain, contentWidth), bounds, isStart || isEnd) - bounds.left}px`}
                            style:--node-color={colors.fill}
                            style:--node-stroke={colors.stroke}
                            title={event.eventType}
                            ><svg
                              width="12"
                              height="12"
                              viewBox="0 0 16 16"
                              aria-hidden="true"
                              ><use href="#wt-icon-workflow" /></svg
                            ></span
                          >
                        {/if}
                      {/each}
                    </div>
                  {:else}
                    <span class="placeholder" title={executionKey}>
                      Run {item.execution.execution.identity.runId.slice(0, 8)}…
                      {#if historyState?.load.status === 'failed'}
                        · History unavailable
                      {:else if historyState?.load.status !== 'loaded'}
                        · Loading history…{/if}
                    </span>
                  {/if}
                {:else}
                  {@const visual = lifecycleVisuals[item.row.kind]}
                  {@const left = plotX(
                    item.row.startTimeMs,
                    domain,
                    contentWidth,
                  )}
                  {@const right = plotX(
                    item.row.endTimeMs,
                    domain,
                    contentWidth,
                  )}
                  {@const bounds = getMarkBounds(left, right)}
                  {@const nodes = getRowNodeBounds(item.row, bounds, domain)}
                  <div
                    class="mark"
                    style:left={`${bounds.left}px`}
                    style:width={`${bounds.right - bounds.left}px`}
                    style:--line-color={getLineColor(
                      endingEvent(item.row)?.eventType,
                      visual.bgColor,
                    )}
                  >
                    {#if right > left}<span class="mark-line"></span>{/if}
                    <button
                      type="button"
                      class="mark-hit"
                      aria-label={`View lifecycle details for ${item.row.label}`}
                      onclick={() => (selectedRow = item.row)}
                    ></button>

                    {#each item.row.eventKeys as eventKey (eventKey)}
                      {@const event = eventByKey.get(eventKey)}
                      {#if event}
                        {@const colors = getMarkColors(event.eventType)}
                        {@const isStart =
                          event.eventId === item.row.startEventId &&
                          event.eventId !== item.row.endEventId}
                        {@const isEnd =
                          event.eventId === item.row.endEventId &&
                          event.eventId !== item.row.startEventId}
                        <span
                          class="node"
                          class:start={isStart}
                          class:end={isEnd}
                          style:left={`${getNodeAnchorX(plotX(event.eventTimeMs, domain, contentWidth), bounds, isStart || isEnd) - bounds.left}px`}
                          style:--node-color={colors.fill}
                          style:--node-stroke={colors.stroke}
                          title={event.eventType}
                          ><svg
                            width="12"
                            height="12"
                            viewBox="0 0 16 16"
                            aria-hidden="true"
                            ><use href={`#wt-icon-${visual.icon}`} /></svg
                          ></span
                        >
                      {/if}
                    {/each}
                  </div>
                  <WorkflowTimelineMarkLabel
                    label={item.row.label}
                    mark={bounds}
                    {nodes}
                    {scrollLeft}
                    viewportWidth={width}
                  />
                {/if}
              </div>
            {/if}
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

  .scroller {
    box-sizing: border-box;
    flex: 1;
    min-height: 12rem;
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

  .group-box {
    position: absolute;
    box-sizing: border-box;
    border: 1px solid var(--group-border-color);
    border-radius: 4px;
    background: color-mix(in srgb, currentColor 6%, transparent);
    pointer-events: none;
    --group-border-color: color-mix(
      in srgb,
      currentColor 60%,
      var(--color-surface-primary)
    );
  }

  .group-label {
    position: sticky;
    top: calc(52px + var(--group-depth) * 24px);
    left: 8px;
    z-index: 4;
    display: inline-block;
    max-width: calc(100% - 16px);
    margin: -11px 0 0 12px;
    padding: 2px 8px;
    border-radius: 3px;
    background: var(--group-border-color);
    color: var(--color-content-primary);
    font-size: 12px;
    line-height: 16px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: top;
  }

  .row {
    position: absolute;
    width: 100%;
    height: 32px;
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

  .placeholder {
    position: sticky;
    left: 8px;
    top: 8px;
    white-space: nowrap;
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
