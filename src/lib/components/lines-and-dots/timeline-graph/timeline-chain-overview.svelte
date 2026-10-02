<script lang="ts">
  import type { TimelineWindowMode } from '$lib/components/lines-and-dots/timeline-graph/timeline-window-controls';
  import { translate } from '$lib/i18n/translate';
  import type { ChainBoundary } from '$lib/services/workflow-chain-index';
  import type { WorkflowChainOverviewRun } from '$lib/services/workflow-chain-overview';
  import { hourFormat, timeFormat } from '$lib/stores/time-format';

  import {
    formatTimelineChainDuration,
    formatTimelineChainTickTime,
    getTimelineChainTimeTicks,
  } from './timeline-chain-time-axis';
  import { binTimelineContinuations } from './timeline-continuation-bins';
  import { clampTimelineOverviewWindowLeft } from './timeline-positioning';

  interface Props {
    segments: readonly Readonly<{
      runs: readonly WorkflowChainOverviewRun[];
      before: ChainBoundary;
      after: ChainBoundary;
    }>[];
    windowStartTimeMs?: number;
    windowEndTimeMs?: number;
    windowDurationMs?: number;
    windowMode?: TimelineWindowMode;
    loading?: boolean;
    /** Aligns the overview's track with a plot area that starts further in. */
    leadingInsetPx?: number;
    trailingInsetPx?: number;
    /** Heads the column the leading inset sits over, e.g. a tree beside it. */
    leadingLabel?: string;
    /** Where that label starts, so it lines up with the column's content. */
    leadingLabelInsetPx?: number;
    /**
     * Titles for columns at the right of that column, ending at
     * `leadingColumnsEndPx` so they sit over the columns they name.
     */
    leadingColumns?: readonly { label: string; widthPx: number }[];
    leadingColumnsEndPx?: number;
    leadingColumnsGapPx?: number;
    /**
     * Where the time labels go: on their own row above the track, or inside
     * the track beside their tick lines, which saves the row. Inside, the
     * overview is one 40px row, the same height as the details panel's
     * header beside it, so the two read as one header bar.
     */
    axisPlacement?: 'above' | 'inside';
    onWindowMove?: (startTimeMs: number) => void;
    onWindowResize?: (range: {
      startTimeMs: number;
      endTimeMs: number;
      anchor: 'start' | 'end';
    }) => void;
  }

  let {
    segments,
    windowStartTimeMs,
    windowEndTimeMs,
    windowDurationMs,
    windowMode,
    loading = false,
    leadingInsetPx = 0,
    trailingInsetPx,
    leadingLabel,
    leadingLabelInsetPx = 12,
    leadingColumns = [],
    leadingColumnsEndPx,
    leadingColumnsGapPx = 8,
    axisPlacement = 'above',
    onWindowMove,
    onWindowResize,
  }: Props = $props();

  const runs = $derived(segments.flatMap((segment) => [...segment.runs]));

  type DragMode = 'move' | 'resize-start' | 'resize-end';

  let trackElement = $state<HTMLDivElement>();
  let overviewElement = $state<HTMLDivElement>();
  let dragMode = $state<DragMode | null>(null);
  let dragLeft = $state<number | null>(null);
  let dragWidth = $state<number | null>(null);
  let dragPointerId: number | null = null;
  let dragOffset = 0;
  let dragFixedEdge = 0;
  let visualDurationMs = 1;
  let visualWindowLeft = 0;
  let visualWindowWidth = 0.4;
  let trackWidth = $state(1);
  let liveNowMs = $state(0);
  // A run that continued as new has ended; the runs after it belong to a later
  // stretch of the chain this view hasn't loaded, which the trailing boundary
  // marks. Running the axis on to now would stretch it past the plot below.
  const chainEndIsLive = $derived(
    runs.at(-1)?.status === 'Running' || runs.at(-1)?.status === 'Paused',
  );

  const startTimeMs = $derived(runs[0]?.startTimeMs);
  const endTimeMs = $derived.by(() => {
    let maximum = 0;
    for (const run of runs) {
      if (run.endTimeMs > maximum) maximum = run.endTimeMs;
    }
    return maximum;
  });
  const durationMs = $derived(
    startTimeMs === undefined ? 0 : Math.max(1, endTimeMs - startTimeMs),
  );
  const displayedEndTimeMs = $derived(
    chainEndIsLive ? Math.max(endTimeMs, liveNowMs) : endTimeMs,
  );
  const displayedDurationMs = $derived(
    startTimeMs === undefined
      ? 0
      : Math.max(1, displayedEndTimeMs - startTimeMs),
  );
  const displayedDuration = $derived(
    formatTimelineChainDuration(displayedDurationMs),
  );
  const timeTicks = $derived(
    startTimeMs === undefined
      ? []
      : getTimelineChainTimeTicks({
          startTimeMs,
          endTimeMs: displayedEndTimeMs,
          widthPx: trackWidth,
        }),
  );
  const position = (timeMs: number): number =>
    startTimeMs === undefined
      ? 0
      : Math.min(100, Math.max(0, ((timeMs - startTimeMs) / durationMs) * 100));
  const windowLeft = $derived(position(windowStartTimeMs ?? startTimeMs ?? 0));
  const visualWindowEndTimeMs = $derived(
    windowStartTimeMs !== undefined && windowDurationMs !== undefined
      ? windowStartTimeMs + windowDurationMs
      : (windowEndTimeMs ?? endTimeMs),
  );
  const windowRight = $derived(position(visualWindowEndTimeMs));
  const windowWidth = $derived(Math.max(0, windowRight - windowLeft));
  const displayedWindowLeft = $derived(
    dragLeft ?? clampTimelineOverviewWindowLeft(windowLeft, windowWidth),
  );
  const displayedWindowWidth = $derived(dragWidth ?? windowWidth);
  const continuationSegments = $derived(
    segments.map((segment) =>
      binTimelineContinuations({
        runs: [...segment.runs],
        startTimeMs: startTimeMs ?? 0,
        durationMs,
        widthPx: trackWidth,
      }),
    ),
  );
  const continuationCount = $derived(
    continuationSegments.reduce((count, bins) => count + bins.totalCount, 0),
  );
  const continuationBinCount = $derived(
    continuationSegments.reduce((count, bins) => count + bins.binCount, 0),
  );
  const gaps = $derived(
    segments.slice(0, -1).flatMap((segment, index) => {
      const left = segment.runs.at(-1);
      const right = segments[index + 1]?.runs[0];
      if (!left || !right) return [];
      return [
        {
          key: `${left.runId}:${right.runId}`,
          left: position(left.endTimeMs),
          width: Math.max(
            0.4,
            position(right.startTimeMs) - position(left.endTimeMs),
          ),
          before: segment.after.kind,
          after: segments[index + 1].before.kind,
        },
      ];
    }),
  );
  const leadingBoundary = $derived(segments[0]?.before);
  const trailingBoundary = $derived(segments.at(-1)?.after);

  $effect(() => {
    if (!chainEndIsLive) {
      liveNowMs = 0;
      return;
    }

    const updateLiveNow = () => (liveNowMs = Date.now());
    updateLiveNow();
    const interval = window.setInterval(updateLiveNow, 1_000);
    return () => window.clearInterval(interval);
  });

  $effect(() => {
    if (!trackElement) return;
    const observer = new ResizeObserver(([entry]) => {
      trackWidth = Math.max(1, Math.round(entry.contentRect.width));
    });
    observer.observe(trackElement);
    return () => observer.disconnect();
  });

  $effect(() => {
    const chainStartTimeMs = startTimeMs;
    const geometryEndTimeMs = endTimeMs;
    const isLive = chainEndIsLive;
    const currentWindowStartTimeMs = windowStartTimeMs;
    const currentWindowEndTimeMs = visualWindowEndTimeMs;
    const currentWindowDurationMs = windowDurationMs;
    const currentWindowMode = windowMode;
    if (chainStartTimeMs === undefined || !trackElement) return;

    const geometryDurationMs = Math.max(
      1,
      geometryEndTimeMs - chainStartTimeMs,
    );
    let animationFrame = 0;
    const animationStartedAtMs = performance.now();

    const updateVisualGeometry = () => {
      const visualEndTimeMs = isLive
        ? Math.max(geometryEndTimeMs, Date.now())
        : geometryEndTimeMs;
      visualDurationMs = Math.max(1, visualEndTimeMs - chainStartTimeMs);
      const scale = geometryDurationMs / visualDurationMs;
      trackElement?.style.setProperty('--overview-live-scale', `${scale}`);

      if (currentWindowStartTimeMs !== undefined) {
        const elapsedMs = performance.now() - animationStartedAtMs;
        const movingWindowStartTimeMs =
          currentWindowMode === 'following' &&
          currentWindowDurationMs !== undefined
            ? visualEndTimeMs - currentWindowDurationMs
            : currentWindowMode === 'playing'
              ? Math.min(
                  currentWindowStartTimeMs + elapsedMs,
                  visualEndTimeMs - (currentWindowDurationMs ?? 0),
                )
              : currentWindowStartTimeMs;
        const movingWindowEndTimeMs =
          currentWindowDurationMs === undefined
            ? currentWindowEndTimeMs
            : movingWindowStartTimeMs + currentWindowDurationMs;
        const left = Math.min(
          100,
          Math.max(
            0,
            ((movingWindowStartTimeMs - chainStartTimeMs) / visualDurationMs) *
              100,
          ),
        );
        const right = Math.min(
          100,
          Math.max(
            0,
            ((movingWindowEndTimeMs - chainStartTimeMs) / visualDurationMs) *
              100,
          ),
        );
        visualWindowWidth = Math.max(0, right - left);
        visualWindowLeft = clampTimelineOverviewWindowLeft(
          left,
          visualWindowWidth,
        );
        trackElement?.style.setProperty(
          '--overview-window-left',
          `${visualWindowLeft}%`,
        );
        trackElement?.style.setProperty(
          '--overview-window-width',
          `${visualWindowWidth}%`,
        );
      }
      if (overviewElement) {
        overviewElement.dataset.chainEndTimeMs = `${visualEndTimeMs}`;
      }
      if (isLive) animationFrame = requestAnimationFrame(updateVisualGeometry);
    };

    updateVisualGeometry();
    return () => cancelAnimationFrame(animationFrame);
  });

  const pointerPosition = (event: PointerEvent): number => {
    const bounds = trackElement?.getBoundingClientRect();
    if (!bounds?.width) return 0;
    return ((event.clientX - bounds.left) / bounds.width) * 100;
  };

  const minimumWindowWidth = (): number =>
    Math.min(100, (1_000 / visualDurationMs) * 100);

  const startDragging = (event: PointerEvent, mode: DragMode) => {
    if (!trackElement || (mode === 'move' ? !onWindowMove : !onWindowResize)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    dragMode = mode;
    dragLeft = visualWindowLeft;
    dragWidth = visualWindowWidth;
    dragPointerId = event.pointerId;
    const pointer = pointerPosition(event);
    dragOffset =
      mode === 'resize-end'
        ? pointer - (visualWindowLeft + visualWindowWidth)
        : pointer - visualWindowLeft;
    dragFixedEdge =
      mode === 'resize-start'
        ? visualWindowLeft + visualWindowWidth
        : visualWindowLeft;
    trackElement.style.removeProperty('--overview-window-left');
    trackElement.style.removeProperty('--overview-window-width');
    trackElement.setPointerCapture(event.pointerId);
  };

  const dragWindow = (event: PointerEvent) => {
    if (
      dragMode === null ||
      dragLeft === null ||
      dragWidth === null ||
      event.pointerId !== dragPointerId
    ) {
      return;
    }
    if (event.buttons === 0) {
      finishDragging(event);
      return;
    }
    const pointer = pointerPosition(event) - dragOffset;
    const minimumWidth = minimumWindowWidth();

    if (dragMode === 'move') {
      dragLeft = Math.min(Math.max(0, pointer), Math.max(0, 100 - dragWidth));
    } else if (dragMode === 'resize-start') {
      dragLeft = Math.min(
        Math.max(0, pointer),
        Math.max(0, dragFixedEdge - minimumWidth),
      );
      dragWidth = dragFixedEdge - dragLeft;
    } else {
      const right = Math.max(
        Math.min(100, pointer),
        Math.min(100, dragFixedEdge + minimumWidth),
      );
      dragLeft = dragFixedEdge;
      dragWidth = right - dragFixedEdge;
    }
  };

  const finishDragging = (event: PointerEvent) => {
    if (
      dragMode === null ||
      dragLeft === null ||
      dragWidth === null ||
      startTimeMs === undefined ||
      event.pointerId !== dragPointerId
    ) {
      return;
    }
    const completedMode = dragMode;
    const selectedStartTimeMs =
      startTimeMs + (dragLeft / 100) * visualDurationMs;
    const selectedEndTimeMs =
      selectedStartTimeMs + (dragWidth / 100) * visualDurationMs;
    dragMode = null;
    dragLeft = null;
    dragWidth = null;
    dragPointerId = null;
    if (trackElement?.hasPointerCapture(event.pointerId)) {
      trackElement.releasePointerCapture(event.pointerId);
    }
    if (completedMode === 'move') {
      onWindowMove?.(selectedStartTimeMs);
    } else {
      onWindowResize?.({
        startTimeMs: selectedStartTimeMs,
        endTimeMs: selectedEndTimeMs,
        anchor: completedMode === 'resize-start' ? 'end' : 'start',
      });
    }
  };

  const cancelDragging = (event: PointerEvent) => {
    if (dragMode === null || event.pointerId !== dragPointerId) return;
    dragMode = null;
    dragLeft = null;
    dragWidth = null;
    dragPointerId = null;
    if (trackElement?.hasPointerCapture(event.pointerId)) {
      trackElement.releasePointerCapture(event.pointerId);
    }
  };

  const resizeWithKeyboard = (event: KeyboardEvent, edge: 'start' | 'end') => {
    if (
      !onWindowResize ||
      startTimeMs === undefined ||
      windowStartTimeMs === undefined ||
      visualWindowEndTimeMs === undefined ||
      (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')
    ) {
      return;
    }
    event.preventDefault();
    const stepMs = Math.max(1_000, (windowDurationMs ?? 10_000) / 10);
    const deltaMs = event.key === 'ArrowRight' ? stepMs : -stepMs;

    if (edge === 'start') {
      onWindowResize({
        startTimeMs: Math.min(
          visualWindowEndTimeMs - 1_000,
          Math.max(startTimeMs, windowStartTimeMs + deltaMs),
        ),
        endTimeMs: visualWindowEndTimeMs,
        anchor: 'end',
      });
    } else {
      onWindowResize({
        startTimeMs: windowStartTimeMs,
        endTimeMs: Math.max(
          windowStartTimeMs + 1_000,
          Math.min(
            startTimeMs + visualDurationMs,
            visualWindowEndTimeMs + deltaMs,
          ),
        ),
        anchor: 'start',
      });
    }
  };
</script>

<svelte:window onpointerup={finishDragging} onpointercancel={cancelDragging} />

<div
  bind:this={overviewElement}
  class="relative border-b border-primary px-3 text-primary {axisPlacement ===
  'inside'
    ? 'h-10 bg-surface-secondary'
    : 'bg-background-primary py-2'}"
  data-testid="timeline-chain-overview"
  data-chain-end-time-ms={endTimeMs}
  style:padding-left={leadingInsetPx ? `${leadingInsetPx}px` : undefined}
  style:padding-right={trailingInsetPx === undefined
    ? undefined
    : `${trailingInsetPx}px`}
>
  {#if leadingLabel && leadingInsetPx}
    <!-- With a column beside the track, the overview heads that column
         instead: its label carries the chain's summary, sitting level with
         the track, and the overview drops its own title row. -->
    <div
      class="absolute inset-y-0 flex items-center text-xs"
      style:left="{leadingLabelInsetPx}px"
      style:width={leadingColumnsEndPx === undefined
        ? undefined
        : `${leadingColumnsEndPx - leadingLabelInsetPx}px`}
      style:gap="{leadingColumnsGapPx}px"
    >
      <div
        class="flex min-w-0 flex-1 items-center gap-1.5"
        data-testid="timeline-chain-leading-label"
      >
        <h3 class="shrink-0 text-base font-medium">{leadingLabel}</h3>
        {#if startTimeMs !== undefined}
          <span class="truncate tabular-nums text-secondary"
            >({@render summary()})</span
          >
        {/if}
        {@render loadingStatus()}
      </div>
      {#each leadingColumns as column (column.label)}
        <span
          class="shrink-0 text-right text-secondary"
          style:width="{column.widthPx}px">{column.label}</span
        >
      {/each}
    </div>
  {:else}
    <div class="mb-1 flex items-center justify-between gap-2 text-xs">
      <span class="font-medium"
        >{translate('workflows.timeline-chain-overview')}</span
      >
      <span class="flex items-center gap-2 tabular-nums text-tertiary">
        {#if startTimeMs !== undefined}
          {@render summary()}
        {/if}
        {@render loadingStatus()}
      </span>
    </div>
  {/if}
  {#if startTimeMs !== undefined && axisPlacement === 'above'}
    <div
      class="relative h-6 text-xs tabular-nums text-tertiary"
      data-testid="timeline-chain-time-axis"
    >
      {#each timeTicks as tick (tick.positionPercent)}
        <span
          class="absolute bottom-1.5 whitespace-nowrap leading-none {tick.edge ===
          'start'
            ? ''
            : tick.edge === 'end'
              ? '-translate-x-full'
              : '-translate-x-1/2'} {tick.edge === 'end' && chainEndIsLive
            ? 'text-success'
            : ''}"
          style:left="{tick.positionPercent}%"
          data-timeline-chain-time-ms={tick.timeMs}
        >
          {@render tickText(tick)}
          <span
            class="absolute top-[calc(100%+2px)] h-1.5 w-px bg-current {tick.edge ===
            'start'
              ? 'left-0'
              : tick.edge === 'end'
                ? 'right-0'
                : 'left-1/2'}"
            aria-hidden="true"
          ></span>
        </span>
      {/each}
    </div>
  {/if}
  <div
    bind:this={trackElement}
    class="relative border border-primary {axisPlacement === 'inside'
      ? `h-full border-y-0 bg-surface-secondary ${trailingInsetPx === 0 ? 'border-r-0' : ''}`
      : 'h-5 rounded bg-surface-tertiary'}"
    role="group"
    aria-label={`${translate('workflows.timeline-chain-overview-description')} ${continuationCount} continuations, ${continuationBinCount} visible markers.`}
    onpointermove={dragWindow}
    onpointerup={finishDragging}
    onpointercancel={cancelDragging}
    onlostpointercapture={finishDragging}
  >
    {#if startTimeMs !== undefined}
      <div
        class="pointer-events-none absolute inset-0 origin-left"
        style:transform="scaleX(var(--overview-live-scale, 1))"
      >
        <svg
          class="absolute inset-0 h-full w-full overflow-visible text-brand"
          viewBox="0 0 {trackWidth} 20"
          preserveAspectRatio="none"
          aria-hidden="true"
          data-testid="timeline-continuation-bins"
          data-continuation-count={continuationCount}
          data-continuation-bin-count={continuationBinCount}
        >
          {#each continuationSegments as bins, index (index)}
            <path
              d={bins.path}
              fill="none"
              stroke="currentColor"
              stroke-width="1"
              vector-effect="non-scaling-stroke"
            />
          {/each}
        </svg>
      </div>
      {#if axisPlacement === 'inside'}
        <!-- Each time sits beside its own tick line, inside the track, rather
             than on a row of its own above it. -->
        <div
          class="pointer-events-none absolute inset-0 text-[11px] tabular-nums leading-none text-secondary"
          data-testid="timeline-chain-time-axis"
        >
          {#each timeTicks as tick (tick.positionPercent)}
            {#if tick.edge !== 'start' && tick.edge !== 'end'}
              <span
                class="absolute inset-y-0 w-px bg-border-primary"
                style:left="{tick.positionPercent}%"
                aria-hidden="true"
              ></span>
            {/if}
            <span
              class="absolute top-1/2 -translate-y-1/2 whitespace-nowrap {tick.edge ===
              'end'
                ? '-translate-x-full pr-1.5'
                : 'pl-1.5'} {tick.edge === 'end' && chainEndIsLive
                ? 'text-success'
                : ''}"
              style:left="{tick.positionPercent}%"
              data-timeline-chain-time-ms={tick.timeMs}
            >
              {@render tickText(tick)}
            </span>
          {/each}
        </div>
      {/if}
      {#each gaps as gap (gap.key)}
        <div
          class="pointer-events-none absolute inset-y-0 border-x border-dashed border-warning bg-surface-warning"
          style:left="{gap.left}%"
          style:width="{gap.width}%"
          data-timeline-chain-gap={gap.key}
          title={`Workflow history is unavailable (${gap.before}, ${gap.after})`}
        ></div>
      {/each}
      {#if leadingBoundary && leadingBoundary.kind !== 'known-chain-start'}
        <div
          class="pointer-events-none absolute inset-y-0 left-0 w-1 border-r border-dashed border-warning bg-surface-overlay-warning"
          data-timeline-chain-boundary={leadingBoundary.kind}
          title={`Earlier workflow history is ${leadingBoundary.kind}`}
        ></div>
      {/if}
      {#if trailingBoundary && trailingBoundary.kind !== 'known-chain-end' && trailingBoundary.kind !== 'live-edge'}
        <div
          class="pointer-events-none absolute inset-y-0 right-0 w-1 border-l border-dashed border-warning bg-surface-overlay-warning"
          data-timeline-chain-boundary={trailingBoundary.kind}
          title={`Later workflow history is ${trailingBoundary.kind}`}
        ></div>
      {/if}
      {#if windowStartTimeMs !== undefined}
        <div
          class="absolute -inset-y-1 z-10 touch-none rounded bg-transparent shadow-sm outline outline-[3px] outline-interactive-primary"
          style:left={dragMode === null
            ? `var(--overview-window-left, ${displayedWindowLeft}%)`
            : `${displayedWindowLeft}%`}
          style:width={dragMode === null
            ? `var(--overview-window-width, ${displayedWindowWidth}%)`
            : `${displayedWindowWidth}%`}
          data-testid="timeline-window-position"
          data-window-start-time-ms={windowStartTimeMs}
          data-window-end-time-ms={visualWindowEndTimeMs}
          title={translate('workflows.timeline-current-window')}
        >
          <button
            type="button"
            class="absolute left-1/2 top-0 z-10 h-full w-[max(100%,24px)] -translate-x-1/2 touch-none bg-transparent p-0 {onWindowMove
              ? 'cursor-grab active:cursor-grabbing'
              : 'pointer-events-none'}"
            aria-label={translate('workflows.timeline-move-window')}
            data-testid="timeline-window-move"
            onpointerdown={(event) => startDragging(event, 'move')}
          ></button>
          <button
            type="button"
            class="absolute -bottom-1.5 -top-1.5 right-full z-20 w-6 cursor-ew-resize touch-none bg-transparent p-0"
            aria-label={translate('workflows.timeline-resize-window-start')}
            data-testid="timeline-window-resize-start"
            onpointerdown={(event) => startDragging(event, 'resize-start')}
            onkeydown={(event) => resizeWithKeyboard(event, 'start')}
          >
            <span
              class="absolute bottom-1 right-0 top-1 w-0.5 rounded bg-interactive-primary"
            ></span>
          </button>
          <button
            type="button"
            class="absolute -bottom-1.5 -top-1.5 left-full z-20 w-6 cursor-ew-resize touch-none bg-transparent p-0"
            aria-label={translate('workflows.timeline-resize-window-end')}
            data-testid="timeline-window-resize-end"
            onpointerdown={(event) => startDragging(event, 'resize-end')}
            onkeydown={(event) => resizeWithKeyboard(event, 'end')}
          >
            <span
              class="absolute bottom-1 left-0 top-1 w-0.5 rounded bg-interactive-primary"
            ></span>
          </button>
        </div>
      {/if}
    {/if}
  </div>
</div>

{#snippet summary()}
  <span data-testid="timeline-chain-duration">
    {translate('workflows.timeline-chain-run-count', {
      count: runs.length,
    })}
    ·
    {translate('workflows.timeline-chain-elapsed', {
      duration: displayedDuration,
    })}
  </span>
{/snippet}

{#snippet loadingStatus()}
  {#if loading}
    <span class="text-tertiary" role="status">
      {translate('workflows.timeline-chain-loading')}
    </span>
  {/if}
{/snippet}

{#snippet tickText(tick: (typeof timeTicks)[number])}
  {#if tick.edge === 'end' && chainEndIsLive}
    {translate('workflows.timeline-chain-now')} ·
  {/if}
  {formatTimelineChainTickTime({
    timeMs: tick.timeMs,
    durationMs: displayedDurationMs,
    timeFormat: $timeFormat,
    hourFormat: $hourFormat,
  })}
{/snippet}
