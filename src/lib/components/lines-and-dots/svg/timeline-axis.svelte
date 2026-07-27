<script lang="ts">
  import type { Timestamp } from '$lib/types';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';

  import { TimelineConfig } from '../constants';

  import Line from './line.svelte';

  type Props = {
    x1: number;
    x2: number;
    timelineHeight: number;
    startTime: string | Timestamp;
    duration: number;
  };
  let {
    x1 = 0,
    x2 = 1000,
    timelineHeight = 1000,
    startTime,
    duration,
  }: Props = $props();

  const { radius } = TimelineConfig;
  const ticks = 20;

  const distance = $derived(x2 - x1);
  const tickDistance = $derived(distance / ticks);
</script>

<Line
  strokeWidth={radius / 2}
  startPoint={[x1, timelineHeight]}
  endPoint={[x1 + distance, timelineHeight]}
/>
{#each Array(ticks) as _, i}
  {@const tickX = x1 + i * tickDistance}
  {@const tickY = timelineHeight + radius * 2}
  {#if i !== 0}
    <Line
      strokeWidth={0.5}
      startPoint={[tickX, 0]}
      endPoint={[tickX, timelineHeight]}
      strokeDasharray="2"
    />
  {/if}
  {#if i !== 0}
    <text
      fill="#fff"
      font-size="12"
      transform="rotate(90, {tickX}, {tickY})"
      x={tickX - radius}
      y={tickY + 3}
    >
      {formatDistanceAbbreviated({
        start: startTime,
        end: new Date(
          new Date(startTime.toString()).getTime() + (duration / ticks) * i,
        ),
        includeMilliseconds: duration / ticks < 1000,
      })}
    </text>
  {/if}
{/each}

<style lang="postcss">
  text {
    @apply fill-current;
  }
</style>
