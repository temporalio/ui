<script lang="ts">
  import { timeFormat } from '$lib/stores/time-format';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';

  import { TimelineConfig } from '../constants';
  import Line from '../svg/line.svelte';

  export let timelineHeight = 1000;
  export let canvasWidth: number;
  export let now: Date;
  export let startTime: Date;
  export let endTime: Date;
  export let duration: number;

  const { radius, height } = TimelineConfig;
  const ticks = 48;

  $: mid = canvasWidth / 2;
  $: tickDistance = canvasWidth / ticks;
</script>

{#each Array(ticks) as _, i}
  {@const tickX = i * tickDistance}
  {@const tickY = timelineHeight + radius * 2}
  {@const distance = formatDistanceAbbreviated({
    start: now,
    end: new Date(
      new Date(startTime.toString()).getTime() +
        Math.round(duration / ticks) * i,
    ),
  })}
  {#if i !== 0}
    <Line
      strokeWidth={radius / 4}
      startPoint={[tickX, 0]}
      endPoint={[tickX, timelineHeight]}
      active={false}
    />
  {/if}
  <text
    fill="#fff"
    font-size="12"
    opacity={0.5}
    transform="rotate(90, {tickX}, {height})"
    x={tickX - radius}
    y={height}
  >
    {#if tickX < mid}-{/if}
    {distance}
  </text>
  <text
    fill="#fff"
    font-size="12"
    transform="rotate(90, {tickX}, {tickY})"
    x={tickX - radius}
    y={tickY}
  >
    {formatDate(
      new Date(
        new Date(startTime.toString()).getTime() + (duration / ticks) * i,
      ),
      $timeFormat,
    )}
  </text>
{/each}
<text
  fill="#fff"
  font-size="12"
  transform="rotate(90, {canvasWidth}, {timelineHeight + radius * 2})"
  x={canvasWidth - radius}
  y={timelineHeight + radius * 2 + radius / 2}
>
  <tspan>{formatDate(endTime, $timeFormat)}</tspan>
</text>
<Line
  strokeWidth={radius / 4}
  startPoint={[mid, 0]}
  endPoint={[mid, timelineHeight]}
  pending
/>
<Line
  strokeWidth={radius / 4}
  startPoint={[0, timelineHeight]}
  endPoint={[canvasWidth, timelineHeight]}
/>
