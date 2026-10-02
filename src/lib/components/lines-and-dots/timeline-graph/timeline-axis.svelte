<script lang="ts">
  import { untrack } from 'svelte';

  import type { Timestamp } from '$lib/types';
  import {
    formatDistanceAbbreviated,
    validTimeToDate,
  } from '$lib/utilities/format-time';

  import { RADIUS } from './constants';
  import {
    getNiceTimelineIntervalMs,
    getTimelineTimeTicks,
    screenToTimelineWorld,
  } from './timeline-axis-geometry';

  import type { TimelineScaleProjection } from './timeline-scale.svelte';

  type Props = {
    x1: number;
    x2: number;
    gutter: number;
    timelineHeight: number;
    bandTop?: number;
    bandHeight?: number;
    startTime: string | Timestamp;
    scale: TimelineScaleProjection;
    viewportOffsetPx: number;
    /** The heavy line along the bottom; views framed some other way skip it. */
    showBaseline?: boolean;
    /** Time labels under the plot; views that label time elsewhere skip them. */
    showTickLabels?: boolean;
    /** The vertical lines at each tick. */
    showGrid?: boolean;
    /** Draws the grid in the lightest border tone instead of faded text. */
    subtleGrid?: boolean;
    /**
     * Pins the time labels to the bottom of the screen while the plot runs
     * past it, on a strip of their own, so they stay readable on long
     * timelines.
     */
    stickyTickLabels?: boolean;
    /** Where the sticky strip starts, relative to the plot; negative to also
     * span a column left of it. */
    tickLabelStripStartPx?: number;
    /** Reports how tall the time labels are, so the plot can leave just that
     * much room for them. */
    onTickLabelHeight?: (heightPx: number) => void;
  };
  let {
    x1 = 0,
    x2 = 1000,
    gutter = 0,
    timelineHeight = 1000,
    bandTop = 0,
    bandHeight = timelineHeight,
    startTime,
    scale,
    viewportOffsetPx = 0,
    showBaseline = true,
    showTickLabels = true,
    showGrid = true,
    subtleGrid = false,
    stickyTickLabels = false,
    tickLabelStripStartPx = 0,
    onTickLabelHeight,
  }: Props = $props();

  const TARGET_TICK_PX = 60;

  const distance = $derived(x2 - x1);
  const startWorldPx = $derived(
    screenToTimelineWorld(x1, gutter, viewportOffsetPx),
  );
  const endWorldPx = $derived(
    screenToTimelineWorld(x2, gutter, viewportOffsetPx),
  );
  const startMs = $derived(scale.unproject(startWorldPx));
  const endMs = $derived(scale.unproject(endWorldPx));
  const originTimeMs = $derived(
    scale.segments[0]?.startTimeMs ?? validTimeToDate(startTime).getTime(),
  );
  // A plot spanning under two seconds would get one tick at most from
  // whole-second steps, so it steps in fractions of a second instead.
  const intervalMs = $derived(
    getNiceTimelineIntervalMs(
      TARGET_TICK_PX / scale.expandedPxPerMs,
      endMs - startMs < 2_000 ? 1 : 1_000,
    ),
  );

  const collapsedTimeRanges = $derived(
    scale.segments
      .filter((segment) => segment.isCollapsed)
      .map((segment) => ({
        startTimeMs: segment.startTimeMs,
        endTimeMs: segment.endTimeMs,
      })),
  );
  const ticks = $derived(
    getTimelineTimeTicks({
      visibleStartTimeMs: startMs,
      visibleEndTimeMs: endMs,
      originTimeMs,
      intervalMs,
      project: (timeMs) => scale.project(timeMs),
      viewportOffsetPx,
      gutterPx: gutter,
      screenStartPx: x1,
      screenEndPx: x2,
      collapsedTimeRanges,
    }),
  );

  const baselineWidth = RADIUS / 2;
  const TICK_LABEL_INSET_PX = 4;

  const tickText = (worldPx: number) =>
    formatDistanceAbbreviated({
      start: originTimeMs,
      end: new Date(scale.unproject(worldPx)),
      // Ticks under a second apart would all round to the same second.
      includeMilliseconds: intervalMs < 1_000,
      includeMillisecondsForUnderSecond: intervalMs < 1_000,
    });

  let tickLabelHeightPx = $state(RADIUS * 6);
  let stripEl = $state<HTMLElement | null>(null);

  // Labels near the end would run past the strip's edge; they're hidden
  // rather than cut off.
  let clippedTicks = $state<number[]>([]);

  // Labels are rotated, so their height depends on how long the longest one
  // is; measure it rather than guess.
  $effect(() => {
    void ticks;
    if (!stripEl) return;
    const stripRect = stripEl.getBoundingClientRect();
    const top = stripRect.top;
    let bottom = top;
    const clipped: number[] = [];
    for (const label of stripEl.querySelectorAll<HTMLElement>('.tick-label')) {
      const rect = label.getBoundingClientRect();
      bottom = Math.max(bottom, rect.bottom);
      if (rect.right > stripRect.right)
        clipped.push(Number(label.dataset.worldPx));
    }
    if (clipped.join() !== untrack(() => clippedTicks.join())) {
      clippedTicks = clipped;
    }
    const height = Math.ceil(bottom - top) + TICK_LABEL_INSET_PX;
    if (height > TICK_LABEL_INSET_PX && height !== tickLabelHeightPx) {
      tickLabelHeightPx = height;
    }
  });

  $effect(() => {
    if (stickyTickLabels) onTickLabelHeight?.(tickLabelHeightPx);
  });
