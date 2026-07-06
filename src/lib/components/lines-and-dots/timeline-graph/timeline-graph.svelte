<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  import { timestamp } from '$lib/components/timestamp.svelte';
  import type { EventGroups } from '$lib/models/event-groups/event-groups';
  import { activeGroups } from '$lib/stores/active-events';
  import { collapseIdleTime } from '$lib/stores/event-view';
  import { fullEventHistory } from '$lib/stores/events';
  import { eventStatusFilter } from '$lib/stores/filters';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { isWorkflowDelayed } from '$lib/utilities/delayed-workflows';
  import { type ValidTime, validTimeToDate } from '$lib/utilities/format-time';
  import { getFailedOrPendingGroups } from '$lib/utilities/get-failed-or-pending';

  import EndTimeInterval from '../end-time-interval.svelte';
  import { GUTTER, RADIUS, ROW_HEIGHT } from './constants';
  import {
    getDescStart,
    getPendingBlockY,
    getRowY,
    getTotalForY,
  } from './timeline-positioning';

  import GroupDetailsRow from './group-details-row.svelte';
  import TimelineAxis from './timeline-axis.svelte';
  import TimelineCollapsedLayer from './timeline-collapsed-layer.svelte';
  import TimelineGraphRow from './timeline-graph-row.svelte';
  import TimelineIconDefs from './timeline-icon-defs.svelte';
  import { TimelineScale } from './timeline-scale.svelte';
  import { Timeline } from './timeline.svelte';
  import { Viewport } from './viewport.svelte';
  import WorkflowRow from './workflow-row.svelte';

  interface Props {
    workflow: WorkflowExecution;
    groups: EventGroups;
    readOnly?: boolean;
    error?: boolean;
    reverseSort?: boolean;
    loading?: boolean;
    totalExpectedEvents?: number;
    descMinId?: number;
    panelHeight?: number;
    onTimelineInit?: (timeline: Timeline) => void;
  }

  let {
    workflow,
    groups,
    readOnly = false,
    error = false,
    reverseSort = false,
    loading = false,
    totalExpectedEvents = 0,
    descMinId = 0,
    panelHeight = $bindable(0),
    onTimelineInit,
  }: Props = $props();

  const DOT_STROKE = 2; // dot border
  // Dot geometry, published as CSS vars on .canvas (consumed by every row's dot).
  const dotSize = 2 * RADIUS + DOT_STROKE;
  const dotRadius = RADIUS * 0.3 + DOT_STROKE / 2;

  let canvasWidth = $state(0);

  // Width via ResizeObserver, not bind:clientWidth: the latter reads clientWidth
  // in every reactive flush, forcing a full sync layout of the tall canvas.
  // contentRect.width is already computed; RAF-debounced to avoid width↔render loops.
  let containerEl = $state<HTMLDivElement | null>(null);

  $effect(() => {
    if (!containerEl) return;
    let isFirst = true;
    let rafId: ReturnType<typeof requestAnimationFrame>;
    const observer = new ResizeObserver((entries) => {
      const width = Math.round(entries[0].contentRect.width);
      if (isFirst) {
        isFirst = false;
        canvasWidth = width;
      } else {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          canvasWidth = width;
        });
      }
    });
    observer.observe(containerEl);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  });

  const timelineWidth = $derived(canvasWidth - 2 * GUTTER);

  let nowMs = $state(Date.now());

  const timeline = new Timeline({
    getFullEventHistory: () => $fullEventHistory,
    getWorkflow: () => workflow,
    getEventGroups: () => groups,
    getCurrentTimeMs: () => nowMs,
    getLoading: () => loading,
    getShouldCollapseByDefault: () => $collapseIdleTime === 'on',
  });

  const viewport = new Viewport({ startTimeMs: 0, endTimeMs: 0 });
  const scale = new TimelineScale({ timeline, viewport });

  $effect(() => {
    onTimelineInit?.(timeline);
  });

  $effect(() => {
    viewport.setSize(timelineWidth, 0);
  });

  const projectX = (time: ValidTime | undefined | null): number => {
    if (!time) return GUTTER;
    return scale.project(validTimeToDate(time).getTime()) + GUTTER;
  };

  const toggleSegment = (segmentKey: string) => {
    const segment = timeline.segments.find(
      (candidate) => candidate.timespan.key === segmentKey,
    );
    if (segment) {
      timeline.toggleTimeSegment(segment);
    }
  };

  const filteredGroups = $derived(
    getFailedOrPendingGroups(groups, $eventStatusFilter),
  );

  // Unfetched skeleton rows. totalExpectedEvents is already a density-adjusted
  // group count, so subtracting the loaded count is correct.
  const pendingGroupCount = $derived.by(() => {
    if (!loading) return 0;
    if (!totalExpectedEvents) {
      return filteredGroups.length === 0 ? 50 : 0;
    }
    return Math.max(0, totalExpectedEvents - filteredGroups.length);
  });

  // Rows mounted beyond the viewport, so edge rows survive small scrolls and
  // direction reversals and are ready ahead of a fast fling.
  const OVERSCAN = 12;

  // Closed-form inverse of getRowY (both cursor segments are linear) → the
  // [start, end) row-index range to mount for a given visible band.
  // Called once per window recompute (~once per frame), not per row — the object
  // param is free here and keeps the many args readable at the call site.
  function getWindowBounds({
    bandTop,
    bandHeight,
    total,
    overscan,
    reverseSort,
    descStart,
    pendingCount,
    totalForY,
  }: {
    bandTop: number;
    bandHeight: number;
    total: number;
    overscan: number;
    reverseSort: boolean;
    descStart: number;
    pendingCount: number;
    totalForY: number;
  }): [number, number] {
    if (total === 0 || !bandHeight) {
      const cap = Math.min(total, 100);
      return reverseSort ? [Math.max(0, total - cap), total] : [0, cap];
    }
    const yMin = bandTop - overscan * ROW_HEIGHT;
    const yMax = bandTop + bandHeight + overscan * ROW_HEIGHT;
    let start = total;
    let end = 0;
    if (!reverseSort) {
      // Segment 1 [0, descStart): y = (i+2)*ROW_HEIGHT
      const seg1Start = Math.max(0, Math.ceil(yMin / ROW_HEIGHT - 2));
      const seg1End = Math.min(
        descStart,
        Math.floor(yMax / ROW_HEIGHT - 2) + 1,
      );
      if (seg1Start < seg1End) {
        start = Math.min(start, seg1Start);
        end = Math.max(end, seg1End);
      }
      // Segment 2 [descStart, N): y = (i+2+pendingCount)*ROW_HEIGHT
      const seg2Start = Math.max(
        descStart,
        Math.ceil(yMin / ROW_HEIGHT - 2 - pendingCount),
      );
      const seg2End = Math.min(
        total,
        Math.floor(yMax / ROW_HEIGHT - 2 - pendingCount) + 1,
      );
      if (seg2Start < seg2End) {
        start = Math.min(start, seg2Start);
        end = Math.max(end, seg2End);
      }
    } else {
      // Segment 1 [0, descStart): i = totalForY+1 - y/ROW_HEIGHT
      const seg1Start = Math.max(
        0,
        Math.ceil(totalForY + 1 - yMax / ROW_HEIGHT),
      );
      const seg1End = Math.min(
        descStart,
        Math.floor(totalForY + 1 - yMin / ROW_HEIGHT) + 1,
      );
      if (seg1Start < seg1End) {
        start = Math.min(start, seg1Start);
        end = Math.max(end, seg1End);
      }
      // Segment 2 [descStart, N): i = totalForY+1-pendingCount - y/ROW_HEIGHT
      const seg2Start = Math.max(
        descStart,
        Math.ceil(totalForY + 1 - pendingCount - yMax / ROW_HEIGHT),
      );
      const seg2End = Math.min(
        total,
        Math.floor(totalForY + 1 - pendingCount - yMin / ROW_HEIGHT) + 1,
      );
      if (seg2Start < seg2End) {
        start = Math.min(start, seg2Start);
        end = Math.max(end, seg2End);
      }
    }
    return start >= end ? [0, 0] : [start, end];
  }

  const firstStartTime = $derived.by(() => {
    const firstEventTime = $fullEventHistory[0]?.eventTime;

    if (!firstEventTime) {
      return workflow.executionTime;
    }

    return firstEventTime < workflow.executionTime
      ? firstEventTime
      : workflow.executionTime;
  });

  const startTime = $derived(
    (!isWorkflowDelayed(workflow) && firstStartTime) || workflow.startTime,
  );

  const groupIndexMap = $derived(
    new Map(filteredGroups.map((g, i) => [g.id, i])),
  );

  // Active group's index in filteredGroups (-1 = none). Derived here so the row
  // pool doesn't subscribe to $activeGroups directly.
  const activeIdx = $derived(
    $activeGroups.length > 0 ? (groupIndexMap.get($activeGroups[0]) ?? -1) : -1,
  );

  $effect(() => {
    if ($activeGroups.length === 0) panelHeight = 0;
  });

  // Open detail panel pushes rows below the active one down by panelHeight.
  // reverseSort flips "below" to i < activeIdx.
  function shiftFor(i: number): number {
    if (activeIdx < 0 || panelHeight === 0) return 0;
    const shifted = reverseSort ? i < activeIdx : i > activeIdx;
    return shifted ? panelHeight : 0;
  }

  const descStart = $derived(
    getDescStart(filteredGroups, descMinId, loading, pendingGroupCount),
  );

  const totalForY = $derived(
    getTotalForY(filteredGroups.length, pendingGroupCount, descStart),
  );

  // Widen the mount window by the panel's row span: shiftFor moves rows down but
  // getWindowBounds maps on the unshifted y, so without this they'd leave a blank.
  const windowOverscan = $derived(
    OVERSCAN + Math.ceil(panelHeight / ROW_HEIGHT),
  );

  // Full drawn height (rows + axis + detail panel). The container is this tall and
  // scrolls with the page.
  const timelineHeight = $derived(
    Math.max(
      ROW_HEIGHT * (filteredGroups.length + pendingGroupCount + 2),
      120,
    ) + panelHeight,
  );
  const AXIS_LABEL_ZONE = 150;
  const svgHeight = $derived(timelineHeight + AXIS_LABEL_ZONE);

  // ── Scroll-driven virtualization ────────────────────────────────────────────
  // Each frame we read the container's offset within its scroll parent to get the
  // visible pixel band, which getWindowBounds turns into a row range. Not
  // IntersectionObserver: the browser drops IO callbacks during fast scroll, so
  // the window trailed the viewport and rows blanked until it settled.
  let visibleBand = $state.raw<[number, number] | null>(null);

  // Visible pixel band, used to window full-height overlays (the collapsed-idle
  // zigzag) so they don't rasterize the entire tens-of-thousands-px canvas.
  const layerBandTop = $derived(visibleBand ? visibleBand[0] : 0);
  const layerBandHeight = $derived(
    visibleBand ? visibleBand[1] - visibleBand[0] : timelineHeight,
  );

  let scroller: HTMLElement | null = null;
  let bandRafId: ReturnType<typeof requestAnimationFrame> | undefined;
  let lastTop = NaN;
  let lastHeight = NaN;
  let stableFrames = 0;
  const STABLE_FRAMES = 8; // still frames before the sampling loop idles out

  // Self-driven rAF loop, not a per-scroll-event measure: a wheel fling fires
  // `wheel` but coalesces `scroll`, so an event-driven measure goes stale mid-fling.
  function sampleBand() {
    bandRafId = undefined;
    if (!containerEl) return;
    const elTop = containerEl.getBoundingClientRect().top;
    const viewTop = scroller ? scroller.getBoundingClientRect().top : 0;
    const viewHeight = scroller ? scroller.clientHeight : window.innerHeight;
    const top = viewTop - elTop; // container-local top of the visible area

    if (top !== lastTop || viewHeight !== lastHeight) {
      lastTop = top;
      lastHeight = viewHeight;
      stableFrames = 0;
      visibleBand = [top, top + viewHeight];
    } else {
      stableFrames++;
    }

    // Loop while moving; idle out once still. pokeSampler restarts it on activity.
    if (stableFrames < STABLE_FRAMES) {
      bandRafId = requestAnimationFrame(sampleBand);
    }
  }

  function pokeSampler() {
    stableFrames = 0;
    if (bandRafId === undefined) {
      bandRafId = requestAnimationFrame(sampleBand);
    }
  }

  function findScrollParent(node: HTMLElement): HTMLElement | null {
    let el = node.parentElement;
    while (el) {
      const overflowY = getComputedStyle(el).overflowY;
      if (overflowY === 'auto' || overflowY === 'scroll') return el;
      el = el.parentElement;
    }
    return null;
  }

  $effect(() => {
    if (!containerEl) return;
    scroller = findScrollParent(containerEl);
    lastTop = NaN;
    lastHeight = NaN;
    stableFrames = 0;
    sampleBand();
    const target: HTMLElement | Window = scroller ?? window;
    const opts = { passive: true };
    // wheel/touchmove cover flings where `scroll` events are throttled.
    target.addEventListener('scroll', pokeSampler, opts);
    target.addEventListener('wheel', pokeSampler, opts);
    target.addEventListener('touchmove', pokeSampler, opts);
    window.addEventListener('resize', pokeSampler, opts);
    return () => {
      target.removeEventListener('scroll', pokeSampler);
      target.removeEventListener('wheel', pokeSampler);
      target.removeEventListener('touchmove', pokeSampler);
      window.removeEventListener('resize', pokeSampler);
      if (bandRafId !== undefined) cancelAnimationFrame(bandRafId);
    };
  });

  const [windowStart, windowEnd] = $derived.by(() => {
    const band = visibleBand;
    const bandTop = band ? band[0] : 0;
    const bandHeight = band ? band[1] - band[0] : Math.min(svgHeight, 1000);
    return getWindowBounds({
      bandTop,
      bandHeight,
      total: filteredGroups.length,
      overscan: windowOverscan,
      reverseSort,
      descStart,
      pendingCount: pendingGroupCount,
      totalForY,
    });
  });

  // ── Row pool ────────────────────────────────────────────────────────────────
  // Fixed-size set of slots reused across scroll (vs a keyed each that creates/
  // destroys rows as the window slides). Slots keep their DOM + instance and just
  // re-point to a new group — avoids the mount churn that caused major-GC pauses.
  const POOL_SLACK = 4;
  const poolSize = $derived.by(() => {
    const band = visibleBand;
    const bandHeight = band ? band[1] - band[0] : Math.min(svgHeight, 1000);
    return Math.ceil(bandHeight / ROW_HEIGHT) + 2 * windowOverscan + POOL_SLACK;
  });

  // Slot n shows filteredGroups[windowStart + n], or null past the window/list.
  // Keyed by slot index (below) so the DOM stays put; poolSize ≥ window span.
  const pool = $derived.by(() => {
    const start = windowStart;
    const total = filteredGroups.length;
    const slots: ({ index: number; group: EventGroups[number] } | null)[] = [];
    for (let slot = 0; slot < poolSize; slot++) {
      const index = start + slot;
      slots.push(
        index < windowEnd && index < total
          ? { index, group: filteredGroups[index] }
          : null,
      );
    }
    return slots;
  });

  const getY = $derived.by(
    () =>
      (i: number): number =>
        getRowY(i, {
          descStart,
          pendingGroupCount,
          totalForY,
          reverseSort,
        }),
  );

  // Border rails span the full timeline height so they meet the bottom axis.
  const lineTop = 0;
  const lineBottom = $derived(timelineHeight);
