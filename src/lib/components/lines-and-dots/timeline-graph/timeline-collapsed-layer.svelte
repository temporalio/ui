<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import { IconCollapse } from '$lib/io/icon';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';

  import { getCollapsedSegmentWindow } from './collapsed-segment-window';
  import { RADIUS, ROW_HEIGHT } from './constants';

  import type { TimelineScaleProjection } from './timeline-scale.svelte';

  type Props = {
    scale: TimelineScaleProjection;
    timelineHeight: number;
    // Visible pixel band; the zigzag renders only across this range instead of
    // the full canvas height so Chromium never rasterizes a giant pattern fill.
    bandTop?: number;
    bandHeight?: number;
    readOnly?: boolean;
    viewportOffsetPx?: number;
    viewportWidthPx: number;
    onToggle: (segmentKey: string) => void;
    /** Row height of the view this row sits in. */
    rowHeight?: number;
  };
  let {
    scale,
    timelineHeight,
    bandTop = 0,
    bandHeight,
    readOnly = false,
    viewportOffsetPx = 0,
    viewportWidthPx,
    onToggle,
    rowHeight = ROW_HEIGHT,
  }: Props = $props();

  const ZIGZAG_HALF_WIDTH = 5;
  const ZIGZAG_STEP = 8;

  // Zigzag surface = the visible band, clamped to [0, timelineHeight] so it
  // never spills below the x-axis. Falls back to full height before first band.
  const zigzagTop = $derived(
    bandHeight != null ? Math.min(Math.max(bandTop, 0), timelineHeight) : 0,
  );
  const zigzagHeight = $derived(
    Math.max(
      0,
      (bandHeight != null
        ? Math.min(bandTop + bandHeight, timelineHeight)
        : timelineHeight) - zigzagTop,
    ),
  );
  // Keep the tiled pattern phase-aligned to canvas coords as the band scrolls,
  // so the teeth don't crawl. Pattern repeats every ZIGZAG_STEP * 2 px.
  const zigzagPatternY = $derived(-(zigzagTop % (ZIGZAG_STEP * 2)));

  const HIT_HALF_WIDTH = Math.max(RADIUS, 12);
  const iconSize = RADIUS * 2;

  const visibleSegments = $derived(
    scale.segments
      .filter((segment) => segment.isCollapsible)
      .map((segment) => ({
        segment,
        segmentWindow: getCollapsedSegmentWindow({
          startWorldPx: segment.startPx,
          endWorldPx: segment.endPx,
          isCollapsed: segment.isCollapsed,
          viewportOffsetPx,
          viewportWidthPx,
          hitHalfWidthPx: HIT_HALF_WIDTH,
          zigzagHalfWidthPx: Math.min(
            ZIGZAG_HALF_WIDTH,
            (segment.endPx - segment.startPx) / 4,
          ),
        }),
      }))
      .filter(
        ({ segmentWindow }) =>
          segmentWindow.zigzagRange ||
          segmentWindow.markerRange ||
          segmentWindow.hitRange ||
          segmentWindow.centerVisible,
      ),
  );

  const handleToggle = (segmentKey: string) => {
    if (readOnly) return;
    onToggle(segmentKey);
  };
</script>

{#snippet marker(
  markerRange: { startPx: number; endPx: number },
  centerX: number,
  centerY: number,
  showIcon: boolean,
)}
  <div
    class="absolute bg-primary"
    style:left="{markerRange.startPx}px"
    style:top="{centerY - RADIUS}px"
    style:width="{markerRange.endPx - markerRange.startPx}px"
    style:height="{RADIUS * 2}px"
  ></div>
  {#if showIcon}
    <div
      class="absolute"
      style:left="{centerX - iconSize / 2}px"
      style:top="{centerY - iconSize / 2}px"
      style:width="{iconSize}px"
      style:height="{iconSize}px"
    >
      <IconCollapse class="text-secondary" width={iconSize} height={iconSize} />
    </div>
  {/if}
{/snippet}

{#each visibleSegments as { segment: seg, segmentWindow } (seg.key)}
  {@const labelX = segmentWindow.centerPx}
  {@const labelY = timelineHeight + RADIUS * 2}
  {@const distance = formatDistanceAbbreviated({
    start: new Date(seg.startTimeMs),
    end: new Date(seg.endTimeMs),
  })}
  {#if seg.isCollapsed && segmentWindow.zigzagRange}
    {@const half = Math.min(ZIGZAG_HALF_WIDTH, (seg.endPx - seg.startPx) / 4)}
    <!-- Zigzag as a tiled <pattern>, windowed to the visible band so Chromium
         never rasterizes the pattern across the full canvas height. -->
    <svg
      class="absolute overflow-hidden"
      style:left="{segmentWindow.zigzagRange.startPx}px"
      style:top="{zigzagTop}px"
      style:width="{segmentWindow.zigzagRange.endPx -
        segmentWindow.zigzagRange.startPx}px"
      style:height="{zigzagHeight}px"
    >
      <defs>
        <pattern
          id="zigzag-{seg.key}"
          patternUnits="userSpaceOnUse"
          x={0}
          y={zigzagPatternY}
          width={half * 2}
          height={ZIGZAG_STEP * 2}
        >
          <path
            class="zigzag-path"
            d="M 0 0 L {half * 2} {ZIGZAG_STEP} L 0 {ZIGZAG_STEP * 2}"
            fill="none"
            stroke-width="1"
            stroke-dasharray="2"
          />
        </pattern>
      </defs>
      <rect width="100%" height={zigzagHeight} fill="url(#zigzag-{seg.key})" />
    </svg>
    {#if segmentWindow.markerRange}
      {@render marker(
        segmentWindow.markerRange,
        labelX,
        rowHeight,
        segmentWindow.centerVisible,
      )}
      {@render marker(
        segmentWindow.markerRange,
        labelX,
        timelineHeight,
        segmentWindow.centerVisible,
      )}
    {/if}
    {#if segmentWindow.centerVisible}
      <div
        class="pointer-events-none absolute origin-left rotate-45 whitespace-nowrap text-[10px] leading-none text-secondary"
        style:left="{labelX}px"
        style:top="{labelY}px"
      >
        {distance}
      </div>
    {/if}
  {/if}
  {#if !readOnly && segmentWindow.hitRange}
    <button
      type="button"
      aria-pressed={seg.isCollapsed}
      aria-label={seg.isCollapsed
        ? translate('workflows.show-idle-time-segment', { distance })
        : translate('workflows.hide-idle-time-segment', { distance })}
      class="timeline-height-control timeline-motion-hit-target absolute top-0 m-0 cursor-pointer border-0 bg-current p-0 opacity-0 outline-none transition-opacity duration-100 ease-in-out hover:opacity-20 focus-visible:opacity-20"
      style:left="{segmentWindow.hitRange.startPx}px"
      style:width="{Math.max(
        1,
        segmentWindow.hitRange.endPx - segmentWindow.hitRange.startPx,
      )}px"
      style:height="{timelineHeight}px"
      onclick={() => handleToggle(seg.key)}
    ></button>
  {/if}
{/each}

<style lang="postcss">
  .zigzag-path {
    stroke: rgb(var(--color-text-secondary));
  }

  .timeline-height-control {
    transition: opacity 100ms ease-in-out;
  }
</style>
