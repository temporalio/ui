<script lang="ts">
  import type { Timestamp } from '$lib/types';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';

  import { TimelineConfig } from '../constants';

  import Line from './line.svelte';

  export let x1 = 0;
  export let x2 = 1000;
  export let timelineHeight = 1000;
  export let startTime: string | Timestamp;
  export let duration: number;

  const { radius } = TimelineConfig;
  const ticks = 20;

  $: distance = x2 - x1;
  $: tickDistance = distance / ticks;
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
    />
  {/if}
  {#if i !== 0}
    <text
      fill="#fff"
      font-size="12"
      transform="rotate(90, {tickX}, {tickY})"
      x={tickX - radius}
      y={tickY}
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