</script>

<div
  id="event-history-timeline-graph"
  class={twMerge(
    'relative overflow-hidden border border-t-0 border-subtle bg-primary',
    error && 'bg-danger',
  )}
  style:height="{svgHeight}px"
  bind:this={containerEl}
>
  <EndTimeInterval {workflow} {startTime} bind:currentTime={nowMs} let:endTime>
    <div
      class="pointer-events-none sticky top-[120px]"
      class:invisible={!!$activeGroups.length}
    >
      <div class="flex w-full justify-between text-xs">
        <p class="w-60 -translate-x-24 rotate-90">
          {$timestamp(startTime, { format: 'short' })}
        </p>
        <p class="w-60 translate-x-24 rotate-90">
          {$timestamp(endTime, { format: 'short' })}
        </p>
      </div>
    </div>
    <!-- Tall scrolled layer; rows/lines/dots are absolutely-positioned divs,
         only the windowed slots exist in the DOM. -->
    <div
      class="canvas"
      style:width="{canvasWidth}px"
      style:height="{svgHeight}px"
      style:--dot="{dotSize}px"
      style:--dot-r="{dotRadius}px"
    >
      <TimelineIconDefs />

      <!-- Border rails -->
      <div
        class="absolute bg-current"
        style:left="{GUTTER - RADIUS / 4}px"
        style:top="{lineTop}px"
        style:width="{RADIUS / 2}px"
        style:height="{lineBottom}px"
      ></div>
      <div
        class="absolute bg-current"
        style:left="{canvasWidth - GUTTER - RADIUS / 4}px"
        style:top="{lineTop}px"
        style:width="{RADIUS / 2}px"
        style:height="{lineBottom}px"
      ></div>

      <TimelineAxis
        x1={GUTTER - RADIUS / 4}
        x2={canvasWidth - GUTTER + RADIUS / 4}
        gutter={GUTTER}
        {timelineHeight}
        {startTime}
        {scale}
      />
      <WorkflowRow {workflow} y={ROW_HEIGHT} length={canvasWidth} />
      {#if !loading}
        <!-- Anchor's left provides the gutter offset for the layer's 0-based coords. -->
        <div class="absolute top-0" style:left="{GUTTER}px">
          <TimelineCollapsedLayer
            {scale}
            {timelineHeight}
            bandTop={layerBandTop}
            bandHeight={layerBandHeight}
            {readOnly}
            onToggle={toggleSegment}
          />
        </div>
      {/if}

      <!-- Keyed by slot index so Svelte reuses the <li>s in place; the <li>
           persists when its slot is null, only the inner row toggles.
           pointer-events-none so clicks fall through to the collapse toggles;
           event buttons opt back in with pointer-events:auto. -->
      <ul class="pointer-events-none absolute inset-0 m-0 list-none p-0">
        {#each pool as slot, slotIndex (slotIndex)}
          <li
            class="absolute left-0 right-0 top-0"
            style:display={slot ? 'block' : 'none'}
            style:height="{ROW_HEIGHT}px"
            style:contain="layout"
            style:transform={slot
              ? `translateY(${getY(slot.index) - ROW_HEIGHT / 2 + shiftFor(slot.index)}px)`
              : undefined}
          >
            {#if slot}
              <TimelineGraphRow
                group={slot.group}
                eventCount={slot.group.eventList.length}
                {canvasWidth}
                project={projectX}
                {readOnly}
              />
            {/if}
          </li>
        {/each}
      </ul>

      {#if loading && pendingGroupCount > 0}
        {@const rectY = getPendingBlockY({
          descStart,
          filteredGroupsLength: filteredGroups.length,
          reverseSort,
        })}
        {@const rectH = pendingGroupCount * ROW_HEIGHT + RADIUS}
        <div
          class="absolute animate-pulse rounded bg-slate-400/30"
          style:left="{GUTTER}px"
          style:top="{rectY}px"
          style:width="{canvasWidth - GUTTER * 2}px"
          style:height="{rectH}px"
        ></div>
      {/if}

      <!-- Last child so it paints above rows; onHeight feeds shiftFor. -->
      {#if !readOnly && activeIdx >= 0}
        {@const activeGroup = filteredGroups[activeIdx]}
        {#if activeGroup}
          {@const panelY = getY(activeIdx) + 1.33 * RADIUS}
          <GroupDetailsRow
            y={panelY}
            group={activeGroup}
            {canvasWidth}
            endTime={workflow?.endTime ? endTime : nowMs}
            onHeight={(height) => {
              panelHeight = height;
            }}
          />
        {/if}
      {/if}
    </div>
  </EndTimeInterval>
</div>

<style lang="postcss">
  /* color drives currentColor for the rails, axis, grid lines, tick labels and
     fallback row labels, so it must be theme-aware (white only reads on dark). */
  .canvas {
    position: relative;
    margin-top: -1rem;
    color: rgb(var(--color-text-primary));
  }

  /* Connector-line styles for the row components' `.tl-line` divs; :global since
     they're in children, scoped under .canvas so they don't leak. Elements set
     geometry + --tl-line-color inline. border-radius: 9999px → pill ends. */
  .canvas :global(.tl-line) {
    border-radius: 9999px;
    background-color: var(--tl-line-color);
  }

  .canvas :global(.tl-line--gradient) {
    background-image: linear-gradient(255deg, #1ff1a5 0%, #f55 100%);
  }

  .canvas :global(.tl-line--dashed) {
    background-color: transparent;
    background-image: repeating-linear-gradient(
      to right,
      var(--tl-line-color) 0 3px,
      transparent 3px 6px
    );
    background-size: 6px 100%;
  }

  /* Animated dashes run on a pseudo-element's transform (GPU-composited) rather
     than background-position (which forces a main-thread repaint every frame). */
  .canvas :global(.tl-line--dashed.tl-line--animate) {
    background-image: none;
    overflow: hidden;
  }

  .canvas :global(.tl-line--dashed.tl-line--animate)::after {
    content: '';
    position: absolute;
    inset: 0 -6px 0 0;
    background-image: repeating-linear-gradient(
      to right,
      var(--tl-line-color) 0 3px,
      transparent 3px 6px
    );
    background-size: 6px 100%;
    animation: tl-line-dash 1.8s linear infinite;
    will-change: transform;
  }

  @keyframes tl-line-dash {
    to {
      transform: translateX(-6px);
    }
  }
</style>