</script>

{#if showBaseline}
  <div
    class="baseline"
    style:left="{x1}px"
    style:top="{timelineHeight - baselineWidth / 2}px"
    style:width="{distance}px"
    style:height="{baselineWidth}px"
  ></div>
{/if}

{#if showGrid || (showTickLabels && !stickyTickLabels)}
  <div class="timeline-motion-layer pointer-events-none absolute inset-0">
    {#each ticks as tick (tick.worldPx)}
      {#if showGrid}
        <div
          class="grid-line top-0"
          class:grid-line-subtle={subtleGrid}
          data-timeline-axis-world-px={tick.worldPx}
          style:left="{tick.screenPx}px"
          style:top="{bandTop}px"
          style:height="{bandHeight}px"
        ></div>
      {/if}
      {#if showTickLabels && !stickyTickLabels}
        <div
          class="tick-label"
          style:left="{tick.screenPx}px"
          style:top="{timelineHeight + RADIUS}px"
        >
          {tickText(tick.worldPx)}
        </div>
      {/if}
    {/each}
  </div>
{/if}

{#if showTickLabels && stickyTickLabels}
  <div
    class="pointer-events-none absolute top-0 z-[70] flex flex-col justify-end"
    style:left="{tickLabelStripStartPx}px"
    style:right="0"
    style:height="{timelineHeight + tickLabelHeightPx}px"
    data-testid="timeline-axis-tick-strip"
  >
    <div
      bind:this={stripEl}
      class="pointer-events-auto sticky bottom-0 shrink-0 overflow-hidden border-t border-primary bg-surface-secondary"
      style:height="{tickLabelHeightPx}px"
    >
      <div
        class="timeline-motion-layer absolute inset-y-0 right-0"
        style:left="{-tickLabelStripStartPx}px"
      >
        {#each ticks as tick (tick.worldPx)}
          <div
            class="tick-label"
            class:invisible={clippedTicks.includes(tick.worldPx)}
            data-world-px={tick.worldPx}
            style:left="{tick.screenPx}px"
            style:top="{TICK_LABEL_INSET_PX / 2}px"
          >
            {tickText(tick.worldPx)}
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style lang="postcss">
  .baseline {
    position: absolute;
    background: currentColor;
  }

  .grid-line {
    position: absolute;
    width: 1px;
    opacity: 0.3;

    /* Solid fill, not a dashed border or gradient: the timeline can be tens of
       thousands of px tall. A dashed border makes Chromium rasterize thousands
       of dash segments (huge GPU textures → jank); a gradient fill exceeds
       WebKit's backing-store height and vanishes in Safari. A solid fill is
       cheap and renders at any height in both. */
    background: var(--color-content-primary);
  }

  .grid-line-subtle {
    opacity: 1;
    background: var(--color-border-primary);
  }

  .tick-label {
    position: absolute;
    font-size: 12px;
    line-height: 1;
    white-space: nowrap;
    transform: rotate(45deg);
    transform-origin: left center;
    pointer-events: none;
  }
</style>
