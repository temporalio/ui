<script lang="ts">
  import { untrack } from 'svelte';

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
    viewportHeight: number | undefined;
    readOnly?: boolean;
    error?: boolean;
    reverseSort?: boolean;
    startedAt?: number;
    onFirstRender?: (ms: number) => void;
    onAllRendered?: (ms: number) => void;
    loading?: boolean;
    totalExpectedEvents?: number;
    descMinId?: number;
  }

  let {
    x = 0,
    y = 0,
    workflow,
    groups,
    viewportHeight,
    readOnly = false,
    error = false,
    reverseSort = false,
    startedAt,
    onFirstRender,
    onAllRendered,
    loading = false,
    totalExpectedEvents = 0,
    descMinId = 0,
  }: Props = $props();

  const { height, gutter, radius } = TimelineConfig;

  const INITIAL_COUNT = 100;
  const OVERSCAN = 15;

  let canvasWidth = $state(0);
  let renderedCount = $state(0);

  // PERF: Effective page scroll relative to SVG container top.
  // Updated by the page-scroll $effect below with hysteresis.
  let _scrollY = $state(0);

  // PERF: O(1) window bounds for virtualization.
  // Ascending:  row i is at y = (i + 2) * h → visible i ∈ [sy/h − 2 ± overscan]
  // Descending: row i is at y = (total + 1 − i) * h → visible i ∈ [total+1 − (sy+vh)/h ± overscan]
  function computeWindowBounds(
    sy: number,
    vh: number,
    n: number,
    isReverse: boolean,
    total: number,
    h: number,
  ): [number, number] {
    let first: number;
    let last: number;
    if (!isReverse) {
      first = Math.max(0, Math.floor(sy / h) - 2 - OVERSCAN);
      last = Math.min(n, Math.ceil((sy + vh) / h) - 2 + OVERSCAN + 1);
    } else {
      first = Math.max(0, total + 1 - Math.ceil((sy + vh) / h) - OVERSCAN);
      last = Math.min(n, total + 1 - Math.floor(sy / h) + OVERSCAN);
    }
    return [Math.min(first, n), Math.max(last, 0)];
  }

  // PERF: bind:clientWidth={canvasWidth} compiled to bind_element_size which reads
  // element.clientWidth inside a Svelte effect during every reactive flush (~150×
  // in T4). Each read forces a full synchronous layout of the 40k-row SVG (~3ms
  // each = 4.2% total CPU). Two fixes combined:
  //   1. Use contentRect.width from the ResizeObserver callback — the browser
  //      already computed this, no additional reflow needed.
  //   2. Debounce via requestAnimationFrame to break any oscillation where a width
  //      change causes re-renders that change the width again.
  let containerEl = $state<HTMLDivElement | null>(null);

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
      const w = Math.round(entries[0].contentRect.width);
      if (isFirst) {
        isFirst = false;
        canvasWidth = w;
      } else {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          canvasWidth = w;
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

  // Progressive rendering: expand to all groups via idle callback.
  // With window-based virtualization only ~80 rows are ever in the DOM,
  // so the progressive phase is just a safety valve for very first paint.
  const visibleGroups = $derived.by(() => {
    const total = filteredGroups.length;
    if (renderedCount >= total) return filteredGroups;
    if (reverseSort)
      return filteredGroups.slice(Math.max(0, total - renderedCount));
    return filteredGroups.slice(0, renderedCount);
  });

  // PERF: Window-based virtualization.
  // Page-scroll $effect keeps _scrollY fresh with RAF + hysteresis.
  // windowedGroups is the only slice Svelte ever puts into the DOM.
  const windowStart = $derived.by(() => {
    const [s] = computeWindowBounds(
      _scrollY,
      typeof window !== 'undefined' ? window.innerHeight : 800,
      visibleGroups.length,
      reverseSort,
      totalForY,
      height,
    );
    return s;
  });

  const windowedGroups = $derived.by(() => {
    const n = visibleGroups.length;
    const [s, e] = computeWindowBounds(
      _scrollY,
      typeof window !== 'undefined' ? window.innerHeight : 800,
      n,
      reverseSort,
      totalForY,
      height,
    );
    return visibleGroups.slice(s, Math.min(e, n));
  });

  // PERF: Page-level scroll tracking for external scroll mode.
  // When viewportHeight is not set the page scrolls, not the inner div.
  // Only updates _scrollY when scroll moves by HYST pixels so window
  // remounts (DOM mutations) happen infrequently.
  $effect(() => {
    if (viewportHeight || !containerEl) return;

    const HYST = Math.floor(OVERSCAN / 2) * height;
    let svgAbsTop = 0;
    let lastWritten = -Infinity;
    let rafId = 0;

    const updateTop = () => {
      svgAbsTop = containerEl!.getBoundingClientRect().top + window.scrollY;
    };
    updateTop();

    const ro = new ResizeObserver(updateTop);
    ro.observe(document.documentElement);

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        const sy = Math.max(0, window.scrollY - svgAbsTop);
        if (Math.abs(sy - lastWritten) >= HYST) {
          lastWritten = sy;
          _scrollY = sy;
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      ro.disconnect();
      cancelAnimationFrame(rafId);
    };
  });

  // Tracks whether onAllRendered has fired for the current data set,
  // preventing double-calls when the effect re-runs due to loading→false.
  let _allRenderedCalled = false;

  $effect(() => {
    const total = filteredGroups.length;
    const t0 = startedAt;
    // Read loading as a reactive dep so the effect re-runs when the fetch
    // completes. This is required for the case where all events fit in the
    // first page: rendering finishes before fetchComplete, so we need loading
    // to flip false to know it's safe to report "all loaded".
    const isLoading = loading;
    // Read current count without making it a reactive dep. This way the effect
    // only re-runs when filteredGroups/loading/startedAt changes, not on every
    // renderedCount tick. If the set shrank (filter applied) we reset; if it
    // grew (data arrived) we pick up from the existing count so already-rendered
    // rows stay in the DOM.
    const cur = untrack(() => renderedCount);

    if (cur === 0 || total < cur) {
      _allRenderedCalled = false;
      renderedCount = Math.min(INITIAL_COUNT, total);
      if (t0 && onFirstRender) {
        requestAnimationFrame(() => {
          onFirstRender(performance.now() - t0);
        });
      }
      if (total <= INITIAL_COUNT) {
        if (
          !isLoading &&
          total > 0 &&
          t0 &&
          onAllRendered &&
          !_allRenderedCalled
        ) {
          _allRenderedCalled = true;
          // Double-rAF: first frame lets Svelte flush DOM updates, second frame
          // fires after the browser has actually painted the new rows.
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              onAllRendered(performance.now() - t0);
            });
          });
        }
        return;
      }
    }

    const effective = untrack(() => renderedCount);
    // All rows already rendered — fire onAllRendered if fetch is also done.
    // This path handles small datasets where rendering finished before the
    // fetch completed, and the effect re-runs when loading flips to false.
    if (effective >= total) {
      if (
        !isLoading &&
        effective > 0 &&
        t0 &&
        onAllRendered &&
        !_allRenderedCalled
      ) {
        _allRenderedCalled = true;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            onAllRendered(performance.now() - t0);
          });
        });
      }
      return;
    }

    let handle = 0;
    let cancelled = false;

    const expand = () => {
      if (cancelled) return;
      renderedCount = total;
      // Only report "all loaded" once the fetch is also complete. Reading
      // `loading` here (not `isLoading`) gets the current prop value at the
      // time the idle callback fires, which may be after fetchComplete.
      if (!loading && t0 && onAllRendered && !_allRenderedCalled) {
        _allRenderedCalled = true;
        // Double-rAF: Svelte flushes DOM on the first frame, browser paints on
        // the second, so the timestamp reflects when rows are visible on screen.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (!cancelled) onAllRendered(performance.now() - t0);
          });
        });
      }
    };

    handle = requestIdleCallback(expand, { timeout: 200 });
    return () => {
      cancelled = true;
      cancelIdleCallback(handle);
    };
  });
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

  // Internal scroll handler (only active when viewportHeight is set).
  const handleScroll = (e: Event) => {
    const raw = (e?.target as HTMLElement)?.scrollTop ?? 0;
    const HYST = Math.floor(OVERSCAN / 2) * height;
    if (Math.abs(raw - _scrollY) >= HYST) _scrollY = raw;
  };

  const groupIndexMap = $derived(
    new Map(filteredGroups.map((g, i) => [g.id, i])),
  );

  // PERF: Index of the currently active group in filteredGroups (-1 = none).
  // Derived here so only the two rendering sections below subscribe to
  // $activeGroups, not the main row {#each}.
  const activeIdx = $derived(
    $activeGroups.length > 0 ? (groupIndexMap.get($activeGroups[0]) ?? -1) : -1,
  );

  // PERF: Actual panel height from GroupDetailsRow's bind:offsetHeight reactive
  // chain. Only used in the $effect below to stamp the transform value.
  let panelHeight = $state(0);

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
    // Progressive rendering: re-run when new rows mount so they receive the
    // correct transform immediately rather than appearing at the wrong position.
    const _count = renderedCount;

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
  const canvasHeight = $derived(timelineHeight + 120);
