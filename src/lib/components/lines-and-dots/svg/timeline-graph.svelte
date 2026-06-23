<script lang="ts">
  import { timestamp } from '$lib/components/timestamp.svelte';
  import type { EventGroups } from '$lib/models/event-groups/event-groups';
  import { activeGroups } from '$lib/stores/active-events';
  import { fullEventHistory } from '$lib/stores/events';
  import { eventStatusFilter } from '$lib/stores/filters';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { isWorkflowDelayed } from '$lib/utilities/delayed-workflows';
  import { getFailedOrPendingGroups } from '$lib/utilities/get-failed-or-pending';

  import { TimelineConfig } from '../constants';
  import EndTimeInterval from '../end-time-interval.svelte';
  import {
    getDescStart,
    getPendingBlockY,
    getRowY,
    getTotalForY,
  } from './timeline-positioning';

  import GroupDetailsRow from './group-details-row.svelte';
  import Line from './line.svelte';
  import TimelineAxis from './timeline-axis.svelte';
  import TimelineGraphRow from './timeline-graph-row.svelte';
  import TimelineIconDefs from './timeline-icon-defs.svelte';
  import WorkflowRow from './workflow-row.svelte';

  interface Props {
    x?: number;
    y?: number;
    workflow: WorkflowExecution;
    groups: EventGroups;
    /** Container viewport height in px — overrides the self-measured height. */
    viewportHeight?: number;
    /** External scrollY in px, driven by the parent's sentinel element. */
    scrollY?: number;
    readOnly?: boolean;
    error?: boolean;
    reverseSort?: boolean;
    loading?: boolean;
    totalExpectedEvents?: number;
    descMinId?: number;
    panelHeight?: number;
  }

  let {
    x = 0,
    y = 0,
    workflow,
    groups,
    viewportHeight = 0,
    scrollY: scrollYProp = undefined,
    readOnly = false,
    error = false,
    reverseSort = false,
    loading = false,
    totalExpectedEvents = 0,
    descMinId = 0,
    panelHeight = $bindable(0),
  }: Props = $props();

  const { height, gutter, radius } = TimelineConfig;

  let canvasWidth = $state(0);
  const scrollY = $derived(scrollYProp ?? 0);

  const AXIS_TICKS = 20;
  const axisX1 = $derived(gutter - radius / 4);
  const axisX2 = $derived(canvasWidth - gutter + radius / 4);
  const tickDistance = $derived((axisX2 - axisX1) / AXIS_TICKS);

  // CSS background string for the 19 dashed tick lines.
  // Recomputes only on canvasWidth change (resize), never during scroll.
  const gridBackgroundStyle = $derived.by(() => {
    if (canvasWidth === 0 || tickDistance <= 0) return '';
    const td = tickDistance;
    const count = AXIS_TICKS - 1;
    const images = Array.from(
      { length: count },
      () =>
        'repeating-linear-gradient(to bottom, currentColor 0px, currentColor 2px, transparent 2px, transparent 4px)',
    ).join(', ');
    const sizes = Array.from({ length: count }, () => '1px 4px').join(', ');
    const positions = Array.from(
      { length: count },
      (_, i) => `${(axisX1 + (i + 1) * td).toFixed(1)}px 0`,
    ).join(', ');
    const repeats = Array.from(
      { length: count },
      () => 'no-repeat repeat',
    ).join(', ');
    return `background-image:${images};background-size:${sizes};background-position:${positions};background-repeat:${repeats};`;
  });

  // PERF: bind:clientWidth={canvasWidth} compiled to bind_element_size which reads
  // element.clientWidth inside a Svelte effect during every reactive flush (~150×
  // in T4). Each read forces a full synchronous layout of the 40k-row SVG (~3ms
  // each = 4.2% total CPU). Two fixes combined:
  //   1. Use contentRect.width from the ResizeObserver callback — the browser
  //      already computed this, no additional reflow needed.
  //   2. Debounce via requestAnimationFrame to break any oscillation where a width
  //      change causes re-renders that change the width again.
  let containerEl = $state<HTMLDivElement | null>(null);
  // Self-measured container height for the virtualization guard.
  // The parent can override via the viewportHeight prop; if it doesn't (or
  // passes 0), we fall back to this measurement so the guard always fires.
  let _measuredHeight = $state(0);
  const effectiveViewportHeight = $derived(
    viewportHeight > 0 ? viewportHeight : _measuredHeight,
  );

  $effect(() => {
    if (!containerEl) return;
    // PERF: Use contentRect.width from the ResizeObserver callback for ALL reads —
    // including the initial one. contentRect is computed by the browser during layout
    // and returned as part of the notification; reading it here does NOT force an
    // additional synchronous reflow (unlike offsetWidth/clientWidth which do).
    //
    // The first callback fires in the same rendering cycle as observe(), so there is
    // no one-frame flash. We apply it immediately (no RAF) so the SVG has a real
    // width on the first paint. Subsequent callbacks are RAF-debounced to prevent
    // oscillation where a width change causes re-renders that alter the width again.
    let isFirst = true;
    let rafId: ReturnType<typeof requestAnimationFrame>;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      const w = Math.round(entry.contentRect.width);
      const h = Math.round(entry.contentRect.height);
      if (isFirst) {
        isFirst = false;
        canvasWidth = w;
        _measuredHeight = h;
      } else {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          canvasWidth = w;
          _measuredHeight = h;
        });
      }
    });
    observer.observe(containerEl);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  });

  const filteredGroups = $derived(
    getFailedOrPendingGroups(groups, $eventStatusFilter),
  );

  // Skeleton rows: how many unfetched event groups we expect below the loaded ones.
  // Density = current groups per loaded event (from the first page). Applied to the
  // remaining unloaded events to estimate how many rows will appear when they arrive.
  // Falls back to 0.5 (2 events/group) when no events are loaded yet so skeletons
  // appear immediately rather than waiting for the first page to derive a real density.
  const pendingGroupCount = $derived.by(() => {
    if (!loading) return 0;
    if (!totalExpectedEvents) {
      // No total known yet (pre-first-progress) — show enough rows to fill a viewport
      // so there's a skeleton from the very first paint rather than an empty timeline.
      return filteredGroups.length === 0 ? 50 : 0;
    }
    const loadedEvents = $fullEventHistory.length;
    const density =
      loadedEvents && filteredGroups.length
        ? filteredGroups.length / loadedEvents
        : 0.5;
    const expectedTotal = Math.round(totalExpectedEvents * density);
    return Math.max(0, expectedTotal - filteredGroups.length);
  });

  // Scroll-window virtualization: only the rows within OVERSCAN rows of the
  // current viewport are mounted in the SVG DOM. The SVG viewBox handles
  // per-frame visual panning; this derived controls which <g> elements exist.
  //
  // OVERSCAN = 8 rows × 24 px = 192 px buffer per side. Rows are cheap
  // (icon + text only, no long connector lines) so a small buffer is enough.
  const OVERSCAN = 8;

  // O(1) closed-form inverse of getRowY for each of the two cursor segments.
  // Both segments are linear (y = m*i + b), so inverting is pure arithmetic.
  // Returns [start, end) indices into filteredGroups.
  function getWindowBounds(
    sy: number,
    vp: number,
    total: number,
    h: number,
    os: number,
    rs: boolean,
    ds: number,
    pc: number,
    tfy: number,
  ): [number, number] {
    if (total === 0 || !vp) {
      const cap = Math.min(total, 100);
      return rs ? [Math.max(0, total - cap), total] : [0, cap];
    }
    const yMin = sy - os * h;
    const yMax = sy + vp + os * h;
    let s = total;
    let e = 0;
    if (!rs) {
      // Segment 1 [0, ds): y = (i+2)*h
      const s1s = Math.max(0, Math.ceil(yMin / h - 2));
      const s1e = Math.min(ds, Math.floor(yMax / h - 2) + 1);
      if (s1s < s1e) {
        s = Math.min(s, s1s);
        e = Math.max(e, s1e);
      }
      // Segment 2 [ds, N): y = (i+2+pc)*h
      const s2s = Math.max(ds, Math.ceil(yMin / h - 2 - pc));
      const s2e = Math.min(total, Math.floor(yMax / h - 2 - pc) + 1);
      if (s2s < s2e) {
        s = Math.min(s, s2s);
        e = Math.max(e, s2e);
      }
    } else {
      // Segment 1 [0, ds): y = (tfy+1-i)*h  → i = tfy+1 - y/h
      const s1s = Math.max(0, Math.ceil(tfy + 1 - yMax / h));
      const s1e = Math.min(ds, Math.floor(tfy + 1 - yMin / h) + 1);
      if (s1s < s1e) {
        s = Math.min(s, s1s);
        e = Math.max(e, s1e);
      }
      // Segment 2 [ds, N): y = (tfy+1-i-pc)*h → i = tfy+1-pc - y/h
      const s2s = Math.max(ds, Math.ceil(tfy + 1 - pc - yMax / h));
      const s2e = Math.min(total, Math.floor(tfy + 1 - pc - yMin / h) + 1);
      if (s2s < s2e) {
        s = Math.min(s, s2s);
        e = Math.max(e, s2e);
      }
    }
    return s >= e ? [0, 0] : [s, e];
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

  // PERF: Index of the currently active group in filteredGroups (-1 = none).
  // Derived here so only the two rendering sections below subscribe to
  // $activeGroups, not the main row {#each}.
  const activeIdx = $derived(
    $activeGroups.length > 0 ? (groupIndexMap.get($activeGroups[0]) ?? -1) : -1,
  );

  $effect(() => {
    if ($activeGroups.length === 0) panelHeight = 0;
  });

  // PERF IMPERATIVE TRANSFORM APPROACH:
  // A plain Map of group-id → SVG <g> wrapper element, populated by the
  // use:registerRow action on each row. Not reactive — Svelte never observes
  // this Map, so registering/deregistering rows causes no reactive cascade.
  const rowWrappers = new Map<string, SVGGElement>();

  function registerRow(el: SVGGElement, id: string) {
    rowWrappers.set(id, el);
    return {
      destroy() {
        rowWrappers.delete(id);
      },
    };
  }

  // PERF: This $effect subscribes only to activeIdx, panelHeight, and
  // groupIndexMap (which changes when filteredGroups changes). It never makes
  // individual rows reactive to $activeGroups.
  //
  // On click: one JS loop over all registered row wrappers + one
  // setAttribute/removeAttribute per row that actually changes its transform.
  // No component destroy/recreate, no cache clearing, no onMount re-runs.
  //
  // Cost: O(N) JS iterations (~50ms for 10k rows) regardless of which row
  // is clicked — uniformly better than the two-loop approach for top clicks
  // and comparable for bottom clicks.
  $effect(() => {
    const idx = activeIdx;
    const shift = panelHeight;
    const idxMap = groupIndexMap; // reactive dep so effect re-runs on filter changes
    // PERF SORT: reverseSort flips which side of activeIdx receives the shift.
    // In ascending mode rows AFTER (i > idx) move down. In descending mode
    // rows BEFORE (i < idx) are visually below the panel and move down instead.
    const isDesc = reverseSort;
    // Re-run when the scroll window shifts and new rows mount so they receive
    // the correct transform immediately rather than appearing at y=0.
    const _ws = windowStart;
    const _we = windowEnd;

    if (idx < 0) {
      for (const el of rowWrappers.values()) {
        el.removeAttribute('transform');
      }
      return;
    }

    if (shift === 0) return;

    for (const [id, el] of rowWrappers) {
      const i = idxMap.get(id);
      if (i === undefined) continue;
      if (isDesc ? i < idx : i > idx) {
        el.setAttribute('transform', `translate(0, ${shift})`);
      } else {
        el.removeAttribute('transform');
      }
    }
  });

  const descStart = $derived(
    getDescStart(filteredGroups, descMinId, loading, pendingGroupCount),
  );

  const totalForY = $derived(
    getTotalForY(filteredGroups.length, pendingGroupCount, descStart),
  );

  const [windowStart, windowEnd] = $derived(
    getWindowBounds(
      scrollY,
      effectiveViewportHeight,
      filteredGroups.length,
      height,
      OVERSCAN,
      reverseSort,
      descStart,
      pendingGroupCount,
      totalForY,
    ),
  );

  const windowedGroups = $derived(filteredGroups.slice(windowStart, windowEnd));

  const getY = $derived.by(
    () =>
      (i: number): number =>
        getRowY(i, {
          descStart,
          pendingGroupCount,
          totalForY,
          reverseSort,
          height,
        }),
  );

  // PERF: timelineHeight is driven purely by panelHeight (delivered async by
  // the ResizeObserver in group-details-row). On click, panelHeight starts at
  // 0, so timelineHeight does NOT change — Line and TimelineAxis are not
  // dirtied. They only update once the panel is actually measured, which is
  // the correct moment. The old Math.max(panelHeight, 800) caused a spurious
  // +800px jump every click, triggering unnecessary setAttribute calls on
  // both Line components and all Axis tick marks.
  const timelineHeight = $derived(
    Math.max(height * (filteredGroups.length + pendingGroupCount + 2), 120) +
      panelHeight,
  );

  // Border lines clipped to the overscan window — updated only at hysteresis
  // rate (same cadence as row add/remove), never on every scroll frame.
  const lineTop = $derived(windowStart * height);
  const lineBottom = $derived(windowEnd * height);
</script>

<div
  id="event-history-timeline-graph"
  class="relative h-full overflow-hidden border border-t-0 border-subtle bg-primary"
  bind:this={containerEl}
>
  <div
    class="pointer-events-none absolute inset-0 opacity-30"
    style={gridBackgroundStyle}
  ></div>
  <EndTimeInterval
    {workflow}
    {startTime}
    let:endTime
    let:duration
    let:currentTime
  >
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
    <!--
      PERF SCROLL: The <svg> element itself carries the CSS translateY so
      that scroll-driven panning is handled at the compositor layer.

      Why <svg> rather than a child <g>:
        - The SVG root is treated as a replaced HTML element by Blink/Chrome,
          so will-change: transform promotes it to a GPU compositing layer.
        - Updating a composited CSS transform does NOT invalidate computed
          styles for descendants — CodeMirror's observers.scroll then reads
          scrollTop against a clean layout tree, eliminating the forced
          style-recalculation of all 4 k+ SVG children that previously cost
          50-100 ms every scroll frame.
        - Inner SVG elements (<g>, <rect> …) are NOT independently
          compositor-promoted, so transform on a <g> still triggers a full
          style recalculation of its subtree.

      viewBox is FIXED at "0 0 w h" — it never changes on scroll.
      overflow="visible" allows windowed rows above/below the viewport rect
      to exist in the DOM; the parent overflow-hidden div clips the rendering.
    -->
    <svg
      {x}
      {y}
      viewBox="0 0 {canvasWidth} {effectiveViewportHeight}"
      height={effectiveViewportHeight}
      width={canvasWidth}
      overflow="visible"
      class="-mt-4"
      class:error
      style:transform="translateY(-{scrollY}px)"
      style:will-change="transform"
    >
      <!--
        PERF: Defines all 11 timeline icon <symbol> elements once per SVG.
        Every <TimelineIcon> is a single <use href="#ti-{name}"> node — no
        {#if} branching, no innerHTML parsing, no repeated path data in the DOM.
        The browser caches the symbol geometry; rendering cost per icon is minimal.
      -->
      <TimelineIconDefs />
      <Line
        startPoint={[gutter, lineTop]}
        endPoint={[gutter, lineBottom]}
        strokeWidth={radius / 2}
      />
      <Line
        startPoint={[canvasWidth - gutter, lineTop]}
        endPoint={[canvasWidth - gutter, lineBottom]}
        strokeWidth={radius / 2}
      />
      <TimelineAxis
        x1={gutter - radius / 4}
        x2={canvasWidth - gutter + radius / 4}
        {timelineHeight}
        {startTime}
        duration={duration ?? 0}
      />
      <WorkflowRow {workflow} y={height} length={canvasWidth} />
      <!--
        PERF IMPERATIVE TRANSFORM APPROACH:
        Single {#each} loop — rows are never destroyed/recreated on click.
        Each row's <g> wrapper is registered in rowWrappers via use:registerRow.
        The $effect in <script> iterates those refs and stamps transform
        attributes directly when activeIdx or panelHeight changes.

        Cost on click: O(N) Map iteration + N-K setAttribute calls (compositor
        path, no layout pass). No component lifecycle operations at all.
        Uniformly fast for both top and bottom clicks.
      -->
      <!--
        PERF SORT: rows always iterate in ascending key order — Svelte never
        reorders DOM nodes when sort changes. y is computed from the loop index
        using the ascending formula (i+2)*height or the descending mirror
        (totalForY+1-i)*height so that the visual order flips without any
        insertBefore. totalForY = filteredGroups.length + pendingGroupCount keeps
        all existing rows at a stable y as new data streams in: pendingGroupCount
        shrinks as filteredGroups grows, so totalForY ≈ constant throughout.
        The transform $effect handles the panel-shift side; it already accounts
        for reverseSort by checking (i < idx) instead of (i > idx).
      -->
      {#each windowedGroups as group, localI (group.id)}
        {@const i = windowStart + localI}
        {@const y = getY(i)}
        <g use:registerRow={group.id}>
          <!--
            PERF: Key on group.eventList.length so Svelte only re-renders
            this row when new events are appended to the group. Frozen to 0
            during loading to prevent destroy+recreate on every streaming
            batch — after loading, individual live-event arrivals are fine.
          -->
          {#key loading ? 0 : group.eventList.length}
            <TimelineGraphRow
              {y}
              {group}
              {canvasWidth}
              {startTime}
              {endTime}
              {readOnly}
            />
          {/key}
        </g>
      {/each}

      {#if loading && pendingGroupCount > 0}
        {@const rectY = getPendingBlockY({
          descStart,
          filteredGroupsLength: filteredGroups.length,
          reverseSort,
          height,
          radius,
        })}
        {@const rectH = pendingGroupCount * height + radius}
        <rect
          x={gutter}
          y={rectY}
          width={canvasWidth - gutter * 2}
          height={rectH}
          rx="4"
          class="animate-pulse fill-slate-400/30"
        />
      {/if}

      <!--
        Details panel sits above all rows in SVG paint order (last child = top).
        onHeight delivers the actual panel height back so the $effect can update
        transforms. Only panelHeight changes — no row attributes touched.
      -->
      {#if !readOnly && activeIdx >= 0}
        {@const grp = filteredGroups[activeIdx]}
        {#if grp}
          {@const panelY = getY(activeIdx) + 1.33 * radius}
          <GroupDetailsRow
            y={panelY}
            group={grp}
            {canvasWidth}
            endTime={workflow?.endTime ? endTime : currentTime}
            onHeight={(h) => {
              panelHeight = h;
            }}
          />
        {/if}
      {/if}
    </svg>
  </EndTimeInterval>
</div>

<style lang="postcss">
  .error {
    @apply bg-danger;
  }

  .skeleton-rows {
    border-radius: 4px;
    overflow: hidden;
    position: relative;
    background-image: repeating-linear-gradient(
      180deg,
      transparent 0,
      transparent 3px,
      color-mix(in srgb, theme(colors.slate.400) 28%, transparent) 3px,
      color-mix(in srgb, theme(colors.slate.400) 28%, transparent) 21px,
      transparent 21px,
      transparent 24px
    );

    :global(.dark) & {
      background-image: repeating-linear-gradient(
        180deg,
        transparent 0,
        transparent 3px,
        color-mix(in srgb, theme(colors.slate.400) 40%, transparent) 3px,
        color-mix(in srgb, theme(colors.slate.400) 40%, transparent) 21px,
        transparent 21px,
        transparent 24px
      );
    }

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgb(255 255 255 / 70%) 50%,
        transparent 100%
      );
      animation: shimmer-lr 1.6s ease-in-out infinite;
      will-change: transform;
    }
  }

  @keyframes shimmer-lr {
    from {
      transform: translateX(-100%);
    }

    to {
      transform: translateX(200%);
    }
  }
</style>
