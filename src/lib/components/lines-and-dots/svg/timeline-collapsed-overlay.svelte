<script lang="ts">
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import type { TimelineScale } from '$lib/utilities/timeline-scale';

  import { TimelineConfig } from '../constants';

  type Props = {
    scale: TimelineScale;
    timelineHeight: number;
  };
  let { scale, timelineHeight }: Props = $props();

  const { radius } = TimelineConfig;
  const ZIGZAG_HALF_WIDTH = 3;

  const collapsedSegments = $derived(scale.segments.filter((s) => s.collapsed));

  const zigzagPath = (xStart: number, xEnd: number, height: number) => {
    const step = 6;
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
</script>

{#each collapsedSegments as seg (seg.tStart)}
  {@const labelX = (seg.xStart + seg.xEnd) / 2}
  {@const labelY = timelineHeight + radius * 2}
  {@const half = Math.min(ZIGZAG_HALF_WIDTH, (seg.xEnd - seg.xStart) / 4)}
  {@const d = zigzagPath(labelX - half, labelX + half, timelineHeight)}
  <path
    class="zigzag-halo"
    {d}
    fill="none"
    stroke-width="3"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <path class="zigzag" {d} fill="none" stroke-width="1" />
  <text
    class="zigzag-label"
    font-size="10"
    transform="rotate(90, {labelX}, {labelY})"
    x={labelX - radius}
    y={labelY + 3}
  >
    {formatDistanceAbbreviated({
      start: new Date(seg.tStart),
      end: new Date(seg.tEnd),
    })} skipped
  </text>
{/each}

<style lang="postcss">
  .zigzag-halo {
    stroke: var(--color-surface-primary);
  }

  .zigzag {
    stroke: currentColor;
    opacity: 0.55;
  }

  .zigzag-label {
    @apply fill-current;

    opacity: 0.7;
  }
</style>