</script>

<div
  id="event-history-timeline-graph"
  class="relative h-auto overflow-auto border border-t-0 border-subtle bg-primary [scrollbar-gutter:stable]"
  bind:this={containerEl}
  style={viewportHeight ? `max-height: ${viewportHeight}px;` : ''}
  onscroll={handleScroll}
>
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
    <svg
      {x}
      {y}
      viewBox="0 0 {canvasWidth} {canvasHeight}"
      height={canvasHeight}
      width={canvasWidth}
      class="-mt-4"
      class:error
      data-fg={filteredGroups.length}
      data-vg={visibleGroups.length}
      data-wg={windowedGroups.length}
      data-ws={windowStart}
      data-sy={_scrollY}
      data-tf={totalForY}
      data-rc={renderedCount}
    >
      <!--
        PERF: Defines all 11 timeline icon <symbol> elements once per SVG.
        Every <TimelineIcon> is a single <use href="#ti-{name}"> node — no
        {#if} branching, no innerHTML parsing, no repeated path data in the DOM.
        The browser caches the symbol geometry; rendering cost per icon is minimal.
      -->
      <TimelineIconDefs />
      <Line
        startPoint={[gutter, 0]}
        endPoint={[gutter, timelineHeight]}
        strokeWidth={radius / 2}
      />
      <Line
        startPoint={[canvasWidth - gutter, 0]}
        endPoint={[canvasWidth - gutter, timelineHeight]}
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
          {#key group.eventList.length}
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
          fill="color-mix(in srgb, currentColor 6%, transparent)"
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
</style>
