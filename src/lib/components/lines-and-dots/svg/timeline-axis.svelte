<script lang="ts">
  import { timeFormat } from '$lib/stores/time-format';
  import type { Timestamp } from '$lib/types';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';

  import { TimelineConfig } from '../constants';

  import Line from './line.svelte';

  export let x1 = 0;
  export let x2 = 1000;
  export let timelineHeight = 1000;
  export let startTime: string | Timestamp;
  export let endTime: string | Date;
  export let duration: number;

  const { radius, height } = TimelineConfig;
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
      strokeWidth={radius / 4}
      startPoint={[tickX, 0]}
      endPoint={[tickX, timelineHeight]}
      active={false}
    />
  {/if}
  {#if i === 0}
    <text
      fill="#fff"
      font-size="12"
      transform="rotate(90, {tickX}, {tickY})"
      x={tickX - radius}
      y={tickY}
    >
      <tspan>{formatDate(startTime, $timeFormat)}</tspan>
    </text>
  {:else}
    <text
      fill="#fff"
      font-size="12"
      opacity={0.5}
      transform="rotate(90, {tickX}, {height})"
      x={tickX + radius}
      y={height}
    >
      {formatDistanceAbbreviated({
        start: startTime,
        end: new Date(
          new Date(startTime.toString()).getTime() + (duration / ticks) * i,
        ),
        includeMilliseconds: duration / ticks < 1000,
      })}
    </text>
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
<text
  fill="#fff"
  font-size="12"
  transform="rotate(90, {x2}, {timelineHeight + radius * 2})"
  x={x2 - radius}
  y={timelineHeight + radius * 2 + radius / 2}
>
  <tspan>{formatDate(endTime, $timeFormat)}</tspan>
</text>
