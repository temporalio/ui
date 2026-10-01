<script lang="ts">
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
  const intervalMs = $derived(
    getNiceTimelineIntervalMs(TARGET_TICK_PX / scale.expandedPxPerMs),
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
</script>

<!-- baseline -->
<div
  class="baseline"
  style:left="{x1}px"
  style:top="{timelineHeight - baselineWidth / 2}px"
  style:width="{distance}px"
  style:height="{baselineWidth}px"
></div>

<div class="timeline-motion-layer pointer-events-none absolute inset-0">
  {#each ticks as tick (tick.worldPx)}
    <div
      class="grid-line top-0"
      data-timeline-axis-world-px={tick.worldPx}
      style:left="{tick.screenPx}px"
      style:top="{bandTop}px"
      style:height="{bandHeight}px"
    ></div>
    <div
      class="tick-label"
      style:left="{tick.screenPx}px"
      style:top="{timelineHeight + RADIUS}px"
    >
      {formatDistanceAbbreviated({
        start: originTimeMs,
        end: new Date(scale.unproject(tick.worldPx)),
        includeMilliseconds: false,
      })}
    </div>
  {/each}
</div>

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
