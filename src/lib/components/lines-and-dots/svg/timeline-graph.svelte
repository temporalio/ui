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
  }

  let {
    x = 0,
    y = 0,
    workflow,
    groups,
    viewportHeight,
    readOnly = false,
    error = false,
  }: Props = $props();

  const { height, gutter, radius } = TimelineConfig;

  let canvasWidth = $state(0);
  let scrollY = $state(0);

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

  const handleScroll = (e: Event) => {
    scrollY = (e?.target as HTMLElement)?.scrollTop;
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

    for (const [id, el] of rowWrappers) {
      const i = idxMap.get(id);
      if (i === undefined) continue;
      if (idx >= 0 && i > idx && shift > 0) {
        el.setAttribute('transform', `translate(0, ${shift})`);
      } else {
        el.removeAttribute('transform');
      }
    }
  });

  // PERF: timelineHeight uses panelHeight (actual measured panel size) so the
  // SVG is tall enough to contain the shifted lower rows. Clamped to at least
  // 800px when a panel is open so the SVG doesn't clip on the first frame
  // before ResizeObserver delivers its first measurement.
  const timelineHeight = $derived(
    Math.max(height * (filteredGroups.length + 2), 120) +
      (activeIdx >= 0 ? Math.max(panelHeight, 800) : 0),
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
      {#each filteredGroups as group, i (group.id)}
        {@const y = (i + 2) * height}
        <g use:registerRow={group.id}>
          {#if !viewportHeight || (y > scrollY - 2 * height && y < scrollY + viewportHeight * height)}
            <!--
              PERF: Key on group.events.size (native Map property) rather than
              group.eventList.length (a getter that allocates an array). This
              busts the key only when new events arrive, not on every render.
            -->
            {#key group.events.size}
              <TimelineGraphRow
                {y}
                {group}
                {canvasWidth}
                {startTime}
                {endTime}
                {readOnly}
              />
            {/key}
          {/if}
        </g>
      {/each}

      <!--
        Details panel sits above all rows in SVG paint order (last child = top).
        onHeight delivers the actual panel height back so the $effect can update
        transforms. Only panelHeight changes — no row attributes touched.
      -->
      {#if !readOnly && activeIdx >= 0}
        {@const grp = filteredGroups[activeIdx]}
        {#if grp}
          <GroupDetailsRow
            y={(activeIdx + 2) * height + 1.33 * radius}
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
