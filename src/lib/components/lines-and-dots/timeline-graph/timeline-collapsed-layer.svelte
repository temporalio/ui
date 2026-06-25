<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';

  import { TimelineConfig } from '../constants';

  import type { TimelineScale } from './timeline-scale.svelte';

  type Props = {
    scale: TimelineScale;
    timelineHeight: number;
    readOnly?: boolean;
    onToggle: (segmentKey: string) => void;
  };
  let { scale, timelineHeight, readOnly = false, onToggle }: Props = $props();

  const { radius, height } = TimelineConfig;

  const AXIS_STROKE_WIDTH = radius / 2;

  const ZIGZAG_HALF_WIDTH = 4;

  const HIT_HALF_WIDTH = Math.max(radius, 12);
  const HIT_WIDTH = HIT_HALF_WIDTH * 2;

  const collapsibleSegments = $derived(
    scale.segments.filter((s) => s.isCollapsible),
  );

  const zigzagPath = (xStart: number, xEnd: number, height: number) => {
    const step = 8;
    let d = `M ${xStart} 0`;
    let y = 0;
    let toRight = true;
    while (y < height) {
      const nextY = Math.min(y + step, height);
      d += ` L ${toRight ? xEnd : xStart} ${nextY}`;
      toRight = !toRight;
      y = nextY;
    }
    return d;
  };

  let activeSegmentKey = $state<string | null>(null);

  const handleToggle = (segmentKey: string) => {
    if (readOnly) return;
    onToggle(segmentKey);
  };

  const handleKeydown = (e: KeyboardEvent, segmentKey: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle(segmentKey);
    }
  };
</script>

{#each collapsibleSegments as seg (seg.key)}
  {@const labelX = (seg.startPx + seg.endPx) / 2}
  {@const labelY = timelineHeight + radius * 2}
  {@const distance = formatDistanceAbbreviated({
    start: new Date(seg.startTimeMs),
    end: new Date(seg.endTimeMs),
  })}
  {#if seg.isCollapsed}
    {@const half = Math.min(ZIGZAG_HALF_WIDTH, (seg.endPx - seg.startPx) / 4)}
    <path
      class="zigzag"
      d={zigzagPath(labelX - half, labelX + half, timelineHeight)}
      fill="none"
      stroke-width="0.5"
      stroke-dasharray="2"
    />
    {@render marker(labelX, height, {
      text: translate('workflows.show-idle-time-segment', {
        distance,
      }),
      show: activeSegmentKey === seg.key,
    })}
    {@render marker(labelX, timelineHeight)}
    <text
      class="zigzag-label"
      font-size="10"
      transform="rotate(90, {labelX}, {labelY})"
      x={labelX - radius}
      y={labelY + 3}
    >
      {distance}
    </text>
  {/if}
  {#if !readOnly}
    <rect
      role="button"
      tabindex="0"
      aria-pressed={seg.isCollapsed}
      aria-label={translate('workflows.hide-idle-time-segment', {
        distance,
      })}
      class="toggle-handle"
      x={seg.isCollapsed ? labelX - HIT_HALF_WIDTH : seg.startPx}
      y={0}
      width={seg.isCollapsed ? HIT_WIDTH : seg.endPx - seg.startPx}
      height={seg.isCollapsed
        ? timelineHeight + AXIS_STROKE_WIDTH * 2
        : timelineHeight - AXIS_STROKE_WIDTH / 2}
      onmouseenter={() => (activeSegmentKey = seg.key)}
      onmouseleave={() => (activeSegmentKey = null)}
      onfocus={() => (activeSegmentKey = seg.key)}
      onblur={() => (activeSegmentKey = null)}
      onclick={() => handleToggle(seg.key)}
      onkeydown={(e) => handleKeydown(e, seg.key)}
    />
  {/if}
{/each}

{#snippet marker(
  cx: number,
  cy: number,
  tooltip?: {
    text?: string;
    show?: boolean;
  },
)}
  {@const iconSize = radius * 2}
  <rect
    class="marker"
    x={cx - HIT_HALF_WIDTH}
    y={cy - radius}
    width={HIT_WIDTH}
    height={radius * 2}
  />
  <foreignObject
    x={cx - iconSize / 2}
    y={cy - iconSize / 2}
    width={iconSize}
    height={iconSize}
  >
    <Tooltip
      text={tooltip?.text}
      usePortal
      right
      portalOffset={{ x: 8 }}
      show={tooltip?.show ?? false}
    >
      <Icon
        class="text-secondary"
        name="timeline-collapse"
        width={iconSize}
        height={iconSize}
      />
    </Tooltip>
  </foreignObject>
{/snippet}

<style lang="postcss">
  .zigzag {
    stroke: rgb(var(--color-text-secondary));
  }

  .zigzag-label {
    fill: rgb(var(--color-text-secondary));
  }

  .marker {
    fill: rgb(var(--color-surface-primary));
  }

  .toggle-handle {
    fill: currentColor;
    cursor: pointer;
    opacity: 0;
    outline: none;
    transition: opacity 0.1s ease-in-out;
  }

  .toggle-handle:hover,
  .toggle-handle:focus-visible {
    opacity: 0.2;
  }
</style>
